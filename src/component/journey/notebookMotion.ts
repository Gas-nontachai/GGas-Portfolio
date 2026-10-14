export const notebookEase = (t: number) => {
  // cubic-bezier(.22, 1, .36, 1), solved for x before evaluating y.
  let low = 0
  let high = 1
  for (let i = 0; i < 16; i++) {
    const mid = (low + high) / 2
    const x = 3 * (1 - mid) ** 2 * mid * .22 + 3 * (1 - mid) * mid ** 2 * .36 + mid ** 3
    if (x < t) low = mid
    else high = mid
  }
  const u = (low + high) / 2
  return 3 * (1 - u) ** 2 * u + 3 * (1 - u) * u ** 2 + u ** 3
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smoothstep = (t: number) => {
  const clamped = Math.max(0, Math.min(1, t))
  return 3 * clamped ** 2 - 2 * clamped ** 3
}

// Quintic interpolation: velocity and acceleration both reach zero at each end.
export const smootherstep = (t: number) => {
  const u = Math.max(0, Math.min(1, t))
  return u * u * u * (u * (u * 6 - 15) + 10)
}
