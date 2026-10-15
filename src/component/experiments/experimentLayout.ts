export const experimentSceneSize = { width: 1600, height: 1000 } as const

export function getExperimentSceneScale(width: number, height: number): number {
  return Math.max(
    0,
    Math.min(width / experimentSceneSize.width, height / experimentSceneSize.height),
  )
}
