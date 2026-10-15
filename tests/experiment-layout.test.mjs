import test from 'node:test'
import assert from 'node:assert/strict'
import {
  experimentSceneSize,
  getExperimentSceneScale,
} from '../src/component/experiments/experimentLayout.ts'

test('the entire desktop composition fits short, standard, and wide viewports', () => {
  for (const [width, height] of [
    [1024, 600],
    [1024, 768],
    [1200, 600],
    [1366, 768],
    [1440, 900],
    [1920, 1080],
    [2560, 1080],
    [1200, 1400],
  ]) {
    const availableHeight = height - 3 // section border
    const scale = getExperimentSceneScale(width, availableHeight)
    const sceneWidth = experimentSceneSize.width * scale
    const sceneHeight = experimentSceneSize.height * scale
    assert.ok(sceneWidth <= width + 0.001)
    assert.ok(sceneHeight <= availableHeight + 0.001)
    assert.ok(
      Math.abs(sceneWidth - width) < 0.001 || Math.abs(sceneHeight - availableHeight) < 0.001,
    )
  }
})

test('resizing recomputes the fit and an unmeasured container never produces a negative scale', () => {
  assert.equal(getExperimentSceneScale(1600, 1000), 1)
  assert.equal(getExperimentSceneScale(1600, 500), 0.5)
  assert.equal(getExperimentSceneScale(800, 1000), 0.5)
  assert.equal(getExperimentSceneScale(0, 0), 0)
})
