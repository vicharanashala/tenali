/* ── DETECTIVE GENERATORS ───────────────────────────────────────────────
 * Dynamic case generators for the Mathematics Detective Agency.
 * Each function returns a complete enhanced case object (suspects, culprit,
 * stages with narrative/question/answer/hints/evidence) with freshly
 * randomized numbers every time it's called.
 *
 * Exports: { CASE_GENERATORS } — a registry mapping case IDs to their
 * generator functions. Used by detective-app.jsx for on-the-fly case generation.
 * ──────────────────────────────────────────────────────────────────────── */

// ── Shared Helpers ────────────────────────────────────────────────────

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Generator Registry ────────────────────────────────────────────────

const CASE_GENERATORS = {};

// ── case-enhanced-1 — The Museum Heist (Pythagoras, age 13+, 2 stages) ─

function generateMuseumHeist() {
  const triples = [[3,4,5], [5,12,13], [7,24,25], [8,15,17]];
  const [aBase, bBase, cBase] = pick(triples);
  const scale = pick([1, 2, 3]);
  const a = aBase * scale;
  const b = bBase * scale;
  const c = cBase * scale;
  const locations = ['doorway', 'window', 'skylight', 'archway'];
  const loc1 = pick(locations);
  const loc2 = pick(locations.filter(l => l !== loc1));

  const doorLabels = ['main entrance', 'side door', 'emergency exit', 'garden gate'];
  const doorLabel = pick(doorLabels);

  return {
    id: 'case-enhanced-1',
    title: 'The Museum Heist',
    description: 'A priceless diamond vanished from the museum overnight. Three suspects remain.',
    difficulty: 2, xpReward: 75, topic: 'pythag',
    suspects: [
      { id: 'suspect-1', name: 'Riya the Guard', role: 'Night Guard', alibi: 'Claims she was patrolling the north wing all night.', appearance: '👮', motive: 'Was passed over for promotion last month.', characteristics: { height: 'short', hand: 'right' } },
      { id: 'suspect-2', name: 'Arjun the Curator', role: 'Museum Curator', alibi: 'Says he was cataloguing artifacts in the basement office.', appearance: '🎨', motive: 'Has large gambling debts and the diamond is insured.', characteristics: { height: 'tall', hand: 'right' } },
      { id: 'suspect-3', name: 'Priya the Cleaner', role: 'Cleaning Staff', alibi: 'Says she left at 6 PM and was home by 7 PM.', appearance: '🧹', motive: 'None apparent — but she knows every corner of the museum.', characteristics: { height: 'very short', hand: 'left' } },
    ],
    culprit: 'suspect-2',
    stages: [
      {
        narrative: `The security footage shows a shadowy figure entering through a ${loc1} in the east corridor. The ${loc1} measures ${a} metres across and ${b} metres high. The intruder moved diagonally through the opening — anyone too short couldn't have cleared the distance from corner to corner. Grab your measuring tape, Detective — what's the diagonal length?`,
        question: `${loc1[0].toUpperCase() + loc1.slice(1)} is ${a}m × ${b}m. What's the diagonal from one corner to the opposite?`,
        answer: c,
        hints: [
          'The diagonal splits the rectangle into two right-angled triangles.',
          `c² = ${a}² + ${b}² = ${a*a} + ${b*b} = ${a*a + b*b}. c = √${a*a + b*b} = ${c}m.`,
        ],
        evidence: {
          id: 'evidence-1',
          text: `The diagonal is ${c}m. The thief needed to be tall enough to move through a ${c}m diagonal entry. The cleaner is very short and couldn't have reached — but the north wing guard was on patrol far from this ${loc1}.`,
          eliminates: ['suspect-3'],
        },
      },
      {
        narrative: `More evidence, Detective! A muddy footprint was found near the ${loc2} of the curator's office. The ${loc2} is ${b} metres wide — not the ${a}-metre ${loc1} from before. The curator claims he was in the basement, but the footprint trail leads directly from the ${loc1} to this ${loc2}. The ${doorLabel} was ${a}m wide — this ${loc2} is ${b}m. Two different widths — two different locations. Where was the guard again?`,
        question: `The ${doorLabel} was ${a}m wide. The ${loc2} is ${b}m wide. Which location did the guard patrol all night?`,
        answer: doorLabel,
        hints: [
          'The guard claimed she was at the north wing all night — the north wing has a wide entrance.',
          `The ${doorLabel} is ${a}m wide — that's the north wing. The guard was there. The ${loc2} (${b}m wide) is the curator's wing — where the curator should have been.`,
        ],
        evidence: {
          id: 'evidence-2',
          text: `Two different widths — the ${doorLabel} (${a}m) and the ${loc2} (${b}m). The north wing guard couldn't have been at both locations. The curator's office footprint proves someone was there while he claimed to be in the basement.`,
          eliminates: ['suspect-1'],
        },
      },
    ],
  };
}
CASE_GENERATORS['case-enhanced-1'] = generateMuseumHeist;

// ── case-enhanced-2 — The Circular Conspiracy Returns (Circle Theorems, age 14+, 2 stages) ─

function generateCircularConspiracy() {
  const centreAngles = pick([60, 80, 100, 120, 140]);
  const circAngle = centreAngles / 2;
  const cyclicPairs = [[50, 130], [60, 120], [70, 110], [40, 140]];
  const [cAngle, cOpposite] = pick(cyclicPairs);
  const buildings = ['transmission tower', 'water tank', 'satellite dish', 'clock tower'];
  const bldg = pick(buildings);

  return {
    id: 'case-enhanced-2',
    title: 'The Circular Conspiracy Returns',
    description: 'Satellite images reveal hidden angles around a circular structure. Someone is lying about their position.',
    difficulty: 3, xpReward: 80, topic: 'circleth',
    suspects: [
      { id: 'suspect-1', name: 'Anika the Architect', role: 'Architect', alibi: 'Claims she was reviewing blueprints at her desk.', appearance: '📐', motive: 'Her design was rejected for this project.', characteristics: { height: 'tall', hand: 'right' } },
      { id: 'suspect-2', name: 'Rohit the Engineer', role: 'Site Engineer', alibi: 'Says he was inspecting the foundation.', appearance: '🔧', motive: 'Was caught cutting corners on materials.', characteristics: { height: 'medium', hand: 'left' } },
      { id: 'suspect-3', name: 'Meera the Contractor', role: 'Contractor', alibi: 'Claims she was at the supplier\'s office.', appearance: '🏗️', motive: 'Her payment was delayed — she wanted revenge.', characteristics: { height: 'medium', hand: 'right' } },
    ],
    culprit: 'suspect-2',
    stages: [
      {
        narrative: `Detective, the sabotage is connected to the ${bldg} at the centre of the construction site. The blueprints show a circular base with an angle of ${centreAngles}° at the centre. The thief's position forms an angle at the circumference. The key relationship in any circle: the angle at the centre is twice the angle at the circumference when they stand on the same arc. What's the circumference angle?`,
        question: `Centre angle = ${centreAngles}°. Circumference angle = centre angle ÷ 2 = ?`,
        answer: circAngle,
        hints: [
          'The angle at the centre is exactly double the angle at the circumference.',
          `${centreAngles}° ÷ 2 = ${circAngle}°. The thief was standing at this angle from the ${bldg}.`,
        ],
        evidence: {
          id: 'evidence-3',
          text: `The ${circAngle}° circumference angle places the thief on the east side of the site. The architect was at her desk in the west office all evening — she couldn't have been there. This eliminates someone who was physically far from the construction site.`,
          eliminates: ['suspect-1'],
        },
      },
      {
        narrative: `The investigation shifts to the top floor of the ${bldg}. A cyclic quadrilateral was drawn on the wall — its angles are ${cAngle}° and ${cOpposite}°. In a cyclic quadrilateral, opposite angles sum to 180°. The vandal knew this theorem — only someone with engineering training would draw a perfect cyclic quadrilateral. What should the missing opposite angle be?`,
        question: `One angle = ${cAngle}°. Opposite angle = 180° − ${cAngle}° = ?`,
        answer: cOpposite,
        hints: [
          'Opposite angles in a cyclic quadrilateral always add up to 180°.',
          `180° − ${cAngle}° = ${cOpposite}°. Only someone who studied geometry would leave such a precise clue.`,
        ],
        evidence: {
          id: 'evidence-4',
          text: `The ${cOpposite}° opposite angle proves the vandal understands advanced geometry. The contractor has basic maths knowledge from procurement, but the site engineer studied this in engineering school. The technical precision points directly to someone with formal training.`,
          eliminates: ['suspect-3'],
        },
      },
    ],
  };
}
CASE_GENERATORS['case-enhanced-2'] = generateCircularConspiracy;

// ── case-enhanced-3 — The Bridge Sabotage (Trigonometry, age 15+, 3 stages) ─

