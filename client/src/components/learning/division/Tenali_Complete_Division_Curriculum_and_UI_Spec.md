# Tenali Division Learning Module
## Complete Curriculum, Activity Map, UX/UI Specification, Feedback System, and Implementation Plan

**Document status:** Product and learning-design specification  
**Implementation status:** Planning only — no code changes authorized or included  
**Target learners:** Children aged 6–8  
**Product:** Tenali  
**Module:** Division foundations  
**Primary design principle:** Children discover the ideas behind division through visual activities before the operation is named.

---

## Document control

This document consolidates the agreed curriculum decisions, complete learning journey, activity map, difficulty levels, interaction rules, visual/UI direction, feedback, mastery criteria, assessment, accessibility, implementation phases, and open product decisions.

### How to read this document

- **Confirmed** means explicitly agreed in the planning conversation.
- **Recommendation** means a proposed design decision that should be reviewed before implementation.
- **Verify** means the current repository or current behavior must be inspected before making a change.
- The existing module audit is a planning input, not proof that the current repository has been independently inspected. Do not assume any reported behavior is verified until Phase A is complete.

## 1. Product vision

Build an activity-based learning experience that helps children understand equal sharing, equal grouping, and leftovers so clearly that they can recognize and use these ideas in unfamiliar situations—even before they know the formal name *division*.

The module should be intuitive, visual, interactive, forgiving, and progressively more abstract. The child should learn through doing, noticing, comparing, correcting, and transferring—not by reading long explanations.

### 1.1 Confirmed decisions

1. **Age range:** 6–8 years.
2. **Activity-based, not story-based:** no story arc or narrative is required. Objects and containers provide context only.
3. **Equal importance for both division models:**
   - **Sharing:** the number of recipients is known; find how many objects each recipient receives.
   - **Grouping:** the size of each group is known; find how many complete groups can be made.
4. **Discover before naming:** do not introduce the word *division* or the ÷ symbol at the beginning. Children should explore several activity types first.
5. **Visual-first unfamiliar problems:** use visuals until the child demonstrates readiness for numbers.
6. **Current facial-feedback behavior:** preserve it for now. Inspect and document the existing rules; do not change them without an explicit later decision.
7. **No implementation during planning:** audit, design, and agree on behavior before coding.
8. **Recoverable actions:** allow children to undo and correct arrangements.
9. **A valid remainder is not an error:** completion must not depend solely on an empty jar.
10. **Broad transfer:** the child should learn the underlying idea across different objects, containers, layouts, and situations.

### 1.2 Learning principles

- Concrete before abstract.
- Visual demonstration before formal vocabulary.
- Equal sharing and equal grouping are equally important.
- One main difficulty variable changes at a time whenever practical.
- Children learn from correct actions and recoverable mistakes.
- Feedback should reveal mathematical structure rather than simply label an answer right or wrong.
- Mastery is skill-specific; finishing a screen does not prove understanding.
- Sound may enhance an action but must never be necessary to understand it.
- No time pressure or penalty-driven experience.

## 2. Core mathematical models

### 2.1 Equal sharing

**Known:** total quantity and number of recipients.  
**Find:** amount each recipient gets, and whether anything remains.

Example: 10 candies shared among 3 friends.

- Each receives 3.
- 1 remains.
- All objects are accounted for: 10 = 3 × 3 + 1.

The key learning is that each recipient gets the same amount, even when a leftover remains.

### 2.2 Equal grouping (measurement model)

**Known:** total quantity and size of each group.  
**Find:** number of complete groups and whether anything remains.

Example: 12 candies, 3 candies per bag.

- 4 complete bags can be filled.
- Nothing remains.
- All objects are accounted for: 12 = 4 × 3 + 0.

The key learning is that the child creates groups of the required size and counts how many complete groups can be made.

### 2.3 Why both models matter

The two models use equal groups but answer different questions. The activity must make the unknown visually clear.

| Model | What is given? | What does the child discover? | Visual cue |
|---|---|---|---|
| Sharing | Recipients are shown | Amount each receives | Empty plates/recipients are waiting for equal shares |
| Grouping | Group size is shown | Number of groups | A bag/basket/box fills when it reaches the target size |

Avoid presenting grouping as just a reskinned sharing task. It needs its own goal, completion rule, visual cues, and mastery evidence.

## 3. Full learning journey overview

These are learning stages, not necessarily separate screens. A stage can contain multiple activities. Children should be able to revisit previously explored concepts.

