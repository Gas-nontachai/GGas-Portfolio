import type { Creation } from './types.ts'

export type InventoryView =
  | 'idle'
  | 'preview-opening'
  | 'preview-open'
  | 'preview-closing'
  | 'book-opening'
  | 'book-open'
  | 'book-closing'
export type InventoryState = {
  view: InventoryView
  selectedItemId: string | null
  pendingBook: boolean
}
export const initialInventoryState: InventoryState = {
  view: 'idle',
  selectedItemId: null,
  pendingBook: false,
}
export type InventoryAction =
  | { type: 'select'; id: string; status: Creation['status'] | 'empty' }
  | { type: 'preview-opened' }
  | { type: 'close-preview' }
  | { type: 'view-more'; hasNotebook: boolean }
  | { type: 'preview-exited' }
  | { type: 'book-opened' }
  | { type: 'book-closing' }
  | { type: 'book-exited' }

export function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'select':
      return state.view === 'idle' && action.status !== 'empty'
        ? { view: 'preview-opening', selectedItemId: action.id, pendingBook: false }
        : state
    case 'preview-opened':
      return state.view === 'preview-opening' ? { ...state, view: 'preview-open' } : state
    case 'close-preview':
      return state.view === 'preview-open' || state.view === 'preview-opening'
        ? { ...state, view: 'preview-closing', pendingBook: false }
        : state
    case 'view-more':
      return state.view === 'preview-open' && action.hasNotebook
        ? { ...state, view: 'preview-closing', pendingBook: true }
        : state
    case 'preview-exited':
      return state.view === 'preview-closing'
        ? state.pendingBook
          ? { ...state, view: 'book-opening' }
          : initialInventoryState
        : state
    case 'book-opened':
      return state.view === 'book-opening' ? { ...state, view: 'book-open' } : state
    case 'book-closing':
      return state.view === 'book-open' || state.view === 'book-opening'
        ? { ...state, view: 'book-closing' }
        : state
    case 'book-exited':
      return state.view === 'book-closing' ||
        state.view === 'book-opening' ||
        state.view === 'book-open'
        ? initialInventoryState
        : state
  }
}

export function canOpenNotebook(item: Pick<Creation, 'status' | 'notebook'>) {
  const notebook = item.notebook
  return (
    item.status !== 'mystery' &&
    Boolean(
      notebook &&
      (notebook.overviewKey ||
        notebook.whyKey ||
        notebook.featureKeys?.length ||
        notebook.tech?.length ||
        notebook.learningKeys?.length ||
        notebook.screenshots?.length),
    )
  )
}

export function buildInventorySlots<T extends { id: string }>(
  items: readonly T[],
  minimum = 12,
  columns = 4,
): (T | null)[] {
  const count = Math.max(minimum, Math.ceil(items.length / columns) * columns)
  return Array.from({ length: count }, (_, index) => items[index] ?? null)
}
