import test from 'node:test'
import assert from 'node:assert/strict'
import { lerp, notebookEase, smoothstep, smootherstep } from '../src/component/journey/notebookMotion.ts'

test('notebook fades stay bounded and monotonic, including overlapping fade windows', () => {
  let previous = 0
  for (let frame = 0; frame <= 100; frame++) {
    const opacity = smoothstep(frame / 100)
    assert.ok(opacity >= previous && opacity <= 1)
    previous = opacity
  }
  assert.equal(smoothstep(-1), 0)
  assert.equal(smoothstep(2), 1)
  assert.equal(smoothstep(0.5), 0.5)
})

test('card easing has stable endpoints and never overshoots on opening or return', () => {
  let previous = 0
  assert.ok(notebookEase(0) < 0.0001)
  assert.ok(Math.abs(notebookEase(1) - 1) < 0.0001)
  for (let frame = 0; frame <= 100; frame++) {
    const progress = notebookEase(frame / 100)
    assert.ok(progress >= previous && progress <= 1)
    previous = progress
  }
})

test('content interpolation finishes at the same rest position in either direction', () => {
  assert.equal(lerp(12, 0, 0), 12)
  assert.equal(lerp(12, 0, 1), 0)
  assert.equal(lerp(0, 12, 0), 0)
  assert.equal(lerp(0, 12, 1), 12)
})

test('page turns settle with zero endpoint velocity and acceleration', () => {
  const h = 0.0001
  assert.equal(smootherstep(-1), 0)
  assert.equal(smootherstep(2), 1)
  assert.equal(smootherstep(0.5), 0.5)
  for (const endpoint of [0, 1]) {
    const direction = endpoint === 0 ? 1 : -1
    const start = smootherstep(endpoint)
    const near = smootherstep(endpoint + direction * h)
    const farther = smootherstep(endpoint + direction * h * 2)
    assert.ok(Math.abs((near - start) / h) < 0.00001)
    assert.ok(Math.abs((farther - 2 * near + start) / (h * h)) < 0.01)
  }
  let previous = 0
  for (let frame = 0; frame <= 100; frame++) {
    const progress = smootherstep(frame / 100)
    assert.ok(progress >= previous && progress <= 1)
    assert.ok(Math.abs(progress + smootherstep(1 - frame / 100) - 1) < 1e-12)
    previous = progress
  }
})
