# Cosmos Explorer — 3D Universe Mass Lab

An interactive 3D astronomy and physics learning experience built with HTML, CSS, JavaScript, and Three.js.

## Features

- Explore the Universe, Galaxy, Stars, and Solar System.
- Interactive 3D navigation: drag to rotate and scroll/pinch to zoom.
- Discover celestial objects and view their scientific facts.
- Compare weight and gravity on different worlds.
- Planet Science Lab:
  - Jump comparison
  - Free-fall experiment
  - Projectile motion simulator with pause-at-instant inspection
  - Natural satellite and orbital-motion display
- Mass Lab using Kepler's third law.
- Missions, XP, ranks, labels, and voice explanations.
- Responsive layout for desktop and mobile screens.

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern web browser.
3. Keep an internet connection available so the external Three.js library and Google Fonts can load.

No build step, package installation, backend, or database is required.

## Publish with GitHub Pages

1. Upload `index.html`, `README.md`, and `.gitignore` to the root of your GitHub repository.
2. Open the repository on GitHub.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose the `main` branch and the `/ (root)` folder.
6. Click **Save**.
7. Wait for GitHub Pages to publish the site. The public URL will appear in the Pages section.

## Dependencies

- [Three.js r128](https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js), loaded from cdnjs.
- Google Fonts: Orbitron and Inter.

An internet connection is required for these external resources. The application itself is contained in `index.html`.

## Project structure

```text
cosmos-explorer/
├── index.html
├── README.md
└── .gitignore
```
