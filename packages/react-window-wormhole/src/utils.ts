export function isCrossOrigin(window_: Window) {
  try {
    // try access protected property which is blocked if cross origin, e.g. parent window redirected
    (() => window_.location.href)(); // :)
    return false;
  } catch (err) {
    return true;
  }
}
