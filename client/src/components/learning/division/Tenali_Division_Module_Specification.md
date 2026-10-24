# Tenali Division Learning Module

## Product Vision, Learning Structure, Levels, UX Issues, and Current State

**Purpose:** Establish a shared product and learning specification
before making further implementation changes to the Tenali
division-learning module.

**Repository:** https://github.com/harshjsh01/tenali\
**Upstream project:** https://github.com/vicharanashala/tenali\
**Current module path reported in the state document:**
`client/src/components/learning/division`

> **Working rule:** Treat this document as a planning and documentation
> baseline. Inspect the repository and its instructions before
> implementing. Do not assume file paths or rewrite unrelated
> components. If a requirement conflicts with existing behavior or a
> pedagogical decision is unclear, ask for clarification before changing
> code.

------------------------------------------------------------------------

# 1. Executive Summary

The division module should help a learner discover division through a
concrete, visual task: **make all friends happy by sharing chocolates
equally**.

The learning journey should move gradually through these
representations:

1.  **Concrete objects:** candies in a jar and friends receiving
    candies.
2.  **Visual feedback:** neutral, happy, and sad faces help learners
    notice whether the distribution is fair.
3.  **Visual grouping and quantities:** show the total, number of
    friends, candies each friend receives, and any leftover candies.
4.  **Numbers:** connect the visual result to counts.
5.  **Operations and symbols:** introduce multiplication and addition as
    a bridge, then the division symbol (`÷`).
6.  **Formal vocabulary:** introduce dividend, divisor, quotient, and
    remainder only after the learner has developed a concrete
    understanding.
7.  **Independent practice:** increase difficulty through more friends,
    larger totals, exact division, and remainders.

The experience should use as few words as possible during the core
manipulation activity. Visuals, animation, facial expressions, and
optional sound should carry most of the meaning. Short labels can be
introduced when they serve a clear learning purpose.

The current module already contains many of these ideas, including
guided demonstrations, interactive activities, emotional states, visual
equations, and a terminology review. The next task is to clarify the
complete learning progression, close gaps in the activity sequence,
reduce unnecessary text, and define exactly when to transition from
objects to numbers and symbols.

------------------------------------------------------------------------

# 2. Product Principles

## 2.1 Learning principles

-   **Concrete before abstract:** begin with tangible-looking candies
    and friends.
-   **One new idea at a time:** do not introduce remainders, formal
    terms, and division notation all at once.
-   **Discover before naming:** let learners observe fair sharing before
    explaining the formal mathematical terms.
-   **Immediate, consistent feedback:** actions should visibly affect
    the candies and the friends.
-   **Progressive scaffolding:** early levels guide the learner; later
    levels allow more independent experimentation.
-   **Mistakes are opportunities to learn:** an unequal distribution
    should be visible and recoverable, not treated as a dead end.
-   **No accidental ambiguity:** facial expressions and celebrations
    must correspond to a clearly defined learning rule.
-   **Accessibility:** support touch, mouse, keyboard, reduced motion,
    and non-audio cues.

## 2.2 UX principles

-   The first screen should communicate the goal primarily through
    imagery.
-   Keep the core activity free of explanatory paragraphs.
-   Use short labels only when they add necessary context.
-   Use animation to show cause and effect, not merely as decoration.
-   Sound should be optional and supplementary; important feedback must
    also be visible.
-   Maintain consistent character identity, candy appearance, sizing,
    and visual language.
-   Keep the experience responsive on desktop, tablet, and mobile.
-   Do not make sound, color, or facial expression the sole source of
    essential information.

------------------------------------------------------------------------

# 3. Recommended Module Structure

The module should be organized as a sequence of learning stages. Each
stage should have a specific learning goal, interaction model,
completion condition, and transition to the next stage.

## Stage 0 --- Visual Goal and Orientation

**Learning goal:** Understand the task: share the candies so that all
friends are happy.

**Visuals:** - A jar containing candies. - A group of friends. - Empty
or partially filled plates/hands for receiving candies. - A brief visual
demonstration of a candy moving from the jar to a friend. - Neutral
faces before sharing begins.

**Interaction:** - Start the activity. - Optionally watch the guided
demonstration first.

**Text policy:** Avoid a paragraph. If text is needed, use one short
prompt such as "Make all friends happy" or communicate the goal through
an animation.

**Completion:** Learner starts the guided demo or first activity.

## Stage 1 --- Guided Demonstrations

**Learning goal:** Observe how candies can be shared one at a time and
how equal groups form.

Demonstrations should be short, replayable, and step-by-step. Each candy
should visibly move to a friend. The learner should be able to pause,
replay, or skip the demo if the existing design supports those controls.