function generateBridgeSabotage() {
  const angle = pick([30, 45, 60]);
  const rad = angle * Math.PI / 180;
  const adj = randomInt(2, 6) * 10;
  const opp = Math.round(adj * Math.tan(rad));
  const dist = randomInt(3, 8) * 10;
  const height = Math.round(dist * Math.tan(rad));
  const angles = [30, 45, 60];
  const angle2 = pick(angles.filter(a => a !== angle));
  const sideA = randomInt(2, 5) * 5;
  const sideB = Math.round(sideA * Math.tan(angle2 * Math.PI / 180));

  return {
    id: 'case-enhanced-3',
    title: 'The Bridge Sabotage',
    description: 'Someone tampered with the bridge supports. Trigonometry reveals the culprit\'s position.',
    difficulty: 3, xpReward: 90, topic: 'trig',
    suspects: [
      { id: 'suspect-1', name: 'Captain Sharma', role: 'Bridge Captain', alibi: 'Claims he was in the control room monitoring traffic.', appearance: '🧢', motive: 'Was suspended last week for safety violations.', characteristics: { height: 'tall', hand: 'right' } },
      { id: 'suspect-2', name: 'Engineer Desai', role: 'Structural Engineer', alibi: 'Says he was reviewing stress test reports.', appearance: '📋', motive: 'His bridge design was rejected for this project.', characteristics: { height: 'medium', hand: 'left' } },
      { id: 'suspect-3', name: 'Worker Patel', role: 'Construction Worker', alibi: 'Claims he was on lunch break.', appearance: '🪚', motive: 'Was fired last month and holds a grudge.', characteristics: { height: 'short', hand: 'right' } },
    ],
    culprit: 'suspect-2',
    stages: [
      {
        narrative: `Detective, the east bridge support shows signs of tampering. A cable was cut at a ${angle}° angle from the base. The horizontal distance from the base to where the cable touches the ground is ${adj} metres. Using tangent = opposite ÷ adjacent, we can find how high up the cut was made. Someone climbed to exactly this height to reach the cable. How high is the cut?`,
        question: `Angle = ${angle}°. Adjacent = ${adj}m. Height = ${adj} × tan(${angle}°) = adjacent × tan(${angle}°) = ?`,
        answer: opp,
        hints: [
          `tan(${angle}°) = height ÷ ${adj}. Use tan(${angle}°) = ${Math.tan(rad).toFixed(3)}`,
          `Height = ${adj} × ${Math.tan(rad).toFixed(3)} = ${opp}m.`,
        ],
        evidence: {
          id: 'evidence-5',
          text: `The cut was made at ${opp}m height. The worker Patel is too short to reach ${opp}m without equipment, and the captain was in the control room all day. The engineer has both the knowledge and the access to calculate the exact cutting angle.`,
          eliminates: ['suspect-3'],
        },
      },
      {
        narrative: `The sabotage goes deeper. The west bridge cable was cut at a steeper ${angle}° angle, but from a distance of ${dist} metres away. The saboteur needed to calculate the height from this new position. Same formula — opposite = adjacent × tan(angle). What height did the saboteur target this time?`,
        question: `Angle = ${angle}°. Distance = ${dist}m. Height = ${dist} × tan(${angle}°) = ?`,
        answer: height,
        hints: [
          'Same formula — opposite = adjacent × tangent of the angle.',
          `Height = ${dist} × ${Math.tan(rad).toFixed(3)} = ${height}m.`,
        ],
        evidence: {
          id: 'evidence-6',
          text: `The second cut at ${height}m required recalculating the same trigonometry from a different position. The captain doesn't have the technical training for this. The engineer, however, recalculated angles daily — this is routine work for someone with his background.`,
          eliminates: ['suspect-1'],
        },
      },
      {
        narrative: `The saboteur left their toolkit behind. Inside, a handwritten note shows a third calculation: an angle of ${angle2}° with a ${sideA}m base. The saboteur was planning one more cut. If tan(${angle2}°) = height ÷ ${sideA}, what height were they targeting? This was their fail-safe — the cut that would bring the whole bridge down.`,
        question: `Angle = ${angle2}°. Base = ${sideA}m. Height = ${sideA} × tan(${angle2}°) = ?`,
        answer: sideB,
        hints: [
          `tan(${angle2}°) = ${Math.tan(angle2 * Math.PI / 180).toFixed(3)}. Multiply by the base.`,
          `Height = ${sideA} × ${Math.tan(angle2 * Math.PI / 180).toFixed(3)} = ${sideB}m. This third cut proves premeditation.`,
        ],
        evidence: {
          id: 'evidence-7',
          text: `Three calculated cuts at ${opp}m, ${height}m, and ${sideB}m — all requiring precise trigonometry. The captain lacks the technical skill to plan a three-point collapse. But the engineer has the expertise, the blueprint access, and the motive.`,
          eliminates: ['suspect-1'],
        },
      },
    ],
  };
}
CASE_GENERATORS['case-enhanced-3'] = generateBridgeSabotage;

// ── case-enhanced-4 — The Coded Ransom (Linear Equations, age 10+, 2 stages) ─

function generateCodedRansom() {
  const a1 = randomInt(2, 5);
  const b1 = randomInt(1, 15);
  const x1 = randomInt(2, 10);
  const result1 = a1 * x1 + b1;

  const a2 = randomInt(2, 4);
  const b2 = randomInt(-12, 12);
  const c2 = randomInt(1, 6);
  const x2 = randomInt(3, 15);
  const result2r = a2 * x2 + b2;

  return {
    id: 'case-enhanced-4',
    title: 'The Coded Ransom',
    description: 'A ransom note contains coded equations. Solve them to find the kidnapper.',
    difficulty: 2, xpReward: 70, topic: 'lineareq',
    suspects: [
      { id: 'suspect-1', name: 'Sam the Tutor', role: 'Private Tutor', alibi: 'Claims he was teaching a student at the library.', appearance: '📚', motive: 'Was fired by the victim\'s family last week.', characteristics: { height: 'medium', hand: 'right' } },
      { id: 'suspect-2', name: 'Mia the Accountant', role: 'Family Accountant', alibi: 'Says she was preparing tax documents at her office.', appearance: '🧾', motive: 'Discovered the family\'s hidden fortune.', characteristics: { height: 'short', hand: 'left' } },
      { id: 'suspect-3', name: 'Omar the Driver', role: 'Family Driver', alibi: 'Says he was washing the car at the garage.', appearance: '🚗', motive: 'Was caught stealing fuel last month.', characteristics: { height: 'tall', hand: 'right' } },
    ],
    culprit: 'suspect-1',
    stages: [
      {
        narrative: `Detective, the ransom note reads: "${a1}x + ${b1} = ${result1}. Solve for x. The answer is the hour the drop happens." The handwriting is shaky — the kidnapper was nervous. This is a simple linear equation: isolate x by moving the constant term. The family tutor was last seen near the library around the time this note was written. What hour is the drop?`,
        question: `${a1}x + ${b1} = ${result1}. Solve for x.`,
        answer: x1,
        hints: [
          `Subtract ${b1} from both sides: ${a1}x = ${a1 * x1}.`,
          `${a1}x = ${a1 * x1}. Divide by ${a1}: x = ${x1}. The drop is at ${x1}:00 hours.`,
        ],
        evidence: {
          id: 'evidence-8',
          text: `The drop time of ${x1}:00 matches the library's closing hours — the tutor was supposedly teaching there. Only someone who knew the victim's family schedule would set the drop at exactly ${x1}:00. The driver wouldn't know the family's daily plans.`,
          eliminates: ['suspect-3'],
        },
      },
      {
        narrative: `A second coded message: "${a2}x + ${b2} = ${c2}x + ${result2r}. The solution is the page number of the next clue." The kidnapper used variables on both sides — someone with teaching experience, who writes equations regularly. Gather the x terms on one side and the constants on the other. What page is the next clue on?`,
        question: `${a2}x + ${b2} = ${c2}x + ${result2r}. Solve for x.`,
        answer: x2,
        hints: [
          `Move x terms: ${a2}x − ${c2}x = ${result2r} − (${b2}). So ${a2 - c2}x = ${result2r - b2}.`,
          `x = ${result2r - b2} ÷ ${a2 - c2} = ${x2}. The next clue is on page ${x2}.`,
        ],
        evidence: {
          id: 'evidence-9',
          text: `Page ${x2} — the kidnapper hid a clue in the victim's textbook. Only the tutor would know which textbook the victim uses and which page to hide things in. The accountant deals with spreadsheets, not textbooks. The tutor's teaching methods are all over this equation.`,
          eliminates: ['suspect-2'],
        },
      },
    ],
  };
}
CASE_GENERATORS['case-enhanced-4'] = generateCodedRansom;

// ── case-enhanced-5 — The Quadratic Cover-Up (Quadratics, age 15+, 3 stages) ─