| Stage | Name | Primary learning | Representation |
|---|---|---|---|
| 1 | Explore quantities | Notice and compare collections | Objects and dots |
| 2 | Share equally | Equal distribution among known recipients | Draggable objects and plates |
| 3 | Make equal groups | Create groups of a known size | Objects and containers |
| 4 | Discover leftovers | Understand valid remainders | Complete groups plus visible leftovers |
| 5 | Repair unequal groups | Detect and correct differences | Comparison and object movement |
| 6 | Choose the action | Distinguish sharing from grouping | Mixed visual challenges |
| 7 | Connect actions to quantities | Relate arrangements to quantities | Objects, dots, numerals |
| 8 | Discover the number relationship | Total = grouped objects + remainder | Visual equations |
| 9 | Reveal division | Name the idea and introduce ÷ | Picture plus notation |
| 10 | Use and explain | Transfer and solve independently | Visual-first, then reduced visual support |

### Stage-transition principle

Progress should be based on evidence of understanding, not just the number of completed screens. If a child struggles with a concept, provide targeted practice on that concept instead of restarting the entire module.

---

# Part I — Complete activity map

## 4. Stage 1: Explore quantities

### Learning goal
Become comfortable moving, counting, and comparing objects before being asked to make equal groups.

### Activity types
1. Move all objects from a jar to a tray.
2. Match a collection to a dot pattern.
3. Add one object and notice the change.
4. Remove one object and notice the change.
5. Compare two collections: same amount or different amount.
6. Count small collections and choose the matching visual quantity.

### Suggested progression
- Level 1: 3–5 objects.
- Level 2: 6–8 objects.
- Level 3: 9–10 objects, if appropriate for the learner.

### UI
- A clearly visible source container and destination area.
- Large objects with generous spacing.
- Optional dot-card targets.
- No formal operation symbols.
- Minimal text; use a simple visual cue or brief audio prompt only if audio is enabled.

### Feedback
- Objects snap into place.
- The visible collection updates immediately.
- Incorrect matches remain recoverable.
- No harsh error banners.

### Mastery evidence
The child can move objects and consistently match small visual collections to dot patterns.

## 5. Stage 2: Share equally

### Learning goal
Discover that equal sharing means each recipient receives the same amount.

### Activity types
1. Share 4 objects between 2 recipients.
2. Share 6 objects between 2 recipients.
3. Share 6 objects between 3 recipients.
4. Share 8 objects between 4 recipients.
5. Share a larger exact quantity after easier problems.
6. Correct a deliberately unequal arrangement.
7. Complete a sharing task with a valid remainder in a later sub-level.

### Guided turn-taking interaction
For the initial guided activity:
1. The child drags one object to a recipient.
2. That recipient becomes temporarily unavailable for the current round.
3. The other recipients remain available.
4. When each recipient has received one object, the next round begins.
5. Continue until no objects remain or no further fair round can be completed.

This lock is a teaching scaffold, not a permanent restriction. Later activities should permit freer distribution.

### UI
- A source jar or tray with draggable objects.
- Recipients with visible plates or receiving areas.
- Clear indication of whose turn is available, without relying on text alone.
- Objects stay visibly associated with their recipient.
- A reset/undo mechanism that does not erase the whole activity unnecessarily.

### Feedback
- Show each object moving to its recipient.
- Make equal and unequal totals visually comparable.
- Preserve existing facial-expression behavior until the actual implementation is verified and the rules are explicitly revisited.
- Do not use faces as the sole signal of success or failure.

### Mastery evidence
The child can share objects equally among 2–4 recipients with progressively fewer hints, including a different visual arrangement from the demonstration.

## 6. Stage 3: Make equal groups

### Learning goal
Discover that a group can be made by repeatedly placing a known number of objects into each container.

### Activity types
1. Put 2 blocks in each box.
2. Put 3 candies in each bag.
3. Put 4 fruit pieces in each basket.
4. Make as many complete groups as possible.
5. Compare a target of 2 per group with a target of 3 per group.
6. Fill containers and count the number of completed groups.
7. Later, solve a grouping activity where some objects remain.

### Core interaction
- The activity shows the target size through a visual cue: for example, a sample bag containing 3 objects or a three-dot target.
- The child fills a container.
- A container becomes visibly complete when it reaches the target size.
- The child continues filling additional containers.
- Remaining objects stay visible rather than disappearing.
- The number of completed groups may be represented by a count of containers or dots, introduced gradually.

### UI
- One clear target-size example.
- A source area containing loose objects.
- Empty group containers.
- A distinct completed-group state.
- A visible leftover area if not all objects can form complete groups.

### Feedback
- Containers visibly fill as objects are added.
- Avoid automatically treating an incomplete final group as a valid complete group.
- If the child puts too many objects into a group, allow correction.
- Use hints to highlight the target size or next empty container.

### Mastery evidence
The child can create groups of a specified size and count how many complete groups can be made.

