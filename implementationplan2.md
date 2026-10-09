# Implementation Plan — Guess What's On Tenali's Mind (v2.0 5-Round Deduction Engine)

This document details the game design specification, educational deduction framework, software architecture, data models, API endpoints, frontend state machines, and implementation roadmap for **Guess What's On Tenali's Mind**.

---

## 1. Executive Summary & Design Philosophy

"Guess What's On Tenali's Mind" is a 5-round gamified educational deduction engine designed for students aged 4–18. Rather than presenting standard textbook Multiple Choice Questions (MCQs) or asking for immediate definitions, the game trains students to think like **detectives** using concept discrimination and progressive uncertainty reduction.

### Core Principles
* **Concept Discrimination over Memorization**: Every level consists of a family of 4 closely related concepts (e.g., *Whole Numbers, Integers, Fractions, Decimal Numbers*). Students must identify what makes the target concept distinct from its close relatives.
* **5-Round Detective Progression**: Tenali secretly chooses 1 of the 4 options. Across 5 rounds, Tenali reveals clues designed according to strict pedagogical rules to reduce uncertainty step-by-step.
* **Multi-Selection Confidence Building**: In rounds 1 through 5, students select **one or more candidate options** they believe are still possible. They can update their thinking each round as evidence mounts.
* **End-of-Level Reflection & Final Guess**: After Round 5, students view a summary histogram of how many times they selected each option across all 5 rounds, building confidence before submitting their **one final guess**.
* **Zero-Inference Latency & Cost**: Uses declarative JSON question banks loaded into memory on server startup rather than real-time LLM calls.

---## 2. 5-Round Clue Progression Framework

Every level follows a standardized 5-round evidence progression designed to guide student reasoning using **progressive uncertainty reduction**. Initial clues start intrigue-first and broad so that students cannot guess the answer immediately on Round 1:

| Round | Evidence Type | Objective & Clue Characteristics | Target Uncertainty State |
| :--- | :--- | :--- | :--- |
| **Round 1** | **Broad Mystery & Observation** | Broad real-world context, pattern, or observation that applies to **3–4 candidate concepts** in the level family. **Strict Rule**: Never include explicit dead-giveaways (like negative signs `-3`, stacked bars `1/2`, or dots `0.5`). | **3–4 options** seem plausible. High intrigue & productive confusion. |
| **Round 2** | **Subtle Property** | Introduces a characteristic that narrows the scope without giving a complete definition. | **1 option eliminated** (3 options remain plausible). |
| **Round 3** | **Constraint & Elimination** | Reveals a negative constraint, edge case, or structural boundary ("My family rejects..."). | **1 more option eliminated** (2 options remain plausible). |
| **Round 4** | **Real-Life Scenario** | Presents a concrete application scenario that strongly favors the target concept over the remaining distractor. | **1 primary option** emerges strongly (2 under consideration). |
| **Round 5** | **Final Clincher** | Explicit defining property that uniquely pinpoints the secret concept with zero ambiguity. | **Only 1 option** fits perfectly. |

---

## 3. Game Mechanics & User Experience Flow

```
[ LEVEL SELECT ]
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│                    ROUND 1 to 5 LOOP                    │
│ 1. Tenali presents Round N Clue                         │
│ 2. Student selects candidate options (☐ Whole ☐ Integers)│
│ 3. Selections recorded → Advance to Round N+1           │
└──────────────────────────┬──────────────────────────────┘
                           │ (After Round 5)
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   END OF LEVEL SUMMARY                  │
│ Histogram: Selection count across all 5 rounds          │
│ Example: Whole Numbers ████ (4), Integers ██ (2)...     │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    ONE FINAL GUESS                      │
│ Student submits their final chosen concept              │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 OUTCOME & WISDOM SCROLL                 │
│ Victory/Defeat screen, Stars, XP, and Educational Card  │
└──────────────────────────┬──────────────────────────────┘
```

### Round-by-Round Interaction Rules
1. **Clue Display**: Tenali's clue is displayed inside Tenali's Mind speech bubble.
2. **Candidate Checkboxes**: The 4 level options are rendered with toggleable checkboxes. In rounds 1–4, students can check any number of options ($1$ to $4$).
3. **No Lock-In**: Student selections are recorded per round. Students are free to modify their selections in subsequent rounds as new clues arrive.
4. **Summary & Final Selection**: After Round 5, a visual bar chart shows their candidate picks across all 5 rounds. The student then taps **one single option** as their final answer.

