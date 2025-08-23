export function isCrossOrigin(targetWindow: Window) {
  try {
    // try access protected property which is blocked if cross origin, e.g. parent window redirected
    targetWindow.location.href; // :)
    return false;
  } catch (err) {
    return true;
  }
}