## 7. Stage 4: Discover leftovers

### Learning goal
Understand that equal sharing or complete grouping may leave objects over, and that this does not automatically make the result wrong.

### Sharing activities
- Share 5 objects between 2 recipients.
- Share 7 objects between 2 recipients.
- Share 8 objects between 3 recipients.
- Share 10 objects between 3 recipients.
- Compare an exact-sharing problem with one that leaves an object.

### Grouping activities
- Make groups of 2 from 7 objects.
- Make groups of 3 from 10 objects.
- Make groups of 3 from 11 objects.
- Compare a total that fills all groups exactly with a total that leaves objects over.

### Essential distinctions
- A fair sharing result can have a leftover.
- A grouping result can have a leftover when there are too few objects to form another complete group.
- A leftover is not the same as an unequal distribution.
- If another complete sharing round or group is possible, the child may not be finished yet.
- Do not require the source jar to be empty as the sole completion rule.

### UI
- Completed groups/recipients remain visually stable.
- Leftover objects are visible in a distinct area or remain clearly outside complete groups.
- Completed and incomplete groups are visually distinguishable.
- The activity should not hide, delete, or silently redistribute leftovers.

### Mastery evidence
The child can identify a valid remainder and distinguish it from an unequal arrangement or an unfinished possible round.

## 8. Stage 5: Repair unequal groups

### Learning goal
Notice differences and correct an arrangement.

### Activity types
1. One plate has more objects than the others; make them equal.
2. One bag has 4 objects and another has 2, while the target is 3.
3. Objects remain in the source even though another fair round is possible.
4. A previously fair arrangement becomes unequal after moving one object.
5. Compare two arrangements and select the equal one.
6. Fix a group that exceeds its target size.

### UI
- Start with a visible incorrect arrangement.
- Keep the objects movable.
- Use subtle visual comparison cues, such as aligned rows or a highlighted count difference.
- Provide undo and a low-friction retry.
- Avoid making the child restart from an empty state unless they choose to.

### Feedback
- First encourage comparison.
- Then highlight the relevant plates or containers.
- If needed, suggest a possible move without completing the entire task.
- After repeated difficulty, demonstrate one move and give control back.

### Mastery evidence
The child can independently repair common unequal arrangements.

## 9. Stage 6: Choose the action

### Learning goal
Choose between sharing and grouping from the visual goal, without being told the strategy name.

### Activity types
- Show recipients and ask the child to distribute objects equally.
- Show a target-size container and ask the child to make complete groups.
- Use similar objects in both models so the child must attend to the goal, not just the artwork.
- Mix exact results and remainders.
- Change the visual context: fruit, blocks, pencils, toys, plates, baskets, bags, or boxes.

### Key design rule
The visual must communicate what is known and what is unknown.

- Sharing: known recipients; discover the amount each receives.
- Grouping: known group size; discover the number of groups.

### UI
- Present one visual challenge at a time.
- Do not label a challenge “sharing” or “grouping” during the discovery phase.
- Avoid written instructions for unfamiliar problems until number use is appropriate.
- Keep the object interaction consistent so the child focuses on the mathematical difference.

### Feedback
If the child uses a mismatched strategy, let the visual result expose the issue. Offer a hint that draws attention to the recipients or target group size.

### Mastery evidence
The child can select a sensible action in mixed visual problems, including at least one unfamiliar layout.

## 10. Stage 7: Connect actions to quantities

### Learning goal
Link concrete actions to visual and numeric representations without losing the meaning of the groups.

### Representation ladder
1. Draggable objects.
2. Static illustrations of the same objects.
3. Dot patterns.
4. Dots plus numerals.
5. Numerals alongside a picture of the groups.
6. A simple number relationship paired with the visual.

### Activity types
- Match a completed plate to its dot pattern.
- Match a bag containing 3 objects to the numeral 3.
- Choose the picture that shows 3 groups of 2.
- Match a starting total to the arrangement that accounts for every object.
- Identify the number of recipients, objects per recipient, group size, or number of complete groups.
- Rebuild a picture from a small number card.

### UI
- Keep the visual and numeric representation near each other.
- Highlight the quantity represented when a numeral is selected.
- Avoid introducing several new symbols at once.
- Allow return to a more concrete view when the child struggles.

### Mastery evidence
The child can match an arrangement to its quantities and identify relevant numbers with decreasing visual support.

## 11. Stage 8: Discover the number relationship

### Learning goal
Understand that the starting total consists of objects in equal groups plus any leftover objects.

### Example A: Sharing
Ten objects shared among three recipients gives three each and one left over:

`10 = 3 × 3 + 1`

The visual should show:
- 3 recipients,
- 3 objects per recipient,
- 1 leftover object,
- all 10 objects accounted for.