---

## 4. Data Models & JSON Schemas

The system uses three declarative configuration files in `server/data/`:
1. `worlds.json` - Kingdom boundaries and XP requirements.
2. `levels.json` - Level mappings, titles, and candidate option sets.
3. `question_banks.json` (or integrated in `concepts.json`) - Complete 5-round clue banks for all 4 concepts per level.

### A. Level Schema (`levels.json`)
```json
[
  {
    "levelNum": 1,
    "worldId": "number_kingdom",
    "levelName": "Number Sets",
    "options": [
      "Whole Numbers",
      "Integers",
      "Fractions",
      "Decimal Numbers"
    ]
  }
]
```

### B. Number Kingdom Curriculum Division (Levels 1–15)

| Level | Family / Level Name | Options (Candidate Concepts) |
| :--- | :--- | :--- |
| **1** | Number Sets | Whole Numbers, Integers, Fractions, Decimal Numbers |
| **2** | Number Properties | Even Numbers, Odd Numbers, Prime Numbers, Composite Numbers |
| **3** | Factors & Multiples | Factor, Multiple, HCF (GCD), LCM |
| **4** | Divisibility | Divisible by 2, Divisible by 3, Divisible by 5, Divisible by 9 |
| **5** | Place Value | Ones, Tens, Hundreds, Thousands |
| **6** | Number Comparison | Greater Than (>), Less Than (<), Equal To (=), Ascending Order |
| **7** | Fractions | Proper Fraction, Improper Fraction, Mixed Fraction, Equivalent Fraction |
| **8** | Decimal Concepts | Tenths, Hundredths, Thousandths, Decimal Number |
| **9** | Fraction Forms | Fraction, Decimal, Percentage, Ratio |
| **10** | Number Patterns | Arithmetic Pattern, Geometric Pattern, Square Numbers, Cube Numbers |
| **11** | Number Operations | Addition, Subtraction, Multiplication, Division |
| **12** | Estimation & Rounding | Round to Nearest 10, Round to Nearest 100, Estimate Sum, Estimate Difference |
| **13** | Powers & Roots | Square, Cube, Square Root, Cube Root |
| **14** | Number Representation | Roman Numerals, Hindu-Arabic Numerals, Expanded Form, Standard Form |
| **15** | Number Kingdom Boss | Prime Number, HCF, Equivalent Fraction, Decimal Number *(Mixed Boss Challenge)* |

### C. Concept Question Bank Schema (`concepts.json`)
```json
{
  "whole_numbers": {
    "conceptId": "whole_numbers",
    "name": "Whole Numbers",
    "levelName": "Number Sets",
    "clues": [
      {
        "round": 1,
        "evidenceType": "Broad Mystery & Observation",
        "tenaliClue": "I am a way we talk about how much or how many items we have when we count, measure, or share!",
        "whyItHelps": "Broad statement fitting Whole Numbers, Integers, Fractions, and Decimals. Leaves all 4 options open."
      },
      {
        "round": 2,
        "evidenceType": "Subtle Property",
        "tenaliClue": "My family is super friendly with zero and positive counting values. We never go below zero!",
        "whyItHelps": "Eliminates Integers (which allow negative values). Whole Numbers, Fractions, and Decimals remain."
      },
      {
        "round": 3,
        "evidenceType": "Constraint & Elimination",
        "tenaliClue": "If you cut a cookie into pieces, a single broken piece alone CANNOT join my family as an exact single member!",
        "whyItHelps": "Eliminates Fractions and Decimals."
      },
      {
        "round": 4,
        "evidenceType": "Real-Life Scenario",
        "tenaliClue": "You use me to count how many students are sitting in a classroom.",
        "whyItHelps": "Reinforces discrete counting of complete units."
      },
      {
        "round": 5,
        "evidenceType": "Final Clincher",
        "tenaliClue": "I am the set of all non-negative full counting numbers starting from 0 (0, 1, 2, 3...) with no minus signs and no broken parts.",
        "whyItHelps": "Definitive property pointing uniquely to Whole Numbers."
      }
    ],
    "educationalInfo": {
      "definition": "Whole numbers are non-negative numbers without fractional or decimal parts: 0, 1, 2, 3...",
      "examples": ["0", "5", "42", "100"],
      "commonMistakes": "Confusing whole numbers with natural numbers (whole numbers include 0, natural numbers start at 1).",
      "funFact": "Zero was added to counting numbers to form Whole Numbers!"
    }
  }
}
```

