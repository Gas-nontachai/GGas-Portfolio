export const cursorAssets = import.meta.glob<string>('../assets/neobrutal-cursors/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})
