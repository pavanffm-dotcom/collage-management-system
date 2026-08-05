/**
 * Utility for HTML5 Fullscreen API (YouTube-style Immersive Mode)
 * Hides Chrome tabs, extension bars, URL bar, and mobile status bar for 100% full-screen app view.
 */

export function isFullscreenActive(): boolean {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
}

export function requestAppFullscreen(): Promise<void> {
  const elem = document.documentElement as any;
  if (elem.requestFullscreen) {
    return elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    return elem.webkitRequestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    return elem.mozRequestFullScreen();
  } else if (elem.msRequestFullscreen) {
    return elem.msRequestFullscreen();
  }
  return Promise.resolve();
}

export function exitAppFullscreen(): Promise<void> {
  const doc = document as any;
  if (doc.exitFullscreen) {
    return doc.exitFullscreen();
  } else if (doc.webkitExitFullscreen) {
    return doc.webkitExitFullscreen();
  } else if (doc.mozCancelFullScreen) {
    return doc.mozCancelFullScreen();
  } else if (doc.msExitFullscreen) {
    return doc.msExitFullscreen();
  }
  return Promise.resolve();
}

export function toggleAppFullscreen(): Promise<void> {
  if (isFullscreenActive()) {
    return exitAppFullscreen();
  } else {
    return requestAppFullscreen();
  }
}
