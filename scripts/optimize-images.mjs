import { randomUUID } from 'node:crypto'
import { readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import sharp from 'sharp'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const imageExtensions = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.avif',
  '.gif',
  '.tif',
  '.tiff',
  '.svg',
  '.ico',
  '.bmp',
  '.apng',
  '.heic',
  '.heif',
  '.jxl',
])
const formats = {
  '.png': ['png', { compressionLevel: 9, effort: 10, adaptiveFiltering: true, palette: false }],
  '.jpg': ['jpeg', { quality: 100, chromaSubsampling: '4:4:4', mozjpeg: true }],
  '.jpeg': ['jpeg', { quality: 100, chromaSubsampling: '4:4:4', mozjpeg: true }],
  '.webp': ['webp', { lossless: true, effort: 6 }],
  '.avif': ['avif', { lossless: true, effort: 9 }],
  '.gif': ['gif', { effort: 10, dither: 0 }],
  '.tif': ['tiff', { compression: 'lzw' }],
  '.tiff': ['tiff', { compression: 'lzw' }],
}

export async function optimizeImage(original, extension, { resizeLarge = false } = {}) {
  const format = formats[extension.toLowerCase()]
  if (!format) return { reason: 'No same-format Sharp encoder; original kept' }
  const before = await sharp(original, { animated: true }).metadata()
  if (before.format === 'png') {
    for (
      let offset = 8;
      offset + 12 <= original.length;
      offset += original.readUInt32BE(offset) + 12
    ) {
      if (original.toString('ascii', offset + 4, offset + 8) === 'acTL') {
        return { reason: 'Animated PNG preserved without re-encoding' }
      }
    }
  }
  const resize =
    resizeLarge &&
    original.length > 1_000_000 &&
    (before.pages ?? 1) === 1 &&
    Math.max(before.width, before.height) > 768
  const resizeOptions = { width: 768, height: 768, fit: 'inside', withoutEnlargement: true }
  const pipeline = sharp(original, { animated: true }).keepMetadata()
  if (resize) pipeline.resize(resizeOptions)
  const buffer = await pipeline.toFormat(...format).toBuffer()
  if (buffer.length >= original.length) return { reason: 'Already smaller than optimized output' }

  const after = await sharp(buffer, { animated: true }).metadata()
  const unchangedKeys = ['format', 'pages', 'depth', 'loop']
  if (!resize) unchangedKeys.push('width', 'height', 'pageHeight')
  for (const key of unchangedKeys) {
    if (before[key] !== after[key]) return { reason: `Changed ${key}; original kept` }
  }
  if ((before.orientation ?? 1) !== (after.orientation ?? 1)) {
    return { reason: 'Changed orientation; original kept' }
  }
  if (JSON.stringify(before.delay) !== JSON.stringify(after.delay)) {
    return { reason: 'Changed animation timing; original kept' }
  }
  if (resize) {
    const scale = 768 / Math.max(before.width, before.height)
    if (
      after.width !== Math.round(before.width * scale) ||
      after.height !== Math.round(before.height * scale)
    ) {
      return { reason: 'Unexpected resized dimensions; original kept' }
    }
  }
  if (format[0] !== 'jpeg') {
    const pixels = (input, shouldResize = false) => {
      const image = sharp(input, { animated: true })
      if (shouldResize) image.resize(resizeOptions)
      return image.ensureAlpha().raw({ depth: 'ushort' }).toBuffer()
    }
    if (!(await pixels(original, resize)).equals(await pixels(buffer))) {
      return { reason: 'Decoded pixels differ; original kept' }
    }
  }
  return { buffer, resized: resize }
}

async function* findImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch((error) => {
    if (error.code === 'ENOENT') return []
    throw error
  })
  for (const entry of entries.sort((first, second) => first.name.localeCompare(second.name))) {
    const filename = path.join(directory, entry.name)
    if (entry.isDirectory()) yield* findImages(filename)
    else if (entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
      yield filename
  }
}

const size = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`

export async function optimizeAssets({
  roots = ['src/assets', 'public'],
  write = false,
  resizeLarge = false,
  log = console.log,
} = {}) {
  let totalBefore = 0
  let totalAfter = 0
  let changed = 0
  let files = 0
  let errors = 0
  log(
    `${write ? 'WRITE' : 'DRY RUN'}: original extensions retained; JPEG quality 100 (not lossless).`,
  )
  log(
    resizeLarge
      ? 'Large-image mode: static images > 1 MB resized to a maximum edge of 768px; this changes pixels. Smaller images and animations keep their dimensions.'
      : 'Original dimensions retained.',
  )
  for (const root of roots) {
    for await (const filename of findImages(path.resolve(projectRoot, root))) {
      files += 1
      let temporary
      try {
        const original = await readFile(filename)
        totalBefore += original.length
        totalAfter += original.length
        const { buffer, reason, resized } = await optimizeImage(original, path.extname(filename), {
          resizeLarge,
        })
        const label = path.relative(projectRoot, filename)
        if (!buffer) {
          log(`KEEP ${label}: ${reason}`)
          continue
        }
        if (write) {
          temporary = `${filename}.${randomUUID()}.tmp`
          await writeFile(temporary, buffer, { flag: 'wx', mode: (await stat(filename)).mode })
          await rename(temporary, filename)
        }
        changed += 1
        totalAfter -= original.length - buffer.length
        log(
          `${write ? 'SAVED' : 'WOULD SAVE'} ${label}: ${size(original.length)} -> ${size(buffer.length)}${resized ? ' (resized to fit 768px)' : ''}`,
        )
      } catch (error) {
        errors += 1
        log(`ERROR ${path.relative(projectRoot, filename)}: ${error.message}`)
      } finally {
        if (temporary) await rm(temporary, { force: true })
      }
    }
  }
  const savings = totalBefore - totalAfter
  log(
    `${files} images, ${changed} ${write ? 'optimized' : 'candidates'}, ${errors} errors. ${size(totalBefore)} -> ${size(totalAfter)}; saved ${size(savings)} (${totalBefore ? ((savings / totalBefore) * 100).toFixed(1) : '0.0'}%).`,
  )
  return { files, changed, errors, totalBefore, totalAfter }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const flags = process.argv.slice(2)
  if (
    flags.some((flag) => !['--dry-run', '--write', '--resize-large'].includes(flag)) ||
    (flags.includes('--write') && flags.includes('--dry-run'))
  ) {
    console.error('Usage: node scripts/optimize-images.mjs [--dry-run | --write] [--resize-large]')
    process.exitCode = 1
  } else {
    const result = await optimizeAssets({
      write: flags.includes('--write'),
      resizeLarge: flags.includes('--resize-large'),
    })
    if (result.errors) process.exitCode = 1
  }
}
