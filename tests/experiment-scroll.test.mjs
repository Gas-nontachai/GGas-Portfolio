import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createExperimentEntranceCapture,
  createScrollVelocityTracker,
  getExperimentAttractionMotion,
} from '../src/component/experiments/experimentScroll.ts'

test('velocity smoothing converges consistently across different frame rates', () => {
  for (const interval of [10, 20, 40]) {
    const sample = createScrollVelocityTracker(0, 0)
    let velocity = 0
    for (let time = interval; time <= 240; time += interval) velocity = sample(time, time)
    assert.ok(Math.abs(velocity - 1000 * (1 - Math.exp(-6))) < 0.000001)
    assert.equal(sample(240, 1000), 0)
  }
})

test('attraction adapts its duration to distance and incoming velocity', () => {
  const slow = getExperimentAttractionMotion(600, 500)
  const fast = getExperimentAttractionMotion(600, 2000)
  const close = getExperimentAttractionMotion(80, 500)
  assert.ok(fast.duration < slow.duration)
  assert.ok(close.duration < slow.duration)
  assert.equal(getExperimentAttractionMotion(0, 1000).duration, 0)
})

test('the attraction curve stays monotonic, lands exactly, and stops without overshoot', () => {
  for (const distance of [-80, -1, 1, 80, 600, 1200]) {
    for (const velocity of [-4000, 0, 50, 600, 2000, 8000]) {
      const { duration, ease } = getExperimentAttractionMotion(distance, velocity)
      assert.ok(duration >= 0.28 && duration <= 0.85)
      assert.equal(ease(0), 0)
      assert.equal(ease(1), 1)
      let previous = 0
      for (let step = 0; step <= 1000; step++) {
        const value = ease(step / 1000)
        assert.ok(value >= previous - 1e-9 && value <= 1 + 1e-9)
        previous = value
      }
      assert.ok(Math.abs((ease(1) - ease(1 - 1e-6)) / 1e-6) < 0.00001)
    }
  }
})

test('ease-out starts promptly and covers progressively less distance as it settles', () => {
  for (const velocity of [0, 600, 2000]) {
    const { ease } = getExperimentAttractionMotion(600, velocity)
    let previousStep = Infinity
    for (let step = 1; step <= 4; step++) {
      const distance = ease(step / 4) - ease((step - 1) / 4)
      assert.ok(distance < previousStep)
      previousStep = distance
    }
    assert.ok(ease(0.25) > 0.5)
  }
})

function frame(scrollY, viewportHeight = 800) {
  return { scrollY, sectionTop: 4000 - scrollY, viewportHeight }
}

test('captures immediately on forward entry without waiting for scrolling to stop', () => {
  const capture = createExperimentEntranceCapture(3200)
  assert.equal(capture(frame(3300)), null)
  assert.equal(capture(frame(3360)), 4000)
})

test('the target aligns the section top across viewport heights and small overshoots', () => {
  for (const height of [540, 800, 1000]) {
    const capture = createExperimentEntranceCapture(4000 - height)
    assert.equal(capture(frame(4000 - height * 0.8, height)), 4000)
    const overshoot = createExperimentEntranceCapture(4000 - height)
    assert.equal(overshoot(frame(4000 + height * 0.05, height)), 4000)
  }
})

test('momentum, tween updates, and later scrolling never recapture the same entrance', () => {
  const capture = createExperimentEntranceCapture(3200)
  assert.equal(capture(frame(3400)), 4000)
  for (const scrollY of [3450, 3600, 3900, 4000, 4040, 4100]) {
    assert.equal(capture(frame(scrollY)), null)
  }
})

test('reversing or staying still does not capture; returning above the entry rearms it', () => {
  const capture = createExperimentEntranceCapture(3800)
  assert.equal(capture(frame(3800)), null)
  assert.equal(capture(frame(3600)), null)
  assert.equal(capture(frame(3200)), null)
  assert.equal(capture(frame(3400)), 4000)
  assert.equal(capture(frame(3200)), null)
  assert.equal(capture(frame(3400)), 4000)
})

test('fast scrolling beyond the entrance and layout changes at rest do not pull back', () => {
  const capture = createExperimentEntranceCapture(3200)
  assert.equal(capture(frame(4300)), null)
  assert.equal(capture({ scrollY: 4300, sectionTop: 100, viewportHeight: 800 }), null)
})

test('menu navigation can cross the experiments entrance without being captured', () => {
  const capture = createExperimentEntranceCapture(0)
  for (const scrollY of [3000, 3400, 3800, 4000, 4400]) {
    assert.equal(capture({ ...frame(scrollY), navigationActive: true }), null)
  }
  assert.equal(capture(frame(4401)), null)
})

test('navigating to experiments also suppresses the final scroll event after arrival', () => {
  const capture = createExperimentEntranceCapture(0)
  assert.equal(capture({ ...frame(3500), navigationActive: true }), null)
  assert.equal(capture({ ...frame(3999), navigationActive: true }), null)
  assert.equal(capture(frame(4000)), null)
  // A later manual entrance still gets the original attraction animation.
  assert.equal(capture(frame(3000)), null)
  assert.equal(capture(frame(3400)), 4000)
})

test('returning to the top through navigation rearms the next manual entrance', () => {
  const capture = createExperimentEntranceCapture(3200)
  assert.equal(capture(frame(3400)), 4000)
  for (const scrollY of [3200, 2000, 0]) {
    assert.equal(capture({ ...frame(scrollY), navigationActive: true }), null)
  }
  assert.equal(capture(frame(3400)), 4000)
})
