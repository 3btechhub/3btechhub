export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent || "Unknown",
    viewport: { width: window.innerWidth, height: window.innerHeight },
    screen: { width: screen.width, height: screen.height },
    pixelRatio: window.devicePixelRatio || 1,
    touch: navigator.maxTouchPoints > 0
  };
}