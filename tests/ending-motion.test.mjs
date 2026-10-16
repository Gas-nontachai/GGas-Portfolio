import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  getDrivingFrame,
  getTravelFraction,
  perspectiveScale,
  projectGround,
  getEndingLayout,
  getLoopDepth,
} from '../src/component/ending/drivingMath.ts'

const close = (actual, expected, tolerance = 1e-6) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≈ ${expected}`)

test('progress is clamped and travel never crosses the stopping distance', () => {
  assert.deepEqual(getDrivingFrame(-1), getDrivingFrame(0))
  assert.deepEqual(getDrivingFrame(2), getDrivingFrame(1))
  assert.deepEqual(getDrivingFrame(NaN), getDrivingFrame(0))
  let previous = 0
  for (let i = 0; i <= 1000; i++) {
    const frame = getDrivingFrame(i / 1000)
    assert.ok(frame.travel >= previous - 1e-9)
    assert.ok(frame.distance >= 20)
    assert.ok(frame.travel <= 240)
    previous = frame.travel
  }
})

test('integrated velocity is continuous at acceleration, cruising and stopping boundaries', () => {
  for (const p of [0.15, 0.7, 0.85]) {
    const epsilon = 1e-6
    const leftVelocity = (getTravelFraction(p) - getTravelFraction(p - epsilon)) / epsilon
    const rightVelocity = (getTravelFraction(p + epsilon) - getTravelFraction(p)) / epsilon
    close(leftVelocity, rightVelocity, 1e-4)
  }
  close(getDrivingFrame(0).speed, 0)
  close(getDrivingFrame(0.85).speed, 0)
  assert.ok(getDrivingFrame(0.08).speed < getDrivingFrame(0.15).speed)
  assert.ok(getDrivingFrame(0.8).speed < getDrivingFrame(0.7).speed)
})

test('travel and scenery are stationary before the message is revealed', () => {
  const stopped = getDrivingFrame(0.85)
  for (const p of [0.85, 0.9, 0.92, 0.99, 1]) {
    const frame = getDrivingFrame(p)
    assert.equal(frame.travel, stopped.travel)
    assert.equal(frame.distance, 20)
    assert.equal(frame.speed, 0)
    assert.equal(getLoopDepth(80, frame.travel), getLoopDepth(80, stopped.travel))
  }
  assert.equal(getDrivingFrame(0.9).messageOpacity, 0)
  assert.equal(getDrivingFrame(0.9).pitch, 0)
  assert.equal(getDrivingFrame(0.85).messageOpacity, 0)
  close(getDrivingFrame(0.95).messageOpacity, 0.5)
  close(getDrivingFrame(1).messageOpacity, 1)
})

test('reverse scrolling produces identical frames without accumulated state', () => {
  const progress = [0, 0.15, 0.45, 0.7, 0.85, 0.95, 1]
  const forward = progress.map(getDrivingFrame)
  assert.deepEqual([...progress].reverse().map(getDrivingFrame).reverse(), forward)
})

test('projection respects depth and the pair of barricades fits every target viewport', () => {
  for (const [width, height] of [
    [1440, 900],
    [1024, 768],
    [768, 1024],
    [390, 844],
    [844, 390],
    [320, 568],
  ]) {
    const layout = getEndingLayout(width, height)
    const far = projectGround(260, layout)
    const near = projectGround(20, layout)
    assert.ok(far.scale < near.scale)
    assert.ok(far.y < near.y)
    assert.equal(near.scale, 1)
    assert.ok(layout.center - layout.blockWidth / 2 >= 0)
    assert.ok(layout.center + layout.blockWidth / 2 <= width)
    assert.ok(near.y < height * 0.77)
    const afterResize = getDrivingFrame(0.8)
    assert.equal(afterResize.distance, getDrivingFrame(0.8).distance)
  }
  close(perspectiveScale(20), 1)
  assert.ok(Number.isFinite(perspectiveScale(-10)))
})

test('TH/EN contain ending message, return CTA and scroll hint', () => {
  for (const language of ['th', 'en']) {
    const { ending } = JSON.parse(
      readFileSync(new URL(`../src/locales/${language}.json`, import.meta.url), 'utf8'),
    )
    for (const key of ['eyebrow', 'title', 'description', 'back', 'scroll'])
      assert.ok(ending[key].length > 0)
  }
})
