# React + TypeScript + Vite

## Journey Timeline POC

The full-width `#journey` section follows the portfolio cards. Vertical scrolling
drives a pinned GSAP ScrollTrigger scene through three static mock milestones (University, First Job / Present, Future).
The car stays centered while the road and buildings move; clouds use a slower
parallax layer. Wheel rotation follows travel in either direction, and dust
stops when movement stops. Chapter buttons also navigate to each scroll position. Header arrows move to the
previous/next focused milestone and remain visible, disabled at the route edges.
Future is reached at 90% of the pinned scroll, leaving a final reading pause with
the car parked at a question-mark direction sign and replay/continue controls in the footer. Scrolling backward restores
the driving state. The Future button lands inside this final pause.
A separate `#after-journey` mock project section provides at least 120svh of
normal-flow content after the pin, so its release and reverse re-entry can be
reviewed. It includes three placeholder cards and a link to restart the journey.
The scene uses CSS sticky inside a non-shrinking block wrapper. Its real document
height equals the scene height plus the journey scroll distance. ScrollTrigger
tracks that wrapper without creating a pin spacer; sticky releases at its end
and the next section follows in normal document flow.

Milestone states use focused > hovered > inactive priority, with scale/brightness
of 1/100%, .85/80%, and .65/45%. Hover previews never change the active chapter or
scroll position. Layout space is reserved for card details and all scene assets.
Cards show a short summary. Click or activate with Enter/Space to open a notebook
containing the full mock story, highlights, memory, image, takeaway, and tags.
The notebook uses a React Portal, GSAP Flip, an HTML/CSS 3D cover matching the chapter card's color, and
decorations from `src/assets/journey-notebook-asset-pack/svg`. It opens in about
960ms, with two cream pages on desktop and a single scrolling column on mobile.
Close with the button, backdrop, or Escape. Closing cancels any opening animation,
returns the visual to the card's current bounds, restores focus, and preserves
the page scroll position. The background is inert and scroll-locked while open.
Reduced motion opens/closes immediately without the zoom or cover rotation.
All stories and memories are placeholders in both languages.
English/Thai copy follows the language switch. Reduced motion removes scrub
lag, parallax, wheel rotation, dust, and visual transitions.

Implementation: `src/component/journey/JourneyTimeline.tsx` and `journey.css`.
Mock copy is in `src/locales/{en,th}.json`; art is in
`src/assets/journey_timeline/`. No backend or real journey data is connected.

Manual review: scroll forward/backward through all three stops; hover a nearby
inactive card while a different card is focused; leave the card; navigate with
the chapter buttons using mouse/keyboard. Repeat at 1440×900, 390×844, 320×568,
and mobile landscape, then resize mid-journey and enable reduced motion.
Run `npm run test:journey` to verify chapter navigation, Future arrival/hold,
reverse travel, and camera positions after resize.
Notebook review: open each chapter with mouse and keyboard; Tab/Shift+Tab must
remain in the dialog. Try all three closing actions, close during opening,
repeatedly reopen, resize while open, and repeat with reduced motion. The scene's
scroll position and focused milestone must stay unchanged after closing.

## CI checks before merging

GitHub Actions runs `npm ci`, `npm run lint`, and `npm run build` on Node.js 24
for pull requests targeting `main`, pushes to `main`, and merge queue groups.
The build includes TypeScript checks. The workflow can also be run manually.

To block merging until checks pass, configure GitHub **Settings > Rules > Rulesets**:

1. Create an active branch ruleset targeting `main`.
2. Enable **Require a pull request before merging**.
3. Enable **Require status checks to pass** and select **Lint and build** after
  the workflow has run once.
4. Enable **Require branches to be up to date before merging** unless using a
  merge queue, and restrict bypass permissions as needed.

The workflow alone does not prevent direct pushes or merges. These rules must
be enabled on GitHub. Deployment is not configured by this workflow.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