### Example B: Grouping
Twelve objects arranged into groups of three gives four groups and no remainder:

`12 = 4 × 3 + 0`

### Activity types
- Match a picture to a visual equation.
- Rebuild a group arrangement from a relationship card.
- Choose which of two equations represents the visible groups.
- Complete a missing part of a visual relationship.
- Compare two arrangements that use the same total but different group sizes.

### UI
- Groups should map clearly to the multiplication part.
- Leftovers should map clearly to the added remainder.
- Animate or highlight each part of the relationship in sequence.
- Keep the full arrangement visible.
- Do not require memorizing the equation before the child understands the picture.

### Mastery evidence
The child can match the total, equal groups, group size, and remainder to a visual relationship.

## 12. Stage 9: Reveal division

### Learning goal
Name and symbolize an idea the child has already explored.

### Introduction sequence
1. Revisit a familiar visual activity.
2. Show the starting quantity and completed groups.
3. Reveal the word *division* as the name for the kind of problem being explored.
4. Introduce the ÷ symbol.
5. Pair the symbol with the familiar picture.
6. Show a simple division expression with the result and remainder.
7. Introduce formal terms gradually.

### Example
`10 ÷ 3 = 3 remainder 1`

The picture remains visible while the child learns to interpret the expression.

### Formal vocabulary
Introduce only after the child understands the visual relationship:
- **Dividend:** the starting quantity being divided.
- **Divisor:** the number of recipients in a sharing problem, or the size of each group in a grouping problem.
- **Quotient:** the number each recipient receives in sharing, or the number of complete groups in grouping.
- **Remainder:** what remains after equal sharing or complete grouping.

The explanations should be concise and accompanied by highlighted objects. Avoid a long vocabulary lecture.

### Activity types
- Match a familiar picture to an expression.
- Select the expression that matches a completed activity.
- Rebuild a picture from a simple expression.
- Identify a remainder in a visual equation.
- Compare sharing and grouping expressions without losing the distinction between their meanings.

### Mastery evidence
The child can interpret simple division notation using the visual model, rather than merely recognizing the symbol.

## 13. Stage 10: Use and explain

### Learning goal
Transfer understanding to unfamiliar visual problems and gradually solve with less visual support.

### Activity types
- Mix sharing and grouping challenges.
- Use unfamiliar objects and containers.
- Change the arrangement while preserving the mathematical concept.
- Use picture-only problems without strategy labels.
- Progress to picture-plus-numeral tasks.
- Introduce number-only problems when the child demonstrates readiness.
- Ask the child to show or select why the groups are equal.
- Revisit a previously learned skill after other stages.

### UI
- One clear task at a time.
- Gradually reduce hints and visual scaffolding.
- Preserve access to concrete representations.
- Avoid adding a timer or competitive score as a condition for success.
- Use short visual feedback rather than lengthy explanations.

### Mastery evidence
The child chooses an appropriate method, solves exact and remainder problems, and can show why the result is reasonable.

---

# Part II — Difficulty and problem-bank specification

## 14. Starter problem bank

These examples are curriculum candidates. They should become data-driven activity definitions during implementation rather than being scattered as hard-coded special cases.

| Level | Sharing problem | Grouping problem | Primary focus |
|---|---|---|---|
| 1 | 4 objects among 2 recipients | 4 objects, 2 per group | Equal amounts |
| 2 | 6 among 2 | 6 objects, 2 per group | More objects |
| 3 | 6 among 3 | 6 objects, 3 per group | Change recipients/group size |
| 4 | 8 among 4 | 12 objects, 3 per group | Larger quantities |
| 5 | 5 among 2 | 7 objects, 2 per group | First leftovers |
| 6 | 7 among 2 | 10 objects, 3 per group | Remainder practice |
| 7 | 8 among 3 | 11 objects, 3 per group | Different remainder sizes |
| 8 | Correct unequal plates | Correct unequal bags | Error detection |
| 9 | Mixed visual sharing/grouping | Mixed visual sharing/grouping | Strategy selection |
| 10 | New visual contexts | New visual contexts | Transfer |

### Additional remainder examples

Sharing:
- 5 shared among 2: 2 each, 1 left.
- 7 shared among 2: 3 each, 1 left.
- 8 shared among 3: 2 each, 2 left.
- 10 shared among 3: 3 each, 1 left.
- 11 shared among 3: 3 each, 2 left.

Grouping:
- 7 objects, 2 per group: 3 complete groups, 1 left.
- 10 objects, 3 per group: 3 complete groups, 1 left.
- 11 objects, 3 per group: 3 complete groups, 2 left.
- 12 objects, 3 per group: 4 complete groups, none left.

