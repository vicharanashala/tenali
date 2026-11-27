# LUMINA — Interactive Mirrors & Lenses Studio

An interactive, gamified optical physics playground built with semantic HTML5, custom CSS3 glassmorphism, Tailwind CSS, and an HTML5 Canvas real-time ray-tracing & wave-optics engine.

## Folder Structure

```text
lumina-optics-studio/
├── index.html   # Main semantic HTML5 structure & section layout
├── styles.css   # Cosmic-Aurora dark/light theme tokens, glassmorphism & custom sliders
├── app.js       # Real-time ray-tracing engine, Web Audio synthesizer, puzzles & quiz logic
└── README.md    # Setup instructions, controls & optical physics reference
```

## Quick Start (Desktop)

1. Extract `lumina-optics-studio.zip` anywhere on your Desktop.
2. Open `lumina-optics-studio/index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari) **or** serve the folder locally:
   - **VS Code:** Right-click `index.html` → **Open with Live Server**.
   - **Python:** Run `python -m http.server 8080` inside `lumina-optics-studio/` and visit `http://localhost:8080`.

## Interactive Modules Included

1. **Optical Observatory Hero:** Drag the glowing light orb across a biconvex cavity, prism fan, or twin-lens array and trigger photon pulse waves.
2. **The 3 Golden Rules of Image Formation:** Switch across Concave Mirror, Convex Mirror, Convex Lens, and Concave Lens and fire animated photons along each principal ray path.
3. **The Big Light Lab (`1280×540` Canvas):**
   - Drag the object horizontally to adjust object distance ($|u|$), drag its tip vertically to scale object height ($h_o$), or drag the focal marker ($F$) directly on the axis.
   - Toggle **Rainbow Rays**, **Huygens Wavefronts**, **Fullscreen Mode**, or **Very Far ($\infty$)** to ignite **Solar Spark Mode**.
4. **Laser Bounce & Focus Arena:** 4 progressive ray-tracing puzzle levels where you rotate angled mirrors to steer a laser past obsidian barriers into the target receiver.
5. **Optics Explorer Missions & Real-World Wonders:** Auto-tracked discovery quests and 1-click presets for reflecting telescopes, wide-angle convex mirrors, magnifying loupes, and myopia eyeglasses.
6. **Optics Mastery Challenge:** Interactive 5-question conceptual quiz with instant explanations, Web Audio sound feedback, and XP rank progression.
