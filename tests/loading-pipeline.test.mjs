import test from 'node:test'
import assert from 'node:assert/strict'
import { preparePortfolio } from '../src/utils/loadingPipeline.ts'
import { preloadImage, withTimeout } from '../src/utils/imagePreloader.ts'

const deferred = () => {
  let resolve
  let reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
const assetsReady = { completed: 4, total: 4, failed: 0 }

test('content and assets start together, and loaded images cannot reveal unready code', async () => {
  const content = deferred()
  const assets = deferred()
  const started = []
  let ready = false
  const loading = preparePortfolio(
    () => {
      started.push('content')
      return content.promise
    },
    () => {
      started.push('assets')
      return assets.promise
    },
  ).then(() => {
    ready = true
  })
  assert.deepEqual(started, ['content', 'assets'])
  assets.resolve(assetsReady)
  await Promise.resolve()
  assert.equal(ready, false)
  content.resolve()
  await loading
  assert.equal(ready, true)
})

test('loaded code cannot reveal the portfolio while images are still preparing', async () => {
  const assets = deferred()
  let ready = false
  const loading = preparePortfolio(
    () => Promise.resolve(),
    () => assets.promise,
  ).then(() => {
    ready = true
  })
  await Promise.resolve()
  assert.equal(ready, false)
  assets.resolve(assetsReady)
  await loading
  assert.equal(ready, true)
})

test('asset failure keeps the gate closed, and a successful retry can complete', async () => {
  await assert.rejects(
    preparePortfolio(
      () => Promise.resolve(),
      () => Promise.resolve({ ...assetsReady, failed: 1 }),
    ),
    /assets unavailable/,
  )
  assert.deepEqual(
    await preparePortfolio(
      () => Promise.resolve(),
      () => Promise.resolve(assetsReady),
    ),
    assetsReady,
  )
})

test('code download errors propagate to the retry state', async () => {
  await assert.rejects(
    preparePortfolio(
      () => Promise.reject(new Error('code download failed')),
      () => Promise.resolve(assetsReady),
    ),
    /code download failed/,
  )
})

test('stalled preparation times out instead of waiting indefinitely', async () => {
  await assert.rejects(withTimeout(new Promise(() => {}), 5), /timed out/)
})

test('image preload shares a request and waits for decoding before completing', async (t) => {
  const originalImage = globalThis.Image
  t.after(() => {
    globalThis.Image = originalImage
  })
  const decoded = deferred()
  let requests = 0
  globalThis.Image = class {
    set src(_url) {
      requests++
      queueMicrotask(() => this.onload())
    }
    decode() {
      return decoded.promise
    }
  }
  const first = preloadImage('test/shared-image')
  assert.equal(preloadImage('test/shared-image'), first)
  let ready = false
  void first.then(() => {
    ready = true
  })
  await Promise.resolve()
  assert.equal(ready, false)
  decoded.resolve()
  await first
  assert.equal(requests, 1)
  assert.equal(ready, true)
})

test('failed images are evicted so retry makes a fresh request', async (t) => {
  const originalImage = globalThis.Image
  t.after(() => {
    globalThis.Image = originalImage
  })
  let requests = 0
  globalThis.Image = class {
    set src(_url) {
      const attempt = ++requests
      queueMicrotask(() => (attempt === 1 ? this.onerror() : this.onload()))
    }
    decode() {
      return Promise.resolve()
    }
  }
  await assert.rejects(preloadImage('test/retry-image'), /Unable to load/)
  await preloadImage('test/retry-image')
  assert.equal(requests, 2)
})