### D. Sample Level Question Bank: Number Sets
Below is the updated 5-round question bank for all 4 concepts in **Level 1: Number Sets**, designed with mystery-first progressive clues:

#### 1. Target Concept: Whole Numbers
| Round | Evidence Type | Tenali's Clue | Expected Student Reasoning |
|:---:|:---:|:--- |:--- |
| 1 | Broad Mystery | I am a way we talk about quantities whenever we count items, measure things, or share snacks! | Applies broadly to all 4 concepts: Whole Numbers, Integers, Fractions, Decimals. |
| 2 | Subtle Property | My family starts at zero and counts upward. We never go backward into negative numbers! | Eliminates Integers (which include negative values). Whole Numbers, Fractions, and Decimals remain. |
| 3 | Constraint | If you cut a birthday cake into slices, a single partial slice alone CANNOT enter my family as a single number! | Eliminates broken numbers (Fractions and Decimals). Whole Numbers is the primary contender. |
| 4 | Real-life | You use me when counting how many chairs, desks, or laptops are in a room. | Confirms discrete, whole-unit counting. |
| 5 | Final Clincher | I am the set of all non-negative full counting numbers starting from 0 (0, 1, 2, 3...) with no minus signs and no fractional parts! | Unambiguous definition of Whole Numbers. |

#### 2. Target Concept: Integers
| Round | Evidence Type | Tenali's Clue | Expected Student Reasoning |
|:---:|:---:|:--- |:--- |
| 1 | Broad Mystery | I describe values on scale meters, temperature gauges, and scoreboards across the world! | Plausible for Integers, Decimals, Fractions, and Whole Numbers. |
| 2 | Subtle Property | I walk in both directions from zero—moving forward into positive territory and backward into negative territory! | Eliminates Whole Numbers (which cannot go below zero). Integers, Decimals, and Fractions remain. |
| 3 | Constraint | Even though I step below zero, every step I take is a complete, full stride—never a broken piece or slice! | Eliminates partial numbers (Fractions and Decimals). Only Integers fits all rules. |
| 4 | Real-life | I am used when reporting freezing weather in winter, like 5 degrees below zero! | Real-life negative temperature scenario. |
| 5 | Final Clincher | I am the complete family of all positive full numbers, zero, and negative full numbers (..., -2, -1, 0, 1, 2, ...)! | Unambiguous definition of Integers. |

#### 3. Target Concept: Fractions
| Round | Evidence Type | Tenali's Clue | Expected Student Reasoning |
|:---:|:---:|:--- |:--- |
| 1 | Broad Mystery | I appear whenever a single full unit isn't enough, or when something whole gets divided among people! | Plausible for Fractions, Decimals, and Whole Numbers. |
| 2 | Subtle Property | I live in the spaces between whole counting numbers, expressing a relationship between a part and a whole! | Eliminates Whole Numbers and Integers (which represent full units). Fractions and Decimals remain. |
| 3 | Constraint | I am written using two stacked numbers separated by a straight dividing bar line—never using a decimal dot! | Eliminates Decimal Numbers. Only Fractions remains. |
| 4 | Real-life | When 4 friends share 1 birthday cake equally, I describe the exact portion each friend receives! | Real-life equal sharing scenario written with stacked numbers. |
| 5 | Final Clincher | I show parts of a whole unit written with a top number (numerator) and a bottom number (denominator)! | Unambiguous definition of Fractions. |

