## Math Detective Agency Feature

A new interactive feature that turns math practice into detective mystery cases.

### What's included

- **detective-app.jsx**: Main React component with game flow (case selection, story narration, question solving, achievements)
- **detective-stories.js**: Story data with engaging math mystery cases for kids
- **detective.test.jsx**: Unit tests for the feature
- **vitest.config.js**: Test configuration with jsdom environment

### Integration Points

- Registered as `detective` route in App.jsx
- Menu card: 🔍 Detective Agency appears on the Home screen
- All MDA animations and styles (particles, mascot, case cards) added to App.css

### How to Test

1. Run `cd client && npm install && npm run dev`
2. Click the 🔍 Detective Agency card on the home menu
3. Select a case and solve the math mysteries!