### Difficulty design rules
- Change one main variable at a time wherever possible.
- Variables include total quantity, recipient count, target group size, remainder size, visual complexity, and abstraction level.
- Early problems should not simultaneously increase the total, change the representation, introduce a new strategy, and include a new remainder pattern.
- Revisit the same concept with different objects and layouts.
- Include exact results and remainders in both sharing and grouping.
- Use number-only questions only after visual readiness is demonstrated.

## 15. Adaptive progression

### Recommended behavior
- If the child succeeds independently, move to a slightly more challenging variation.
- If the child succeeds after a hint, offer another problem at the same conceptual level.
- If the child struggles repeatedly, simplify one variable and provide a more concrete representation.
- If the child makes a mistake, keep the activity recoverable.
- If the child masters a skill, revisit it later in a mixed problem to check retention.

### Candidate mastery rule
Use at least 4 correct responses out of 5 varied problems as an initial design target, including:
- at least one changed visual arrangement,
- at least one problem with minimal or no hinting,
- and a mixture of familiar and less familiar examples where appropriate.

This is a proposed threshold for usability testing, not an established scientific standard. Validate it with observed learner performance. A single correct answer or screen completion should not establish mastery.

### Skill-specific evidence
Track separate evidence for:
- Quantity recognition.
- Equal sharing.
- Equal grouping.
- Remainder understanding.
- Error correction.
- Strategy selection.
- Visual-to-number representation.
- Equation interpretation.
- Division notation.
- Transfer to unfamiliar visual problems.

---

# Part III — UI/UX specification

## 16. Design principles

1. **The activity is the interface.** Children should understand what to do by looking at the objects and the goal.
2. **One primary task per screen.** Avoid multiple competing panels or instructions.
3. **Visual hierarchy:** source objects → target recipients/containers → current progress → subtle feedback.
4. **Minimal text:** no long paragraphs during activities. Use short labels only when needed.
5. **Consistent interaction:** dragging an object should work similarly across sharing and grouping.
6. **Visible state:** every object should have a clear location and every group should have a clear state.
7. **Forgiving interaction:** undo, return, and retry should be easy to discover.
8. **No forced speed:** do not time the child or penalize slow thinking.
9. **Progressive abstraction:** hide formal notation early, then introduce it alongside familiar visuals.
10. **Accessibility:** don't rely on color, sound, or facial expressions as the sole communication channel.

## 17. Proposed activity-screen layout

This is a conceptual layout, not a claim about the current UI implementation.

### Top area
- Small stage/progress indicator.
- Optional pause or exit control.
- Avoid large text headings that dominate the screen.
- Do not show division terminology before the agreed introduction stage.

### Main activity area
- Source container with remaining objects.
- Recipients/plates for sharing, or group containers for grouping.
- Large touch-friendly objects.
- Enough spacing to prevent accidental drops.
- A clearly visible target cue when group size is known.
- A distinct place for valid leftovers when needed.

### Feedback area
- Subtle, short visual feedback.
- Existing facial feedback retained pending audit.
- No persistent red error banner for a recoverable mistake.
- Avoid displaying an equation during early discovery unless that stage explicitly calls for it.

### Controls
- Undo or return object.
- Retry or reset current activity, with reset not being the only recovery path.
- Optional sound toggle if sound is implemented.
- Continue/next control only after the activity's completion condition is met, unless exploration mode intentionally permits free movement.

### Responsive behavior
- Preserve clear relationships between source objects and targets on small screens.
- Use touch targets large enough for young learners.
- Prevent important controls from being obscured by scrolling or device edges.
- Avoid layouts that require precise dragging.
- Support mouse and touch input where the application platform allows.

## 18. Sharing UI states

At minimum, design and verify these states:

1. **Ready:** objects are in the source; recipients are visible.
2. **Dragging:** an object is picked up.
3. **Valid drop:** the object moves to a recipient.
4. **Guided lock:** recipients who have already received an object in the current round are temporarily unavailable.
5. **Round complete:** all recipients have had their turn; the next round can begin.
6. **Unequal arrangement:** visible counts differ; correction remains possible.
7. **Fair distribution:** recipients have equal quantities.
8. **Remainder:** equal shares are complete and remaining objects are visible.
9. **Another round possible:** enough objects remain to continue fair sharing.
10. **Complete:** the mathematical goal is satisfied.
11. **Hint:** a progressive visual hint is displayed.
12. **Undo:** the last action can be reversed.

## 19. Grouping UI states

At minimum, design and verify:

