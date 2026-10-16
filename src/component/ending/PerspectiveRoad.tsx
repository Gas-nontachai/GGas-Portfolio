export default function PerspectiveRoad() {
  return (
    <svg className="ending-road" preserveAspectRatio="none" aria-hidden="true">
      <path className="ending-road-shoulder" data-road-shoulder />
      <path className="ending-road-surface" data-road-surface />
      <path className="ending-road-edge" data-road-edge />
      {Array.from({ length: 12 }, (_, index) => (
        <path key={index} className="ending-lane-mark" data-lane-mark />
      ))}
    </svg>
  )
}
