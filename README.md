# Atom Adventure — Balancing Chemical Equations

A colourful, responsive learning website that introduces young learners to chemical equations, reactants, products, atoms, molecules, coefficients, subscripts, and the law of conservation of mass. It includes animated illustrations, molecule diagrams, interactive equation practice, and a short quiz.

## Files
- `index.html` — page content and learning sections
- `styles.css` — layout, typography, responsive design, and animations
- `science-pattern.svg` — original subtle molecular/chalkboard background texture
- `script.js` — molecule illustrations, equation practice, atom counter, and quiz

## Run locally
Open `index.html` in a web browser. An internet connection is needed to load the Google Fonts; the rest of the site runs locally. Keep `science-pattern.svg` in the same folder as the HTML and CSS files.

## Publish with GitHub Pages
1. Create a new GitHub repository.
2. Upload `index.html`, `styles.css`, `script.js`, `README.md`, and `.gitignore` to the repository's main (root) folder.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder, then save.
6. Wait for GitHub Pages to publish the site and open the link it provides.

## Learning activity note
The practice area contains five sample reactions. It checks those prepared examples rather than acting as a general-purpose chemical equation solver.


### Latest additions
- A live timer starts when a learner first changes a coefficient or checks an equation.
- Each reaction records its elapsed time and number of Check attempts.
- A results analysis at the end shows completed reactions, total check attempts, average completion time, and a per-reaction breakdown.
- The balancing simulation uses a black-and-gold visual theme.