1. **Ready:** target group size and loose objects are visible.
2. **Filling group:** the child adds objects to a container.
3. **Group complete:** the container reaches the target size.
4. **Next group:** another container becomes available.
5. **Oversized group:** more than the target number are placed; the child can correct it.
6. **Incomplete final group:** not enough objects remain to complete another group.
7. **Remainder:** incomplete remainder objects remain visible outside complete groups.
8. **Another complete group possible:** enough objects remain to fill another group.
9. **Complete:** no further complete group of the target size can be made.
10. **Undo, hint, and retry:** the child can recover from mistakes.

## 20. Completion logic and invariants

### Object conservation
At every point:

`starting quantity = objects in source + objects in recipients/groups + any explicitly staged objects`

No object should disappear, duplicate, or become inaccessible during dragging, undo, or reset.

### Sharing completion
A sharing activity is complete when:
- all recipients have equal shares, and
- no further full fair sharing round is possible with the remaining objects, if the task is to share as evenly as possible.

A valid remainder is allowed. An empty jar is not required.

### Grouping completion
A grouping activity is complete when:
- every counted group has the specified target size, and
- no additional complete group can be made from the remaining objects.

Any objects that cannot make another complete group remain visible as the remainder.

### Recovery
- Undo restores the previous valid object arrangement.
- Reset returns the activity to its defined initial state.
- Correcting one group should not silently change unrelated groups.
- Repeated dragging should not create or lose objects.

## 21. Facial-expression policy

**Confirmed:** Keep current behavior for now.

### Before implementation
- Inspect the actual expression-selection logic.
- Record which states produce neutral, happy, and sad expressions.
- Verify behavior for equal sharing, unequal sharing, empty recipients, valid leftovers, and unfinished rounds.
- Check whether expression changes are immediate or occur only after submission.
- Confirm the observed behavior with the product owner before proposing changes.

### UI principle
Expressions are supplementary feedback. Equality, remaining objects, completion, and errors must also be understandable from object arrangement and other visual cues.

Do not silently change the existing expression rules as part of adding grouping or remainders.

## 22. Audio and motion

### Audio recommendation
Audio is optional and should follow stabilization of core visual interactions.

Potential cues:
- Object picked up.
- Object placed.
- Group filled.
- Round completed.
- Activity completed.

Requirements:
- Brief and gentle sounds.
- Visible mute/unmute control.
- No information conveyed only through sound.
- No repeated loud or startling effects.
- Reuse the shared audio utility only after its API and behavior have been inspected.

### Motion recommendation
- Use short movement animations to show where objects go.
- Avoid excessive bouncing, flashing, or distracting motion.
- Do not use animation as the only signal of state.
- Allow restrained motion if the app supports a reduced-motion setting.
- Keep motion short enough that it does not make repeated interactions feel slow.

## 23. Visual asset direction

### Objects
- Use consistent object size and visual weight.
- Make objects distinguishable from containers.
- Keep wrappers, colors, and object types consistent within a problem.
- Avoid realistic clutter that obscures counts.

### Recipients
- Keep recipient positions stable during an activity.
- Plates or receiving areas should make ownership of objects clear.
- Use neutral, happy, and sad face assets only in line with verified current logic.
- Avoid exaggerated emotional feedback that may feel punitive.

### Group containers
- Bags, boxes, baskets, plates, or rings should clearly indicate group boundaries.
- The target group size should be visually representable, for example through a sample group or dot pattern.
- Completed groups and loose objects should be easy to distinguish.
- The group container should not imply that a partial group is complete.

### Background
- Keep it quiet and uncluttered.
- Use contrast for the activity, not decorative scenery.
- Avoid narrative details that distract from the mathematical action.

---

# Part IV — Feedback, accessibility, and assessment

## 24. Feedback framework

### Correct action
- Show the object moving into place.
- Preserve the new arrangement.
- Provide brief positive confirmation.
- Avoid a long explanatory message after every move.

### Unequal arrangement
- Make the difference visible.
- Let the child compare groups.
- Offer correction without wiping the work.

### Child gets stuck
Use a graduated hint ladder:
1. **Observe:** highlight relevant groups or containers.
2. **Prompt:** indicate what needs attention without giving the answer.
3. **Demonstrate one move:** show one step, then return control.
4. **Guided example:** provide a worked example after repeated difficulty.
5. **Retry:** offer a new problem testing the same concept with different visuals.

### Remainder
- Keep the remainder visible.
- Show complete groups separately.
- Do not label a valid remainder as a mistake.
- If another complete round/group is possible, visually suggest continuing.

### Completion
- Indicate that the activity goal has been met.
- Avoid implying that the child must empty the source container.
- Keep success feedback calm and brief.

## 25. Accessibility requirements

