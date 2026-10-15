import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import sharp from 'sharp'
import { optimizeAssets, optimizeImage } from '../scripts/optimize-images.mjs'

test('PNG optimization retains decoded pixels, dimensions and transparency', async () => {
  const original = await sharp({ create: { width: 128, height: 128, channels: 4, background: '#ff80ab80' } })
    .png({ compressionLevel: 0 }).toBuffer()
  const { buffer } = await optimizeImage(original, '.PNG')
  assert.ok(buffer.length < original.length)
  const metadata = await sharp(buffer).metadata()
  assert.equal(metadata.format, 'png')
  assert.equal(metadata.width, 128)
  assert.equal(metadata.height, 128)
  assert.equal(metadata.hasAlpha, true)
  assert.deepEqual(await sharp(buffer).raw().toBuffer(), await sharp(original).raw().toBuffer())
})

test('dry run does not write; write mode preserves SVG and original paths', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'ggas-images-'))
  try {
    const image = await sharp({ create: { width: 64, height: 64, channels: 3, background: '#ffe16b' } })
      .png({ compressionLevel: 0 }).toBuffer()
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><path id="cursor" d="M0 0h8v8H0z"/></svg>'
    await writeFile(path.join(directory, 'sample.png'), image)
    await writeFile(path.join(directory, 'cursor.svg'), svg)
    const options = { roots: [directory], log: () => {} }
    const preview = await optimizeAssets(options)
    assert.equal(preview.changed, 1)
    assert.equal(preview.errors, 0)
    assert.deepEqual(await readFile(path.join(directory, 'sample.png')), image)
    const result = await optimizeAssets({ ...options, write: true })
    assert.equal(result.changed, 1)
    assert.equal(result.errors, 0)
    assert.ok((await readFile(path.join(directory, 'sample.png'))).length < image.length)
    assert.equal(await readFile(path.join(directory, 'cursor.svg'), 'utf8'), svg)
    assert.deepEqual((await readdir(directory)).sort(), ['cursor.svg', 'sample.png'])
    assert.equal((await optimizeAssets({ ...options, write: true })).changed, 0)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('failed decodes leave originals untouched and report errors', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'ggas-images-'))
  try {
    const filename = path.join(directory, 'broken.png')
    const original = Buffer.from('not an image')
    await writeFile(filename, original)
    const result = await optimizeAssets({ roots: [directory], write: true, log: () => {} })
    assert.equal(result.errors, 1)
    assert.equal(result.changed, 0)
    assert.deepEqual(await readFile(filename), original)
    assert.deepEqual(await readdir(directory), ['broken.png'])
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('large mode resizes only oversized images, retains format and aspect ratio', async () => {
  const original = await sharp({ create: { width: 2048, height: 512, channels: 4, background: '#ff80ab80' } })
    .png({ compressionLevel: 0 }).toBuffer()
  assert.ok(original.length > 1_000_000)
  const normal = await optimizeImage(original, '.png')
  assert.equal((await sharp(normal.buffer).metadata()).width, 2048)
  const resized = await optimizeImage(original, '.png', { resizeLarge: true })
  assert.equal(resized.resized, true)
  const metadata = await sharp(resized.buffer).metadata()
  assert.equal(metadata.format, 'png')
  assert.equal(metadata.width, 768)
  assert.equal(metadata.height, 192)
  assert.equal(metadata.hasAlpha, true)
  assert.ok(resized.buffer.length < original.length)
  const expected = await sharp(original).resize({ width: 768, height: 768, fit: 'inside' }).raw().toBuffer()
  assert.deepEqual(await sharp(resized.buffer).raw().toBuffer(), expected)

  const smallFile = await sharp(original).png({ compressionLevel: 9 }).toBuffer()
  assert.ok(smallFile.length < 1_000_000)
  const kept = await optimizeImage(smallFile, '.png', { resizeLarge: true })
  assert.notEqual(kept.resized, true)
  assert.equal((await sharp(kept.buffer ?? smallFile).metadata()).width, 2048)
})

test('large-mode dry run leaves files untouched before explicitly writing', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'ggas-large-images-'))
  try {
    const filename = path.join(directory, 'large.png')
    const original = await sharp({ create: { width: 1024, height: 1024, channels: 3, background: '#6699f5' } })
      .png({ compressionLevel: 0 }).toBuffer()
    await writeFile(filename, original)
    const options = { roots: [directory], resizeLarge: true, log: () => {} }
    const preview = await optimizeAssets(options)
    assert.equal(preview.changed, 1)
    assert.deepEqual(await readFile(filename), original)
    const result = await optimizeAssets({ ...options, write: true })
    assert.equal(result.errors, 0)
    const metadata = await sharp(filename).metadata()
    assert.equal(metadata.width, 768)
    assert.equal(metadata.height, 768)
    assert.equal(metadata.format, 'png')
    assert.equal((await optimizeAssets({ ...options, write: true })).changed, 0)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})