function generateQuadraticCoverUp() {
  const roots = [];
  const r1 = randomInt(-8, -1);
  const r2 = randomInt(2, 9);
  roots.push(r1, r2);
  const quadA = 1;
  const quadB = -(r1 + r2);
  const quadC = r1 * r2;

  const len = randomInt(3, 8);
  const wid = randomInt(2, 6);
  const expandB = -(len + wid);
  const expandC = len * wid;

  const d = quadB * quadB - 4 * quadA * quadC;

  return {
    id: 'case-enhanced-5',
    title: 'The Quadratic Cover-Up',
    description: 'A scientist faked research data. Solve the quadratic equation to uncover the truth.',
    difficulty: 3, xpReward: 90, topic: 'quadratic',
    suspects: [
      { id: 'suspect-1', name: 'Dr. Mehta', role: 'Lead Researcher', alibi: 'Claims he was in the lab running experiments.', appearance: '🔬', motive: 'His grant was about to be revoked.', characteristics: { height: 'tall', hand: 'right' } },
      { id: 'suspect-2', name: 'Student Kohli', role: 'Research Assistant', alibi: 'Says he was at the library writing his thesis.', appearance: '📝', motive: 'Was failing the course and needed a good grade.', characteristics: { height: 'medium', hand: 'left' } },
      { id: 'suspect-3', name: 'Principal Singh', role: 'Principal Investigator', alibi: 'Claims he was in a faculty meeting.', appearance: '🎓', motive: 'The lab budget was being slashed.', characteristics: { height: 'short', hand: 'right' } },
    ],
    culprit: 'suspect-2',
    stages: [
      {
        narrative: `Detective, the research log shows a manipulated quadratic equation: x² ${quadB >= 0 ? '+ ' + quadB : '- ' + Math.abs(quadB)}x ${quadC >= 0 ? '+ ' + quadC : '- ' + Math.abs(quadC)} = 0. The doctored data points to two solution values. Factorise the quadratic to find the roots. These roots correspond to faked benchmark scores.`,
        question: `x² ${quadB >= 0 ? '+ ' + quadB : '- ' + Math.abs(quadB)}x ${quadC >= 0 ? '+ ' + quadC : '- ' + Math.abs(quadC)} = 0. Find both roots.`,
        answer: `${Math.min(r1, r2)}, ${Math.max(r1, r2)}`,
        hints: [
          `Find two numbers that multiply to ${quadC} and add to ${quadB >= 0 ? '+ ' : ''}${quadB}.`,
          `The numbers are ${r1} and ${r2}. (x ${r1 < 0 ? '+ ' + Math.abs(r1) : '- ' + r1})(x ${r2 < 0 ? '+ ' + Math.abs(r2) : '- ' + r2}) = 0. Roots: x = ${r1}, x = ${r2}.`,
        ],
        evidence: {
          id: 'evidence-10',
          text: `The roots ${r1} and ${r2} are suspicious — they're both extreme values. Only someone who ran the actual experiments would know the real data range. The principal was in a meeting, not handling raw data. This points to someone with direct lab access.`,
          eliminates: ['suspect-3'],
        },
      },
      {
        narrative: `The fabricated data extends to a word problem. The lab notebook contains: "A rectangular culture plate has length ${len}cm more than its width, and area ${len * wid}cm²." The equation uses x² − ${Math.abs(expandB)}x + ${expandC} = 0 where x is the width. Solve for the width of the plate. This isn't just bad science — it's a cover-up.`,
        question: `Width = x. Length = x + ${len - wid > 0 ? len - wid : wid - len}. Area = ${len * wid}. x² + ${-expandB}x + ${expandC} = 0. Find positive root.`,
        answer: Math.min(len, wid),
        hints: [
          `If width = w, then w(w + ${Math.abs(len - wid)}) = ${len * wid}. So w² + ${Math.abs(len - wid)}w − ${len * wid} = 0.`,
          `Factorise: (w − ${Math.min(len, wid)})(w + ${Math.max(len, wid)}) = 0. Width = ${Math.min(len, wid)}cm.`,
        ],
        evidence: {
          id: 'evidence-11',
          text: `The plate width of ${Math.min(len, wid)}cm is in the lab notebook. The lead researcher uses metric, but the notebook shows centimetres — the research assistant works in both units. This inconsistency reveals who actually wrote the fabricated data.`,
          eliminates: ['suspect-1'],
        },
      },
      {
        narrative: `The discriminant of the tampered equation tells us about the nature of roots. For x² ${quadB >= 0 ? '+ ' + quadB : '- ' + Math.abs(quadB)}x ${quadC >= 0 ? '+ ' + quadC : '- ' + Math.abs(quadC)} = 0: the discriminant D = b² − 4ac. The sabotage made the equation have real and distinct roots when it shouldn't have. Calculate D to see how badly the data was doctored.`,
        question: `D = (${quadB})² − 4(${quadA})(${quadC}) = ?`,
        answer: d,
        hints: [
          `D = ${quadB}² − 4 × ${quadA} × ${quadC} = ${quadB * quadB} − ${4 * quadA * quadC}.`,
          `D = ${quadB * quadB} − ${4 * quadA * quadC} = ${d}. The positive D confirms the data was artificially altered.`,
        ],
        evidence: {
          id: 'evidence-12',
          text: `D = ${d} — the roots are real and distinct, but the original data should have produced a perfect square discriminant. The principal was in meetings and couldn't have manipulated the data. The research assistant had late-night access to the lab system.`,
          eliminates: ['suspect-3'],
        },
      },
    ],
  };
}
CASE_GENERATORS['case-enhanced-5'] = generateQuadraticCoverUp;

// ── case-enhanced-6 — The Simultaneous Standoff (Simultaneous Equations, age 11+, 2 stages) ─

function generateSimultaneousStandoff() {
  const x = randomInt(2, 8);
  const y = randomInt(1, 6);
  const a1 = randomInt(1, 4);
  const b1 = randomInt(1, 4);
  const c1 = a1 * x + b1 * y;
  const a2 = randomInt(1, 4);
  const b2 = randomInt(1, 4);
  const c2 = a2 * x + b2 * y;

  const x2 = randomInt(2, 10);
  const y2 = randomInt(1, 8);
  const a1s = randomInt(2, 5);
  const b1s = randomInt(2, 5);
  const c1s = a1s * x2 + b1s * y2;
  const a2s = randomInt(2, 5);
  const b2s = randomInt(2, 5);
  const c2s = a2s * x2 + b2s * y2;

  return {
    id: 'case-enhanced-6',
    title: 'The Simultaneous Standoff',
    description: 'Two witnesses gave contradictory statements. Solve the equations to find the truth.',
    difficulty: 2, xpReward: 70, topic: 'simul',
    suspects: [
      { id: 'suspect-1', name: 'Kiran the Guard', role: 'Security Guard', alibi: 'Claims he was at the front desk all evening.', appearance: '🛡️', motive: 'Was caught sleeping on duty last week.', characteristics: { height: 'tall', hand: 'right' } },
      { id: 'suspect-2', name: 'Deepa the Cleaner', role: 'Office Cleaner', alibi: 'Says she was cleaning the third floor.', appearance: '🧽', motive: 'Was about to be fired for theft.', characteristics: { height: 'short', hand: 'left' } },
      { id: 'suspect-3', name: 'Vikram the Manager', role: 'Office Manager', alibi: 'Claims he was in a meeting until 9 PM.', appearance: '👔', motive: 'The missing money was from his department.', characteristics: { height: 'medium', hand: 'right' } },
    ],
    culprit: 'suspect-2',
    stages: [
      {
        narrative: `Detective, two witnesses saw the intruder but gave conflicting descriptions. ${a1}x + ${b1}y = ${c1} — that's the first witness's account. ${a2}x + ${b2}y = ${c2} — that's the second witness. x is the suspect's height rank, y is their speed rank. Both equations must be true simultaneously. Use elimination: multiply one equation so the y terms cancel, then solve for x.`,
        question: `Solve: ${a1}x + ${b1}y = ${c1}, ${a2}x + ${b2}y = ${c2}. Find x.`,
        answer: x,
        hints: [
          `Multiply the second equation by ${b1}, first by ${b2}, then subtract to eliminate y.`,
          `After elimination: ${a1 * b2 - a2 * b1 > 0 ? a1 * b2 - a2 * b1 : (a1 * b2 - a2 * b1)}x = ${c1 * b2 - c2 * b1}. x = ${x}.`,
        ],
        evidence: {
          id: 'evidence-13',
          text: `Height rank ${x} matches a medium-height suspect. The guard is tall (rank would be higher). The cleaner is short — rank ${x} doesn't fit. The manager is medium height. The cleaner's statement contradicts her own description.`,
          eliminates: ['suspect-1'],
        },
      },
      {
        narrative: `A third witness came forward with a different angle. They say: ${a1s}x + ${b1s}y = ${c1s}, and ${a2s}x + ${b2s}y = ${c2s}. But this time, use substitution — solve the first equation for x in terms of y, then substitute into the second. x is the floor number, y is the time in hours after midnight. Where and when did this actually happen?`,
        question: `Solve by substitution: ${a1s}x + ${b1s}y = ${c1s}, ${a2s}x + ${b2s}y = ${c2s}. Find y.`,
        answer: y2,
        hints: [
          `From first equation: x = (${c1s} − ${b1s}y) ÷ ${a1s}. Substitute into second.`,
          `After substitution: ${a2s}(${c1s} − ${b1s}y)/${a1s} + ${b2s}y = ${c2s}. Solve: y = ${y2}.`,
        ],
        evidence: {
          id: 'evidence-14',
          text: `Time ${y2}:00 hours — the cleaner claimed she was on the third floor at this time, but the manager was in his meeting. The cleaner's timeline doesn't add up. She's the only one whose alibi conflicts with the calculated time.`,
          eliminates: ['suspect-3'],
        },
      },
    ],
  };
}
CASE_GENERATORS['case-enhanced-6'] = generateSimultaneousStandoff;

// ── case-enhanced-7 — The GST Swindle (GST, age 15+, 3 stages) ─

