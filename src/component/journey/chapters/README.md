# Custom notebook chapters

Each spread has its own React component. `UniversityChapter`, `FirstJobChapter`,
`PresentChapter`, and `FutureChapter` own their content and layout. The notebook
owns opening, closing, page turns, numbering, navigation, and focus management.

## Change an existing EP

Edit the corresponding component. Its `side` prop selects the left or right
page; return any JSX for that side. Arrange widgets freely, add your own components,
and keep translated text in `src/locales/th.json` and `en.json`.

The shell keeps `.notebook-content` mounted while changing EPs, so new components
receive the same fade and page-turn animations without implementing animation logic.
Return the content only; the shell provides paper, content wrappers, and page numbers.

## Widgets

Import from `../widgets/NotebookWidgets`:

- `PhotoFrame`: image, caption, tape, rotation, personal-photo sizing, `imageStyle`.
- `Highlights`: any number of items and an optional heading.
- `MemoryNote`: custom body, title, and icon.
- `Takeaway`: custom body and label.
- `Sticker`: star, heart, arrow, bookmark, paperclip, or car.
- `EpisodeLabel` and `Tags`: translated strings.

Widgets accept `className` and `style` for local styling. Photo frames also accept
`imageStyle`; use it to override height, cropping, or image positioning.

```tsx
<PhotoFrame
  src={photo}
  alt={t('myEpisode.photoAlt')}
  caption={t('myEpisode.period')}
  rotation={2}
  tape={false}
  imageStyle={{ height: 180, objectFit: 'cover' }}
/>
<MemoryNote title={t('myEpisode.noteTitle')} style={{ background: '#bdefff' }}>
  <p><ScrambleText text={t('myEpisode.note')} /></p>
</MemoryNote>
```

## Add or reorder a spread

Create a component accepting `ChapterPageProps`, then register it in `index.ts`:

```tsx
career: [
  // Existing spreads...
  {
    id: 'my-episode',
    Content: MyEpisode,
    titleKey: 'journey.stages.career.spreads.myEpisode.title',
    descriptionKey: 'journey.stages.career.spreads.myEpisode.description',
    className: 'my-episode-layout', // Optional style scope on the book pages.
  },
],
```

Keep each chapter's list nonempty and spread IDs unique within it. The list order
determines navigation and page numbers. `titleKey` and `descriptionKey` name the
dialog for assistive technology independently of the visual layout.
