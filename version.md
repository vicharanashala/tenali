# Release Notes: Version 1.1.0 (Minor Feature Release)

**Release Date:** July 8, 2026  
**Target Branch:** `main`  
**Deploy Status:** Production Ready  

---

## Executive Summary
Version 1.1.0 introduces a comprehensive onboarding framework and voice-guided narrative assistant alongside major visual and functional upgrades to three core learning modules: the Visual Math Lab, the Mensuration Lab, and the Addition Lab. This update standardizes the application's design system using a premium dark-themed, glassmorphic UI. Most notably, it elevates the "Top 3" features—Visual Math, Addition, and Mensuration—into a unified top-row grid to reduce cognitive overload. It also introduces rich interactive SVG mechanics, advanced gamified celebrations (Ribbon Popups), and integrates client-side Web Speech APIs to assist student navigation.

---

## 🛠️ Feature Breakdown

### 1. Voice Narrative Assistant & Onboarding Tour
* **Interactive Step-by-Step Onboarding:** Implemented a targeted, interactive walkthrough modal targeting critical dashboard zones, utilizing scroll-into-view snapping and highlight overlays. This onboarding is engineered to automatically trigger on a student's first visit via persistent `localStorage`.
  * *Component:* [OnboardingTour.jsx](file:///Users/ghost/phase%202%20ten/tenali/client/src/components/OnboardingTour.jsx)
  * *Styles:* [OnboardingTour.css](file:///Users/ghost/phase%202%20ten/tenali/client/src/components/OnboardingTour.css)
* **Web Speech API Narration:** Seamless Text-to-Speech (TTS) integration with voice selection fallbacks (e.g., Google UK English Female, Samantha, Daniel) and playback controls (Mute/Unmute, Skip).
  * *Component:* [VoiceAssistant.jsx](file:///Users/ghost/phase%202%20ten/tenali/client/src/components/VoiceAssistant.jsx)
  * *Styles:* [VoiceAssistant.css](file:///Users/ghost/phase%202%20ten/tenali/client/src/components/VoiceAssistant.css)
* **Dynamic Recommendations:** The Voice Assistant scans client performance records stored in `localStorage` and suggests specific topics where the student's score is currently lowest.

### 2. Gamified Visual Math Lab (Redux)
* **Design & Aesthetics:** Applied a premium glassmorphic dark-theme UI with floating math operator assets, custom entry animations (`framer-motion`), particle explosions (`canvas-confetti`), and responsive XP gain indicators (`+10 XP`). Added a new `RibbonPopup` component that orchestrates an emerald ribbon drop from the top of the viewport for correct answers.
* **Pedagogical Refinements & Bug Fixes:**
  * Fixed backend template mapping (`groups` to `equal_groups`) restoring the Cookie Partitioning division visualizer.
  * Replaced visually ambiguous entities (tricycles/alien dogs) with unambiguous 3-light Traffic Lights and Spiders for accurate multiplication counting.
* **Algorithm-Driven Question Templates (defined in [labRoutes.js](file:///Users/ghost/phase%202%20ten/tenali/server/labRoutes.js)):**
  * *Planting Arrays:* Interactive cell-planting grid designed to illustrate rows-and-columns multiplication.
  * *Frog Jumps:* A draggable frog sprite (Freddy) jumping along an interactive number line.
  * *Candy Sharing:* A basket partitioning visualizer simulating equal-sharing division rules.
  * *Equal Groups:* Grouped items on plates reinforcing repeated addition.
  * *Picture Multiplication:* Object component multiplication counting (dogs to legs, tricycles to wheels).
  * *Math Machine:* Numeric values put through function multiplier chambers.

### 3. Geometry & Mensuration Lab
* **Dynamic SVG Visualizers:** Implemented vector-based interactive geometry puzzles inside the main interface to facilitate visual geometry learning.
  * *Module Path:* [App.jsx](file:///Users/ghost/phase%202%20ten/tenali/client/src/App.jsx#L49500-L49818)
* **Templates Included:**
  * *Grid Area Counting:* Interactive grid overlay allowing tap-to-count operations with live state counters.
  * *Animated Perimeter DOT:* SVG perimeter path animation displaying a moving tracking dot representing boundary travel.
  * *Interactive Protractor:* Real-time SVG rendering of Acute, Right, and Obtuse angles with color-coded arc indicators.
  * *Missing Dimension Solver:* Inverse calculations to determine rectangle/square dimensions from area or perimeter.
  * *Circle Geometry:* Dotted boundary spinner highlighting Circumference vs. Area calculations.

### 4. Addition Lab
* **Restructured Game Modes:** Re-themed the start interface to match the premium dark theme and integrated support for three interactive sub-modes:
  * *Standard Mode:* Adaptive multi-digit addition equations with custom NumPad entry controls.
  * *Visual Counting:* Drag-and-drop apples into a basket with boundary collision feedback.
  * *Balance Scale:* Drag-and-drop physics-style scale weights balancing against target sum equations.
  * *Module Path:* [App.jsx](file:///Users/ghost/phase%202%20ten/tenali/client/src/App.jsx#L35160-L35700)

---

## 📦 System Architecture & Manifest

### Dependency Manifest
The client environment has been updated to support standard modern libraries for animation and celebrations:
* `framer-motion` (v12.42.2) – Entrance and layout animations
* `canvas-confetti` (v1.9.4) – Reward and celebration animations
* `vite` (v8.0.0) & `@vitejs/plugin-react` (v6.0.0) – Module bundler upgrades

### File Delta

| File Path | Change Status | Description |
|---|---|---|
| [OnboardingTour.jsx](file:///Users/ghost/phase%202%20ten/tenali/client/src/components/OnboardingTour.jsx) | `NEW` | Component running onboarding walkthrough modals. |
| [OnboardingTour.css](file:///Users/ghost/phase%202%20ten/tenali/client/src/components/OnboardingTour.css) | `NEW` | Styles for tour backdrop masks and modals. |
| [VoiceAssistant.jsx](file:///Users/ghost/phase%202%20ten/tenali/client/src/components/VoiceAssistant.jsx) | `NEW` | Client assistant handling text-to-speech feedback and lesson analysis. |
| [VoiceAssistant.css](file:///Users/ghost/phase%202%20ten/tenali/client/src/components/VoiceAssistant.css) | `NEW` | Layout positioning and wave/pulse animations for the assistant avatar. |
| [VisualMathLabRedux.jsx](file:///Users/ghost/phase%202%20ten/tenali/client/src/VisualMathLabRedux.jsx) | `NEW` | Premium game module running the revised Visual Math templates. |
| [kid-zone.css](file:///Users/ghost/phase%202%20ten/tenali/client/src/kid-zone.css) | `NEW` | Custom visual theme assets and styles. |
| [package.json](file:///Users/ghost/phase%202%20ten/tenali/client/package.json) | `MODIFY` | Configured dependencies (`canvas-confetti`, `framer-motion`) and bumped version. |
| [vite.config.js](file:///Users/ghost/phase%202%20ten/tenali/client/vite.config.js) | `MODIFY` | Configured express API backend proxy routing rules. |
| [App.jsx](file:///Users/ghost/phase%202%20ten/tenali/client/src/App.jsx) | `MODIFY` | Integrated lab components, voice assist, router pathways, and geometry SVG views. |
| [App.css](file:///Users/ghost/phase%202%20ten/tenali/client/src/App.css) | `MODIFY` | Visual styling for balance scales, grids, and dark theme variables. |
| [index.js](file:///Users/ghost/phase%202%20ten/tenali/server/index.js) | `MODIFY` | Integrated client routes, routers, and express static paths. |
| [labRoutes.js](file:///Users/ghost/phase%202%20ten/tenali/server/labRoutes.js) | `MODIFY` | Programmed random algorithmic question generators for Basic Arith, Mensuration, and Visual Math. |

---

## 🔍 Verification & Staging
* **Compilation Status:** Client bundling completed successfully via `npm run build` producing optimized production assets under `client/dist`.
* **API Validation:** All generated route endpoints verified for expected response payload JSON contracts.
* **Component Testing:** Live validation conducted on the draggable frog UI, scale balancing vectors, and apple counting drag-and-drop operations with zero state leakage.
