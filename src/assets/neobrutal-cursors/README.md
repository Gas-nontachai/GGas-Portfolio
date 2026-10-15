# Neo-brutalist cursor pack

18 original SVG cursors (48×48): default, hover, pointer, pressed, grab, grabbing, drag, drop, no-drop, text, link, loading, disabled, resize-horizontal, resize-vertical, resize-diagonal, help, precision.

## Usage (React + Vite)
`src/component/CustomCursor.tsx` loads every SVG in this folder with
`import.meta.glob` and selects the cursor from pointer events and `data-cursor`
attributes. Keep all 18 SVGs: their filenames are resolved dynamically.
For example: `<div data-cursor="drag">Drag me</div>`.

Note: SVG cursor support varies across browsers and platforms. CSS image cursor URLs cannot animate; `loading.svg` is static. `:active` changes only during the pressed interaction. A React overlay cursor driven by pointer events is needed for fluid animated transitions.