function generateGSTSwindle() {
  const gstRates = [5, 12, 18, 28];
  const gstRate = pick(gstRates);
  const baseAmt = randomInt(10, 50) * 100;
  const gstAmt = baseAmt * gstRate / 100;
  const sgst = gstAmt / 2;



  const rate3 = pick(gstRates);
  const total3 = randomInt(12, 60) * 100;
  const base3 = Math.round(total3 * 100 / (100 + rate3));

  return {
    id: 'case-enhanced-7',
    title: 'The GST Swindle',
    description: 'A vendor pocketed the GST instead of remitting it. Trace the tax trail.',
    difficulty: 2, xpReward: 80, topic: 'gst',
    suspects: [
      { id: 'suspect-1', name: 'Gupta the Cashier', role: 'Store Cashier', alibi: 'Claims he was processing refunds at the front counter.', appearance: '💵', motive: 'His salary was docked for a cash shortage.', characteristics: { height: 'short', hand: 'right' } },
      { id: 'suspect-2', name: 'Jain the Accountant', role: 'Store Accountant', alibi: 'Says he was auditing last month\'s tax returns.', appearance: '📊', motive: 'Was caught embezzling funds at his previous job.', characteristics: { height: 'medium', hand: 'left' } },
      { id: 'suspect-3', name: 'Kumar the Supplier', role: 'Goods Supplier', alibi: 'Claims he was making deliveries all morning.', appearance: '📦', motive: 'His contract was about to be terminated.', characteristics: { height: 'tall', hand: 'right' } },
    ],
    culprit: 'suspect-2',
    stages: [
      {
        narrative: `Detective, the tax audit reveals a discrepancy. A product worth ₹${baseAmt} was sold at ${gstRate}% GST. The cashier recorded the GST amount incorrectly — he says he doesn't remember the rate. But the math is clear: GST = rate% of base price. What should the GST amount have been? The government is missing this exact amount.`,
        question: `GST = ${gstRate}% of ₹${baseAmt} = ?`,
        answer: gstAmt,
        hints: [
          `GST = (${gstRate} ÷ 100) × ${baseAmt}.`,
          `GST = 0.${gstRate < 10 ? '0' : ''}${gstRate} × ${baseAmt} = ₹${gstAmt}.`,
        ],
        evidence: {
          id: 'evidence-15',
          text: `₹${gstAmt} in GST went missing. The supplier never handles tax payments — he only ships goods. The cashier claims ignorance of GST rates, but anyone running a register deals with taxes daily. Only the accountant has direct access to the GST payment system.`,
          eliminates: ['suspect-3'],
        },
      },
      {
        narrative: `The audit reveals a trick with the SGST/CGST split. GST of ₹${gstAmt} is supposed to be split equally between State GST and Central GST. But the records show a different split. If SGST = CGST, and they must sum to ₹${gstAmt}, what should each be? The accountant recorded an uneven split — the difference went into a private account.`,
        question: `Total GST = ₹${gstAmt}. SGST = CGST = GST ÷ 2 = ?`,
        answer: sgst,
        hints: [
          'SGST and CGST are always equal and together make up the total GST.',
          `SGST = CGST = ₹${gstAmt} ÷ 2 = ₹${sgst}.`,
        ],
        evidence: {
          id: 'evidence-16',
          text: `Each half should be ₹${sgst}, but the records show a different split. Only the accountant has authority to file tax returns. The cashier enters sales, not tax splits. This manipulation required access to the filing system.`,
          eliminates: ['suspect-1'],
        },
      },
      {
        narrative: `A third transaction: a bill shows a total of ₹${total3} including ${rate3}% GST. The store claims the base price was higher than it actually was. If the total includes GST, then total = base + (rate% of base) = base × (100 + rate)/100. What was the actual base price before GST? The inflated base price was used to cover the stolen amount.`,
        question: `Total (incl. GST) = ₹${total3}. GST rate = ${rate3}%. Base price = (total × 100) ÷ (100 + ${rate3}) = ?`,
        answer: base3,
        hints: [
          `Base = total × 100 ÷ (100 + rate) = ${total3} × 100 ÷ ${100 + rate3}.`,
          `Base = ${total3 * 100} ÷ ${100 + rate3} = ₹${base3}. The inflated base is the difference.`,
        ],
        evidence: {
          id: 'evidence-17',
          text: `The base price was inflated to ₹${total3 - base3} above the real ₹${base3}. This complex manipulation required altering both sales records and tax filings. The cashier processes refunds at the front counter — he doesn't touch the filing system. The accountant has direct control over the books.`,
          eliminates: ['suspect-1'],
        },
      },
    ],
  };
}
CASE_GENERATORS['case-enhanced-7'] = generateGSTSwindle;

// ── case-enhanced-8 — The Stock Market Mystery (Shares & Dividends, age 15+, 3 stages) ─

function generateStockMarketMystery() {
  const faceValues = [10, 100];
  const fv = pick(faceValues);
  const divPct = pick([5, 8, 10, 12]);
  const numShares = randomInt(5, 20) * 10;
  const dividend = numShares * fv * divPct / 100;
  const mp = fv + randomInt(1, 5) * (fv === 10 ? 2 : 20);
  const investment = numShares * mp;
  const roi = Math.round(dividend / investment * 10000) / 100;

  const fv2 = pick(faceValues);
  const divPct2 = pick([5, 8, 10, 12].filter(d => d !== divPct));
  const num2 = randomInt(3, 15) * 10;
  const div2 = num2 * fv2 * divPct2 / 100;
  const mp2 = fv2 + randomInt(1, 4) * (fv2 === 10 ? 2 : 25);
  const inv2 = num2 * mp2;
  const roi2 = Math.round(div2 / inv2 * 10000) / 100;

  return {
    id: 'case-enhanced-8',
    title: 'The Stock Market Mystery',
    description: 'Insider trading detected. Calculate the dividends to find the fraud.',
    difficulty: 3, xpReward: 85, topic: 'shares',
    suspects: [
      { id: 'suspect-1', name: 'Kapoor the Trader', role: 'Stock Trader', alibi: 'Claims he was on the trading floor all day.', appearance: '📈', motive: 'His fund was underperforming.', characteristics: { height: 'tall', hand: 'right' } },
      { id: 'suspect-2', name: 'Iyer the Analyst', role: 'Financial Analyst', alibi: 'Says he was preparing quarterly reports.', appearance: '📉', motive: 'Was about to be exposed for insider trading.', characteristics: { height: 'medium', hand: 'left' } },
      { id: 'suspect-3', name: 'Deshmukh the Broker', role: 'Stock Broker', alibi: 'Claims he was meeting a client for lunch.', appearance: '💼', motive: 'His license was under investigation.', characteristics: { height: 'short', hand: 'right' } },
    ],
    culprit: 'suspect-2',
    stages: [
      {
        narrative: `Detective, a suspicious trade was flagged. Someone bought ${numShares} shares of face value ₹${fv} each at a ${divPct}% dividend rate. The dividend per share is rate% of face value. Multiply by the number of shares to find the total dividend payout. This payout matches an unreported offshore account.`,
        question: `Dividend per share = ${divPct}% of ₹${fv}. Total for ${numShares} shares = ?`,
        answer: dividend,
        hints: [
          `Dividend per share = (${divPct} ÷ 100) × ${fv} = ₹${fv * divPct / 100}.`,
          `Total = ${numShares} × ₹${fv * divPct / 100} = ₹${dividend}.`,
        ],
        evidence: {
          id: 'evidence-18',
          text: `₹${dividend} in dividends matches the offshore deposit. The broker was at lunch with a client — no access to execute trades at that moment. Only the trader and analyst were at their desks. The trader buys on volume — the analyst studies payouts.`,
          eliminates: ['suspect-3'],
        },
      },
      {
        narrative: `The market price of these shares was ₹${mp} — above the face value of ₹${fv}. The total investment = number of shares × market price. The Rate of Return = (dividend ÷ investment) × 100. Calculate the ROI percentage. A low ROI despite high dividends means the shares were overvalued — someone manipulated the market price.`,
        question: `Investment = ${numShares} × ₹${mp} = ? ROI = (₹${dividend} ÷ investment) × 100 = ?%`,
        answer: roi,
        hints: [
          `Investment = ${numShares} × ${mp} = ₹${investment}.`,
          `ROI = (${dividend} ÷ ${investment}) × 100 = ${roi}%.`,
        ],
        evidence: {
          id: 'evidence-19',
          text: `An ROI of ${roi}% is unusual for shares with face value ₹${fv}. The analyst had been publishing positive reports on these shares to inflate the market price. The trader buys what the market offers — the analyst creates the demand. This is classic pump-and-dump manipulation.`,
          eliminates: ['suspect-1'],
        },
      },
      {
        narrative: `A second stock was traded: ${num2} shares of ₹${fv2} face value at ${divPct2}% dividend. The market price was ₹${mp2}. The suspect calculated the ROI to ensure it looked legitimate. Calculate the ROI for this second trade. An unusually consistent ROI across different stocks is a red flag — it means someone was cherry-picking data.`,
        question: `Dividend = ${num2} × ${divPct2}% of ₹${fv2}. Investment = ${num2} × ₹${mp2}. ROI = ?%`,
        answer: roi2,
        hints: [
          `Dividend = ${num2} × ₹${fv2 * divPct2 / 100} = ₹${div2}. Investment = ${num2} × ${mp2} = ₹${inv2}.`,
          `ROI = ₹${div2} ÷ ₹${inv2} × 100 = ${roi2}%.`,
        ],
        evidence: {
          id: 'evidence-20',
          text: `The ${roi2}% ROI is suspiciously close to the first trade's ${roi}%. The broker was meeting a client at the time — he couldn't have cherry-picked these stocks. The analyst, however, had been publishing reports on both companies.`,
          eliminates: ['suspect-3'],
        },
      },
    ],
  };
}
CASE_GENERATORS['case-enhanced-8'] = generateStockMarketMystery;

// ── case-enhanced-9 — The Profit & Loss Conspiracy (moved from detective-stories.js) ─

