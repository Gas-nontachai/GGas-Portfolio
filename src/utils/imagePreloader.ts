const images = new Map<string, Promise<void>>()

export function withTimeout(task: Promise<unknown>, timeoutMs = 60000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = globalThis.setTimeout(
      () => reject(new Error('Asset loading timed out')),
      timeoutMs,
    )
    task.then(() => resolve(), reject).finally(() => globalThis.clearTimeout(timeout))
  })
}

export function preloadImage(url: string) {
  const cached = images.get(url)
  if (cached) return cached

  const image = new Image()
  const task = withTimeout(
    new Promise<void>((resolve, reject) => {
      image.onload = () => {
        image.decode().then(resolve, reject)
      }
      image.onerror = () => reject(new Error(`Unable to load ${url}`))
      image.src = url
    }),
  )
    .catch((error) => {
      images.delete(url)
      throw error
    })
    .finally(() => {
      image.onload = null
      image.onerror = null
    })
  images.set(url, task)
  return task
}
