# ⚛️ Periodic Table Lab & Bohr Atom Visualizer

An interactive Periodic Table and 2D Bohr Atom Visualizer built with React, TypeScript, Vite, and Vitest.

## ✨ Features

- **Full 118 IUPAC Periodic Table**: Complete dataset (`elements118.json`) with accurate atomic numbers, masses, categories, periods, groups, electron configurations, and isotopes.
- **Dynamic Filtering & Search**: Instant real-time search by element name, symbol, or atomic number ($Z$), plus category filter chips (Alkali Metals, Noble Gases, Transition Metals, Lanthanides, Actinides, etc.).
- **Interactive 2D Bohr Atom Visualizer**:
  - **Animated Concentric Electron Shells** ($K, L, M, N, O, P, Q$) with real-time orbital motion and speed scaling ($\omega_k = \frac{1.15}{0.65 + 0.45k}$).
  - **Hybrid Nucleus Engine**:
    - **Countable SVG Nucleons** ($Z \le 20$): Interleaved protons ($p^+$) and neutrons ($n^0$) arranged via deterministic golden-angle phyllotaxis packing.
    - **Optimized HTML5 Canvas Cluster** ($Z > 20$): 60 FPS nucleon cluster with thermal jitter and glow halo for heavy/superheavy elements.
- **Accurate Subatomic Particle Math**:
  - Protons: $p^+ = Z$
  - Neutrons: $n^0 = A - Z$
  - Electrons: $e^- = Z$ (neutral ground state)
  - Abundant stable isotope vs. radioactive / synthetic longest-lived isotope identification.
- **Accessibility & Controls**:
  - Full keyboard navigation (Escape to close modal, Left/Right arrow keys to navigate elements).
  - Play / Pause orbit animation toggle.
  - Automatically respects `prefers-reduced-motion: reduce`.
  - Screen reader accessible ARIA attributes and focus management.

---

## 📁 Project Structure

```
atomic-module/
├── public/
│   └── atom.svg                  # App favicon
├── src/
│   ├── AtomVisualizerModal.tsx   # Modal with 2D Bohr orbits & hybrid nucleus
│   ├── PeriodicTableApp.tsx      # Main periodic table grid, search & filters
│   ├── PeriodicTableApp.test.tsx # Unit & integration test suite (Vitest)
│   ├── elements118.json          # IUPAC 118 elements dataset
│   ├── App.tsx                   # Root application component
│   ├── main.tsx                  # React entry point
│   ├── index.ts                  # Module re-exports
│   ├── index.css                 # Base dark-theme stylesheet
│   └── setupTests.ts             # Testing library setup
├── index.html                    # HTML entry point
├── package.json                  # Dependencies & npm scripts
├── tsconfig.json                 # TypeScript compiler configuration
├── vite.config.ts                # Vite & Vitest configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation

```bash
npm install
```

### Running the Development Server

To launch the local development server:

```bash
npm run dev
```

The application will start at `http://localhost:3000` (or the next available port).

### Running Tests

Run the Vitest test suite:

```bash
npm test
```

Or watch mode:

```bash
npm run test:watch
```

### Building for Production

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```
