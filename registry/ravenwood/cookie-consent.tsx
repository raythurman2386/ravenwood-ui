"use client"

import * as React from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"

type CookieConsentValue = "granted" | "denied"
/** `undefined` until the stored choice is read on the client, `null` when no choice is stored. */
type CookieConsentState = CookieConsentValue | null | undefined

const COOKIE_CONSENT_STORAGE_KEY = "ravenwood-cookie-consent"
/** Fired on `window` after every change. `detail` is `{ key, value }`. */
const COOKIE_CONSENT_EVENT = "ravenwood:cookie-consent"

function readCookieConsent(
  storageKey: string = COOKIE_CONSENT_STORAGE_KEY
): CookieConsentValue | null {
  try {
    const value = window.localStorage.getItem(storageKey)
    return value === "granted" || value === "denied" ? value : null
  } catch {
    return null
  }
}

function writeCookieConsent(
  value: CookieConsentValue | null,
  storageKey: string = COOKIE_CONSENT_STORAGE_KEY
) {
  try {
    if (value) window.localStorage.setItem(storageKey, value)
    else window.localStorage.removeItem(storageKey)
  } catch {
    // Storage can be blocked. The choice still applies to this page view.
  }
  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_EVENT, {
      detail: { key: storageKey, value },
    })
  )
}

/** Google Consent Mode v2 fields for `gtag("consent", "update", ...)`. */
function googleConsentMode(value: CookieConsentValue | null | undefined) {
  const state = value === "granted" ? "granted" : "denied"
  return {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  } as const
}

function subscribe(onChange: () => void) {
  window.addEventListener(COOKIE_CONSENT_EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

type CookieConsentContextValue = {
  /** The stored choice. `undefined` during server render and first paint. */
  consent: CookieConsentState
  /** True only after the visitor chose Accept. Load ads and analytics on this. */
  granted: boolean
  /** The banner is showing: no choice yet, or reopened from settings. */
  open: boolean
  /** The banner was reopened from a settings control. */
  reopened: boolean
  accept: () => void
  reject: () => void
  /** Forget the stored choice. The banner shows again. */
  reset: () => void
  openSettings: () => void
  closeSettings: () => void
  bannerId: string
  choicesId: string
}

const CookieConsentContext =
  React.createContext<CookieConsentContextValue | null>(null)

function useCookieConsent() {
  const context = React.useContext(CookieConsentContext)
  if (!context) {
    throw new Error(
      "useCookieConsent must be used within CookieConsentProvider."
    )
  }
  return context
}

function CookieConsentProvider({
  storageKey = COOKIE_CONSENT_STORAGE_KEY,
  reloadOnReject = false,
  onChange,
  children,
}: {
  /** localStorage key. Change it to ask again after a policy change. */
  storageKey?: string
  /** Reload when a visitor switches from Accept to Reject, so scripts already in the page go away. */
  reloadOnReject?: boolean
  /** Called after the visitor accepts, rejects, or resets. */
  onChange?: (value: CookieConsentValue | null) => void
  children: React.ReactNode
}) {
  const consent = React.useSyncExternalStore<CookieConsentState>(
    subscribe,
    () => readCookieConsent(storageKey),
    () => undefined
  )
  const [reopened, setReopened] = React.useState(false)
  const returnFocus = React.useRef<HTMLElement | null>(null)
  const bannerId = React.useId()
  const choicesId = React.useId()

  const restoreFocus = React.useCallback(() => {
    const target = returnFocus.current
    returnFocus.current = null
    if (target?.isConnected) target.focus()
  }, [])

  const choose = React.useCallback(
    (value: CookieConsentValue | null) => {
      const previous = readCookieConsent(storageKey)
      writeCookieConsent(value, storageKey)
      setReopened(false)
      onChange?.(value)
      if (reloadOnReject && value === "denied" && previous === "granted") {
        window.location.reload()
        return
      }
      if (value) restoreFocus()
    },
    [storageKey, onChange, reloadOnReject, restoreFocus]
  )

  const openSettings = React.useCallback(() => {
    const active = document.activeElement
    returnFocus.current = active instanceof HTMLElement ? active : null
    setReopened(true)
  }, [])

  const closeSettings = React.useCallback(() => {
    setReopened(false)
    restoreFocus()
  }, [restoreFocus])

  const value = React.useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      granted: consent === "granted",
      open: consent === null || (reopened && consent !== undefined),
      reopened,
      accept: () => choose("granted"),
      reject: () => choose("denied"),
      reset: () => choose(null),
      openSettings,
      closeSettings,
      bannerId,
      choicesId,
    }),
    [
      consent,
      reopened,
      choose,
      openSettings,
      closeSettings,
      bannerId,
      choicesId,
    ]
  )

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  )
}