function generateProfitLossCase() {
  const cp1 = randomInt(30, 80) * 10;
  const profit = randomInt(8, 30) * 5;
  const sp1 = cp1 + profit;
  const recordedProfit = profit - randomInt(1, 4) * 5;
  const diff = profit - recordedProfit;

  const cp2 = randomInt(50, 150) * 10;
  const lossPct = pick([10, 12, 15, 20]);
  const lossAmt = cp2 * lossPct / 100;
  const sp2 = cp2 - lossAmt;
  const falseSP = sp2 - randomInt(1, 4) * 10;

  return {
    id: 'case-enhanced-9',
    title: 'The Profit & Loss Conspiracy',
    description: 'The Corner Mart accounts don\'t add up. Someone is cooking the books — can you crack the case?',
    difficulty: 1, xpReward: 60, topic: 'profitloss',
    suspects: [
      { id: 'suspect-1', name: 'Ravi the Shopkeeper', role: 'Store Owner', alibi: 'Says he was restocking at the wholesale market that morning.', appearance: '🏪', motive: 'His share of the profits has been shrinking every month.', characteristics: { height: 'tall', hand: 'right' } },
      { id: 'suspect-2', name: 'Meera the Accountant', role: 'Accountant', alibi: 'Claims she was home with a cold and didn\'t come in that day.', appearance: '📊', motive: 'She was caught overcharging customers last month.', characteristics: { height: 'medium', hand: 'left' } },
      { id: 'suspect-3', name: 'Arjun the Delivery Driver', role: 'Delivery Driver', alibi: 'Says he was on delivery runs all day and has a logbook to prove it.', appearance: '🚚', motive: 'He was caught taking stock from the warehouse.', characteristics: { height: 'medium', hand: 'right' } },
    ],
    culprit: 'suspect-2',
    stages: [
      {
        narrative: `The Corner Mart's morning delivery record shows goods bought for ₹${cp1} were sold for ₹${sp1}. But the ledger only shows a profit of ₹${recordedProfit} — that's suspiciously low. The shopkeeper insists the sale price of ₹${sp1} is correct. What should the actual profit be?`,
        question: `Profit = Selling Price − Cost Price = ${sp1} − ${cp1} = ?`,
        answer: profit,
        hints: [
          'Profit is the difference between the selling price and the cost price.',
          `${sp1} − ${cp1} = ${profit}. The ledger's ₹${recordedProfit} is ₹${diff} short.`,
        ],
        evidence: {
          id: 'evidence-21',
          text: `The ₹${diff} discrepancy proves someone altered the ledger after the sale. The recorded profit should be ₹${profit}, not ₹${recordedProfit}. The shopkeeper was at the wholesale market that morning and never touched the computer.`,
          eliminates: ['suspect-1'],
        },
      },
      {
        narrative: `A second suspicious entry: goods with a cost price of ₹${cp2} were supposedly sold at a ${lossPct}% loss. The recorded selling price in the books is ₹${falseSP}, but something feels off. If the true loss is ${lossPct}% of ₹${cp2}, what should the correct selling price be?`,
        question: `Loss = ${lossPct}% of ${cp2} = ?. Selling Price = ${cp2} − loss = ?`,
        answer: sp2,
        hints: [
          `First calculate the loss amount: ${lossPct}% of ${cp2}.`,
          `Loss = ${lossPct} ÷ 100 × ${cp2} = ${lossAmt}. SP = ${cp2} − ${lossAmt} = ${sp2}. The books recorded ₹${falseSP} to hide the real loss.`,
        ],
        evidence: {
          id: 'evidence-22',
          text: `The correct selling price should be ₹${sp2}, but ₹${falseSP} was recorded. This manipulation required access to the digital accounting system. The delivery driver was on the road all day and never uses the accounting software.`,
          eliminates: ['suspect-3'],
        },
      },
    ],
  };
}
CASE_GENERATORS['case-enhanced-9'] = generateProfitLossCase;

// ── case-enhanced-10 — The Dice Game Rigged (Probability, age 12+, 2 stages) ─

function generateDiceGameRigged() {
  const dice1 = randomInt(1, 6);
  const outcomes = 6;
  const favorable1 = dice1 <= 3 ? 3 : (dice1 === 4 ? 2 : (dice1 === 5 ? 1 : 0));
  const prob1 = `1/${Math.round(outcomes / (favorable1 || 1))}`;

  const tgt = randomInt(2, 12);
  const pairs = [];
  for (let i = 1; i <= 6; i++) {
    for (let j = 1; j <= 6; j++) {
      if (i + j === tgt) pairs.push([i, j]);
    }
  }
  const favorable2 = pairs.length;
  const frac = favorable2 / 36;
  const simplified = frac === 1/6 ? '1/6' : frac === 1/9 ? '1/9' : frac === 1/12 ? '1/12' : frac === 1/18 ? '1/18' : frac === 1/36 ? '1/36' : frac === 1/4 ? '1/4' : frac === 1/3 ? '1/3' : frac === 5/36 ? '5/36' : frac === 5/18 ? '5/18' : `${favorable2}/36`;

  return {
    id: 'case-enhanced-10',
    title: 'The Dice Game Rigged',
    description: 'A casino dice game seems rigged. Calculate the true probabilities.',
    difficulty: 2, xpReward: 70, topic: 'prob',
    suspects: [
      { id: 'suspect-1', name: 'Rohan the Dealer', role: 'Dice Dealer', alibi: 'Claims he was running the table all night.', appearance: '🎲', motive: 'Was caught switching dice at another casino.', characteristics: { height: 'medium', hand: 'right' } },
      { id: 'suspect-2', name: 'Priya the Pit Boss', role: 'Pit Boss', alibi: 'Says she was reviewing surveillance footage.', appearance: '👀', motive: 'Her bonus depended on table revenue.', characteristics: { height: 'tall', hand: 'left' } },
      { id: 'suspect-3', name: 'Sameer the Security Guard', role: 'Security Guard', alibi: 'Claims he was at the entrance checking IDs.', appearance: '🛂', motive: 'Was paid off by a known cheater.', characteristics: { height: 'short', hand: 'right' } },
    ],
    culprit: 'suspect-1',
    stages: [
      {
        narrative: `Detective, players have been losing suspiciously fast at Table 7. A fair die has 6 sides. The dealer calls "over ${dice1}" — meaning the die must show more than ${dice1} to win. How many outcomes out of 6 satisfy this? The probability should be fair, but players keep losing. Something's wrong with the die.`,
        question: `Die roll must be > ${dice1}. Favorable outcomes ÷ total outcomes = ?`,
        answer: prob1,
        hints: [
          `Numbers greater than ${dice1} on a die are: ${Array.from({length: 6 - dice1}, (_, i) => dice1 + 1 + i).join(', ') || 'none'}. Count them.`,
          `${favorable1 || 0} ÷ 6 = ${prob1}.`,
        ],
        evidence: {
          id: 'evidence-23',
          text: `The probability should be ${prob1}, but players win half as often. The security guard was at the entrance and couldn't have tampered with the table. The pit boss watches from above — only the dealer has direct access to the dice between rolls.`,
          eliminates: ['suspect-3'],
        },
      },
      {
        narrative: `The rigged game involves two dice. The dealer says the sum will be ${tgt}. With two fair dice, there are 6 × 6 = 36 possible outcomes. How many ways can the sum be ${tgt}? List the pairs and count. The dealer's been calling sums with fewer winning combinations — the odds are stacked against the players.`,
        question: `Two dice. Sum = ${tgt}. Number of favorable outcomes out of 36 = ?`,
        answer: `${favorable2 > 0 ? simplified : '0'}`,
        hints: [
          `List all pairs (a, b) where a + b = ${tgt} and both are between 1 and 6.`,
          `The pairs are: ${pairs.map(p => `(${p[0]},${p[1]})`).join(', ') || 'none'}. Count: ${favorable2}. Probability = ${favorable2 > 0 ? simplified : '0'}.`,
        ],
        evidence: {
          id: 'evidence-24',
          text: `Sum ${tgt} has only ${favorable2} winning combination${favorable2 !== 1 ? 's' : ''} out of 36 — that's ${simplified} probability. The pit boss monitors from the cameras and doesn't touch the table. The dealer controls the dice cup and chooses when to call which sum. He's the only one who can rig the call.`,
          eliminates: ['suspect-2'],
        },
      },
    ],
  };
}
CASE_GENERATORS['case-enhanced-10'] = generateDiceGameRigged;

// ── case-enhanced-11 — The Data Breach (Statistics, age 9+, 2 stages) ─

function generateDataBreach() {
  const baseValues = pick([
    [100, 200, 300, 400, 500],
    [50, 150, 250, 350, 450],
    [200, 350, 400, 500, 550],
    [60, 120, 180, 240, 300],
  ]);
  const sum = baseValues.reduce((a, b) => a + b, 0);
  const count = baseValues.length;
  const mean = sum / count;
  const sorted = [...baseValues].sort((a, b) => a - b);
  const median = count % 2 === 1 ? sorted[Math.floor(count / 2)] : (sorted[count / 2 - 1] + sorted[count / 2]) / 2;

  const values2 = pick([
    [10, 20, 30, 40, 50, 60],
    [5, 15, 25, 35, 45, 55],
    [12, 22, 32, 42, 52, 62],
  ]);
  const sum2 = values2.reduce((a, b) => a + b, 0);
  const mean2 = sum2 / values2.length;
  const fakeMean = mean2 + pick([10, 15, 20, 25]);

  return {
    id: 'case-enhanced-11',
    title: 'The Data Breach',
    description: 'A data analyst manipulated statistics. Find the true mean.',
    difficulty: 2, xpReward: 70, topic: 'stats',
    suspects: [
      { id: 'suspect-1', name: 'Elena the Analyst', role: 'Data Analyst', alibi: 'Claims she was running reports for the quarterly review.', appearance: '📊', motive: 'Was about to be fired for poor performance.', characteristics: { height: 'medium', hand: 'right' } },
      { id: 'suspect-2', name: 'Raj the IT Admin', role: 'Database Administrator', alibi: 'Says he was performing server maintenance.', appearance: '💻', motive: 'Was being outsourced to a cheaper contractor.', characteristics: { height: 'tall', hand: 'left' } },
      { id: 'suspect-3', name: 'Sara the Manager', role: 'Department Manager', alibi: 'Claims she was in meetings all day.', appearance: '👩‍💼', motive: 'Her bonus depended on good quarterly numbers.', characteristics: { height: 'short', hand: 'right' } },
    ],
    culprit: 'suspect-1',
    stages: [
      {
        narrative: `Detective, the quarterly revenue report doesn't match the raw data. The true figures are: ${baseValues.join(', ')} (in thousands). The published report shows a higher mean. If mean = sum of values ÷ number of values, what's the true mean? Someone inflated it to make the quarter look better.`,
        question: `Data: ${baseValues.join(', ')}. Mean = sum ÷ ${count} = ?`,
        answer: mean,
        hints: [
          'Add all the values: ' + baseValues.join(' + ') + ' = ' + sum + '.',
          `Sum = ${sum}. Mean = ${sum} ÷ ${count} = ${mean}.`,
        ],
        evidence: {
          id: 'evidence-25',
          text: `The true mean is ${mean}K but the report showed a higher number. Only the analyst has direct access to the statistical software. The IT admin manages servers, not data content. The manager reviews reports but doesn't generate raw calculations.`,
          eliminates: ['suspect-2'],
        },
      },
      {
        narrative: `The data was sorted for the median report: ${sorted.join(', ')}. The median is the middle value when data is arranged in order — it's harder to manipulate than the mean because changing one value doesn't shift it much. What's the true median? The inflated report showed a different median too.`,
        question: `Sorted data: ${sorted.join(', ')}. Median = middle value = ?`,
        answer: median,
        hints: [
          `With ${count} values, the median is the ${Math.ceil(count / 2)}th value.`,
          `Middle value = ${sorted[Math.floor(count / 2)]}. Median = ${median}.`,
        ],
        evidence: {
          id: 'evidence-26',
          text: `Mean = ${mean} and median = ${median}. The report showed a mean of ${fakeMean} — the analyst adjusted the numbers. The manager couldn't have altered raw data — she only sees final reports. The IT admin doesn't use the statistical software at all.`,
          eliminates: ['suspect-3'],
        },
      },
    ],
  };
}
CASE_GENERATORS['case-enhanced-11'] = generateDataBreach;