Recommended demonstrations: - 4 candies shared between 2 friends: 2
each. - 6 candies shared between 3 friends: 2 each. - 7 candies shared
between 2 friends: 3 each and 1 leftover.

The exact sequence should be validated against the intended progression.
A demonstration should not introduce a concept before the learner has
seen the prerequisites.

**Transition:** Move to hands-on sharing.

## Stage 2 --- Concrete Sharing Activities

**Learning goal:** Practise distributing candies and observe equal
versus unequal quantities.

Each problem should show: - A jar with a defined total number of
candies. - A defined number of friends. - A visible receiving area for
each friend. - The candies remaining in the jar. - The current state of
each friend. - A clear way to undo or return a candy.

The activities should progress from small exact divisions to larger
quantities and then remainders and challenges. See Section 4 for the
proposed levels.

## Stage 3 --- Visual Reflection

**Learning goal:** Connect what happened physically to a stable visual
representation.

After a completed problem, show a visual summary of: - Total candies at
the start. - Number of friends. - Candies each friend received. -
Candies remaining in the jar, if any.

For a remainder problem, a useful visual relationship is:

**Total candies = (number of friends × candies each) + leftover
candies**

For example, 10 candies shared among 3 friends can be shown as:

**10 = (3 × 3) + 1**

The visual summary should reuse the same jar, friend, hand/plate, and
candy assets where possible. It should make the relationship visible
before requiring the learner to read an equation.

## Stage 4 --- Numbers and Mathematical Relationships

**Learning goal:** Connect objects to quantities and quantities to
mathematical notation.

Recommended order: 1. Show actual candies and friends. 2. Add small
count badges or numerals to the visual groups. 3. Show the total, number
of friends, and number each friend received. 4. Introduce the
multiplication relationship that describes the equal groups. 5.
Introduce the leftover as an additional amount. 6. Introduce the
division expression using `÷`. 7. Show how the division result and
remainder relate to the original total.

Do not jump directly from the concrete activity to a dense equation.
Keep the concrete objects visible while the numbers and symbols are
first introduced.

## Stage 5 --- Formal Vocabulary

**Learning goal:** Learn the names of the parts of a division
expression.

Introduce these terms after learners have repeatedly experienced the
concepts visually:

-   **Dividend:** the total quantity being divided.
-   **Divisor:** the number of equal groups or, in this module's story,
    the number of friends sharing.
-   **Quotient:** the number each friend receives when the groups are
    equal.
-   **Remainder:** the quantity left over after making equal groups.

Use one visual equation and highlight each part in turn. Keep
definitions short and attached to the relevant object or number.

## Stage 6 --- Independent Practice and Review

**Learning goal:** Apply the idea without relying on a guided animation.

Include: - Exact-division questions. - Larger totals. - Different
numbers of friends. - Remainder questions. - Questions that ask the
learner to identify whether sharing is fair. - Questions that connect a
visual distribution to numbers and symbols. - A short review of
terminology only after the concrete and symbolic concepts have been
introduced.

Practice should revisit earlier concepts rather than only increase the
numbers.

------------------------------------------------------------------------

# 4. Proposed Level and Activity Progression

The current interface reportedly has a guided demo followed by
**Exact**, **Larger**, **Leftovers**, and **Challenge**. Keep these
recognizable stages where possible, but make the learning purpose and
difficulty progression explicit.

This is a proposed curriculum structure, not a claim that every listed
level currently exists in code. The exact problem set should be
finalized before implementation.

## Level 0 --- Watch and Notice (Guided Demo)

**Purpose:** Show what fair sharing looks like.

Suggested problems: 1. 4 candies, 2 friends → 2 each. 2. 6 candies, 3
friends → 2 each. 3. 7 candies, 2 friends → 3 each, 1 left over.

**Support:** Fully animated walkthrough; pause, replay, and step
forward.

**Key observation:** Friends receive equal quantities when sharing is
fair. A leftover can remain without making the sharing unfair.

**Exit condition:** Demo completed or skipped.

## Level 1 --- Exact Sharing

**Purpose:** Learn the basic one-at-a-time process with small
quantities.

Suggested problems: - 2 candies, 2 friends. - 4 candies, 2 friends. - 6
candies, 3 friends.

**Support:** Strong guidance. Use a turn-taking rule so the learner
practises giving one candy to each friend before beginning another
round.

**Success condition:** All friends have equal quantities.

**Feedback:** Celebrate with a short animation and optional sound. Do
not require the learner to understand formal terminology yet.

## Level 2 --- More Candies, Same Idea

**Purpose:** Generalize equal sharing to larger totals and/or a
different number of friends.

