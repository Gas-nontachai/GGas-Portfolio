import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  getPreviewExperiment,
  initialSelection,
  selectionReducer,
} from '../src/component/experiments/experimentSelection.ts'

test('Flutter is selected initially and hover does not change the locked experiment', () => {
  assert.equal(getPreviewExperiment(initialSelection), 'flutter')
  const preview = selectionReducer(initialSelection, { type: 'hover', id: 'esp32' })
  assert.equal(getPreviewExperiment(preview), 'esp32')
  assert.equal(preview.selected, 'flutter')
  assert.equal(
    getPreviewExperiment(selectionReducer(preview, { type: 'leave', id: 'esp32' })),
    'flutter',
  )
})

test('selection persists after leaving and selecting again never closes the panel', () => {
  let state = selectionReducer(initialSelection, { type: 'select', id: 'printing' })
  state = selectionReducer(state, { type: 'leave', id: 'printing' })
  state = selectionReducer(state, { type: 'select', id: 'printing' })
  assert.equal(state.selected, 'printing')
  assert.equal(getPreviewExperiment(state), 'printing')
})

test('keyboard focus previews and blur restores selection', () => {
  const focused = selectionReducer(initialSelection, { type: 'focus', id: 'davinci' })
  assert.equal(getPreviewExperiment(focused), 'davinci')
  assert.equal(
    getPreviewExperiment(selectionReducer(focused, { type: 'blur', id: 'davinci' })),
    'flutter',
  )
})

test('pointer preview yields back to keyboard focus on leave', () => {
  let state = selectionReducer(initialSelection, { type: 'focus', id: 'esp32' })
  state = selectionReducer(state, { type: 'hover', id: 'davinci' })
  assert.equal(getPreviewExperiment(state), 'davinci')
  state = selectionReducer(state, { type: 'leave', id: 'davinci' })
  assert.equal(getPreviewExperiment(state), 'esp32')
})

test('late leave and blur events cannot clear a newer preview', () => {
  let state = selectionReducer(initialSelection, { type: 'hover', id: 'esp32' })
  state = selectionReducer(state, { type: 'hover', id: 'printing' })
  state = selectionReducer(state, { type: 'leave', id: 'esp32' })
  assert.equal(getPreviewExperiment(state), 'printing')
  state = selectionReducer(state, { type: 'leave', id: 'printing' })
  state = selectionReducer(state, { type: 'focus', id: 'esp32' })
  state = selectionReducer(state, { type: 'focus', id: 'davinci' })
  state = selectionReducer(state, { type: 'blur', id: 'esp32' })
  assert.equal(getPreviewExperiment(state), 'davinci')
})

test('rapid selection settles on the latest choice without stale preview', () => {
  let state = initialSelection
  for (let index = 0; index < 50; index++) {
    for (const id of ['flutter', 'esp32', 'printing', 'davinci']) {
      state = selectionReducer(state, { type: 'hover', id })
      state = selectionReducer(state, { type: 'select', id })
      state = selectionReducer(state, { type: 'leave', id })
    }
  }
  assert.deepEqual(state, { selected: 'davinci', hovered: null, focused: null })
})

test('TH/EN include descriptions, three highlights, and all statuses', () => {
  for (const language of ['en', 'th']) {
    const { experiments } = JSON.parse(
      readFileSync(new URL(`../src/locales/${language}.json`, import.meta.url), 'utf8'),
    )
    for (const id of ['flutter', 'esp32', 'printing', 'davinci']) {
      assert.ok(experiments.items[id].description.length > 0)
      assert.equal(experiments.items[id].highlights.length, 3)
      assert.ok(experiments.items[id].highlights.every((text) => text.length > 0))
    }
    for (const status of ['learning', 'exploring', 'experimenting'])
      assert.ok(experiments.status[status])
  }
})