// ── case-enhanced-12 — The Permutation Puzzle (Permutations & Combinations, age 16+, 3 stages) ─

function generatePermutationPuzzle() {
  const n = pick([5, 6, 7, 8]);
  const r = randomInt(2, Math.min(4, n));
  let nPr = 1;
  for (let i = n; i > n - r; i--) nPr *= i;

  const n2 = pick([5, 6, 7, 8]);
  const r2 = randomInt(2, Math.min(3, n2));
  let nCrNum = 1;
  for (let i = n2; i > n2 - r2; i--) nCrNum *= i;
  let nCrDen = 1;
  for (let i = 1; i <= r2; i++) nCrDen *= i;
  const nCr = nCrNum / nCrDen;

  const word = pick(['MATHS', 'LOGIC', 'CODES', 'BRAIN', 'PROOF']);
  const letters = word.length;
  const arrangements = (() => { let f = 1; for (let i = 2; i <= letters; i++) f *= i; return f; })();

  return {
    id: 'case-enhanced-12',
    title: 'The Permutation Puzzle',
    description: 'A cryptic message uses permutations. Decode the arrangement pattern.',
    difficulty: 3, xpReward: 95, topic: 'permcomb',
    suspects: [
      { id: 'suspect-1', name: 'Dr. Raman', role: 'Mathematics Professor', alibi: 'Claims he was grading papers in his office.', appearance: '🧑‍🏫', motive: 'His research was stolen by the department.', characteristics: { height: 'tall', hand: 'right' } },
      { id: 'suspect-2', name: 'Student Nisha', role: 'PhD Student', alibi: 'Says she was in the library studying.', appearance: '📖', motive: 'Was failing the combinatorics course.', characteristics: { height: 'medium', hand: 'left' } },
      { id: 'suspect-3', name: 'Warden Kumar', role: 'Hostel Warden', alibi: 'Claims he was doing evening rounds.', appearance: '🔑', motive: 'None apparent — but he has keys to every room.', characteristics: { height: 'short', hand: 'right' } },
    ],
    culprit: 'suspect-2',
    stages: [
      {
        narrative: `Detective, a coded message was found on the whiteboard: "Arrange ${n} objects ${r} at a time." The number of permutations P(${n}, ${r}) = ${n}! ÷ (${n} − ${r})!. This is the key to the first lockbox. The message was written by someone who knows advanced combinatorics. What's the permutation count?`,
        question: `P(${n}, ${r}) = ${n}! ÷ (${n} − ${r})! = ?`,
        answer: nPr,
        hints: [
          `P(${n}, ${r}) = ${n} × ${n - 1} × ... × ${n - r + 1} (${r} terms).`,
          `P = ${Array.from({length: r}, (_, i) => n - i).join(' × ')} = ${nPr}.`,
        ],
        evidence: {
          id: 'evidence-27',
          text: `${nPr} permutations — this is graduate-level mathematics. The warden doesn't have the mathematical background for combinatorics. The professor would use different notation. The PhD student has been studying this exact topic for her upcoming exam.`,
          eliminates: ['suspect-3'],
        },
      },
      {
        narrative: `A second clue: "Choose ${r2} from ${n2} items." The combination C(${n2}, ${r2}) = ${n2}! ÷ (${r2}! × (${n2} − ${r2})!). Combinations don't care about order — useful for selecting evidence tags. The suspect left this note in the library.`,
        question: `C(${n2}, ${r2}) = ${n2}! ÷ (${r2}! × (${n2} − ${r2})!) = ?`,
        answer: nCr,
        hints: [
          `C(${n2}, ${r2}) = (${n2} × ${n2 - 1} × ... × ${n2 - r2 + 1}) ÷ ${r2}!.`,
          `C = ${nCrNum} ÷ ${nCrDen} = ${nCr}.`,
        ],
        evidence: {
          id: 'evidence-28',
          text: `C(${n2}, ${r2}) = ${nCr} combinations. This clue was found in the library — the professor doesn't use the student library, he has his own office. The student studies there daily. The warden doesn't enter the library during his rounds.`,
          eliminates: ['suspect-1'],
        },
      },
      {
        narrative: `The final clue: "How many ways can the word ${word} be arranged?" All ${letters} letters are distinct, so it's simply ${letters}!. The suspect wrote this on a notepad near the library's combinatorics section — right where the PhD student's study carrel is located.`,
        question: `Arrange all ${letters} letters of ${word}. Number of arrangements = ${letters}! = ?`,
        answer: arrangements,
        hints: [
          `${letters}! = ${letters} × ${letters - 1} × ${letters - 2} × ... × 1.`,
          `${letters}! = ${arrangements}.`,
        ],
        evidence: {
          id: 'evidence-29',
          text: `${arrangements} arrangements of the word ${word}. All three clues connect to the library's combinatorics section — where the PhD student studies. The warden's rounds don't include the library after hours, and the professor has his own office across campus. Only someone living in the dorms would use the library this late.`,
          eliminates: ['suspect-1'],
        },
      },
    ],
  };
}
CASE_GENERATORS['case-enhanced-12'] = generatePermutationPuzzle;

// ── case-enhanced-13 — The Derivative Detective (Differentiation, age 16+, 3 stages) ─

function generateDerivativeDetective() {
  const n = pick([2, 3, 4, 5]);
  const coeff = randomInt(2, 6);
  const xVal = randomInt(1, 4);

  const pCoeff = randomInt(1, 4);
  const pPow = pick([2, 3]);
  const qCoeff = randomInt(2, 5);
  const qPow = pick([1, 2]);
  const prodDerivAt = pCoeff * pPow * Math.pow(xVal, pPow - 1) + qCoeff * qPow * Math.pow(xVal, qPow - 1);

  const c = pick([2, 3, 4]);
  const inner = randomInt(1, 3);
  const outerPow = pick([2, 3]);
  const chainAt = c * outerPow * Math.pow(c * xVal + inner, outerPow - 1);

  return {
    id: 'case-enhanced-13',
    title: 'The Derivative Detective',
    description: 'A graph was tampered with. Find the rate of change at the critical point.',
    difficulty: 3, xpReward: 100, topic: 'diff',
    suspects: [
      { id: 'suspect-1', name: 'Dr. Sinha', role: 'Professor of Calculus', alibi: 'Claims he was in a faculty meeting.', appearance: '👨‍🏫', motive: 'His research paper was rejected by the journal.', characteristics: { height: 'medium', hand: 'right' } },
      { id: 'suspect-2', name: 'Prof. Banerjee', role: 'Associate Professor', alibi: 'Says he was invigilating an exam.', appearance: '📋', motive: 'Was denied tenure this semester.', characteristics: { height: 'tall', hand: 'left' } },
      { id: 'suspect-3', name: 'TA Verma', role: 'Teaching Assistant', alibi: 'Claims he was holding office hours.', appearance: '✏️', motive: 'Was caught leaking exam papers.', characteristics: { height: 'short', hand: 'right' } },
    ],
    culprit: 'suspect-2',
    stages: [
      {
        narrative: `Detective, an exam answer key was altered. The question was: differentiate f(x) = ${coeff}x^${n}. The power rule says: d/dx of ax^n = a × n × x^(n-1). Someone modified the answer key to show a wrong derivative. What should the correct derivative be before evaluating at any x?`,
        question: `f(x) = ${coeff}x^${n}. f'(x) = ${coeff} × ${n}x^(${n}−1) = ?`,
        answer: `${coeff * n}x^${n - 1}`,
        hints: [
          `f'(x) = ${coeff} × ${n} × x^(${n} − 1).`,
          `f'(x) = ${coeff * n}x^${n - 1}.`,
        ],
        evidence: {
          id: 'evidence-30',
          text: `The derivative ${coeff * n}x^${n - 1} was changed to a different expression. The TA was holding office hours and doesn't have keys to the exam storage. The professor was in a meeting. Only someone who invigilated the exam would have after-hours access to the answer key room.`,
          eliminates: ['suspect-3'],
        },
      },
      {
        narrative: `The tampered graph shows f(x) = ${pCoeff}x^${pPow} + ${qCoeff}x^${qPow}. The rate of change at x = ${xVal} determines the slope of the tangent — the suspect used this slope to draw a fake trend line. Differentiate term by term, then plug in x = ${xVal}.`,
        question: `f(x) = ${pCoeff}x^${pPow} + ${qCoeff}x^${qPow}. Find f'(${xVal}).`,
        answer: prodDerivAt,
        hints: [
          `f'(x) = ${pCoeff * pPow}x^${pPow - 1} + ${qCoeff * qPow}x^${qPow - 1}.`,
          `At x = ${xVal}: f'(${xVal}) = ${pCoeff * pPow}(${xVal})^${pPow - 1} + ${qCoeff * qPow}(${xVal})^${qPow - 1} = ${prodDerivAt}.`,
        ],
        evidence: {
          id: 'evidence-31',
          text: `f'(${xVal}) = ${prodDerivAt}. The fake trend line used a different slope. The professor teaches this exact problem in class — he'd know the correct slope. The associate professor hasn't taught this course in years and might misremember the numbers.`,
          eliminates: ['suspect-1'],
        },
      },
      {
        narrative: `A hidden note shows f(x) = (${c}x + ${inner})^${outerPow}. The chain rule: derivative = outer × inner' × (inner)^(outer-1). This composite function was used to encode the exam leak. Calculate f'(${xVal}) using the chain rule to decode the message.`,
        question: `f(x) = (${c}x + ${inner})^${outerPow}. Find f'(${xVal}).`,
        answer: chainAt,
        hints: [
          `f'(x) = ${outerPow}(${c}x + ${inner})^${outerPow - 1} × ${c}.`,
          `At x = ${xVal}: f'(${xVal}) = ${c} × ${outerPow} × (${c * xVal + inner})^${outerPow - 1} = ${chainAt}.`,
        ],
        evidence: {
          id: 'evidence-32',
          text: `f'(${xVal}) = ${chainAt}. The chain rule problem is from the upcoming exam. The professor was in a meeting across campus — he couldn't have accessed the exam storage. Both the TA and associate professor were nearby, but the TA only holds office hours for previously covered topics, not upcoming exam material.`,
          eliminates: ['suspect-1'],
        },
      },
    ],
  };
}
CASE_GENERATORS['case-enhanced-13'] = generateDerivativeDetective;

