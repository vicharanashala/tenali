#!/usr/bin/env python3
import json, os

DIR = os.path.dirname(os.path.abspath(__file__))

EXPL = {
  "M1Q2E1": "Step 1: Atul starts at (0,0). Step 2: Bala walks right 2, up 1 \u2192 B = (0+2, 0+1) = (2,1). This is a displacement vector (2,1) applied to the origin. In Mission 12, we will learn that applying a matrix to (1,0) gives the first column \u2014 here (2,1) plays that role as the first step of the journey.",
  "M1Q2E2": "Step 1: Chetan starts from B = (2,1). Step 2: Walks right 1, up 1 \u2192 C = (2+1, 1+1) = (3,2). This is vector addition: position C = position B + displacement (1,1). Vector addition will be formalised in Mission 11, where we learn that R\u00b2 is closed under addition.",
  "M1Q2E3": "Step 1: Divya starts from C = (3,2). Step 2: Walks right 1, up 1 \u2192 D = (3+1, 2+1) = (4,3). Notice the displacement (1,1) is the same as Chetan's \u2014 same direction, same magnitude. This repeated displacement is what keeps the points on the same line.",
  "M1Q2E4": "Step 1: Slope = (y\u2082 - y\u2081)/(x\u2082 - x\u2081). Step 2: Slope = (2-1)/(3-2) = 1. The slope measures the rate of change between consecutive points. If all consecutive pairs have the same slope, the points are collinear. This slope test is the foundation for checking collinearity.",
  "M1Q2E5": "Step 1: Slope = (3-2)/(4-3) = 1. Step 2: Since this equals the slope from B to C, all three points are collinear. The key insight: if the slope is the same between every consecutive pair, the points all lie on one straight line. This is equivalent to saying the displacement vectors between consecutive points are scalar multiples of each other.",
  "M1Q2E6": "Step 1: Slope m = 1. Step 2: Using point-slope form with B(2,1): y - 1 = 1(x - 2), giving y = x - 1. This line equation describes ALL points on the line, not just B, C, D. In linear algebra terms, this line is NOT a subspace because it doesn't pass through the origin (y = x - 1 gives (0,-1) at x = 0, not (0,0)).",
  "M1Q2E7": "Step 1: Substitute x = 4 into y = x - 1: y = 4 - 1 = 3. Step 2: This matches D's y-coordinate. Step 3: Since D satisfies the line equation, it lies on the same line as B and C, confirming collinearity. Verifying a point satisfies a line equation is equivalent to checking collinearity \u2014 the same test in different language.",
  "M1Q2E8": "Step 1: 'Right 2' means x-component +2. Step 2: 'Up 1' means y-component +1. Step 3: The displacement vector is (2,1). This is the first step of the journey \u2014 in Mission 12, we will learn that the columns of a transformation matrix are exactly where the standard basis vectors are mapped, and (2,1) is the image of (1,0) under a certain transformation.",
  "M1Q2E9": "Step 1: C - B = (3-2, 2-1) = (1,1). Step 2: Chetan moved right 1 and up 1, giving displacement (1,1). This vector captures the direction and magnitude of movement between two points. In linear algebra, the difference between two position vectors gives the displacement vector connecting them.",
  "M1Q2E10": "Step 1: C to D = (4-3, 3-2) = (1,1). Step 2: B to C = (3-2, 2-1) = (1,1). Step 3: They are identical \u2014 equal displacement vectors confirm the points are equally spaced along the line. This means the direction vector (1,1) is the same for both steps, which is why the points remain collinear.",
  "M1Q2M1": "Collinear points mean all displacement vectors point along the same line. B to C and C to D both have displacement (1,1), confirming identical direction. In vector terms: if all displacement vectors are scalar multiples of a single direction vector, the points are collinear. This connects to linear dependence \u2014 the vectors are all multiples of (1,1).",
  "M1Q2M2": "If slope BC = slope CD and both segments share point C, they lie on the same line. Two segments with the same rate of change, sharing a common point, must be part of one continuous line. This is the geometric version of: if two vectors are parallel and share a point, they define a single line. In formal terms, the three points are linearly dependent.",
  "M1Q2M3": "New D would be (3+1, 2+2) = (4,4). Slope from C to new D = (4-2)/(4-3) = 2. Slope from B to C = 1 \u2260 2. Different slopes mean the points are no longer collinear. The displacement vectors (1,1) and (1,2) are no longer scalar multiples, so the direction changed \u2014 breaking collinearity.",
  "M1Q2M4": "B to D = (4-2, 3-1) = (2,2). B to C = (1,1). So (2,2) = 2 \u00d7 (1,1). BD is exactly twice BC \u2014 a scalar multiple. This scalar multiple relationship is the hallmark of collinearity: if one displacement vector is a scalar multiple of another, the points lie on the same line. In Mission 11, this becomes the test for linear dependence.",
  "M1Q2M5": "Equally spaced collinear points have equal gaps \u2014 equal displacement vectors. BC = CD = (1,1), confirming equal spacing. More generally: if consecutive displacement vectors are equal, the points are evenly distributed along the line. This connects to arithmetic sequences and uniform sampling along a direction.",
  "M1Q2M6": "Slope from D(4,3) to E(5,5) = (5-3)/(5-4) = 2 \u2260 1. Since the slope changed, E does NOT lie on the same line. For any new point to be collinear with B, C, D, the slope from the last known point must remain 1. This is the same as checking whether the new displacement vector is a scalar multiple of the direction vector (1,1).",
  "M1Q2M7": "Slope = 0 means rise/run = 0, so rise = 0. Zero rise means no change in y \u2014 B and C have the same y-coordinate, making the line horizontal. In vector terms, the displacement vector has y-component = 0, so it points purely in the x-direction. A horizontal line is y = c for some constant c.",
  "M1Q2M8": "Step 1: Distance = \u221a((3-2)\u00b2 + (2-1)\u00b2). Step 2: = \u221a(1+1) = \u221a2. Step 3: This is the diagonal of a 1\u00d71 square. The distance formula is the Euclidean norm of the displacement vector: ||(1,1)|| = \u221a(1\u00b2 + 1\u00b2) = \u221a2. The norm of a vector gives its magnitude \u2014 a fundamental operation in linear algebra.",
  "M1Q2M9": "y = x - 1 is a full line, but restricting to x \u2265 2 means we only take the portion from (2,1) rightward. Starting at (2,1) and extending infinitely in one direction defines a ray. This is like a half-open interval in 1D \u2014 restricting the domain changes the geometric object from a line to a ray.",
  "M1Q2M10": "If three position vectors from the origin lie on the same line, one is a scalar multiple of another. This means none adds a new direction \u2014 they are linearly dependent. The span of {B, C, D} is 1-dimensional (a line), not 2-dimensional (the full plane). Linear dependence means redundancy: at most one of these vectors is needed to span the line."
}

with open(os.path.join(DIR, "questions", "m1q2.json")) as f:
    data = json.load(f)

count = 0
for diff in data["mcqs"]:
    for q in data["mcqs"][diff]:
        if q["id"] in EXPL:
            q["explanation"] = EXPL[q["id"]]
            count += 1

with open(os.path.join(DIR, "questions", "m1q2.json"), "w") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print(f"m1q2.json: {count} explanations replaced")
