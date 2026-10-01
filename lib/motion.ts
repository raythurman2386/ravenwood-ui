/**
 * Ravenwood motion language.
 *
 * Named intents, not per-component guesswork. If you cannot say what
 * information an animation carries (press, origin, hierarchy, continuity),
 * do not add it.
 */

export const duration = {
  snap: 110,
  ui: 180,
  overlay: 200,
  overlayExit: 160,
  layout: 220,
  gentle: 220,
  press: 90,
  fade: 150,
  scrim: 160,
  content: 140,
  stagger: 40,
} as const

export const easing = {
  enter: "cubic-bezier(0.16, 1, 0.3, 1)",
  exit: "cubic-bezier(0.4, 0, 1, 1)",
  press: "cubic-bezier(0, 0, 0.2, 1)",
  snap: "cubic-bezier(0.2, 0.8, 0.2, 1)",
} as const

export const springs = {
  snap: { type: "tween" as const, duration: 0.11, ease: [0.2, 0.8, 0.2, 1] as const },
  ui: { type: "tween" as const, duration: 0.18, ease: [0.16, 1, 0.3, 1] as const },
  overlay: { type: "tween" as const, duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
}

export const stagger = {
  step: 40,
  cap: 8,
} as const

export const intents = [
  {
    name: "snap",
    ms: `${duration.snap}ms`,
    use: "Buttons, switches, checkboxes, icon buttons. Immediate press.",
  },
  {
    name: "ui",
    ms: `${duration.ui}ms`,
    use: "Menus, tooltips, selects, the tabs indicator.",
  },
  {
    name: "overlay",
    ms: `${duration.overlay}ms`,
    use: "Dialog, sheet, drawer, popover. Close on overlay-exit.",
  },
  {
    name: "layout",
    ms: `${duration.layout}ms`,
    use: "Sidebar collapse, expanding rows, shared-layout tabs.",
  },
  {
    name: "gentle",
    ms: `${duration.gentle}ms`,
    use: "Large surfaces only. Page frame. Rare.",
  },
] as const

/** Menus, selects, popovers: fade + 6px from the trigger origin. */
export const overlayMenuClass =
  "duration-ui ease-enter data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 data-closed:duration-overlay-exit data-closed:ease-exit motion-reduce:animate-none"

/** Dialog panel: fade + 6px rise. Not a zoom from center. */
export const overlayPanelClass =
  "duration-overlay ease-enter data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-[6px] data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom-[4px] data-closed:duration-overlay-exit data-closed:ease-exit motion-reduce:animate-none motion-reduce:slide-in-from-bottom-0"

/** Dim scrim behind overlays. */
export const overlayScrimClass =
  "duration-scrim ease-enter data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 data-closed:duration-overlay-exit data-closed:ease-exit motion-reduce:animate-none"

export const motionBan = [
  "transition-all",
  "linear easing on UI (progress bars only)",
  "ease-in-out as the default",
  "hover scale > 1.02 on cards or buttons",
  "bounce / wiggle / rubber / ping / infinite pulse on chrome",
  "staggered fade-in of every paragraph on first paint",
  "400ms+ functional transitions",
  "autoplaying Lottie/Rive loops in product chrome",
  "gradient mesh / glow orbs that drift forever",
  "layout animations that reflow text while the user is reading",
] as const
