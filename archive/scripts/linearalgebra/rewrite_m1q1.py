#!/usr/bin/env python3
import json, os

DIR = os.path.dirname(os.path.abspath(__file__))
FPATH = os.path.join(DIR, "questions", "m1q1.json")

EXPL = {
  "M1Q1E1": "Step 1: The relation is R = 2L. Step 2: Substitute L = 50 \u2192 R = 2 \u00d7 50 = 100. This works because the ratio R/L is constant at 2 \u2014 every point (L, R) lies on the line y = 2x. That constant-ratio property is exactly what makes the relationship linear. In later missions we will see this line is actually a 1-dimensional subspace of R\u00b2 \u2014 a vector space where every element is a scalar multiple of every other element.",

  "M1Q1E2": "The problem states Ram\u2019s pocket money is twice Lakshman\u2019s. \u2018Twice\u2019 means multiply by 2 \u2014 not add 2 (common error) or divide by 2 (reversal error). In equation form: R = 2L. Translating word problems into equations is the first step in all of linear algebra. If you wrote R = L + 2 instead, you would have shifted from a direct proportionality (line through the origin) to an affine relationship (line offset from the origin) \u2014 a distinction explored in Missions 4 and 5.",

  "M1Q1E3": "Since R = 2L is a first-degree (linear) equation, every point satisfying it lies on a straight line. There is no squared term to bend it into a curve, and no fixed radius to make it a circle. The word \u2018linear\u2019 literally means the graph is a line. This is the seed idea for Mission 3, where we learn ALL equations of the form y = ax pass through the origin \u2014 a property that makes them true vector subspaces.",

  "M1Q1E4": "Substitute L = 0: R = 2(0) = 0, so (0,0) satisfies the equation. This is not a coincidence \u2014 it reflects that a direct proportionality has no fixed starting offset. This will matter a lot in Mission 3 (lines through the origin are subspaces) and Mission 4 (lines NOT through the origin fail the subspace test). The physical meaning: before saving begins, both have zero \u2014 the origin is physically meaningful.",

  "M1Q1E5": "Writing R = 2L as y = mx with y = R and x = L, the coefficient of L is the slope m = 2. The slope literally encodes \u2018Ram always has twice what Lakshman has.\u2019 The trap answer 0.5 comes from confusing which variable is \u2018per unit\u2019 of the other. In Mission 5, we will see that this slope is the \u2018a\u2019 parameter in y = ax + b, and changing it rotates the line.",

  "M1Q1E6": "Step 1: R = 2L still holds for cumulative totals because both totals scale the same way. Step 2: L = 80 \u2192 R = 2 \u00d7 80 = 160. This generalises: if f(x) = kx, then f(cx) = k(cx) = c \u00b7 kx = c \u00b7 f(x) \u2014 the function commutes with scalar multiplication. This property is called \u2018homogeneity,\u2019 one of the two defining properties of a linear map that we will study formally in Mission 12.",

  "M1Q1E7": "Check each: (10,20) \u2713 since 2\u00d710=20, (20,40) \u2713, (5,10) \u2713, but (15,20) fails since 2\u00d715=30\u226020. This pair breaks the R=2L rule. In linear algebra terms, (15,20) is not in the span of the direction vector (1,2) \u2014 it lives outside the 1-dimensional subspace defined by R = 2L.",

  "M1Q1E8": "The problem defines R = 2L, so L is the input and R is the output \u2014 making L the natural x-axis variable. Mathematically the choice is a convention, but in linear algebra we always write transformations as y = Ax where x is the input. This convention will become essential in Mission 12 when we represent transformations as matrix-vector products.",

  "M1Q1E9": "If a fixed amount \u2018a\u2019 is saved each week, total after week n = a\u00d7n \u2014 again linear in n, and at week 0 total is 0, so it passes through the origin. This is the same R = kL pattern at a different scale: savings is directly proportional to the number of weeks. The general principle: any quantity that grows by a fixed amount per unit time produces a linear graph through the origin.",

  "M1Q1E10": "y = mx always gives y = 0 when x = 0, so the origin is always on the line for any slope m. Adding a nonzero c would shift it off the origin (as in y = 2x + 1, explored in Mission 4). This is why the equation y = ax (no constant term) is special: it defines a subspace. The constant term \u2018b\u2019 in y = mx + b is exactly what distinguishes a linear subspace from an affine set."
}

with open(FPATH) as f:
    data = json.load(f)

def replace(data):
    count = 0
    for section in ["mcqs"]:
        for diff in data[section]:
            for q in data[section][diff]:
                if q["id"] in EXPL:
                    q["explanation"] = EXPL[q["id"]]
                    count += 1
    for q in data.get("real_life_application", []):
        pass  # keep real_life explanations as-is
    return count

c = replace(data)
with open(FPATH, "w") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print(f"m1q1.json: {c} explanations replaced")