- Large drag targets and adequate spacing.
- Strong contrast between objects, containers, and background.
- Never rely on color alone to indicate state.
- Never rely on sound alone.
- Never rely on facial expressions alone.
- No time pressure.
- Recoverable actions and undo.
- Clear focus and selection states where keyboard navigation is supported.
- Support mouse and touch input as appropriate to the platform.
- Use brief, age-appropriate language when text is necessary.
- Keep layouts consistent across related tasks.
- Avoid unnecessary motion or flashing.
- Do not make decorative animation block the child's next action.

## 26. Assessment model

Assess the skill, not merely whether the screen was completed.

| Skill | Observable evidence |
|---|---|
| Quantity recognition | Matches small collections to visual quantities |
| Equal sharing | Distributes objects evenly among known recipients |
| Equal grouping | Creates groups of a specified size |
| Remainders | Recognizes leftovers while preserving complete/equal groups |
| Error correction | Repairs unequal arrangements |
| Strategy choice | Chooses between sharing and grouping in a mixed set |
| Representation | Connects objects, dots, and numerals |
| Number relationship | Matches groups and leftovers to a visual equation |
| Division notation | Interprets a simple division expression |
| Transfer | Solves a new visual arrangement without a strategy label |

### Assessment design
- Use multiple problems per skill.
- Vary the visual arrangement.
- Include at least some problems solved without hints.
- Include both exact results and remainders.
- Revisit skills after the child moves forward.
- Avoid using speed as a proxy for understanding.
- Do not infer permanent mastery from one successful attempt.

### Candidate mastery threshold
An initial target is at least 4 correct responses out of 5 varied problems, with at least one changed visual arrangement and some independent performance. This is a proposal to validate through usability testing, not a research-established threshold.

---

# Part V — Technical verification and implementation roadmap

## 27. Phase A: Verify and freeze existing behavior

**Goal:** Establish a trustworthy baseline before changing the module.

### Tasks
- Inspect the repository and exact files named in the supplied audit.
- Confirm the current stage flow and navigation.
- Confirm guided turn-taking lock behavior.
- Confirm free distribution and undo/return-to-source behavior.
- Verify remainder and completion conditions.
- Verify object conservation under every action.
- Record current facial-expression rules.
- Inspect the current problem data and equation-card timing.
- Inspect the shared audio utility and its API.
- Run existing tests and capture a baseline of the experience.

### Deliverable
A verified baseline report identifying any difference between the audit and actual code.

### Exit criteria
Every behavior marked for preservation has a known implementation location and a test or reproducible verification.

## 28. Phase B: Finalize learning design

**Goal:** Turn the curriculum into a finite and ordered activity catalogue.

### Tasks
- Approve the ten learning stages.
- Define first activities for both sharing and grouping.
- Define exact and remainder problem sequences for both models.
- Define mixed-strategy and transfer activities.
- Specify the visual cue, interaction, hints, and completion condition for each activity.
- Define the point at which visual quantity summaries, equations, ÷, and vocabulary appear.
- Confirm current facial feedback remains unchanged.

### Deliverable
Approved curriculum map and problem-bank specification.

### Exit criteria
Every activity has a learning goal, problem type, interaction, feedback, and mastery evidence.

## 29. Phase C: UX and state design

**Goal:** Define the UI and state model for the approved curriculum.

### Tasks
- Decide whether grouping is a separate mode or a shared configurable interaction.
- Define recipient versus target-group-size cues.
- Design complete-group and remainder states.
- Define the visual-to-number progression.
- Define undo, reset, hint, retry, and completion behavior.
- Define audio/mute behavior if audio remains in scope.
- Preserve current facial feedback until separately approved.
- Document responsive and accessibility behavior.

### Deliverable
Screen flow, interaction/state diagrams, and visual-state inventory.

### Exit criteria
Every state and transition is defined for correct actions, incorrect arrangements, leftovers, undo, hints, completion, and return to practice.

## 30. Phase D: Implementation tasks and acceptance tests

**Goal:** Break the design into small, independently reviewable tasks.

### Recommended implementation order
1. Add or improve tests for existing invariants and interactions.
2. Refine the demonstration sequence and current problem data.
3. Introduce equal grouping with its own goal and completion rules.
4. Add mixed sharing/grouping strategy selection.
5. Implement the staged visual-to-number progression.
6. Add skill-specific progression and targeted retries.
7. Refine text density and visual feedback.
8. Add optional audio only after the visual experience is stable.
9. Run regression, accessibility, and child-usability tests.

### Deliverable
Engineering tickets with dependencies and acceptance criteria.

### Exit criteria
Each ticket can be implemented and reviewed independently without speculative changes to unrelated module behavior.

## 31. Phase E: Implement and validate

**Goal:** Build only after Phases A–D have been reviewed and approved.