Suggested problems: - 8 candies, 2 friends. - 9 candies, 3 friends. - 12
candies, 3 friends.

The final list should be checked against the target age and desired
difficulty. Larger quantities should not make the drag-and-drop
interface cumbersome.

**Support:** Reduce guidance slightly. Keep a visible round structure,
but avoid unnecessary labels.

**Success condition:** Equal quantities across friends.

**Bridge:** Add count indicators or a visual numerical summary after
successful completion.

## Level 3 --- What Happens to Leftovers?

**Purpose:** Discover that a total does not always divide into equal
whole-number groups with nothing left.

Use a deliberate sequence from a small remainder to a larger one.

Suggested problems: - 5 candies, 2 friends → 2 each, 1 left. - 7
candies, 2 friends → 3 each, 1 left. - 8 candies, 3 friends → 2 each, 2
left. - 10 candies, 3 friends → 3 each, 1 left. - 11 candies, 3 friends
→ 3 each, 2 left.

These examples are proposed additions to close the currently reported
gaps in the leftover section. Confirm the final order and whether every
problem is required.

**Support:** Allow experimentation and undoing. The learner should be
able to see what happens when an extra candy is given to one friend and
then returned.

**Success condition:** The learner finds equal shares and recognizes the
leftover in the jar.

**Important distinction:** A leftover is not automatically unfair.
Unequal quantities among friends are different from equal quantities
with candies remaining in the jar.

## Level 4 --- Fair or Not Fair? (Challenge)

**Purpose:** Apply the concept with less guidance and more varied
conditions.

Possible challenge types: - Equal distribution with no leftovers. -
Equal distribution with leftovers. - An intentionally unequal
distribution that the learner must fix. - More friends, within a
manageable visual layout. - Larger totals. - A visual distribution that
must be matched to a numerical summary.

Use up to five friends only if the interface remains usable on small
screens. Do not increase both the number of friends and total candies
too sharply at once.

**Support:** Minimal. Keep undo/return interactions available.

**Success condition:** The learner produces or identifies a fair
distribution and correctly interprets any remainder.

## Level 5 --- Count What Each Friend Got

**Purpose:** Make the transition from objects to numerals.

Show the same concrete distribution but add: - Total number in the
starting jar. - Number of friends. - Number each friend received. -
Number left in the jar.

Begin with exact sharing, then include a remainder example.

**Support:** Keep the visual objects visible beside the numbers.

**Success condition:** Learner can match quantities to the correct
numerals.

## Level 6 --- Build the Relationship

**Purpose:** Explain the result mathematically before introducing formal
division vocabulary.

Use visual cards or a guided equation:

**Total = (friends × candies each) + leftover**

For example:

**10 = (3 × 3) + 1**

Reveal one part at a time, with the corresponding objects highlighted.
Explain through the visual relationship that the groups account for the
shared candies and the jar accounts for the remainder.

**Success condition:** Learner can connect the physical result to the
numerical relationship.

## Level 7 --- Introduce the Division Symbol

**Purpose:** Connect the familiar sharing story to division notation.

Recommended sequence: 1. Show the jar and friends. 2. Add the total and
friend-count numerals. 3. Show the equal share. 4. Reveal the `÷` symbol
between the total and number of friends. 5. Show the quotient and, where
applicable, the remainder. 6. Keep the original objects visible during
the first few examples.

Examples: - `6 ÷ 3 = 2` - `7 ÷ 2 = 3 R 1` - `10 ÷ 3 = 3 R 1`

Do not assume all learners already understand the equals sign or
multiplication symbol; check prerequisite knowledge in the intended
curriculum.

## Level 8 --- Names of Division

**Purpose:** Introduce dividend, divisor, quotient, and remainder.

Use one example such as `10 ÷ 3 = 3 R 1` and highlight each part in
sequence. Keep definitions short and anchored to the jar, friends, each
friend's share, and leftover candies.

## Level 9 --- Mixed Practice and Review

**Purpose:** Consolidate the full journey.

Mix: - Concrete sharing. - Equal versus unequal outcomes. - Leftover
identification. - Counting and number matching. - Visual equation
completion. - Division-symbol questions. - Term identification.

Keep the number of words low, but make the task clear. Avoid testing a
new concept before it has been taught.

------------------------------------------------------------------------

# 5. Emotional Feedback Rules

The module has three face assets for each friend: neutral, happy, and
sad. The specification must clearly distinguish **in-progress feedback**
from **final evaluation**.

## 5.1 Recommended behavior

### While sharing is in progress

-   Use neutral expressions by default.
-   Do not label a friend as sad merely because they temporarily have
    fewer candies while the learner is still distributing.
