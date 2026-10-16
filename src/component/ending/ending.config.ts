export const endingConfig = {
  accelerationEnd: 0.15,
  brakingStart: 0.7,
  stop: 0.85,
  reveal: 0.9,
  startDistance: 260,
  stopDistance: 20,
  nearPlane: 16,
  desktopScrollScreens: 4,
  compactScrollScreens: 3,
} as const

export const roadsideObjects = Array.from({ length: 12 }, (_, index) => ({
  side: index % 2 === 0 ? -1 : 1,
  depth: 30 + Math.floor(index / 2) * 46,
  kind: index % 5 === 0 ? 'lamp' : index % 3 === 0 ? 'bush' : index % 2 ? 'tall' : 'round',
  lateral: 0.47 + (index % 3) * 0.075,
}))
