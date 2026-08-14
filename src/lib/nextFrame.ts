/**
 * Yield one animation frame.
 *
 * PDF / Excel / print generation runs synchronously and blocks the main thread,
 * so without this the button's spinner would never get a chance to paint.
 */
export const nextFrame = (): Promise<void> =>
  new Promise(resolve => requestAnimationFrame(() => resolve()));
