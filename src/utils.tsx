export function isCrossOrigin(window_: Window) {
  try {
    // try access protected property which is blocked if cross origin, e.g. parent window redirected
    ;(() => window_.location.href)() // :)
    return false
  } catch (err) {
    return true
  }
}

export function createSubscription<
  Args extends any[],
  Unsubscribe extends () => void
>(func: (...args: Args) => Unsubscribe | void) {
  let unsubscribe: Unsubscribe | null = null
  return (...args: Args) => {
    if (typeof unsubscribe === 'function') unsubscribe()
    unsubscribe = func(...args) || null
  }
}
