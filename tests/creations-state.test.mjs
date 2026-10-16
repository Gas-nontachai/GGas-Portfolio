import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildInventorySlots,
  canOpenNotebook,
  initialInventoryState as idle,
  inventoryReducer as reduce,
} from '../src/component/creations/inventoryState.ts'

const project = { id: 'health', status: 'completed' }
const select = { type: 'select', ...project }

test('project flow returns from notebook directly to inventory', () => {
  let state = reduce(idle, select)
  assert.equal(state.view, 'preview-opening')
  assert.equal(reduce(state, { type: 'select', id: 'another', status: 'completed' }), state)
  state = reduce(state, { type: 'preview-opened' })
  state = reduce(state, { type: 'view-more', hasNotebook: true })
  assert.equal(state.view, 'preview-closing')
  assert.equal(state.pendingBook, true)
  state = reduce(state, { type: 'preview-exited' })
  assert.equal(state.view, 'book-opening')
  state = reduce(state, { type: 'book-opened' })
  state = reduce(state, { type: 'book-closing' })
  assert.equal(reduce(state, { type: 'book-exited' }), idle)
})

test('Escape can interrupt preview opening and stale completion cannot reopen it', () => {
  let state = reduce(reduce(idle, select), { type: 'close-preview' })
  assert.equal(state.view, 'preview-closing')
  assert.equal(reduce(state, { type: 'preview-opened' }), state)
  assert.equal(reduce(state, { type: 'preview-exited' }), idle)
})

test('mystery has a preview but never a notebook; empty slots cannot be selected', () => {
  assert.equal(reduce(idle, { type: 'select', id: 'empty', status: 'empty' }), idle)
  let state = reduce(idle, { type: 'select', id: 'mystery-1', status: 'mystery' })
  state = reduce(state, { type: 'preview-opened' })
  assert.equal(reduce(state, { type: 'view-more', hasNotebook: false }), state)
  assert.equal(canOpenNotebook({ status: 'mystery', notebook: {} }), false)
  assert.equal(canOpenNotebook({ status: 'wip', notebook: {} }), false)
  assert.equal(canOpenNotebook({ status: 'wip', notebook: { tech: ['Flutter'] } }), true)
  assert.equal(canOpenNotebook({ status: 'completed', notebook: {} }), false)
  assert.equal(canOpenNotebook({ status: 'completed' }), false)
})

test('slots start with six items and six empty positions and expand without losing projects', () => {
  const initial = Array.from({ length: 6 }, (_, index) => ({ id: String(index) }))
  const slots = buildInventorySlots(initial)
  assert.equal(slots.length, 12)
  assert.equal(slots.filter((item) => item === null).length, 6)
  const projects = Array.from({ length: 17 }, (_, index) => ({ id: String(index) }))
  for (const columns of [3, 4]) {
    const expanded = buildInventorySlots(projects, 12, columns)
    assert.ok(expanded.length >= projects.length)
    assert.equal(expanded.length % columns, 0)
    assert.deepEqual(expanded.filter(Boolean), projects)
  }
})
