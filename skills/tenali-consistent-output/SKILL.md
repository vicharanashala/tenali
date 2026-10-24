---
name: tenali-consistent-output
description: Enforce consistent UI design tokens, typography, accessibility, multilingual translation, error handling, and code conventions across all Tenali modules.
---

# Tenali Consistent Output Skill

## 1. Purpose & Trigger
Use this skill whenever authoring or modifying UI components, CSS styles, error handlers, user feedback, or internationalization files in Tenali.

## 2. UI & Design System Standards

### Centralized CSS Variables
All styling must resolve through the global design system defined in [`client/src/App.css`](../../client/src/App.css) and [`docs/design/ui-guidelines.md`](../../docs/design/ui-guidelines.md). Never use hardcoded hex colors or arbitrary pixel margins for standard UI components.

- **Typography**:
  - Headings / Display: `var(--font-display)` (`'Source Serif 4', Georgia, serif`)
  - Body / Controls: `var(--font-body)` (`'DM Sans', sans-serif`)
- **Border Radius**:
  - Containers / Cards: `var(--radius)` (`16px`)
  - Buttons / Inputs / Badges: `var(--radius-sm)` (`10px`)
- **Theme Palette (Dark by default, Light toggleable)**:
  - Background: `var(--clr-bg)`
  - Surface / Card: `var(--clr-card)`, `var(--clr-surface)`
  - Accent / Primary Action: `var(--clr-accent)` (`#e8864a`)
  - Correct Feedback: `var(--clr-correct)` (`#5cb87a`), `var(--clr-correct-bg)`
  - Wrong Feedback: `var(--clr-wrong)` (`#e05a4a`), `var(--clr-wrong-bg)`
  - Text: `var(--clr-text)` (primary), `var(--clr-text-soft)` (muted)

### Cognitive Load & Minimalist Layout
In accordance with Problem Statement C ([`docs/specs/problem-statements.md`](../../docs/specs/problem-statements.md)):
- **One Primary Action per Screen**: Emphasize only the main interactive step (e.g. "Check" or "Next").
- **Minimal Text Clutter**: Prefer intuitive icons, visual representations, and worked examples over long paragraphs of explanatory text.
- **Consistent Feedback**: Render clear status indicators using standard green/red containers rather than popup alert banners.

---

## 3. Code Conventions & Standards

### React & State Management
- Use functional React components with standard hooks (`useState`, `useEffect`, `useCallback`, `useRef`).
- When writing `useEffect`, satisfy all required dependencies or structure handlers with `useCallback` to prevent infinite re-renders. Avoid introducing fresh `react-hooks/exhaustive-deps` warnings.
- Clean up any subscriptions, timers, or event listeners in `useEffect` cleanup returns.

### Internationalization (i18n)
- Wrap user-facing strings in the translation system (`AutoTranslator` or locale files in `client/src/locales/` for `en`, `hi`, `bn`, `ta`, `te`, `mr`).

### Error Handling & API Resilience
- Always wrap network requests in `try/catch` blocks.
- When an API request fails, show an informative error card or retry button. **Never silently substitute fake hardcoded data** as live production responses (FLN #449).

---

## 4. Verification Checklist
- Toggle between Dark and Light mode (`data-theme="light"`) to ensure color contrast remains readable.
- Check responsive behavior at mobile viewports (down to 360px).
- Verify zero ESLint errors are introduced.
