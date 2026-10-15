// Reserve the final 10% of the pinned scroll for reading the Future stop.
export const JOURNEY_ARRIVAL_PROGRESS = 0.9

export function getJourneyFrame(scrollProgress: number, milestoneCount: number, spacing: number) {
  const progress = Math.max(0, Math.min(1, scrollProgress / JOURNEY_ARRIVAL_PROGRESS))
  const lastIndex = Math.max(0, milestoneCount - 1)
  return {
    progress,
    distance: progress * spacing * lastIndex,
    focused: Math.round(progress * lastIndex),
    arrived: progress === 1,
    percentage: Math.round(progress * 100),
  }
}

export function getMilestoneScrollProgress(index: number, milestoneCount: number) {
  const lastIndex = Math.max(0, milestoneCount - 1)
  const clampedIndex = Math.max(0, Math.min(lastIndex, index))
  if (lastIndex === 0) return 0
  // Land inside the final hold so browser scroll rounding cannot miss arrival.
  if (clampedIndex === lastIndex) return (1 + JOURNEY_ARRIVAL_PROGRESS) / 2
  return (clampedIndex / lastIndex) * JOURNEY_ARRIVAL_PROGRESS
}