-   If the turn-taking lock is active, use a subtle visual indication
    that a friend is waiting or ready. Do not rely on text alone.

### After a completed fair distribution

-   If every friend has the same number of candies, all friends become
    happy.
-   If candies remain in the jar but every friend has the same number,
    all friends remain happy.
-   Visually distinguish leftover candies in the jar without implying
    that the sharing was unfair.

### After a completed unequal distribution

-   Friends with fewer candies than the maximum should appear sad.
-   Friends with the maximum quantity should appear happy, if this is
    the chosen rule.
-   The learner should be able to correct the distribution by returning
    or moving candies.

## 5.2 A decision that needs to remain explicit

The original idea says that when one friend has extra candy, that friend
is happy and the others are sad. The later UX description also says
expressions should update when a candy is moved. The current-state
document describes neutral faces during free distribution and final
reactions on submission.

These are different interaction choices. Recommended default: - **In
progress:** neutral. - **On submit/evaluation:** happy or sad according
to the final distribution. - **After a change to an evaluated
distribution:** reset to neutral until the learner submits again, unless
the design intentionally calls for immediate reevaluation.

Confirm whether instant emotion changes are wanted in every activity or
only after submission. Keep the rule consistent across levels.

------------------------------------------------------------------------

# 6. Equal-Sharing Lock and Remainder Logic

The lock is a teaching scaffold, not a rule that prevents the learner
from discovering remainders.

## Early guided level

-   A friend who has received a candy is temporarily locked for that
    round.
-   Other friends must receive one candy before another round starts.
-   Once all active friends have received one, unlock the next round.
-   The rule should teach turn-taking and equal distribution.

## Later free-experimentation levels

-   The learner may distribute candies in any order.
-   Candies can be returned to the jar.
-   The learner may submit the arrangement for feedback.
-   The lock should not silently prevent every uneven arrangement,
    because the learner needs to see and correct mistakes.

## Completion conditions

Do not treat "the jar is empty" as the only definition of completion.

-   **Exact division:** jar empty and all friends have equal quantities.
-   **Division with a remainder:** jar has fewer candies than the number
    of friends and all friends have equal quantities.
-   **Unequal distribution:** friend counts differ; show the result as
    unequal and allow correction.
-   **Premature submission:** if there are still enough candies to give
    every friend another candy, guide the learner to continue rather
    than calling it a final remainder.

For a completed fair distribution, the remainder is the number of
candies left after equal groups have been made. It must be less than the
number of friends.

------------------------------------------------------------------------

# 7. Visual-to-Abstract Transition: When to Introduce Numbers and Symbols

The current experience has a visual equation view and a terminology
review. The main opportunity is to define the transition as a deliberate
sequence instead of moving directly from an activity to a fully formal
equation.

## Recommended transition sequence

  ---------------------------------------------------------------------------------------
  Step                    What the learner sees                   What the learner learns
  ----------------------- --------------------------------------- -----------------------
  1\. Objects only        Jar, candies, friends, plates           Sharing means
                                                                  distributing objects

  2\. Fairness feedback   Neutral/happy/sad faces                 Equal quantities create
                                                                  a fair share

  3\. Count each group    Small numerals beside each group        Each group has a count

  4\. Show total and      Total in jar and number of friends      The problem has a
  groups                                                          starting total and a
                                                                  group count

  5\. Show each share     Count of candies each friend receives   The quotient represents
                                                                  the amount in each
                                                                  equal group

  6\. Show leftovers      Remaining candies stay visibly in the   A remainder is what
                          jar                                     cannot make another
                                                                  complete round

  7\. Show a relationship `Total = (friends × each) + leftover`   Shared candies and
                                                                  leftovers account for
                                                                  the total

  8\. Introduce `÷`       `Total ÷ friends = each`, with          Division notation
                          remainder if needed                     represents the sharing
                                                                  task

  9\. Name the parts      Dividend, divisor, quotient, remainder  Formal vocabulary maps
                                                                  to a familiar visual

  10\. Mixed practice     Objects, numerals, symbols, and terms   The learner can move
                                                                  between representations
  ---------------------------------------------------------------------------------------

The table is a proposed learning design. Validate the sequence against
the module's target age and the curriculum before implementation.

------------------------------------------------------------------------

# 8. Sound and Animation

The current request is to make the module more interactive with sound.
Add sound only where it reinforces an action or learning outcome.

## Suggested sound events

-   **Candy picked up:** a subtle, soft pickup sound.
-   **Candy dropped successfully:** a short, pleasant pop.
-   **Equal round completed:** a light chime.
-   **All friends happy:** a short celebratory sound.
-   **Candy returned to the jar:** a soft reverse/pop sound.
-   **Invalid drop:** a gentle, non-punitive cue.
-   **Problem completed:** a small success flourish.