// ── case-enhanced-14 — The Integration Investigation (Integration, age 16+, 3 stages) ─

function generateIntegrationInvestigation() {
  const n = pick([2, 3, 4]);
  const coeff = randomInt(1, 5);
  const constTerm = randomInt(1, 10);
  const integral = `${coeff / (n + 1)}x^${n + 1} + ${constTerm}x + C`;

  const a = randomInt(0, 1);
  const b = randomInt(2, 5);
  const polyCoeff = randomInt(2, 4);
  const polyPow = pick([1, 2]);
  const defIntegral = polyCoeff * (Math.pow(b, polyPow + 1) - Math.pow(a, polyPow + 1)) / (polyPow + 1);

  const areaA = 1;
  const areaB = randomInt(2, 4);
  const areaCoeff = randomInt(1, 3);
  const areaPow = 2;
  const area = areaCoeff * (Math.pow(areaB, areaPow + 1) - Math.pow(areaA, areaPow + 1)) / (areaPow + 1);

  return {
    id: 'case-enhanced-14',
    title: 'The Integration Investigation',
    description: 'A hidden formula was found in the research notes. Integrate to uncover the truth.',
    difficulty: 3, xpReward: 100, topic: 'integ',
    suspects: [
      { id: 'suspect-1', name: 'Dr. Bose', role: 'Head Researcher', alibi: 'Claims he was presenting at a conference.', appearance: '🔬', motive: 'His funding was being cut.', characteristics: { height: 'tall', hand: 'right' } },
      { id: 'suspect-2', name: 'Prof. Chatterjee', role: 'Lab Director', alibi: 'Says he was reviewing lab safety protocols.', appearance: '🧪', motive: 'Was passed over for the head researcher position.', characteristics: { height: 'medium', hand: 'left' } },
      { id: 'suspect-3', name: 'Student Roy', role: 'Research Student', alibi: 'Claims he was collecting data from the sensors.', appearance: '📡', motive: 'His stipend was reduced this semester.', characteristics: { height: 'short', hand: 'right' } },
    ],
    culprit: 'suspect-2',
    stages: [
      {
        narrative: `Detective, the lab notebook contains a suspicious antiderivative: ∫(${coeff}x^${n} + ${constTerm}) dx. The power rule for integration: ∫ax^n dx = a×x^(n+1)/(n+1) + C. Integrate term by term to find the general antiderivative. This formula was used to encode experimental results.`,
        question: `∫(${coeff}x^${n} + ${constTerm}) dx = ?`,
        answer: integral,
        hints: [
          `∫${coeff}x^${n} dx = ${coeff}x^(${n} + 1) ÷ (${n} + 1) = ${coeff / (n + 1)}x^${n + 1}.`,
          `Plus ∫${constTerm} dx = ${constTerm}x + C. So answer: ${integral}.`,
        ],
        evidence: {
          id: 'evidence-33',
          text: `The antiderivative ${integral} was used to encode the data. The research student doesn't have access to the lab's main computer — only the sensor terminals. The head researcher was at a conference across the country. The lab director was on-site and has full system access.`,
          eliminates: ['suspect-3'],
        },
      },
      {
        narrative: `A second clue: a definite integral from x = ${a} to x = ${b}: ∫₀${a === 0 ? '' : '^' + a}${'^' + b} ${polyCoeff}x^${polyPow} dx. The definite integral = F(b) − F(a). Evaluate the antiderivative at the bounds and subtract. This calculates the area under the curve — the exact area where evidence was hidden.`,
        question: `∫₀${a === 0 ? '' : '^' + a}${b} ${polyCoeff}x^${polyPow} dx = F(${b}) − F(${a}) = ?`,
        answer: defIntegral,
        hints: [
          `Antiderivative: F(x) = ${polyCoeff}x^${polyPow + 1} ÷ ${polyPow + 1} = ${polyCoeff / (polyPow + 1)}x^${polyPow + 1}.`,
          `F(${b}) − F(${a}) = ${polyCoeff / (polyPow + 1)}(${b}^${polyPow + 1} − ${a}^${polyPow + 1}) = ${defIntegral}.`,
        ],
        evidence: {
          id: 'evidence-34',
          text: `The area ${defIntegral} corresponds to the lab's off-limits storage room. The head researcher was at a conference and couldn't have accessed the lab. The lab director's security badge was logged entering that storage room at the time the data was planted.`,
          eliminates: ['suspect-1'],
        },
      },
      {
        narrative: `The final piece: the area under curve y = ${areaCoeff}x² from x = ${areaA} to x = ${areaB}. This was used to calculate the exact amount of missing research funding. Integrate and evaluate. The result matches the embezzled amount.`,
        question: `∫₀${areaA}${areaB} ${areaCoeff}x² dx = area under curve from ${areaA} to ${areaB} = ?`,
        answer: area,
        hints: [
          `∫${areaCoeff}x² dx = ${areaCoeff}x³ ÷ 3 = ${areaCoeff / 3}x³.`,
          `F(${areaB}) − F(${areaA}) = ${areaCoeff / 3}(${areaB}³ − ${areaA}³) = ${areaCoeff / 3 * (areaB * areaB * areaB - areaA * areaA * areaA)}. Round to ${area}.`,
        ],
        evidence: {
          id: 'evidence-35',
          text: `The embezzled amount matches the area ${area}. The student can only submit purchase requests, not authorise them. The head researcher was at a conference — his signature was forged. Only the director knows the signing protocols and the head researcher's signature well enough to forge it.`,
          eliminates: ['suspect-1'],
        },
      },
    ],
  };
}
CASE_GENERATORS['case-enhanced-14'] = generateIntegrationInvestigation;

// ── case-enhanced-15 — The Limit Labyrinth (Limits, age 16+, 3 stages) ─

