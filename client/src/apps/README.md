# `client/src/apps/`

Destination for the mode components that used to live inline in `App.jsx`
(epic #234). Each file holds exactly one component.

## Convention

- **One component per file**, file named after the component: `CoordGeomInteractiveApp.jsx`.
- **Default export** for the component: `export default function FooApp({ onBack }) { ... }`.
- **No barrel `index.js`.** `App.jsx` imports each file directly, so a PR that moves one
  component touches one import line and never a shared index (fewer merge conflicts).
- **Import it back in `App.jsx`** next to the other component imports:
  `import CoordGeomInteractiveApp from './apps/CoordGeomInteractiveApp.jsx'`.
  The `modeMap` entry is unchanged.
- **Move the component verbatim.** No behaviour changes or reformatting in an extraction PR.

## Reaching shared helpers (the open question this pattern settles for now)

Shared hooks and helpers still live in `App.jsx`. An extracted component imports them
from there as named exports, the same way `WaterJugLab.jsx` and `EquationCraftingLab.jsx`
already import `QuizLayout`:

```js
import { API, QuizLayout, useTimer, useProgressSubmit, renderFeedback } from '../App.jsx'
```

What `CoordGeomInteractiveApp` needed, and where each comes from:

| Needed | Defined in | Note |
|---|---|---|
| `API` | `App.jsx` | already exported |
| `QuizLayout` | `App.jsx` | already exported |
| `useTimer` | `App.jsx` | already exported |
| `useProgressSubmit` | `App.jsx` | **newly exported** by this PR |
| `renderFeedback` | `App.jsx` | **newly exported** by this PR |

Caveats for later batches:

- This is a **circular import** (`App.jsx` imports the app, the app imports `App.jsx`).
  It is safe because the app only uses those names at render time, never while the
  module is first evaluated. Do not call a shared helper at the top level of an app file.
- Each newly exported non-component counts against the
  `react-refresh/only-export-components` baseline in `eslint-suppressions.json`
  (raised from 6 to 8 here).
- The clean fix is to move the shared hooks and helpers (`useTimer`, `useAutoAdvance`,
  `useProgressSubmit`, `renderFeedback`, `QuizLayout`, `API`) into their own modules, so
  apps stop importing from `App.jsx`. That is separate work and should happen before or
  alongside the large batches (#236 onwards).
- `useAutoAdvance` and `fetchQuestionForType` are still private to `App.jsx`. The first
  extracted component that needs them has to export them or have them moved.