## Sound requirements

-   Provide a mute/unmute control.
-   Respect browser autoplay restrictions; sound should start only after
    an explicit user interaction.
-   Keep volume moderate and avoid repetitive or harsh sounds.
-   Respect reduced-motion preferences for animations.
-   Do not make audio the only way to detect success or failure.
-   Keep sounds short and avoid playing multiple overlapping sounds for
    a rapid sequence of drops.
-   If sound assets already exist, inspect and reuse them before adding
    dependencies.

## Suggested animation events

-   Candy follows the pointer/finger while dragging.
-   Candy settles on the plate or in the jar.
-   A completed sharing round gives a subtle visual acknowledgement.
-   Equal final shares trigger a coordinated happy reaction.
-   A remainder receives a subtle visual highlight.
-   Equation parts appear in sequence and highlight the matching visual
    objects.

Animations should remain fast enough that they do not slow down repeated
practice.

------------------------------------------------------------------------

# 9. Issues to Resolve in the Current Module

This section separates issues reported by the product owner from items
that need code inspection.

## 9.1 Too much text

**Reported issue:** The experience uses more words than desired.

**Desired direction:** - Remove unnecessary paragraphs and repeated
instructions. - Use visuals, face states, animations, and short
prompts. - Keep essential controls accessible and understandable. -
Introduce mathematical vocabulary only at the appropriate stage.

**Inspection needed:** Identify all user-facing text in the goal screen,
demo, activities, banners, equation view, and terminology review.
Classify each as essential, replaceable with a visual, or removable. Do
not delete accessibility labels or necessary control names without an
equivalent accessible alternative.

## 9.2 Sound is missing or insufficient

**Reported issue:** Add sound to make the activity more engaging.

**Desired direction:** Use short, optional sounds for meaningful actions
and outcomes. Include mute control and visible feedback.

**Inspection needed:** Check whether sound assets, audio utilities, user
preferences, or browser-policy handling already exist.

## 9.3 The reason behind each emotion needs to be clearer

**Reported issue:** Learners need to understand why friends are happy or
sad.

**Desired direction:** - Equal counts → all happy. - Unequal final
counts → friends with the maximum are happy and those with fewer are
sad, under the selected rule. - Equal shares with a remainder → all
happy, with the leftover visibly in the jar. - Incomplete distribution →
neutral.

The visual result should explain the rule. If extra explanation is
necessary, use a brief, contextual visual cue rather than a paragraph.

**Inspection needed:** Compare the current emotion logic with this rule.
The supplied current-state document says that an unequal distribution's
maximum-count friend remains neutral and that happy faces are reserved
for equal shares meeting a remainder condition. This differs from the
intended UX. Review the code and confirm the desired final rule before
changing it.

## 9.4 Gaps in the leftover level

**Reported issue:** The leftover section has gaps and needs more
questions.

**Desired direction:** Build a graduated sequence from a small remainder
to different friend counts and remainders. The proposed examples in
Level 3 are candidates, not a finalized mandatory list.

**Inspection needed:** Extract the actual problem data, current order,
and completion/advancement rules. Identify missing combinations, abrupt
difficulty jumps, repeated questions, and cases where a remainder is
incorrectly treated as unfair sharing.

## 9.5 The move from pictures to numbers is not fully specified

**Reported issue:** Define when to move from images to numbers and when
to introduce the division symbol.

**Desired direction:** Add numerals to familiar visual groups first;
then show the total, number of friends, each share, and leftover; then
introduce a visual relationship; then introduce `÷`; finally teach
formal terms.

**Inspection needed:** Document which of these transitions already
exists and where the learner currently moves from one stage to another.

## 9.6 The levels need a complete learning progression

**Reported issue:** The current progression includes demo, exact,
larger, leftover, and challenge, but additional steps are needed.

**Desired direction:** Keep those core levels but define their learning
goals and add explicit transitions for counting, numerical
relationships, division notation, terminology, and mixed practice.

**Inspection needed:** Determine whether these later stages should be
nested in the current module or exposed as separate levels. Prefer the
smallest change consistent with the existing architecture.

## 9.7 The turn-taking lock must support both fairness and remainder discovery

**Reported issue:** Preserve the one-at-a-time lock but do not make
remainders impossible.

**Desired direction:** Use strong round-based locking in the first
activity, then allow freer experimentation in later activities. Keep
return-to-jar and correction behavior.

**Inspection needed:** Confirm that the lock, submit logic, remainder
logic, and emotional state transitions agree on what counts as an
incomplete round versus a completed problem.

## 9.8 Current UX has competing feedback modes

