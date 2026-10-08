import * as React from "react"

const QUERY = "(prefers-reduced-motion: reduce)"

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", callback)

  // `.motion-reduce` can be toggled on any ancestor (the /motion playground
  // does this), so watch class changes across the document.
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
    subtree: true,
  })

  return () => {
    mql.removeEventListener("change", callback)
    observer.disconnect()
  }
}

function getServerSnapshot() {
  return false
}

/**
 * True when the user asks for reduced motion, either through the OS
 * (`prefers-reduced-motion: reduce`) or through a `.motion-reduce` class on
 * the element passed in `ref` or any of its ancestors. Without a ref, the
 * class is checked on `<html>`.
 */
export function useReducedMotion(ref?: React.RefObject<Element | null>) {
  const getSnapshot = React.useCallback(() => {
    if (window.matchMedia(QUERY).matches) {
      return true
    }
    const element = ref?.current ?? document.documentElement
    return element.closest(".motion-reduce") !== null
  }, [ref])

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
