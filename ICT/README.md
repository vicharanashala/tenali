# LinearLab 10 — Interactive Linear Equations Studio (v2)

A modern, animated Class 10 Mathematics web studio for learning **Pair of Linear Equations in Two Variables** (Intersecting, Parallel, Coincident, Consistent, and Inconsistent systems) with **exact fraction arithmetic**.

## What's New in v2

- **Exact Fraction Coefficient Mode (`p/q`)**: Switch between Integer/Decimal Sliders and stacked Numerator/Denominator inputs, or type fractions like `3/4` directly into text inputs. All ratios (`a₁/a₂`, `b₁/b₂`, `c₁/c₂`) and intersection points are computed with exact reduced fractions.
- **Live Canvas Visualization Effects**:
  - Smooth animated line morphing when switching presets or adjusting values.
  - Glowing pulsing intersection beacon with dashed axis projection lines.
  - Animated constant-gap indicator for Parallel lines and flowing energy dashes for Coincident lines.
  - Interactive hover crosshair with live `(x, y)` coordinates, intercept dots, and zoom controls (`±4` to `±24`).
- **Step-by-Step Math Breakdown**: Live Slope-Intercept form (`y = mx + k`), exact ratio division, and determinant solution steps.
- **Professional UI & Dark Mode**: Sticky glassmorphic navbar, Light/Dark theme toggle, scroll-reveal animations, and a 6-question quiz (including fraction questions, streak counter, confetti celebration, and a "Visualize This in Graph Studio" button).

## Folder Structure

```text
linear-equations-website-v2/
├── index.html   # Page structure, semantic sections, and fraction/slider UI
├── style.css    # Light/Dark themes, responsive layout, animations, stacked math styling
├── script.js    # Exact Fraction class, smooth animated Canvas engine, and 6-question quiz
└── README.md    # Documentation and GitHub Pages instructions
```

## Deploy to GitHub Pages

1. Unzip `linear-equations-website-v2.zip`.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the root of your GitHub repository.
3. Open **Settings → Pages**, choose **Branch: `main`** and **`/ (root)`**, and click **Save**.