The supplied current-state document describes: - Activity 1 using live
reactions and turn-taking locks. - Activities 2--4 using neutral
expressions during distribution and reactions on submission. - A later
submission model that allows correction.

The newer UX description asks for expressions to update when the
distribution changes, but also asks not to judge an incomplete sharing
round too early.

**Decision needed:** Choose a consistent state model for every level.
Recommended default is neutral during an unfinished distribution and
final reactions after evaluation. Early guided rounds may use a limited,
non-judgmental visual acknowledgement when each friend receives a candy.

## 9.9 Asset consistency and accessibility

**Reported direction:** Use the new friend expressions, blue-wrapped
candy, jar, and hand assets.

**Inspection needed:** - Check how the current sprites are cropped and
mapped to each character. - Verify background transparency rather than
assuming a checkerboard preview means transparency. - Confirm image
dimensions and aspect ratios. - Ensure draggable objects remain
interactive and images do not block pointer events. - Keep keyboard and
touch access working. - Ensure facial expressions are not the sole
signal for screen-reader users.

------------------------------------------------------------------------

# 10. Current State of the Module (From the Supplied State Document)

The following describes the current state as documented in
`DIVISION_MODULE_STATE.md`. It has not been independently verified
against the repository source code in this document.

## 10.1 Architecture and philosophy

The state document identifies the module at
`client/src/components/learning/division` and describes these stages:

1.  Physical sharing of candies from a jar to friends' plates.
2.  Emotional feedback through neutral, happy, and sad expressions.
3.  Free experimentation with unequal distributions and leftovers.
4.  Visual synthesis using the relationship
    `Jar = Friends × Hand + Leftover`.
5.  Formal division notation and terms.

It reports custom SVG icons, five consistent characters (Maya, Rohan,
Priya, Leo, and Sam), a glass candy jar, wrapped candies, and hand
illustrations.

## 10.2 Current phase sequence

The supplied state document describes:

1.  **Goal screen:** back navigation, step indicators, hero
    illustration, principle badges, and buttons to start sharing or
    watch the demo.
2.  **Guided demo:** 4 candies / 2 friends, 6 / 2, and 7 / 2, with
    animated candy movement and playback controls.
3.  **Activity 1 --- Exact sharing:** guided turn-taking lock and
    automatic completion when the jar is empty.
4.  **Visual equation view:** visual cards and an equation relationship.
5.  **Activity 2 --- Larger exact:** free mode and submit button.
6.  **Activity 3 --- Leftover discovery:** free experimentation, submit,
    and unequal-distribution feedback.
7.  **Activity 4 --- Challenge:** up to five friends and more complex
    remainders.
8.  **Terminology review:** dividend, divisor, quotient, and remainder.
9.  **Practice quiz or return to home:** described as a final action in
    the terminology section.

The exact routing and progression must be confirmed in source code.

## 10.3 Current interaction model

The state document reports: - A glass jar on the left with a
remaining-candy badge. - Friends and plates on the right. - Candies can
be dragged to friends or tapped/clicked. - Candies on plates can be
returned to the jar. - Activity 1 uses turn-taking locks and ready/wait
indicators. - Activities 2--4 use free distribution and a submit
button. - Keyboard controls include Space, number keys 1--5, and
Enter/Space on plates. - A state invariant keeps the sum of friend
counts and jar count equal to the problem total.

## 10.4 Current emotion rules documented

The state document currently says: - Neutral faces appear at the
beginning, during free distribution before submission, for maximum-count
friends in an unequal distribution, and for some equal distributions
where another round remains possible. - Sad faces appear for friends
with fewer candies than the maximum. - Happy faces appear when all
friends have equal nonzero quantities and the remaining candies cannot
be shared equally.

This is not fully aligned with the newer desired behavior, which calls
for happy faces for friends with the maximum quantity in a final unequal
distribution and all friends happy after an equal distribution with a
remainder. Resolve this discrepancy explicitly before implementation.

## 10.5 Current remainder behavior documented

The state document includes examples: - 7 candies / 2 friends: 3 each
with 1 remaining should be fair and celebratory. - Giving the seventh
candy to one friend creates an unequal distribution and triggers a
warning on submission. - Returning that candy restores equal shares and
allows celebration. - Submitting before another full round is possible
shows guidance to continue.

The general principle is useful: a remainder should be the amount left
after equal shares are made, not an extra candy assigned to one friend.

## 10.6 Current equation and terminology views

The state document describes: - A visual equation breakdown with total,
number of friends, each share, and leftover. - Visual cards for the jar,
friend groups, hands holding candies, and leftover jar. - A formal
example such as `7 ÷ 2 = 3 (remainder 1)`. - A terminology screen using
`10 ÷ 3 = 3 R 1` to introduce dividend, divisor, quotient, and
remainder.

