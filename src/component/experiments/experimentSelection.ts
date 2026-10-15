export type ExperimentId = 'flutter' | 'esp32' | 'printing' | 'davinci'

export type ExperimentSelection = {
  selected: ExperimentId
  hovered: ExperimentId | null
  focused: ExperimentId | null
}

export type SelectionAction =
  | { type: 'select'; id: ExperimentId }
  | { type: 'hover' | 'focus'; id: ExperimentId }
  | { type: 'leave' | 'blur'; id: ExperimentId }

export const initialSelection: ExperimentSelection = {
  selected: 'flutter',
  hovered: null,
  focused: null,
}

export function selectionReducer(
  state: ExperimentSelection,
  action: SelectionAction,
): ExperimentSelection {
  switch (action.type) {
    case 'select':
      return { selected: action.id, hovered: null, focused: null }
    case 'hover':
      return { ...state, hovered: action.id }
    case 'focus':
      return { ...state, focused: action.id }
    case 'leave':
      return state.hovered === action.id ? { ...state, hovered: null } : state
    case 'blur':
      return state.focused === action.id ? { ...state, focused: null } : state
  }
}

export function getPreviewExperiment(state: ExperimentSelection): ExperimentId {
  return state.hovered ?? state.focused ?? state.selected
}