### Validation checklist
- [ ] No objects disappear or duplicate.
- [ ] Guided turn-taking lock works as specified.
- [ ] Free distribution and undo work.
- [ ] Exact sharing works.
- [ ] Sharing with remainders works.
- [ ] Exact grouping works.
- [ ] Grouping with remainders works.
- [ ] Unequal arrangements are recoverable.
- [ ] Completion does not depend only on an empty jar.
- [ ] Mixed strategy tasks require recognizing the goal.
- [ ] Visuals and equations agree.
- [ ] Division notation is introduced progressively.
- [ ] Existing facial-expression rules remain unchanged unless separately approved.
- [ ] Audio is optional and mute behavior works, if implemented.
- [ ] Mouse/touch interactions are usable.
- [ ] Visual layouts remain clear on supported screen sizes.
- [ ] The child can complete core activities without long text.
- [ ] Existing tests pass and new behaviors have regression coverage.

### Deliverable
Working module, passing tests, and a short validation report.

## 32. Acceptance criteria for the complete curriculum

The curriculum-aligned module is ready when:

- Both sharing and grouping receive meaningful practice.
- Children explore several activity types before division is named.
- Unfamiliar problems are visual until number-readiness is demonstrated.
- Exact results and valid remainders are included in both models.
- Children can correct mistakes without restarting.
- Mixed activities require choosing between sharing and grouping.
- Concrete arrangements connect to quantities and equations.
- Division notation and formal vocabulary are introduced progressively.
- Mastery is tracked by skill rather than screen completion alone.
- Existing facial-expression behavior has been verified and preserved unless separately approved.
- Object conservation and interaction tests pass.
- The module supports recovery, accessibility, and calm feedback.
- No implementation starts before the plan is reviewed and approved.

---

# Part VI — Open decisions

## 33. Decisions that remain open

These are not settled by the current planning conversation. Keep them open until explicitly decided.

1. **Grouping interaction:** Should children drag objects into bags that fill at a target size, or should sharing and grouping use one configurable container interaction?
2. **Progression:** Should stages unlock in a sequence while allowing revisits, or should children freely choose activity types?
3. **Audio scope:** Include optional audio in the first implementation, or defer it until the visual curriculum works well?
4. **Progress persistence:** Should mastered skills persist across sessions, or should the first version track only current-session progress?
5. **Equation timing:** After which observed learning evidence should the first equation appear? Recommendation: not on the first discovery task; introduce it after several varied visual activities.
6. **Formal vocabulary pacing:** Introduce dividend/divisor/quotient/remainder together in one compact visual review, or gradually across later activities?
7. **Facial feedback:** Keep current rules for the first implementation; consider changes only after a verified behavior review and explicit approval.
8. **Target quantities:** Confirm the upper quantity range appropriate for the intended first release through learner testing.
9. **Progress feedback:** Decide whether the child sees a stage map, subtle progress indicator, or both.
10. **Testing with children:** Determine how to observe usability and learning without using speed or repeated failure as the success metric.

## 34. Recommended decisions if the team wants a default

These are recommendations, not confirmed requirements:

- Use target-size bags/containers for grouping so the difference from sharing is immediately visible.
- Keep a mostly sequential learning path, while allowing children to revisit earlier activities.
- Defer optional audio until core visual interactions are stable.
- Start with session-level progress unless persistence is already part of the application's architecture and product requirements.
- Introduce equations only after multiple visual activity types have been explored.
- Introduce formal vocabulary gradually, paired with visual examples.
- Preserve current facial feedback behavior until it has been audited and separately approved.
- Select quantity limits after observing children use the activities.
- Use a quiet progress indicator rather than a competitive score or countdown.

---

# Part VII — Planning artifacts and next action

## 35. Documents this specification should supersede or accompany

This is intended to be the comprehensive curriculum and UX reference. When used alongside earlier planning artifacts:

- Treat this document as the consolidated curriculum/UX specification.
- Keep the original module-state document as a report of the earlier baseline, pending repository verification.
- Keep the audit document as historical audit input, not as proof of current code behavior.
- Update implementation tickets only after the verified baseline and open decisions are reviewed.
- If the repository differs from the audit, correct the baseline report before planning code changes.

## 36. Immediate next step

Perform Phase A only:

1. Inspect the actual repository.
2. Verify the existing flow and interactions.
3. Record exact current facial-expression rules.
4. Verify completion/remainder behavior and object conservation.
5. Compare findings against this document.
6. Produce a precise preserve/refine/add list tied to actual files and tests.

Do not begin implementing grouping, change facial feedback, rewrite equation timing, or add audio until the baseline and design are reviewed.

---

## Final status

**This document is a complete proposed learning and UX plan, not a claim that every proposed behavior exists in the current application.**

**No code changes have been made.**
