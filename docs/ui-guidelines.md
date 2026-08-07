# Tenali UI Guidelines & Design System

Tenali focuses on a **minimalistic, cognitive-load-aware UI** (refer to `docs/problem-statements.md` for the underlying pedagogical research). To ensure a consistent look and feel across features built by different contributors, you must strictly follow this design system and use the centralized CSS tokens.

---

## 1. Design System Tokens (CSS Variables)

All UI elements must utilize these global custom CSS variables instead of hardcoded hex colors, margins, font sizes, or transition values.

### Typography
- **Headings & Display:** `var(--font-display)` (`'Source Serif 4', Georgia, serif`) — Use for screen titles, headings, and conceptual emphasis.
- **Body & Controls:** `var(--font-body)` (`'DM Sans', sans-serif`) — Use for paragraphs, button labels, lists, and general interface text.

### Layout & Borders
- **Border Radius (Large):** `var(--radius)` (`16px`) — Use for cards, containers, and main panels.
- **Border Radius (Small):** `var(--radius-sm)` (`10px`) — Use for buttons, inputs, and badges.
- **Card Shadow:** `var(--shadow-card)` — Layered shadow for floating cards and modals.
- **Button Shadow:** `var(--shadow-btn)` — Muted shadow for interactive controls.
- **Standard Transition:** `var(--transition)` (`180ms ease`) — Apply to hover, focus, and state transition animations.

### Theme Palette (Dark & Light)

Tenali features a default **Dark theme** with a toggleable **Light theme**. The variables resolve automatically based on the presence of the `[data-theme="light"]` attribute on the DOM.

| Variable | Dark Theme (Default) | Light Theme | Usage |
| :--- | :--- | :--- | :--- |
| `--clr-bg` | `#1a1614` (Dark Brown) | `#f5f0eb` (Off-white) | Base screen viewport background |
| `--clr-card` | `#2c2622` | `#fffdf9` | Cards, modals, main interactive boxes |
| `--clr-surface` | `#362f2a` | `#f0ebe5` | Panels, inner surface containers |
| `--clr-input` | `#3e3631` | `#ffffff` | Input field backgrounds |
| `--clr-border` | `rgba(255, 245, 230, 0.18)` | `rgba(60, 45, 30, 0.22)` | Borders, divider lines |
| `--clr-text` | `#ede8e3` (Cream) | `#2c2420` (Dark Brown) | Primary text content |
| `--clr-text-soft` | `#a89e94` | `#6b5e54` | Secondary text, sub-labels, hints |
| `--clr-accent` | `#e8864a` (Orange) | `#e07a3a` (Orange) | Primary interactive actions & highlights |
| `--clr-accent-soft` | `rgba(232, 134, 74, 0.22)`| `rgba(224, 122, 58, 0.18)`| Accent background highlights/overlays |
| `--clr-correct` | `#5cb87a` (Green) | `#3a8a5c` (Green) | Correct state feedback text/icons |
| `--clr-correct-bg` | `rgba(92, 184, 122, 0.12)` | `#eaf5ef` | Correct state highlight containers |
| `--clr-wrong` | `#e05a4a` (Red) | `#e05a4a` (Red) | Incorrect state feedback text/icons |
| `--clr-wrong-bg` | `rgba(224, 90, 74, 0.12)` | `#fdf2f0` (approx tint) | Incorrect state highlight containers |

---

## 2. General UI Principles

1. **One Primary Action per Screen:** Do not overwhelm the learner. Use primary accents only on the main call-to-action button (e.g., "Submit" or "Continue").
2. **Accessible Interactivity:** Every interactive component must have clear hover and focus states using `var(--clr-hover-strong)` and `var(--transition)`.
3. **Typography Hierarchy:**
   - Screen Title: `h1` using `var(--font-display)` (approx. `1.8rem - 2rem`).
   - Card Heading: `h2` / `h3` using `var(--font-body)` with bold weight.
   - Body/Controls: `p` / `span` / `button` using `var(--font-body)`.
4. **Spacing Rules:** Apply standard spacing multiples (`8px`, `12px`, `16px`, `24px`, `32px`) to maintain layout rhythm. Avoid arbitrary inline spacing values.

---

## 3. Reusable UI Components

To maintain consistency, **do not write raw HTML elements** for core interactions. Always use the predefined UI components from `client/src/components/ui/`:

- **`<Button />`**: Supports `primary`, `secondary`, and `danger` variants with standard shadows, border radius, and hover styles.
- **`<Card />`**: Establishes standard container styles with correct padding and shadows.
- **`<Modal />`**: Built-in backdrop transitions, keyboard/click-away close options, and header formatting.
- **`<Input />`**: Consistent styling for text/number entry, showing active outline focus using accent colors.