The requested improvement is to make the transition into these views
more gradual and ensure the learner understands the visual relationship
before seeing formal terminology.

------------------------------------------------------------------------

# 11. Initial Idea and Original Requirements

This section preserves the original product intent that preceded the
current implementation.

## 11.1 Core concept

Teach division by asking the learner to share candies equally among
friends. Use an intuitive visual activity rather than starting with a
written definition.

The original example was a jar with 10 chocolates and 3 friends. The
learner shares one chocolate at a time and discovers:

**10 = 3 × 3 + 1**

That is, each friend gets 3 chocolates and 1 remains.

## 11.2 Sharing interaction

-   A candy is given to one friend at a time.
-   A friend who has received a candy is locked for the current round
    until the others catch up.
-   Once every friend has received the same number for that round,
    another round can begin.
-   The mechanism should teach equal turn-taking, not prevent the
    learner from exploring an incorrect result in later levels.
-   The jar and each friend's candies should remain visually clear.

## 11.3 Emotional feedback

The original emotional concept was: - Equal sharing makes all friends
happy. - If one friend has more and another has fewer, the friend with
more is happy and the friend with fewer is sad. - During incomplete
sharing, avoid premature judgments. - Equal sharing with a leftover in
the jar should still be considered fair.

The user later asked for three expressions for every friend: happy, sad,
and neutral.

## 11.4 Visual assets

The original asset requests included: - Consistent friend characters
with happy and sad faces. - Neutral faces for the same characters. -
Blue-wrapped candies that can be dragged and dropped. - A jar containing
the total candies. - Hands holding different numbers of candies for
visual summaries.

The assets should be integrated into the existing asset system rather
than used to justify an unrelated rewrite.

## 11.5 Words and formal terminology

The original preference was for the core activity to contain no words or
as few words as possible. The learner should understand the goal from
the visuals.

Formal vocabulary such as dividend, divisor, quotient, and remainder
should be introduced only after the learner has completed the concrete
sharing activities and seen the visual representation.

------------------------------------------------------------------------

# 12. Desired Changes and Additional Requests

The product owner wants the current experience to evolve in these ways:

1.  **Reduce text:** remove unnecessary words and use visual
    communication wherever possible.
2.  **Add sound:** include optional sound effects for dragging,
    dropping, completing a round, and reaching a fair result.
3.  **Explain fairness visually:** make it clear why friends are happy
    or sad through their counts, expressions, and the final
    distribution.
4.  **Define all levels:** document each level's goal, problem sequence,
    scaffolding, completion criteria, and transition.
5.  **Improve the leftover section:** add more questions and create a
    smoother progression from simple to more difficult remainder cases.
6.  **Introduce numerals gradually:** connect the objects to numbers
    before displaying equations.
7.  **Introduce the division symbol deliberately:** explain the visual
    relationship first, then show `÷`.
8.  **Introduce terminology later:** map formal terms to the visual
    model after the learner has experience with the concept.
9.  **Preserve existing functionality:** retain drag-and-drop,
    return-to-jar, keyboard/touch support, state integrity, and the
    existing design system.
10. **Avoid premature implementation:** document and agree on the
    structure and unresolved choices before making changes.

------------------------------------------------------------------------

# 13. Proposed Work Plan

Work in small, reviewable stages.

## Phase A --- Documentation and audit

-   Read the repository instructions and current module documentation.
-   Verify the current module flow and problem data in code.
-   Inventory all user-facing text and sound/animation support.
-   Document current emotion, lock, submission, remainder, and
    navigation behavior.
-   Compare actual behavior against this specification.

**Deliverable:** A verified current-state document and a list of
discrepancies.

## Phase B --- Finalize the learning design

-   Confirm the final level sequence.
-   Confirm the problem set and difficulty progression.
-   Decide when expressions update and when evaluation happens.
-   Decide the exact visual-to-number-to-symbol transition.
-   Agree on sound behavior and text reduction.
-   Confirm whether any levels should be combined or separated.

**Deliverable:** An approved learning-flow specification.

## Phase C --- UX and state design

-   Map each phase to the required visuals and interactions.
-   Define the state transitions for sharing, submission, correction,
    and completion.
-   Define how emotion state is derived from counts and activity phase.
-   Define accessibility and reduced-motion/audio behavior.

**Deliverable:** A screen/state-flow and interaction specification.

## Phase D --- Implementation plan

-   Identify the smallest set of components and data that need changes.
-   Reuse the existing asset and interaction architecture.
-   Avoid adding dependencies unless a clear need is demonstrated.
-   Add or update tests around counts, remainders, emotions, and
    completion.

