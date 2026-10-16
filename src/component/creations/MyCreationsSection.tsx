import { useCallback, useMemo, useReducer, useRef, useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslation } from 'react-i18next'
import ScrambleText from '../ScrambleText'
import Notebook from '../notebook/Notebook'
import type { NotebookSelection } from '../notebook/Notebook'
import CreationArtwork from './CreationArtwork'
import ItemInspection from './ItemInspection'
import type { InspectionOrigin } from './ItemInspection'
import type { Creation } from './types'
import { creations, inventoryConfig } from './creations.config'
import { creationNotebooks } from './creationNotebooks'
import {
  buildInventorySlots,
  canOpenNotebook,
  initialInventoryState,
  inventoryReducer,
} from './inventoryState'
import './creations.css'

gsap.registerPlugin(Flip, ScrollTrigger)

export default function MyCreationsSection({ ready = true }: { ready?: boolean }) {
  const { t } = useTranslation()
  const section = useRef<HTMLElement>(null)
  const slotRefs = useRef(new Map<string, HTMLButtonElement>())
  const [origin, setOrigin] = useState<InspectionOrigin | null>(null)
  const [state, dispatch] = useReducer(inventoryReducer, initialInventoryState)
  const [bookSelection, setBookSelection] = useState<NotebookSelection | null>(null)
  const [columns, setColumns] = useState<number>(() =>
    window.matchMedia('(max-width: 1023px)').matches
      ? inventoryConfig.columns.mobile
      : inventoryConfig.columns.desktop,
  )
  const slots = useMemo(
    () => buildInventorySlots(creations, inventoryConfig.minimumSlots, columns),
    [columns],
  )
  const selected = creations.find((item) => item.id === state.selectedItemId)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)')
    const update = () =>
      setColumns(media.matches ? inventoryConfig.columns.mobile : inventoryConfig.columns.desktop)
    media.addEventListener('change', update)
    const observer = new IntersectionObserver(([entry]) => {
      if (section.current) section.current.dataset.inView = String(entry.isIntersecting)
    })
    if (section.current) observer.observe(section.current)
    return () => {
      media.removeEventListener('change', update)
      observer.disconnect()
    }
  }, [])

  useGSAP(
    () => {
      if (!ready || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.from('.creation-slot', {
        opacity: 0,
        y: 18,
        duration: 0.45,
        stagger: 0.045,
        ease: 'power3.out',
        scrollTrigger: { trigger: section.current, start: 'top 80%', once: true },
      })
    },
    { scope: section, dependencies: [ready], revertOnUpdate: true },
  )

  const select = (item: Creation) => {
    if (state.view !== 'idle') return
    const button = slotRefs.current.get(item.id)!
    const art = button.querySelector<HTMLElement>('[data-creation-art]')!
    art.getAnimations().forEach((animation) => animation.finish())
    setOrigin({ button, art, initialState: Flip.getState(art) })
    dispatch({ type: 'select', id: item.id, status: item.status })
  }
  const previewOpened = useCallback(() => dispatch({ type: 'preview-opened' }), [dispatch])
  const closePreview = useCallback(() => dispatch({ type: 'close-preview' }), [dispatch])
  const bookOpened = useCallback(() => dispatch({ type: 'book-opened' }), [dispatch])
  const bookClosing = useCallback(() => dispatch({ type: 'book-closing' }), [dispatch])
  const bookExited = useCallback(() => {
    dispatch({ type: 'book-exited' })
    setBookSelection(null)
  }, [dispatch])
  const previewExited = () => {
    if (state.pendingBook && selected && origin) {
      const source = origin.art
      setBookSelection({
        id: selected.id,
        label: String(creations.indexOf(selected) + 1).padStart(2, '0'),
        color: selected.color,
        image: selected.artwork.kind === 'image' ? selected.artwork.src : null,
        source,
        focusTarget: origin.button,
        initialRect: source.getBoundingClientRect(),
        initialState: Flip.getState(source),
        flipId: `creation-art-${selected.id}`,
        cover: {
          eyebrowKey: 'creations.project',
          titleKey: selected.titleKey,
          descriptionKey: selected.summaryKey,
          label: 'CREATIONS / NOTES',
        },
      })
    }
    dispatch({ type: 'preview-exited' })
  }
  const isPreview = state.view.startsWith('preview-')
  const isBook = state.view.startsWith('book-')
  return (
    <section
      ref={section}
      id="my-creations"
      className="creations-section"
      aria-labelledby="creations-heading"
    >
      <div className="creations-layout">
        <header className="creations-heading">
          <p className="creations-eyebrow">
            <ScrambleText text={`04 / ${t('creations.eyebrow')}`} />
          </p>
          <h2 id="creations-heading">
            <ScrambleText text="My Creations" />
            <br />
            &amp; <ScrambleText text="Toolbox" />
            <span>.</span>
          </h2>
          <p>
            <ScrambleText text={t('creations.description')} />
          </p>
          <span className="creations-collection-tag">
            <ScrambleText text={t('creations.collection', { count: creations.length })} />
          </span>
        </header>
        <div className="creation-board" role="group" aria-label={t('creations.inventory')}>
          {slots.map((item, index) =>
            item ? (
              <button
                key={item.id}
                ref={(node) => {
                  if (node) slotRefs.current.set(item.id, node)
                  else slotRefs.current.delete(item.id)
                }}
                type="button"
                className="creation-slot"
                data-status={item.status}
                data-id={item.id}
                style={{ '--creation-color': item.color } as CSSProperties}
                onClick={() => select(item)}
                aria-label={t('creations.inspect', {
                  title: t(item.titleKey, {
                    number: item.id.replace('mystery-', '').padStart(2, '0'),
                  }),
                })}
                aria-haspopup="dialog"
              >
                <span className="creation-slot-number" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span
                  className="creation-slot-art"
                  data-creation-art
                  data-flip-id={`creation-art-${item.id}`}
                >
                  <CreationArtwork artwork={item.artwork} />
                </span>
                <span className="creation-slot-label">
                  <ScrambleText
                    text={t(item.titleKey, {
                      number: item.id.replace('mystery-', '').padStart(2, '0'),
                    })}
                  />
                </span>
                <span className="creation-slot-status">
                  <ScrambleText text={t(`creations.status.${item.status}`)} />
                </span>
              </button>
            ) : (
              <div
                key={`empty-${index}`}
                className="creation-slot creation-slot--empty"
                aria-label={t('creations.empty')}
              >
                <span aria-hidden="true">+</span>
                <span>
                  <ScrambleText text={t('creations.empty')} />
                </span>
              </div>
            ),
          )}
        </div>
      </div>
      {isPreview && selected && origin && (
        <ItemInspection
          item={selected}
          origin={origin}
          view={state.view}
          onOpened={previewOpened}
          onClose={closePreview}
          onMore={() => dispatch({ type: 'view-more', hasNotebook: canOpenNotebook(selected) })}
          onExited={previewExited}
        />
      )}
      {isBook && selected && bookSelection && (
        <Notebook
          selection={bookSelection}
          spreads={creationNotebooks.get(selected.id)!}
          onOpened={bookOpened}
          onCloseStart={bookClosing}
          onExited={bookExited}
        />
      )}
    </section>
  )
}