function generateLimitLabyrinth() {
  const directA = randomInt(1, 5);
  const directVal = 2 * directA + 3;

  const factorA = randomInt(1, 4);
  const factorB = randomInt(1, 5);
  const factorLimit = factorA + factorB;

  const ratA = randomInt(1, 3);
  const ratB = randomInt(2, 5);
  const ratC = ratB * ratB;
  const ratResult = 2 * ratA;

  return {
    id: 'case-enhanced-15',
    title: 'The Limit Labyrinth',
    description: 'A hidden path through a maze of limits. Find the limit to escape.',
    difficulty: 3, xpReward: 100, topic: 'limits',
    suspects: [
      { id: 'suspect-1', name: 'Prof. Saxena', role: 'Mathematics Professor', alibi: 'Claims he was in the common room grading papers.', appearance: '👨‍🏫', motive: 'His research lab was reassigned.', characteristics: { height: 'medium', hand: 'right' } },
      { id: 'suspect-2', name: 'Dr. Nair', role: 'Postdoctoral Fellow', alibi: 'Says he was running experiments in the lab.', appearance: '🧑‍🔬', motive: 'Was denied a research grant extension.', characteristics: { height: 'tall', hand: 'left' } },
      { id: 'suspect-3', name: 'Student Reddy', role: 'Graduate Student', alibi: 'Claims he was in the computer lab.', appearance: '🖥️', motive: 'Was failing the advanced calculus course.', characteristics: { height: 'short', hand: 'right' } },
    ],
    culprit: 'suspect-2',
    stages: [
      {
        narrative: `Detective, the maze entrance requires evaluating: lim(x→${directA}) (2x + 3). This is a direct substitution limit — simply plug in x = ${directA}. The result opens the first gate. The labyrinth was designed by someone comfortable with limits.`,
        question: `lim(x→${directA}) (2x + 3) = 2(${directA}) + 3 = ?`,
        answer: directVal,
        hints: [
          'Direct substitution: replace x with the value it approaches.',
          `2(${directA}) + 3 = ${directA * 2} + 3 = ${directVal}.`,
        ],
        evidence: {
          id: 'evidence-36',
          text: `The limit is ${directVal}. The first gate opened, but the labyrinth has more layers. The professor grades papers in the common room — he's been there all evening. The postdoc was in the lab, which is next to the labyrinth entrance. The student was in the computer lab across campus.`,
          eliminates: ['suspect-3'],
        },
      },
      {
        narrative: `The second gate: lim(x→${factorA}) (x² − ${factorA * factorA})/(x − ${factorA}). Direct substitution gives 0/0 — an indeterminate form. Factor the numerator as (x − ${factorA})(x + ${factorA}), cancel (x − ${factorA}), then substitute. This limit reveals the second coordinate.`,
        question: `lim(x→${factorA}) (x² − ${factorA * factorA})/(x − ${factorA}) = ?`,
        answer: factorLimit,
        hints: [
          `x² − ${factorA * factorA} = (x − ${factorA})(x + ${factorA}). Cancel (x − ${factorA}).`,
          `Simplified: lim(x→${factorA}) (x + ${factorA}) = ${factorA} + ${factorA} = ${factorLimit}.`,
        ],
        evidence: {
          id: 'evidence-37',
          text: `The second limit ${factorLimit} points to the lab wing. The professor was in the common room — confirmed by multiple witnesses. The postdoc's lab is in the lab wing. The student was in the computer lab — and his access card wasn't swiped near the labyrinth.`,
          eliminates: ['suspect-1'],
        },
      },
      {
        narrative: `The final gate: lim(x→0) (√(${ratC} + ${ratA}x) − √(${ratC})) / x. Direct substitution gives 0/0. Rationalise by multiplying numerator and denominator by (√(${ratC} + ${ratA}x) + √(${ratC})). The numerator becomes ${ratA}x. Cancel x, then substitute. This opens the central chamber where the answer lies.`,
        question: `lim(x→0) (√(${ratC} + ${ratA}x) − √(${ratC})) / x = (after rationalising) ${ratA} / (2√(${ratC})) = ?`,
        answer: ratResult,
        hints: [
          'Multiply by the conjugate: (√(a) − √(b))(√(a) + √(b)) = a − b.',
          `After rationalising: ${ratA}x / (x(√(${ratC} + ${ratA}x) + √(${ratC}))) = ${ratA} / (2√(${ratC})) = ${ratA} / ${2 * ratB} = ${ratResult}.`,
        ],
        evidence: {
          id: 'evidence-38',
          text: `The final limit ${ratResult} opens the central chamber. All three gates required advanced calculus knowledge. The professor was in the common room — confirmed on CCTV. The student was across campus in the computer lab. The postdoc's lab is adjacent to the labyrinth, and his access card was logged there at midnight.`,
          eliminates: ['suspect-3'],
        },
      },
    ],
  };
}
CASE_GENERATORS['case-enhanced-15'] = generateLimitLabyrinth;

// ── case-enhanced-16 — The Coded Ledger Mystery (Linear Equations, age 13+, path mode) ─
// Path-mode case: stages are solved in sequence along a circle map. Each solved
// equation reveals a CLUE about the culprit's identity (letter / characteristic).
// The player then picks whom the clue eliminates ("no one" is a valid, always
// accepted answer). Cumulative eliminations still narrow to suspects − 1.
//
// Clue design invariants (checked by detective.test.jsx):
//   - The culprit (Vikram Nair) is never eliminated by any clue.
//   - Stage 1 letter ('A' or 'I') appears in ALL three names → eliminates no one.
//   - Stage 2 letter 'V' appears in Vikram Nair and Ravi Das but not Anita Rao.
//   - Stage 3 right-handed eliminates Ravi Das only (Vikram + Anita are right-handed).

function generateCodedLedger() {
  const stage1Letter = pick(['A', 'I']);
  const pageStart = stage1Letter === 'A' ? 9 : pick([17, 26]);
  const pageAnswer = pageStart + 1;
  const pageSum = pageStart + (pageStart + 1);
  const stage1DigitSum = String(pageAnswer).split('').reduce((s, d) => s + Number(d), 0);

  const a2 = randomInt(2, 5);
  const b2 = randomInt(1, 14);
  const x2 = 22;
  const result2 = a2 * x2 + b2;

  const halfC = randomInt(1, 6);
  const c3 = halfC * 2;
  const x3 = 5;
  const total3 = x3 + halfC;

  return {
    id: 'case-enhanced-16',
    title: 'The Coded Ledger Mystery',
    description: 'A ledger was tampered with using coded equations. Collect clues along the path and eliminate the culprit by deduction.',
    difficulty: 2, xpReward: 80, topic: 'lineareq',
    mode: 'path',
    suspects: [
      { id: 'ledger-culprit', name: 'Vikram Nair', role: 'Accountant', alibi: 'Claims he was reconciling the annual report in his office all evening.', appearance: '🧮', motive: 'The upcoming audit was about to expose his embezzlement.', characteristics: { height: 'tall', hand: 'right' } },
      { id: 'ledger-anita', name: 'Anita Rao', role: 'Cashier', alibi: 'Says she left at 6 PM and was home with her family by 7 PM.', appearance: '🪙', motive: 'She discovered the missing money and was about to report it.', characteristics: { height: 'short', hand: 'right' } },
      { id: 'ledger-ravi', name: 'Ravi Das', role: 'Security Guard', alibi: 'Claims he was doing his rounds on the ground floor.', appearance: '🗝️', motive: 'Was angry about his overtime pay being cut.', characteristics: { height: 'medium', hand: 'left' } },
    ],
    culprit: 'ledger-culprit',
    clueChain: [
      { type: 'letter', value: stage1Letter },
      { type: 'letter', value: 'V' },
      { type: 'characteristic', key: 'hand', value: 'right' },
    ],
    stages: [
      {
        narrative: `Detective, the back-entry ledger was tampered with! The first coded entry reads: "Pages ${pageStart} and ${pageStart + 1} of the secret register were torn out — their page numbers add up to ${pageSum}." The forger scrawled a key in the margin: "reduce the page to its digits, then to its letter — 1 = A." Solve it and the first clue about the culprit is yours.`,
        question: `Two consecutive page numbers add up to ${pageSum}. What is the LARGER page number?`,
        answer: pageAnswer,
        hints: [
          `Let the pages be n and n + 1. Their sum: 2n + 1 = ${pageSum}.`,
          `n = (${pageSum} − 1) ÷ 2 = ${pageStart}. The larger page is ${pageStart} + 1 = ${pageAnswer}.`,
        ],
        evidence: {
          id: 'ledger-ev-1',
          text: `The larger page is ${pageAnswer}. Using the margin's key — ${pageAnswer} → digit-sum ${stage1DigitSum} → the letter '${stage1Letter}' — and every suspect's name, Vikram Nair, Anita Rao and Ravi Das, carries a '${stage1Letter}'. The clue fits all three, so nobody is ruled out yet.`,
          summary: `The page number ${pageAnswer} reduces to the letter '${stage1Letter}' — a letter every suspect's name carries, so nobody is ruled out yet.`,
          eliminates: [],
        },
      },
      {
        narrative: `The second entry is bolder, Detective — the forger wrote their own initial as an equation. The margin reads: "the answer is my initial-value — A = 1, B = 2, ... Z = 26." Solve ${a2}x + ${b2} = ${result2} and the number you get is the culprit's code.`,
        question: `${a2}x + ${b2} = ${result2}. Solve for x.`,
        answer: x2,
        hints: [
          `Subtract ${b2} from both sides: ${a2}x = ${result2 - b2}.`,
          `Divide by ${a2}: x = ${result2 - b2} ÷ ${a2} = 22.`,
        ],
        evidence: {
          id: 'ledger-ev-2',
          text: `Solving gave x = 22, and the margin's code reads 22 = 'V'. Vikram Nair and Ravi Das both have a 'V' in their names — but Anita Rao's name has no 'V', so the cashier couldn't have done it.`,
          summary: `x = 22 decodes to the letter 'V'. Vikram Nair and Ravi Das both have a 'V' — Anita Rao doesn't, so the cashier is cleared.`,
          eliminates: ['ledger-anita'],
        },
      },
      {
        narrative: `The final cipher sits at the end of the path, Detective. The margin holds a trait key: "1 = short, 2 = medium, 3 = tall, 4 = left-handed, 5 = right-handed." The forger encoded their own body in the equation: double the number, add ${c3}, then halve the result — you get ${total3}. Unravel it and the culprit's identity is yours.`,
        question: `(2x + ${c3}) ÷ 2 = ${total3}. Solve for x.`,
        answer: x3,
        hints: [
          `Multiply both sides by 2: 2x + ${c3} = ${total3 * 2}.`,
          `Subtract ${c3}: 2x = ${total3 * 2 - c3}. Divide by 2: x = ${(total3 * 2 - c3) / 2} = 5.`,
        ],
        evidence: {
          id: 'ledger-ev-3',
          text: `Solving gave x = 5, and the margin's key reads 5 = right-handed. Vikram Nair and Anita Rao are both right-handed — but Ravi Das is left-handed, so the guard couldn't have done it.`,
          summary: `x = 5 decodes to "right-handed". Vikram Nair and Anita Rao are right-handed — Ravi Das isn't, so the guard is cleared.`,
          eliminates: ['ledger-ravi'],
        },
      },
    ],
  };
}
CASE_GENERATORS['case-enhanced-16'] = generateCodedLedger;

export { CASE_GENERATORS };
