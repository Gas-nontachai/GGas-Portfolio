import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getJourneyFrame,
  getMilestoneScrollProgress,
} from '../src/component/journey/journeyMotion.ts'

test('all chapter buttons position the matching stop at the camera center', () => {
  for (const spacing of [370, 760]) {
    for (let index = 0; index < 3; index++) {
      const frame = getJourneyFrame(getMilestoneScrollProgress(index, 3), 3, spacing)
      assert.equal(frame.focused, index)
      assert.ok(Math.abs(frame.distance - index * spacing) < 0.000001)
    }
  }
})

test('Future remains at the center during the ending hold', () => {
  for (const progress of [0.9, 0.95, 1, 1.1]) {
    const frame = getJourneyFrame(progress, 3, 760)
    assert.equal(frame.distance, 1520)
    assert.equal(frame.focused, 2)
    assert.equal(frame.percentage, 100)
    assert.equal(frame.arrived, true)
  }
})

test('reverse scrolling leaves the ending and returns through each earlier chapter', () => {
  assert.equal(getJourneyFrame(0.89, 3, 760).arrived, false)
  assert.deepEqual(
    [0.95, 0.45, 0].map((progress) => getJourneyFrame(progress, 3, 760).focused),
    [2, 1, 0],
  )
  assert.equal(getJourneyFrame(-0.1, 3, 760).distance, 0)
})

test('camera positions resize while preserving the current chapter and arrival', () => {
  for (const progress of [0, 0.45, 0.95]) {
    const desktop = getJourneyFrame(progress, 3, 760)
    const mobile = getJourneyFrame(progress, 3, 370)
    assert.equal(desktop.focused, mobile.focused)
    assert.equal(desktop.arrived, mobile.arrived)
    assert.equal(desktop.percentage, mobile.percentage)
  }
})
