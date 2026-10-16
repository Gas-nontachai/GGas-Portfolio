import { endingConfig as config } from './ending.config.ts'

export const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, Number.isFinite(value) ? value : min))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smoothstep = (value: number) => {
  const t = clamp(value)
  return t * t * (3 - 2 * t)
}
const integratedSmoothstep = (t: number) => t ** 3 - 0.5 * t ** 4
const travelIntegral = 0.075 + 0.55 + 0.075

export function getTravelFraction(progress: number) {
  const p = clamp(progress)
  if (p <= config.accelerationEnd) return (0.15 * integratedSmoothstep(p / 0.15)) / travelIntegral
  if (p <= config.brakingStart) return (0.075 + p - 0.15) / travelIntegral
  if (p >= config.stop) return 1
  const t = (p - 0.7) / 0.15
  return (0.625 + 0.15 * (t - integratedSmoothstep(t))) / travelIntegral
}

export function getDrivingFrame(progress: number) {
  const p = clamp(progress)
  const fraction = getTravelFraction(p)
  const speed = p < 0.15 ? smoothstep(p / 0.15) : p < 0.7 ? 1 : 1 - smoothstep((p - 0.7) / 0.15)
  const settling = clamp((p - 0.7) / 0.2)
  const pitch =
    p > 0.7 && p < 0.9
      ? 4 * Math.exp(-6 * settling) * Math.sin(20 * settling) * Math.sin(Math.PI * settling) ** 2
      : 0
  return {
    progress: p,
    travel: (config.startDistance - config.stopDistance) * fraction,
    fraction,
    distance: lerp(config.startDistance, config.stopDistance, fraction),
    speed,
    entrance: smoothstep(p / 0.15),
    pitch,
    messageOpacity: smoothstep((p - config.reveal) / (1 - config.reveal)),
  }
}

export function perspectiveScale(distance: number) {
  return (config.stopDistance + config.nearPlane) / (Math.max(0, distance) + config.nearPlane)
}

export function getEndingLayout(width: number, height: number) {
  const w = Math.max(1, width)
  const h = Math.max(1, height)
  const short = h < 500 && w > h
  const compact = w < 1024
  return {
    width: w,
    height: h,
    compact,
    center: w * (short ? 0.72 : 0.5),
    horizon: h * (short ? 0.35 : 0.38),
    stopY: h * (compact || short ? 0.67 : 0.7),
    blockWidth: Math.min(w * (short ? 0.5 : compact ? 0.82 : 0.64), h * 1.25),
    sceneryWidth: Math.min(w * 0.18, h * 0.3, 240),
    motion: compact ? 0.55 : 1,
  }
}

export type EndingLayout = ReturnType<typeof getEndingLayout>

export function projectGround(distance: number, layout: EndingLayout, lateral = 0) {
  const scale = perspectiveScale(distance)
  return {
    scale,
    x: layout.center + lateral * layout.width * scale,
    y: lerp(layout.horizon, layout.stopY, scale),
  }
}

export function getLoopDepth(seed: number, travel: number) {
  return ((((seed - travel) % 300) + 300) % 300) + 4
}