**Deliverable:** A focused implementation plan for review before coding.

## Phase E --- Implementation and validation

-   Implement only the approved changes.
-   Test all exact, unequal, remainder, and premature-submission cases.
-   Test touch, mouse, keyboard, muted sound, and responsive layouts.
-   Run relevant tests and build checks.
-   Report modified files, behavior changes, test results, and known
    limitations.

------------------------------------------------------------------------

# 14. Acceptance Criteria

The design should not be considered complete until the following are
true:

## Learning progression

-   The goal is understandable from the opening visuals.
-   Guided demos precede or support the first independent activity.
-   Exact sharing comes before remainder discovery.
-   Remainder problems progress gradually.
-   Numbers are introduced while the objects are still visible.
-   The division symbol is introduced after the visual relationship is
    understood.
-   Formal terminology comes after concrete and symbolic examples.
-   Practice checks both understanding and application.

## Fairness and remainder behavior

-   Equal friend counts produce an equal-share result.
-   Equal counts with candies left in the jar are still fair.
-   A remainder is less than the number of friends.
-   An extra candy assigned to one friend creates an unequal result.
-   Learners can correct an unequal distribution.
-   The lock supports guided learning without eliminating remainder
    discovery.

## UX and accessibility

-   Unnecessary text is removed without making controls inaccessible.
-   Sound is optional and has a mute control.
-   Essential information is not communicated by sound or color alone.
-   Drag-and-drop and return-to-jar behavior remain functional.
-   Keyboard and touch interactions remain available.
-   Assets are consistent, correctly cropped, and not distorted.
-   Animations do not block learning or make the interface sluggish.

## Engineering

-   Existing architecture and project instructions are followed.
-   No unrelated modules are rewritten.
-   Relevant tests and build checks pass.
-   Any unresolved product decision is raised before implementation.

------------------------------------------------------------------------

# 15. Open Decisions to Confirm Before Implementation

1.  **Emotion timing:** Should happy/sad faces appear only after submit,
    or should they update immediately after each move once a
    distribution is considered complete?
2.  **Definition of completion:** In free mode, should the learner
    explicitly submit every answer, or should exact and valid remainder
    results be detected automatically?
3.  **Challenge difficulty:** What is the intended learner age/grade and
    maximum acceptable number of friends and candies?
4.  **Numeral transition:** Should number badges first appear after
    Level 2, or should they appear earlier in a very subtle form?
5.  **Division notation:** Should the first `÷` example appear after the
    exact-sharing levels or after the remainder level?
6.  **Sound assets:** Are there existing project sounds to reuse, or
    should new sound assets be sourced/created?
7.  **Terminology:** Should the review teach the terms "dividend,"
    "divisor," "quotient," and "remainder" in one screen or
    progressively over multiple questions?
8.  **Problem progression:** Which proposed remainder problems should be
    mandatory, and how many questions should each level contain?
9.  **Language and accessibility:** Which languages and screen-reader
    behavior must the module support?

These questions should be answered only where the existing code and
project documentation do not already resolve them.

------------------------------------------------------------------------

# Appendix A --- Reference Examples

  --------------------------------------------------------------------------
   Total candies        Friends  Each receives       Leftover Expected final
                                                              result
  -------------- -------------- -------------- -------------- --------------
               4              2              2              0 All happy

               6              3              2              0 All happy

               5              3   1 each, with              0 Unequal;
                                     an uneven                evaluate the
                                         final                actual counts
                                  distribution                
                                  if 2 receive                
                                      an extra                

               7              2              3              1 All happy

               8              3 2 each, with 2   0 if all are Depends on
                                     left over distributed; 2 actual
                                                if left after distribution
                                                 equal shares 

              10              3              3              1 All happy

              11              3              3              2 All happy
  --------------------------------------------------------------------------

**Important clarification for the examples:** The final result depends
on the actual number of candies on each friend's plate and in the jar.
For instance, with 8 candies and 3 friends, a fair remainder result is 2
each with 2 left in the jar. If all 8 are distributed as 3, 3, and 2,
the distribution is unequal. The activity should not conflate these two
outcomes.

# Appendix B --- Source and Confidence Notes

-   The **Current State** section is based on the uploaded
    `DIVISION_MODULE_STATE.md`.
-   The **Initial Idea** and **Desired Changes** sections preserve the
    product requirements described by the user.
-   The **Proposed Levels**, **transition sequence**, and **work plan**
    are recommendations to review, not verified descriptions of current
    code.
-   The current repository has not been inspected as part of creating
    this document. Verify paths, actual behavior, and existing
    architecture before implementation.
