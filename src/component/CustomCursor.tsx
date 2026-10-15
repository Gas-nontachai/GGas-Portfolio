import { useEffect, useRef } from 'react'

const cursorAssets = import.meta.glob<string>('../assets/neobrutal-cursors/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

const hotspots = {
  default: [23, 23],
  pointer: [12, 7],
  hover: [24, 24],
  pressed: [24, 24],
  grab: [24, 24],
  grabbing: [24, 24],
  drag: [24, 24],
  drop: [24, 24],
  'no-drop': [24, 24],
  text: [24, 24],
  link: [24, 24],
  loading: [24, 24],
  disabled: [24, 24],
  'resize-horizontal': [24, 24],
  'resize-vertical': [24, 24],
  'resize-diagonal': [24, 24],
  help: [24, 24],
  precision: [24, 24],
} as const

type CursorName = keyof typeof hotspots

const cursorScale = 12 / 48

function getCursor(target: Element | null, pressed: boolean): CursorName {
  if (!target) return 'default'
  if (target.closest(':disabled, [aria-disabled="true"]')) return 'disabled'

  const custom = target.closest('[data-cursor]')?.getAttribute('data-cursor')
  if (custom && Object.hasOwn(hotspots, custom)) return custom as CursorName

  if (target.closest('[data-dragging="true"]')) return 'grabbing'
  if (target.closest('[draggable="true"]')) return pressed ? 'grabbing' : 'grab'
  if (target.closest('a, button, [role="button"], [role="switch"]')) {
    return pressed ? 'pressed' : 'pointer'
  }
  if (target.closest('input, textarea, [contenteditable="true"]')) return 'text'
  return 'default'
}

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let currentCursor: CursorName | null = null

    const updateCursor = (event: PointerEvent) => {
      const cursor = cursorRef.current
      if (!cursor || event.pointerType === 'touch') return

      const target = event.target instanceof Element ? event.target : null
      const name = getCursor(target, (event.buttons & 1) !== 0)
      const [hotspotX, hotspotY] = hotspots[name]

      if (currentCursor !== name) {
        cursor.style.backgroundImage = `url("${cursorAssets[`../assets/neobrutal-cursors/${name}.svg`]}")`
        currentCursor = name
      }
      cursor.style.transform = `translate3d(${event.clientX - hotspotX * cursorScale}px, ${event.clientY - hotspotY * cursorScale}px, 0)`
      cursor.style.visibility = 'visible'
    }

    const hideCursor = () => {
      if (cursorRef.current) cursorRef.current.style.visibility = 'hidden'
    }

    const handlePointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) hideCursor()
    }

    window.addEventListener('pointermove', updateCursor)
    window.addEventListener('pointerover', updateCursor)
    window.addEventListener('pointerdown', updateCursor)
    window.addEventListener('pointerup', updateCursor)
    window.addEventListener('pointerout', handlePointerOut)
    window.addEventListener('pointercancel', hideCursor)
    window.addEventListener('blur', hideCursor)

    return () => {
      window.removeEventListener('pointermove', updateCursor)
      window.removeEventListener('pointerover', updateCursor)
      window.removeEventListener('pointerdown', updateCursor)
      window.removeEventListener('pointerup', updateCursor)
      window.removeEventListener('pointerout', handlePointerOut)
      window.removeEventListener('pointercancel', hideCursor)
      window.removeEventListener('blur', hideCursor)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      style={{ visibility: 'hidden' }}
      className="pointer-events-none fixed top-0 left-0 z-[9999] size-[32px] bg-contain bg-no-repeat will-change-transform pointer-coarse:hidden"
    />
  )
}