function CookieConsentBanner({
  className,
  title = "Cookies for analytics and ads",
  description = "We only load analytics and ads if you allow them. The site works the same either way.",
  acceptLabel = "Accept",
  rejectLabel = "Reject",
  position = "fixed",
  children,
  onKeyDown,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  title?: React.ReactNode
  description?: React.ReactNode
  acceptLabel?: React.ReactNode
  rejectLabel?: React.ReactNode
  /** `fixed` pins the banner to the bottom of the viewport. `inline` keeps it in flow. */
  position?: "fixed" | "inline"
}) {
  const {
    consent,
    open,
    reopened,
    accept,
    reject,
    closeSettings,
    bannerId,
    choicesId,
  } = useCookieConsent()
  const firstChoice = React.useRef<HTMLButtonElement>(null)
  const titleId = `${bannerId}-title`
  const descriptionId = `${bannerId}-description`

  React.useEffect(() => {
    if (open && reopened) firstChoice.current?.focus()
  }, [open, reopened])

  if (!open) return null

  return (
    <section
      id={bannerId}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      data-slot="cookie-consent-banner"
      data-position={position}
      className={cn(
        position === "fixed" &&
          "fixed inset-x-0 bottom-0 z-50 max-h-[60dvh] overflow-y-auto overscroll-contain p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4",
        className
      )}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (!event.defaultPrevented && event.key === "Escape" && consent) {
          closeSettings()
        }
      }}
      {...props}
    >
      <div className="duration-overlay mx-auto flex max-w-3xl animate-in flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-lg ease-enter fade-in-0 slide-in-from-bottom-[6px] motion-reduce:animate-none motion-reduce:slide-in-from-bottom-0 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
        <div className="min-w-0 flex-1">
          <p id={titleId} className="font-display text-base leading-snug">
            {title}
          </p>
          <div
            id={descriptionId}
            className="mt-1 text-sm text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a:focus-visible]:rounded-sm [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-ring [&_a:focus-visible]:outline-none"
          >
            {description}
            {children ? <> {children}</> : null}
          </div>
        </div>
        <div
          id={choicesId}
          role="group"
          aria-label="Cookie choices"
          className="flex shrink-0 gap-2"
        >
          <Button
            ref={firstChoice}
            type="button"
            variant="outline"
            className="min-w-24 flex-1 sm:flex-none"
            data-consent="denied"
            aria-pressed={reopened ? consent === "denied" : undefined}
            onClick={reject}
          >
            {rejectLabel}
          </Button>
          <Button
            type="button"
            className="min-w-24 flex-1 sm:flex-none"
            data-consent="granted"
            aria-pressed={reopened ? consent === "granted" : undefined}
            onClick={accept}
          >
            {acceptLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}

/** Visually hidden until focused. Put it first in `<body>` so keyboard users reach the choices at once. */
function CookieConsentSkipLink({
  className,
  children = "Skip to cookie choices",
  onClick,
  ...props
}: React.ComponentProps<"a">) {
  const { open, choicesId } = useCookieConsent()
  if (!open) return null

  return (
    <a
      href={`#${choicesId}`}
      data-slot="cookie-consent-skip-link"
      className={cn(
        "sr-only rounded-md bg-card px-3 py-2 text-sm text-card-foreground focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[60] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        event.preventDefault()
        document
          .getElementById(choicesId)
          ?.querySelector<HTMLButtonElement>("button")
          ?.focus()
      }}
      {...props}
    >
      {children}
    </a>
  )
}

/** Reopens the banner so the visitor can change their choice. Put it in the footer. */
function CookieSettingsButton({
  children = "Cookie settings",
  variant = "link",
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { open, openSettings, bannerId } = useCookieConsent()

  return (
    <Button
      type="button"
      variant={variant}
      data-slot="cookie-settings-button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? bannerId : undefined}
      className={cn(variant === "link" && "h-auto px-0", className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) openSettings()
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

/** Renders `children` only after Accept. Wrap ad and analytics scripts in it. */
function CookieConsentGate({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { granted } = useCookieConsent()
  return <>{granted ? children : fallback}</>
}

export {
  COOKIE_CONSENT_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  CookieConsentBanner,
  CookieConsentGate,
  CookieConsentProvider,
  CookieConsentSkipLink,
  CookieSettingsButton,
  googleConsentMode,
  readCookieConsent,
  useCookieConsent,
  writeCookieConsent,
  type CookieConsentState,
  type CookieConsentValue,
}