#### 4. Target Concept: Decimal Numbers
| Round | Evidence Type | Tenali's Clue | Expected Student Reasoning |
|:---:|:---:|:--- |:--- |
| 1 | Broad Mystery | I show up on store price tags, measuring tapes, and stopwatch timers during races! | Plausible for Decimal Numbers, Fractions, Integers, and Whole Numbers. |
| 2 | Subtle Property | I express quantities smaller than 1 or amounts lying between whole numbers using place value scale of tens and hundredths! | Eliminates Whole Numbers and Integers. Decimals and Fractions remain. |
| 3 | Constraint | I separate whole units from tiny partial parts using a single dot point separator, never a stacked fraction bar! | Eliminates Fractions (which use stacked bars). Only Decimals remains. |
| 4 | Real-life | You see me every single time you buy a juice bottle for 12.50 or measure a ribbon as 2.5 meters long! | Real-life price tag / measurement with a dot. |
| 5 | Final Clincher | I am a number that uses a dot point (decimal point) to separate whole units from parts smaller than 1! | Unambiguous definition of Decimal Numbers. |

---

## 5. API Reference & Endpoints

### 1. `POST /api/mindreader/start`
Initializes a 5-round level session and selects the secret concept.
* **Request**: `{ "levelNum": 1 }`
* **Response**:
  ```json
  {
    "gameId": "sess_9823471",
    "levelNum": 1,
    "levelName": "Number Sets",
    "options": ["Whole Numbers", "Integers", "Fractions", "Decimal Numbers"],
    "currentRound": 1,
    "clue": {
      "round": 1,
      "evidenceType": "Observation",
      "tenaliClue": "I love counting apples, sheep, and stars in the night sky using 0, 1, 2, 3..."
    }
  }
  ```

### 2. `POST /api/mindreader/record-round`
Submits student candidate selections for the current round and retrieves the next round's clue.
* **Request**:
  ```json
  {
    "gameId": "sess_9823471",
    "round": 1,
    "selectedOptions": ["Whole Numbers", "Integers"]
  }
  ```
* **Response**:
  ```json
  {
    "gameId": "sess_9823471",
    "nextRound": 2,
    "isFinalRound": false,
    "clue": {
      "round": 2,
      "evidenceType": "Property",
      "tenaliClue": "I never allow negative numbers into my family."
    }
  }
  ```

### 3. `POST /api/mindreader/submit-final-guess`
Submits candidate selections for Round 5 and the student's single final guess.
* **Request**:
  ```json
  {
    "gameId": "sess_9823471",
    "round5Selections": ["Whole Numbers"],
    "finalGuess": "Whole Numbers"
  }
  ```
* **Response**:
  ```json
  {
    "correct": true,
    "secretConcept": "Whole Numbers",
    "starsEarned": 3,
    "xpEarned": 150,
    "selectionHistogram": {
      "Whole Numbers": 5,
      "Integers": 3,
      "Fractions": 1,
      "Decimal Numbers": 1
    },
    "educationalInfo": {
      "definition": "Whole numbers are non-negative numbers starting from 0 without fractions...",
      "examples": ["0", "5", "42"],
      "commonMistakes": "Confusing whole numbers with natural numbers.",
      "funFact": "Zero was added to counting numbers to form Whole Numbers!"
    }
  }
  ```

---

## 6. Telemetry & Misconception Analytics

We record round-by-round candidate selections in MongoDB (`MindReaderAnalytic2` collection):
* `gameId`: Session UUID.
* `userId`: Student ID.
* `levelNum`: Level number.
* `secretConcept`: Target concept.
* `roundSelections`: `[{ round: 1, options: [...] }, ..., { round: 5, options: [...] }]`
* `finalGuess`: Final guess submitted.
* `isCorrect`: Boolean victory flag.
* `timeTakenMs`: Total time spent across 5 rounds.

This analytics log allows teachers and game designers to identify which clues caused confusion and which incorrect options persisted until late rounds.

---

## 7. Development Roadmap

* **Phase 1**: Update `server/data/levels.json` and `server/data/concepts.json` with 4-option family structures and 5-round clue matrices. [x]
* **Phase 2**: Update backend session state in `server/index.js` to track `roundSelections` history across 5 rounds. [x]
* **Phase 3**: Update frontend UI components in `client/src/App.jsx` to render:
  - 5-round step progression indicator.
  - Checkbox option multi-selector per round.
  
  - End-of-level histogram summary card.
  - Single final guess confirmation screen.
* **Phase 4**: Automated testing (`test_guess_mind.js`) for multi-round recording, selection persistence, and final scoring. [x]
