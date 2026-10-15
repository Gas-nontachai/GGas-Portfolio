type EntranceFrame = { scrollY: number; sectionTop: number; viewportHeight: number }

export function createScrollVelocityTracker(initialY: number, initialTime: number) {
  let previousY = initialY
  let previousTime = initialTime
  let velocity = 0
  return (scrollY: number, time: number): number => {
    const elapsed = Math.max(1, time - previousTime)
    const measured = ((scrollY - previousY) * 1000) / elapsed
    // Exponential smoothing with a 40ms time constant behaves consistently across frame rates.
    const weight = 1 - Math.exp(-elapsed / 40)
    velocity = elapsed > 120 ? measured : velocity + (measured - velocity) * weight
    previousY = scrollY
    previousTime = time
    return velocity
  }
}

export function getExperimentAttractionMotion(distance: number, velocity: number) {
  if (Math.abs(distance) < 1) return { duration: 0, ease: (time: number) => time }
  // Constant-deceleration estimate T = 2d/v, bounded to keep short and long pulls usable.
  const duration = Math.min(
    0.85,
    Math.max(0.28, (2 * Math.abs(distance)) / Math.max(600, Math.abs(velocity))),
  )
  // Cubic ease-out (GSAP power2.out): start immediately and decelerate to rest.
  return {
    duration,
    ease: (time: number) => 1 - (1 - time) ** 3,
  }
}

export function createExperimentEntranceCapture(initialScrollY: number) {
  let previousScrollY = initialScrollY
  let consumed = false

  return ({ scrollY, sectionTop, viewportHeight }: EntranceFrame): number | null => {
    const movingDown = scrollY > previousScrollY
    previousScrollY = scrollY
    // Rearm only after returning to the previous section, not on every wheel tick.
    if (sectionTop > viewportHeight * 0.82) consumed = false
    if (
      consumed ||
      !movingDown ||
      sectionTop > viewportHeight * 0.82 ||
      sectionTop < -viewportHeight * 0.12
    )
      return null
    consumed = true
    return scrollY + sectionTop
  }
}
