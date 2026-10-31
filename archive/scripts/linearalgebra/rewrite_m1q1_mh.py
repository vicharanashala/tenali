#!/usr/bin/env python3
import json, os

DIR = os.path.dirname(os.path.abspath(__file__))

FILES_EXPL = {
"m1q1.json": {
  "M1Q1M1": "From R = 2L, divide both sides by 2: L = R/2. Substituting R = 300 gives L = 150. This is \u2018running the equation backward\u2019 \u2014 solving for the input given the output. In linear algebra, this is the inverse problem: if Ax = b, find x = A\u207b\u00b9b. We will formalise this in Mission 13 when we study matrix invertibility.",
  "M1Q1M2": "'Thrice' means multiply by 3, same logic as 'twice' means multiply by 2. The new relation R = 3L still passes through the origin (substitute L = 0: R = 0), but with a steeper slope of 3. The line is still a 1D subspace \u2014 the slope changes but the subspace property (closure under addition and scalar multiplication) is preserved.",
  "M1Q1M3": "Slope = rise/run = R/L. Since R/L is constant at 2 for every point, the slope literally encodes 'Ram always has twice what Lakshman has.' This is the ratio between them. More deeply: the slope is the coordinate of every vector on the line when expressed in the basis direction (1, 2). In Mission 11, we will learn that this direction vector (1, 2) spans the entire subspace.",
  "M1Q1M4": "The slope is a property of the relationship R = 2L, not of any single week's data. As long as the underlying rule holds every week, every plotted point sits on the same fixed-slope line. This is a key insight: the equation defines a geometric object (a line) that contains ALL possible data points. In later missions, we call this the solution set or the span of a direction vector.",
  "M1Q1M5": "Starting from R = 2L, divide both sides by 2: L = R/2. Swapping axes is equivalent to solving for the other variable \u2014 the slope becomes the reciprocal (0.5 instead of 2). This is the same operation as finding the inverse function, which we will study in Mission 7. The inverse of y = 2x is y = x/2 \u2014 reflected across y = x.",
  "M1Q1M6": "y = mx means y is directly proportional to x. If x \u2192 2x, then y \u2192 m(2x) = 2(mx) = 2y. This 'doubling behavior' is the hallmark of direct proportionality. In linear algebra terms, this is the homogeneity property of linear maps: T(cv) = cT(v). This will be one of the two defining conditions for a linear transformation in Mission 12.",
  "M1Q1M7": "Each week: Ram-saving = 2\u00d7(that week's Lakshman-saving). Total R = \u03a3(2\u00d7L\u1d62) = 2\u00d7\u03a3(L\u1d62) = 2\u00d7Total L. The relation survives summation because multiplication distributes over addition. This is exactly the additivity property: T(v\u2081 + v\u2082) = T(v\u2081) + T(v\u2082). Together with homogeneity (from M1Q1M6), these two properties define a linear transformation.",
  "M1Q1M8": "Check each pair: 2\u00d72=4 \u2713, 2\u00d73=6 \u2713, 2\u00d75=10 \u2713. All three are consistent only with R = 2L. This is essentially 'fitting a line' from observations \u2014 the same process used in regression and data science. If the points did not all lie on one line, no single linear equation would fit perfectly, which is when we use least-squares approximation.",
  "M1Q1M9": "At 'week zero' before they begin, both have zero savings: L = 0, R = 0. This isn't a coincidence of the algebra \u2014 it reflects that a direct proportionality has no fixed starting offset. Physical meaning: the origin (0,0) is the only point where both variables are simultaneously zero. This is why lines through the origin are subspaces (Mission 3): they contain the zero vector by construction.",
  "M1Q1M10": "Substituting L = 0 gives R = 2(0) + 5 = 5 \u2260 0, so (0,0) is not on the line. The +5 constant shifts the line upward and off the origin. This is exactly the situation explored in Mission 4 (y = 2x + 1) and Mission 5 (y = ax + b). Adding a constant term breaks the subspace property: the zero vector is no longer in the set. This is the fundamental difference between linear functions (y = mx) and affine functions (y = mx + b).",
  "M1Q1H1": "R = 2L + 10 is still degree-1 in L, so it's a straight line (constant slope 2). But at L = 0, R = 10 \u2260 0, so it misses the origin. This is the key distinction between 'linear' in the everyday sense (degree 1) and 'linear' in the strict algebraic sense (must pass through origin). The +10 makes it an affine set, not a vector subspace. We will formalise this in Mission 4.",
  "M1Q1H2": "The solution set of R = 2L is a line through the origin \u2014 it has one degree of freedom (pick any L, R is determined). It contains the zero vector, and is closed under addition and scalar multiplication (verified in H4 and H5). Therefore it is a 1-dimensional subspace of R\u00b2. The dimension equals the number of free parameters \u2014 here, just one (L). This will be formalised in Mission 11.",
  "M1Q1H3": "One strict requirement for a subspace is that it contains the zero vector (0,0). R = 2L contains it; R = 2L + 5 does not (at L = 0, R = 5). This single failed condition disqualifies the shifted line from being a subspace, even though both are straight lines. In Missions 3 and 4, we learn that lines through the origin are subspaces while lines not through the origin are affine subsets.",
  "M1Q1H4": "Add the two true equations: R\u2081 = 2L\u2081 and R\u2082 = 2L\u2082. Term by term: R\u2081 + R\u2082 = 2L\u2081 + 2L\u2082 = 2(L\u2081 + L\u2082). The sum vector also satisfies the rule \u2014 the set is closed under addition, one of the two defining properties of a subspace. This is the additivity property of linear maps: if T(v\u2081) and T(v\u2082) are in the image, so is T(v\u2081 + v\u2082).",
  "M1Q1H5": "Given R = 2L, multiply both sides by \u03b1: \u03b1R = 2(\u03b1L). The scaled point (\u03b1L, \u03b1R) still satisfies the same rule. This holds for every real \u03b1 \u2014 including negative and fractional values. This is the homogeneity property: T(cv) = cT(v). Combined with closure under addition (H4), these two properties are precisely the conditions that define a subspace.",
  "M1Q1H6": "A subset of R\u00b2 is a vector subspace exactly when it (1) contains the zero vector, (2) is closed under addition, and (3) is closed under scalar multiplication. We verified all three for R = 2L: zero vector at (0,0) \u2713, addition in H4 \u2713, scalar multiplication in H5 \u2713. It formally qualifies as a 1-dimensional subspace \u2014 a line through the origin. This is the prototype for all subspaces we will encounter.",
  "M1Q1H7": "Since R = 2L and T = R + L = 3L, both coordinates are completely determined once L is chosen. Still one free parameter (L), so the set is a single line in R\u00b3 \u2014 still 1-dimensional, just embedded in a bigger space. This illustrates that dimension is about the number of independent directions, not the ambient space. A line in R\u00b3 has dimension 1, the same as a line in R\u00b2.",
  "M1Q1H8": "The angle \u03b8 satisfies tan(\u03b8) = k (the slope). As k grows, tan(\u03b8) grows, pushing \u03b8 closer to 90\u00b0. The slope and angle are related by the tangent function, which approaches infinity as the angle approaches 90\u00b0. This connects to the geometric interpretation: steeper lines have larger slopes, and the slope is the tangent of the angle with the x-axis.",
  "M1Q1H9": "A negative slope means as L increases, R decreases (goes negative). The line still passes through the origin, but runs through quadrants II and IV instead of I and III. Physically, negative money doesn't make literal sense here, but mathematically the line y = -2x is still a valid 1D subspace \u2014 it satisfies all three subspace conditions (zero vector, closure under addition, closure under scalar multiplication).",
  "M1Q1H10": "Algebraically R = 2L defines a full line in both directions. But since L \u2265 0 and R \u2265 0 for real savings, only the portion in the first quadrant (including the origin) is physically achievable \u2014 a ray. This distinction between the 'algebraic solution set' (the full line) and the 'physically valid subset' (a ray) is an important habit of mind. In optimisation and linear programming, constraints like non-negativity define the feasible region."
},
"m1q1.json_rl": {}
}

FPATH = os.path.join(DIR, "questions", "m1q1.json")

with open(FPATH) as f:
    data = json.load(f)

EXPL = FILES_EXPL["m1q1.json"]
count = 0
for diff in data["mcqs"]:
    for q in data["mcqs"][diff]:
        if q["id"] in EXPL:
            q["explanation"] = EXPL[q["id"]]
            count += 1

with open(FPATH, "w") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print(f"m1q1.json: {count} more explanations replaced (medium+hard)")
