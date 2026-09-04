# Reading Traps - Changelog

## [Unreleased]
## [2026-07-18]
### Added
- Created Reading Traps overview screen.
- Added responsive Levels screen with clickable level cards.
- Added floating 👀 info button to access the overview.
- Implemented six progressive learning levels:
  - Level 1 – Math Decoder
  - Level 2 – Spot the Phrase
  - Level 3 – Order Matters
  - Level 4 – Mind the Boundaries
  - Level 5 – Read Between the Lines
  - Level 6 – Master Challenge
- Added dynamic question loading based on the selected level.
- Added Back to Levels navigation.
- Added Submit button workflow.
- Locked answer options after submission.
- Added instant feedback with explanations.
- Added Next Question navigation.
- Added Level Complete screen.
- Added hover animations for level cards.
- Added invisible timer to automatically advance unanswered questions.

### Changed
- Levels screen is now the default landing page.
- Moved the overview behind a floating 👀 info button.
- Removed Start buttons from level cards; the entire card is now clickable.
- Redesigned level selection into a responsive grid layout.
- Replaced the original introductory level with **Math Decoder**.
- Updated the quiz flow to require explicit submission before evaluation.

---

## Current Workflow

```
Levels
   ↓
Select Level
   ↓
Quiz
   ↓
Select Answer
   ↓
Submit
   ↓
Feedback & Explanation
   ↓
Next Question / Auto-advance (timer)
   ↓
Level Complete
   ↓
Back to Levels
```

## Notes

- Six playable levels have been implemented.
- Each level maintains its own question bank.
- The timer advances only unanswered questions.
- The overview is accessible at any time through the floating information button.