/**
 * GeoGebra Live Canvas Inspector & Question Validator
 *
 * Inspects the live ggbApplet instance and checks whether objects
 * created by the student match the expectations for each question.
 */

export function inspectGeoGebraCanvas(api) {
  if (!api || typeof api.getAllObjectNames !== 'function') {
    return {
      connected: false,
      objects: [],
      count: 0
    };
  }

  try {
    const names = api.getAllObjectNames() || [];
    const objects = names.map((name) => {
      const type = api.getObjectType ? api.getObjectType(name) : 'unknown';
      const value = api.getValueString ? api.getValueString(name) : '';
      const definition = api.getDefinitionString ? api.getDefinitionString(name) : '';
      const command = api.getCommandString ? api.getCommandString(name) : '';
      const isVisible = api.getVisible ? api.getVisible(name) : true;

      let numericValue = null;
      if (typeof api.getValue === 'function') {
        try {
          const val = api.getValue(name);
          if (typeof val === 'number' && !isNaN(val)) {
            numericValue = Number(val.toFixed(3));
          }
        } catch (e) {}
      }

      let coords = null;
      if (type === 'point' || type === 'vector') {
        try {
          const x = api.getXcoord ? api.getXcoord(name) : 0;
          const y = api.getYcoord ? api.getYcoord(name) : 0;
          let z = 0;
          if (typeof api.getZcoord === 'function') {
            try {
              z = api.getZcoord(name) || 0;
            } catch (e) {}
          }
          coords = [
            Number((x || 0).toFixed(2)),
            Number((y || 0).toFixed(2)),
            Number((z || 0).toFixed(2))
          ];
        } catch (e) {}
      }

      return {
        name,
        type,
        value,
        definition,
        command,
        numericValue,
        coords,
        isVisible
      };
    });

    return {
      connected: true,
      objects,
      count: objects.length
    };
  } catch (err) {
    console.warn('GeoGebra inspection error:', err);
    return { connected: false, objects: [], count: 0 };
  }
}

/**
 * Validates the current canvas state against the active question.
 * Returns: { verified: boolean, status: string, message: string, detected?: string, missing?: string, suggestion?: string }
 */
export function verifyQuestionConstruction(question, inspection) {
  if (!question) {
    return {
      verified: true,
      status: 'idle',
      message: 'No active question to verify.'
    };
  }

  if (!inspection || !inspection.connected) {
    return {
      verified: false,
      status: 'waiting',
      message: 'GeoGebra workspace is initializing...'
    };
  }

  const { objects, count } = inspection;

  if (count === 0) {
    return {
      verified: false,
      status: 'empty',
      message: 'No objects detected on your GeoGebra board yet.',
      suggestion: 'Type your command into the GeoGebra input bar and press Enter.'
    };
  }

  const qId = question.id;
  const is3D = question.perspective === 'T';

  // Helper matching utilities
  const normalize = (str) => (str || '').toLowerCase().replace(/[\s\(\)\[\]\{\},*]/g, '');

  const isNear = (coords, targetX, targetY, targetZ = null, tol = 0.35) => {
    if (!coords || !Array.isArray(coords)) return false;
    const dx = Math.abs(coords[0] - targetX);
    const dy = Math.abs(coords[1] - targetY);
    if (dx > tol || dy > tol) return false;
    if (targetZ !== null) {
      const dz = Math.abs((coords[2] || 0) - targetZ);
      if (dz > tol) return false;
    }
    return true;
  };

  const findPointsNear = (x, y, z = null, tol = 0.35) =>
    objects.filter((o) => o.type === 'point' && isNear(o.coords, x, y, z, tol));

  const findVectorsNear = (x, y, z = null, tol = 0.35) =>
    objects.filter((o) => o.type === 'vector' && isNear(o.coords, x, y, z, tol));

  const findAnyNear = (x, y, z = null, tol = 0.35) =>
    objects.filter((o) => (o.type === 'point' || o.type === 'vector') && isNear(o.coords, x, y, z, tol));

  const findByType = (t) => objects.filter((o) => (o.type || '').toLowerCase() === t.toLowerCase());

  const findByName = (n, exact = false) =>
    objects.find((o) => (exact ? o.name === n : o.name.toLowerCase() === n.toLowerCase()));

  const hasCmd = (cmd) =>
    objects.some((o) => (o.command || '').toLowerCase().includes(cmd.toLowerCase()));

  const hasValOrDef = (term) => {
    const normTerm = normalize(term);
    return objects.some(
      (o) => normalize(o.value).includes(normTerm) || normalize(o.definition).includes(normTerm)
    );
  };

  // Format object for detected pill
  const formatObj = (o) => {
    if (o.type === 'point' || o.type === 'vector') {
      const label = o.type === 'vector' ? `Vector ${o.name}` : `Point ${o.name}`;
      const c = is3D ? o.coords : [o.coords[0], o.coords[1]];
      return `${label} = (${c.join(', ')})`;
    }
    if (o.value) {
      return `${o.name}: ${o.value}`;
    }
    return `${o.name} (${o.type})`;
  };

  // Detailed multi-plot validation per question
  switch (qId) {
    // ─────────────────────────────────────────────────────────────
    // Q1: Single point at (3, 5)
    // ─────────────────────────────────────────────────────────────
    case 1: {
      const p = findPointsNear(3, 5)[0] || findAnyNear(3, 5)[0];
      if (p) {
        return {
          verified: true,
          status: 'success',
          message: `Awesome! Point ${p.name} at (3, 5) was found on your Cartesian plane.`,
          detected: formatObj(p)
        };
      }
      const anyPoints = findByType('point');
      return {
        verified: false,
        status: 'partial',
        message: anyPoints.length > 0
          ? `Point at (3, 5) not found. Detected point(s): ${anyPoints.map(formatObj).join('  •  ')}`
          : 'Point at (3, 5) not found yet.',
        detected: anyPoints.length > 0 ? anyPoints.map(formatObj).join('  •  ') : null,
        missing: 'Point at (3, 5)',
        suggestion: 'Type (3, 5) into the GeoGebra input bar and press Enter.'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q2: Multi-plot: Point A = (4, 2) AND Vector a = (4, 2)
    // ─────────────────────────────────────────────────────────────
    case 2: {
      const pA = findPointsNear(4, 2)[0] || objects.find((o) => o.type === 'point' && isNear(o.coords, 4, 2));
      const vA = findVectorsNear(4, 2)[0] || objects.find((o) => o.type === 'vector' && isNear(o.coords, 4, 2));

      if (pA && vA) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Both objects detected! Point ${pA.name} is a coordinate dot, and vector ${vA.name} is a directed arrow from the origin. Uppercase creates points, lowercase creates vectors!`,
          detected: `${formatObj(pA)}  •  ${formatObj(vA)}`
        };
      }
      if (pA && !vA) {
        return {
          verified: false,
          status: 'partial',
          message: `Detected Point ${pA.name} at (4, 2) (1/2 plots)! Now enter lowercase a = (4, 2) to see the vector arrow.`,
          detected: formatObj(pA),
          missing: 'Vector a = (4, 2)',
          suggestion: 'Type a = (4, 2) into the Input Bar.'
        };
      }
      if (!pA && vA) {
        return {
          verified: false,
          status: 'partial',
          message: `Detected Vector ${vA.name} at (4, 2) (1/2 plots)! Now enter uppercase A = (4, 2) to see the point coordinate.`,
          detected: formatObj(vA),
          missing: 'Point A = (4, 2)',
          suggestion: 'Type A = (4, 2) into the Input Bar.'
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Type A = (4, 2) and a = (4, 2) to see the difference between points and vectors.',
        missing: 'Point A = (4, 2) and Vector a = (4, 2)',
        suggestion: 'Enter A = (4, 2), then enter a = (4, 2).'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q3: Multi-plot: Parent Point A = (2, 3) AND Dependent Point B = A + (3, 1)
    // ─────────────────────────────────────────────────────────────
    case 3: {
      const pA = findPointsNear(2, 3)[0] || findByName('A');
      const pB = findPointsNear(5, 4)[0] || objects.find((o) => o.definition && o.definition.includes('A'));

      const detected = [];
      if (pA) detected.push(formatObj(pA));
      if (pB) detected.push(formatObj(pB));

      if (pA && pB) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Both points detected! Parent Point ${pA.name} at (2, 3) and dependent Point ${pB.name} at (5, 4). Try dragging Point ${pA.name} on canvas to watch ${pB.name} follow dynamically!`,
          detected: detected.join('  •  ')
        };
      }
      if (pA && !pB) {
        return {
          verified: false,
          status: 'partial',
          message: `Point ${pA.name} at (2, 3) detected (1/2 plots)! Now enter B = A + (3, 1) to create the dynamic dependent point.`,
          detected: detected.join('  •  '),
          missing: 'Point B = A + (3, 1)',
          suggestion: 'Type B = A + (3, 1) into the input bar.'
        };
      }
      if (!pA && pB) {
        return {
          verified: true,
          status: 'success',
          message: `Dependent Point ${pB.name} at (5, 4) detected! Create A = (2, 3) to test dragging.`,
          detected: formatObj(pB)
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'First create A = (2, 3), then enter B = A + (3, 1).',
        missing: 'A = (2, 3) and B = A + (3, 1)',
        suggestion: 'Type A = (2, 3) in the input bar.'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q4: Multi-plot: Point A = (1, 2), Point B = (4, 6), Segment(A, B)
    // ─────────────────────────────────────────────────────────────
    case 4: {
      const pA = findPointsNear(1, 2)[0] || findByName('A');
      const pB = findPointsNear(4, 6)[0] || findByName('B');
      const seg = findByType('segment')[0] || objects.find((o) => hasCmd('segment'));

      const detected = [];
      if (pA) detected.push(formatObj(pA));
      if (pB) detected.push(formatObj(pB));
      if (seg) detected.push(`Segment ${seg.name}`);

      if (seg) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Finite line segment detected connecting your endpoints!`,
          detected: detected.join('  •  ')
        };
      }
      if (pA && pB) {
        return {
          verified: false,
          status: 'partial',
          message: `Both endpoints detected (2/2 points): A at (1, 2) and B at (4, 6)! Now connect them with Segment(A, B).`,
          detected: detected.join('  •  '),
          missing: 'Segment(A, B)',
          suggestion: 'Type Segment(A, B) into the Input Bar.'
        };
      }
      if (pA || pB) {
        const found = pA || pB;
        const missingName = pA ? 'B' : 'A';
        const missingCoords = pA ? '(4, 6)' : '(1, 2)';
        return {
          verified: false,
          status: 'partial',
          message: `Detected ${formatObj(found)} (1/2 points). Now plot ${missingName} = ${missingCoords}.`,
          detected: detected.join('  •  '),
          missing: `Point ${missingName} = ${missingCoords}`,
          suggestion: `Type ${missingName} = ${missingCoords} into the Input Bar.`
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Plot points A = (1, 2) and B = (4, 6), then type Segment(A, B).',
        missing: 'Points A = (1, 2) and B = (4, 6)',
        suggestion: 'Type A = (1, 2) into the Input Bar.'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q5: Multi-plot: Point A = (2, 1), Point B = (4, 5), Line(A, B)
    // ─────────────────────────────────────────────────────────────
    case 5: {
      const pA = findPointsNear(2, 1)[0] || findByName('A');
      const pB = findPointsNear(4, 5)[0] || findByName('B');
      const line = findByType('line')[0] || objects.find((o) => hasCmd('line'));

      const detected = [];
      if (pA) detected.push(formatObj(pA));
      if (pB) detected.push(formatObj(pB));
      if (line) detected.push(`Line ${line.name}`);

      if (line) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Infinite line detected passing through both Point A and Point B!`,
          detected: detected.join('  •  ')
        };
      }
      if (pA && pB) {
        return {
          verified: false,
          status: 'partial',
          message: `Both points detected (2/2 points): A at (2, 1) and B at (4, 5)! Now type Line(A, B) to draw the infinite line.`,
          detected: detected.join('  •  '),
          missing: 'Line(A, B)',
          suggestion: 'Type Line(A, B) into the Input Bar.'
        };
      }
      if (pA || pB) {
        const found = pA || pB;
        const missingName = pA ? 'B' : 'A';
        const missingCoords = pA ? '(4, 5)' : '(2, 1)';
        return {
          verified: false,
          status: 'partial',
          message: `Detected ${formatObj(found)} (1/2 points). Now plot ${missingName} = ${missingCoords}.`,
          detected: detected.join('  •  '),
          missing: `Point ${missingName} = ${missingCoords}`,
          suggestion: `Type ${missingName} = ${missingCoords} into the Input Bar.`
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Plot points A = (2, 1) and B = (4, 5), then type Line(A, B).',
        missing: 'Points A = (2, 1) and B = (4, 5)',
        suggestion: 'Type A = (2, 1) into the Input Bar.'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q6: Multi-plot: Point A = (2, 4), Point B = (6, 8), Midpoint(A, B) = (4, 6)
    // ─────────────────────────────────────────────────────────────
    case 6: {
      const pA = findPointsNear(2, 4)[0] || findByName('A');
      const pB = findPointsNear(6, 8)[0] || findByName('B');
      const mid = findPointsNear(4, 6)[0] || objects.find((o) => hasCmd('midpoint'));

      const detected = [];
      if (pA) detected.push(formatObj(pA));
      if (pB) detected.push(formatObj(pB));
      if (mid) detected.push(formatObj(mid));

      if (mid) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Midpoint at (4, 6) successfully calculated and plotted!`,
          detected: detected.join('  •  ')
        };
      }
      if (pA && pB) {
        return {
          verified: false,
          status: 'partial',
          message: `Both endpoints detected (2/2 points): A at (2, 4) and B at (6, 8)! Now enter Midpoint(A, B).`,
          detected: detected.join('  •  '),
          missing: 'Midpoint(A, B)',
          suggestion: 'Type Midpoint(A, B) into the Input Bar.'
        };
      }
      if (pA || pB) {
        const found = pA || pB;
        const missingName = pA ? 'B' : 'A';
        const missingCoords = pA ? '(6, 8)' : '(2, 4)';
        return {
          verified: false,
          status: 'partial',
          message: `Detected ${formatObj(found)} (1/2 points). Now plot ${missingName} = ${missingCoords}.`,
          detected: detected.join('  •  '),
          missing: `Point ${missingName} = ${missingCoords}`,
          suggestion: `Type ${missingName} = ${missingCoords} into the Input Bar.`
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Plot A = (2, 4) and B = (6, 8), then enter Midpoint(A, B).',
        missing: 'Points A and B',
        suggestion: 'Type A = (2, 4).'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q7: Linear Equation y = 2x + 3
    // ─────────────────────────────────────────────────────────────
    case 7: {
      const line = objects.find(
        (o) => hasValOrDef('2x+3') || hasValOrDef('2*x+3') || (o.value && o.value.includes('2x'))
      );
      if (line) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Linear function/equation y = 2x + 3 detected on your canvas!`,
          detected: formatObj(line)
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Type y = 2x + 3 or f(x) = 2x + 3 into the Input Bar.',
        missing: 'y = 2x + 3',
        suggestion: 'Type y = 2x + 3 into the input bar.'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q8: Multi-plot: Slider m AND Line y = m*x + 2
    // ─────────────────────────────────────────────────────────────
    case 8: {
      const sliderM = findByName('m', true) || objects.find((o) => o.type === 'numeric' && o.name === 'm');
      const line = objects.find(
        (o) => hasValOrDef('mx') || hasValOrDef('m*x') || hasValOrDef('+2')
      );

      const detected = [];
      if (sliderM) detected.push(`Slider m = ${sliderM.numericValue ?? sliderM.value ?? '1'}`);
      if (line) detected.push(formatObj(line));

      if (sliderM && line) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Dynamic slider m and line y = mx + 2 detected! Drag slider m to watch the line rotate dynamically.`,
          detected: detected.join('  •  ')
        };
      }
      if (line) {
        return {
          verified: true,
          status: 'success',
          message: `Line ${line.name} plotted! GeoGebra auto-creates the slider m.`,
          detected: detected.join('  •  ')
        };
      }
      if (sliderM) {
        return {
          verified: false,
          status: 'partial',
          message: `Slider m detected! Now type y = m*x + 2 into the Input Bar.`,
          detected: detected.join('  •  '),
          missing: 'Line y = m*x + 2',
          suggestion: 'Type y = m*x + 2 into the Input Bar.'
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Type y = m*x + 2 into an empty sheet to watch GeoGebra auto-generate slider m.',
        missing: 'y = m*x + 2',
        suggestion: 'Type y = m*x + 2 and press Enter.'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q9: Multi-plot: Line f: y = 2x - 1, Line g: y = -x + 5, Intersect(f, g) = (2, 3)
    // ─────────────────────────────────────────────────────────────
    case 9: {
      const lineF = objects.find((o) => hasValOrDef('2x-1') || hasValOrDef('2*x-1') || o.name === 'f');
      const lineG = objects.find((o) => hasValOrDef('-x+5') || hasValOrDef('-1*x+5') || o.name === 'g');
      const ptIntersect = findPointsNear(2, 3)[0] || objects.find((o) => hasCmd('intersect'));

      const detected = [];
      if (lineF) detected.push(`f: ${lineF.value || 'y = 2x - 1'}`);
      if (lineG) detected.push(`g: ${lineG.value || 'y = -x + 5'}`);
      if (ptIntersect) detected.push(formatObj(ptIntersect));

      if (ptIntersect) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Intersection point (2, 3) between lines f and g successfully calculated and plotted!`,
          detected: detected.join('  •  ')
        };
      }
      if (lineF && lineG) {
        return {
          verified: false,
          status: 'partial',
          message: `Both lines detected (2/2 lines): f and g! Now enter Intersect(f, g) to plot where they cross.`,
          detected: detected.join('  •  '),
          missing: 'Intersect(f, g)',
          suggestion: 'Type Intersect(f, g) into the Input Bar.'
        };
      }
      if (lineF || lineG) {
        const found = lineF ? 'f: y = 2x - 1' : 'g: y = -x + 5';
        const missing = lineF ? 'g: y = -x + 5' : 'f: y = 2x - 1';
        return {
          verified: false,
          status: 'partial',
          message: `Detected ${found} (1/2 lines). Now enter ${missing}.`,
          detected: detected.join('  •  '),
          missing: missing,
          suggestion: `Type ${missing} into the Input Bar.`
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Type f: y = 2x - 1, g: y = -x + 5, then enter Intersect(f, g).',
        missing: 'Lines f and g',
        suggestion: 'Type y = 2x - 1.'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q10: Multi-plot: Curve f(x) = x^2, Point P = Point(f)
    // ─────────────────────────────────────────────────────────────
    case 10: {
      const curve = objects.find((o) => hasValOrDef('x^2') || o.type === 'function');
      const ptOnCurve = objects.find(
        (o) =>
          o.type === 'point' &&
          (hasCmd('point') ||
            (o.coords && Math.abs(o.coords[1] - Math.pow(o.coords[0], 2)) < 0.35))
      );

      const detected = [];
      if (curve) detected.push(`Curve f: ${curve.value || 'f(x) = x^2'}`);
      if (ptOnCurve) detected.push(formatObj(ptOnCurve));

      if (curve && ptOnCurve) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Constrained point ${ptOnCurve.name} on parabola detected! Drag ${ptOnCurve.name} to watch it slide along the curve.`,
          detected: detected.join('  •  ')
        };
      }
      if (curve && !ptOnCurve) {
        return {
          verified: false,
          status: 'partial',
          message: `Parabola f(x) = x^2 detected! Now type P = Point(f) to attach a point strictly to the curve.`,
          detected: detected.join('  •  '),
          missing: 'P = Point(f)',
          suggestion: 'Type P = Point(f) into the Input Bar.'
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Define f(x) = x^2, then enter P = Point(f).',
        missing: 'f(x) = x^2',
        suggestion: 'Type f(x) = x^2 into the input bar.'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q11: Multi-plot: Dynamic Point A, Dependent Point B = (x(A), 0)
    // ─────────────────────────────────────────────────────────────
    case 11: {
      const pA = findByName('A') || findByType('point')[0];
      const pB = objects.find(
        (o) =>
          o.type === 'point' &&
          o !== pA &&
          (hasValOrDef('x(A)') || hasValOrDef('x(') || (o.coords && Math.abs(o.coords[1]) < 0.05))
      );

      const detected = [];
      if (pA) detected.push(formatObj(pA));
      if (pB) detected.push(formatObj(pB));

      if (pA && pB) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Both points detected: Point ${pA.name} and projected Point ${pB.name} at (${pB.coords[0]}, 0)! Drag A to watch B track its shadow on the x-axis.`,
          detected: detected.join('  •  ')
        };
      }
      if (pA && !pB) {
        return {
          verified: false,
          status: 'partial',
          message: `Point ${pA.name} detected (1/2 points)! Now create dependent point B = (x(${pA.name}), 0).`,
          detected: detected.join('  •  '),
          missing: `B = (x(${pA.name}), 0)`,
          suggestion: `Type B = (x(${pA.name}), 0) into the input bar.`
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Plot point A, then create B = (x(A), 0).',
        missing: 'Point A',
        suggestion: 'Type A = (3, 4) into the input bar.'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q12: Multi-plot: Points A = (1, 2), B = (4, 5), Vector(A, B)
    // ─────────────────────────────────────────────────────────────
    case 12: {
      const pA = findPointsNear(1, 2)[0] || findByName('A');
      const pB = findPointsNear(4, 5)[0] || findByName('B');
      const vec =
        findVectorsNear(3, 3)[0] ||
        findByType('vector')[0] ||
        objects.find((o) => hasCmd('vector'));

      const detected = [];
      if (pA) detected.push(formatObj(pA));
      if (pB) detected.push(formatObj(pB));
      if (vec) detected.push(formatObj(vec));

      if (vec) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Directed vector connecting Point A to Point B detected!`,
          detected: detected.join('  •  ')
        };
      }
      if (pA && pB) {
        return {
          verified: false,
          status: 'partial',
          message: `Both endpoints detected (2/2 points): A at (1, 2) and B at (4, 5)! Now type Vector(A, B).`,
          detected: detected.join('  •  '),
          missing: 'Vector(A, B)',
          suggestion: 'Type Vector(A, B) into the Input Bar.'
        };
      }
      if (pA || pB) {
        const found = pA || pB;
        const missing = pA ? 'B = (4, 5)' : 'A = (1, 2)';
        return {
          verified: false,
          status: 'partial',
          message: `Detected ${formatObj(found)} (1/2 points). Now plot ${missing}.`,
          detected: detected.join('  •  '),
          missing: missing,
          suggestion: `Type ${missing} into the Input Bar.`
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Plot A = (1, 2) and B = (4, 5), then enter Vector(A, B).',
        missing: 'Points A and B',
        suggestion: 'Type A = (1, 2).'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q13: Multi-plot: Vectors u = (3, 1), v = (1, 4), Resultant w = u + v = (4, 5)
    // ─────────────────────────────────────────────────────────────
    case 13: {
      const vecU = findVectorsNear(3, 1)[0] || findByName('u');
      const vecV = findVectorsNear(1, 4)[0] || findByName('v');
      const vecW =
        findVectorsNear(4, 5)[0] ||
        objects.find((o) => o.type === 'vector' && (hasValOrDef('u+v') || o.name === 'w'));

      const detected = [];
      if (vecU) detected.push(formatObj(vecU));
      if (vecV) detected.push(formatObj(vecV));
      if (vecW) detected.push(formatObj(vecW));

      if (vecW) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Resultant vector w = (4, 5) formed by u + v successfully computed and plotted!`,
          detected: detected.join('  •  ')
        };
      }
      if (vecU && vecV) {
        return {
          verified: false,
          status: 'partial',
          message: `Both vectors detected (2/2 vectors): u = (3, 1) and v = (1, 4)! Now enter w = u + v to display the resultant.`,
          detected: detected.join('  •  '),
          missing: 'w = u + v',
          suggestion: 'Type w = u + v into the Input Bar.'
        };
      }
      if (vecU || vecV) {
        const found = vecU || vecV;
        const missing = vecU ? 'v = (1, 4)' : 'u = (3, 1)';
        return {
          verified: false,
          status: 'partial',
          message: `Detected ${formatObj(found)} (1/2 vectors). Now enter ${missing}.`,
          detected: detected.join('  •  '),
          missing: missing,
          suggestion: `Type ${missing} into the Input Bar.`
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Enter u = (3, 1), v = (1, 4), then enter w = u + v.',
        missing: 'Vectors u and v',
        suggestion: 'Type u = (3, 1).'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q14: Multi-plot: Vector v = (2, 3), Scaled Vector w = 3*v = (6, 9)
    // ─────────────────────────────────────────────────────────────
    case 14: {
      const vecV = findVectorsNear(2, 3)[0] || findByName('v');
      const vecW =
        findVectorsNear(6, 9)[0] ||
        objects.find((o) => o.type === 'vector' && (hasValOrDef('3*v') || hasValOrDef('3v') || o.name === 'w'));

      const detected = [];
      if (vecV) detected.push(formatObj(vecV));
      if (vecW) detected.push(formatObj(vecW));

      if (vecW) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Scaled vector w = 3*v = (6, 9) detected, pointing in the same direction and 3 times longer!`,
          detected: detected.join('  •  ')
        };
      }
      if (vecV) {
        return {
          verified: false,
          status: 'partial',
          message: `Vector v = (2, 3) detected (1/2 vectors)! Now enter w = 3*v to scale it by 3.`,
          detected: detected.join('  •  '),
          missing: 'w = 3*v',
          suggestion: 'Type w = 3*v into the Input Bar.'
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Enter v = (2, 3), then enter w = 3*v.',
        missing: 'Vector v = (2, 3)',
        suggestion: 'Type v = (2, 3).'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q15: Multi-plot: u = (1, 2), v = (3, -1), Sliders c_1, c_2, w = c_1*u + c_2*v
    // ─────────────────────────────────────────────────────────────
    case 15: {
      const vecU = findVectorsNear(1, 2)[0] || findByName('u');
      const vecV = findVectorsNear(3, -1)[0] || findByName('v');
      const sliderC1 = findByName('c_1') || findByName('c1');
      const sliderC2 = findByName('c_2') || findByName('c2');
      const vecW = objects.find(
        (o) =>
          o.type === 'vector' &&
          (hasValOrDef('c_1') || hasValOrDef('c1') || isNear(o.coords, -1, 5) || o.name === 'w')
      );

      const detected = [];
      if (vecU) detected.push(formatObj(vecU));
      if (vecV) detected.push(formatObj(vecV));
      if (sliderC1) detected.push(`c_1 = ${sliderC1.numericValue ?? sliderC1.value}`);
      if (sliderC2) detected.push(`c_2 = ${sliderC2.numericValue ?? sliderC2.value}`);
      if (vecW) detected.push(formatObj(vecW));

      if (vecW) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Dynamic linear combination vector w = c_1*u + c_2*v successfully plotted!`,
          detected: detected.join('  •  ')
        };
      }
      if (vecU && vecV) {
        return {
          verified: false,
          status: 'partial',
          message: `Vectors u and v detected! Now create sliders c_1 = 2, c_2 = -1, and type w = c_1*u + c_2*v.`,
          detected: detected.join('  •  '),
          missing: 'w = c_1*u + c_2*v',
          suggestion: 'Type w = c_1*u + c_2*v into the input bar.'
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Enter u = (1, 2), v = (3, -1), then enter w = c_1*u + c_2*v.',
        missing: 'Vectors u and v',
        suggestion: 'Type u = (1, 2).'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q16: Vector u = (3, 4), Length(u) = 5
    // ─────────────────────────────────────────────────────────────
    case 16: {
      const vecU = findVectorsNear(3, 4)[0] || findByName('u');
      const lengthVal = objects.find(
        (o) => hasCmd('length') || o.numericValue === 5 || hasValOrDef('length(u)')
      );

      const detected = [];
      if (vecU) detected.push(formatObj(vecU));
      if (lengthVal) detected.push(`Length = ${lengthVal.numericValue ?? 5}`);

      if (lengthVal) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Vector norm (length) = 5 calculated!`,
          detected: detected.join('  •  ')
        };
      }
      if (vecU) {
        return {
          verified: false,
          status: 'partial',
          message: `Vector u = (3, 4) detected! Now type Length(u) to calculate its magnitude.`,
          detected: detected.join('  •  '),
          missing: 'Length(u)',
          suggestion: 'Type Length(u) into the input bar.'
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Enter u = (3, 4), then type Length(u).',
        missing: 'Vector u = (3, 4)',
        suggestion: 'Type u = (3, 4).'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q17: Multi-plot: Vector u = (3, 4), UnitVector(u) = (0.6, 0.8)
    // ─────────────────────────────────────────────────────────────
    case 17: {
      const vecU = findVectorsNear(3, 4)[0] || findByName('u');
      const unitVec =
        findVectorsNear(0.6, 0.8)[0] ||
        objects.find((o) => o.type === 'vector' && (hasCmd('unitvector') || hasValOrDef('unitvector')));

      const detected = [];
      if (vecU) detected.push(formatObj(vecU));
      if (unitVec) detected.push(formatObj(unitVec));

      if (unitVec) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Normalized unit vector (0.6, 0.8) with length 1 detected!`,
          detected: detected.join('  •  ')
        };
      }
      if (vecU) {
        return {
          verified: false,
          status: 'partial',
          message: `Vector u = (3, 4) detected! Now type UnitVector(u) to normalize it.`,
          detected: detected.join('  •  '),
          missing: 'UnitVector(u)',
          suggestion: 'Type UnitVector(u) into the Input Bar.'
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Enter u = (3, 4), then enter UnitVector(u).',
        missing: 'Vector u = (3, 4)',
        suggestion: 'Type u = (3, 4).'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q18: Multi-plot: Vectors u = (2, 3), v = (4, -1), Dot Product u * v = 5
    // ─────────────────────────────────────────────────────────────
    case 18: {
      const vecU = findVectorsNear(2, 3)[0] || findByName('u');
      const vecV = findVectorsNear(4, -1)[0] || findByName('v');
      const dotVal = objects.find(
        (o) => o.numericValue === 5 || hasValOrDef('u*v') || hasValOrDef('u v')
      );

      const detected = [];
      if (vecU) detected.push(formatObj(vecU));
      if (vecV) detected.push(formatObj(vecV));
      if (dotVal) detected.push(`Dot Product = ${dotVal.numericValue ?? 5}`);

      if (dotVal) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Scalar dot product u · v = 5 computed!`,
          detected: detected.join('  •  ')
        };
      }
      if (vecU && vecV) {
        return {
          verified: false,
          status: 'partial',
          message: `Both vectors detected: u = (2, 3) and v = (4, -1)! Now enter u * v to calculate the scalar dot product.`,
          detected: detected.join('  •  '),
          missing: 'u * v',
          suggestion: 'Type u * v into the Input Bar.'
        };
      }
      if (vecU || vecV) {
        const found = vecU || vecV;
        const missing = vecU ? 'v = (4, -1)' : 'u = (2, 3)';
        return {
          verified: false,
          status: 'partial',
          message: `Detected ${formatObj(found)} (1/2 vectors). Now enter ${missing}.`,
          detected: detected.join('  •  '),
          missing: missing,
          suggestion: `Type ${missing} into the Input Bar.`
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Enter u = (2, 3), v = (4, -1), then enter u * v.',
        missing: 'Vectors u and v',
        suggestion: 'Type u = (2, 3).'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q19: Multi-plot: Vector u = (3, 2), PerpendicularVector(u) = (-2, 3)
    // ─────────────────────────────────────────────────────────────
    case 19: {
      const vecU = findVectorsNear(3, 2)[0] || findByName('u');
      const perpVec =
        findVectorsNear(-2, 3)[0] ||
        objects.find((o) => o.type === 'vector' && hasCmd('perpendicularvector'));

      const detected = [];
      if (vecU) detected.push(formatObj(vecU));
      if (perpVec) detected.push(formatObj(perpVec));

      if (perpVec) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Orthogonal vector (-2, 3) rotated 90° counterclockwise detected!`,
          detected: detected.join('  •  ')
        };
      }
      if (vecU) {
        return {
          verified: false,
          status: 'partial',
          message: `Vector u = (3, 2) detected! Now type PerpendicularVector(u).`,
          detected: detected.join('  •  '),
          missing: 'PerpendicularVector(u)',
          suggestion: 'Type PerpendicularVector(u) into the Input Bar.'
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Enter u = (3, 2), then enter PerpendicularVector(u).',
        missing: 'Vector u = (3, 2)',
        suggestion: 'Type u = (3, 2).'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q20: Multi-plot: Vectors u = (4, 1), v = (2, 3), Angle(u, v)
    // ─────────────────────────────────────────────────────────────
    case 20: {
      const vecU = findVectorsNear(4, 1)[0] || findByName('u');
      const vecV = findVectorsNear(2, 3)[0] || findByName('v');
      const angleObj = objects.find((o) => o.type === 'angle' || hasCmd('angle'));

      const detected = [];
      if (vecU) detected.push(formatObj(vecU));
      if (vecV) detected.push(formatObj(vecV));
      if (angleObj) detected.push(`Angle ${angleObj.name} = ${angleObj.value || ''}`);

      if (angleObj) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Geometric angle θ between vectors u and v successfully plotted!`,
          detected: detected.join('  •  ')
        };
      }
      if (vecU && vecV) {
        return {
          verified: false,
          status: 'partial',
          message: `Both vectors detected: u = (4, 1) and v = (2, 3)! Now enter Angle(u, v).`,
          detected: detected.join('  •  '),
          missing: 'Angle(u, v)',
          suggestion: 'Type Angle(u, v) into the Input Bar.'
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Enter u = (4, 1), v = (2, 3), then enter Angle(u, v).',
        missing: 'Vectors u and v',
        suggestion: 'Type u = (4, 1).'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q21: 3D Point P = (2, 3, 5)
    // ─────────────────────────────────────────────────────────────
    case 21: {
      const pt3D =
        findPointsNear(2, 3, 5)[0] ||
        objects.find((o) => isNear(o.coords, 2, 3, 5)) ||
        findByName('P');

      if (pt3D) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 3D Point P at (2, 3, 5) successfully plotted in 3D coordinate space!`,
          detected: `Point P = (2, 3, 5)`
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Type P = (2, 3, 5) into the Input Bar.',
        missing: 'P = (2, 3, 5)',
        suggestion: 'Type P = (2, 3, 5) in the input bar.'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q22: Multi-plot: 3D Point P = (2, 3, 5), z(P) = 5
    // ─────────────────────────────────────────────────────────────
    case 22: {
      const ptP = findPointsNear(2, 3, 5)[0] || findByName('P');
      const zVal = objects.find(
        (o) => hasValOrDef('z(P)') || o.numericValue === 5 || o.value?.includes('z(P)')
      );

      const detected = [];
      if (ptP) detected.push(`Point P = (2, 3, 5)`);
      if (zVal) detected.push(`z(P) = ${zVal.numericValue ?? 5}`);

      if (zVal) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Vertical z-coordinate extracted as scalar value 5!`,
          detected: detected.join('  •  ')
        };
      }
      if (ptP) {
        return {
          verified: false,
          status: 'partial',
          message: `3D Point P detected! Now enter z(P) to extract its z-coordinate.`,
          detected: detected.join('  •  '),
          missing: 'z(P)',
          suggestion: 'Type z(P) into the Input Bar.'
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Enter P = (2, 3, 5), then enter z(P).',
        missing: 'Point P = (2, 3, 5)',
        suggestion: 'Type P = (2, 3, 5).'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q23: Multi-plot: 3D Points A = (1, 2, 3), B = (4, 6, 8), Line(A, B)
    // ─────────────────────────────────────────────────────────────
    case 23: {
      const pA = findPointsNear(1, 2, 3)[0] || findByName('A');
      const pB = findPointsNear(4, 6, 8)[0] || findByName('B');
      const line3D = findByType('line')[0] || objects.find((o) => hasCmd('line'));

      const detected = [];
      if (pA) detected.push(`Point A = (1, 2, 3)`);
      if (pB) detected.push(`Point B = (4, 6, 8)`);
      if (line3D) detected.push(`3D Line ${line3D.name}`);

      if (line3D) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 3D Line passing through both points constructed across 3D space!`,
          detected: detected.join('  •  ')
        };
      }
      if (pA && pB) {
        return {
          verified: false,
          status: 'partial',
          message: `Both 3D points detected: A at (1, 2, 3) and B at (4, 6, 8)! Now enter Line(A, B).`,
          detected: detected.join('  •  '),
          missing: 'Line(A, B)',
          suggestion: 'Type Line(A, B) into the Input Bar.'
        };
      }
      if (pA || pB) {
        const found = pA ? 'A = (1, 2, 3)' : 'B = (4, 6, 8)';
        const missing = pA ? 'B = (4, 6, 8)' : 'A = (1, 2, 3)';
        return {
          verified: false,
          status: 'partial',
          message: `Detected 3D Point ${found} (1/2 points). Now plot ${missing}.`,
          detected: detected.join('  •  '),
          missing: missing,
          suggestion: `Type ${missing} into the Input Bar.`
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Plot A = (1, 2, 3) and B = (4, 6, 8), then enter Line(A, B).',
        missing: '3D Points A and B',
        suggestion: 'Type A = (1, 2, 3).'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q24: Multi-plot: 3D Points A = (1, 0, 0), B = (0, 1, 0), C = (0, 0, 1), Plane(A, B, C)
    // ─────────────────────────────────────────────────────────────
    case 24: {
      const pA = findPointsNear(1, 0, 0)[0] || findByName('A');
      const pB = findPointsNear(0, 1, 0)[0] || findByName('B');
      const pC = findPointsNear(0, 0, 1)[0] || findByName('C');
      const plane = findByType('plane')[0] || objects.find((o) => hasCmd('plane'));

      const detected = [];
      if (pA) detected.push(`Point A = (1, 0, 0)`);
      if (pB) detected.push(`Point B = (0, 1, 0)`);
      if (pC) detected.push(`Point C = (0, 0, 1)`);
      if (plane) detected.push(`Plane ${plane.name}`);

      if (plane) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 3D Plane passing through points A, B, and C constructed!`,
          detected: detected.join('  •  ')
        };
      }
      const ptsCount = [pA, pB, pC].filter(Boolean).length;
      if (ptsCount === 3) {
        return {
          verified: false,
          status: 'partial',
          message: `All 3 points detected (3/3 points)! Now type Plane(A, B, C) to create the flat surface.`,
          detected: detected.join('  •  '),
          missing: 'Plane(A, B, C)',
          suggestion: 'Type Plane(A, B, C) into the Input Bar.'
        };
      }
      if (ptsCount > 0) {
        return {
          verified: false,
          status: 'partial',
          message: `Detected ${ptsCount}/3 points in 3D space.`,
          detected: detected.join('  •  '),
          missing: 'Remaining 3D points',
          suggestion: 'Ensure A = (1, 0, 0), B = (0, 1, 0), C = (0, 0, 1) are all plotted.'
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Plot A = (1, 0, 0), B = (0, 1, 0), C = (0, 0, 1), then enter Plane(A, B, C).',
        missing: 'Points A, B, C',
        suggestion: 'Type A = (1, 0, 0).'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q25: Multi-plot: Point P = (1, 2, 3), Vector v = (0, 0, 1), PerpendicularPlane(P, v)
    // ─────────────────────────────────────────────────────────────
    case 25: {
      const ptP = findPointsNear(1, 2, 3)[0] || findByName('P');
      const vecV = findVectorsNear(0, 0, 1)[0] || findByName('v');
      const perpPlane =
        findByType('plane')[0] || objects.find((o) => hasCmd('perpendicularplane'));

      const detected = [];
      if (ptP) detected.push(`Point P = (1, 2, 3)`);
      if (vecV) detected.push(`Vector v = (0, 0, 1)`);
      if (perpPlane) detected.push(`PerpendicularPlane ${perpPlane.name}`);

      if (perpPlane) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Plane perpendicular to normal vector v passing through Point P constructed!`,
          detected: detected.join('  •  ')
        };
      }
      if (ptP && vecV) {
        return {
          verified: false,
          status: 'partial',
          message: `Point P and normal vector v detected! Now type PerpendicularPlane(P, v).`,
          detected: detected.join('  •  '),
          missing: 'PerpendicularPlane(P, v)',
          suggestion: 'Type PerpendicularPlane(P, v) into the Input Bar.'
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Enter P = (1, 2, 3), v = (0, 0, 1), then enter PerpendicularPlane(P, v).',
        missing: 'Point P and Vector v',
        suggestion: 'Type P = (1, 2, 3).'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q26: Multi-plot: 3D Points A = (1, 2, 3), B = (4, 6, 3), Distance(A, B) = 5
    // ─────────────────────────────────────────────────────────────
    case 26: {
      const pA = findPointsNear(1, 2, 3)[0] || findByName('A');
      const pB = findPointsNear(4, 6, 3)[0] || findByName('B');
      const distVal = objects.find(
        (o) => hasCmd('distance') || o.numericValue === 5 || hasValOrDef('distance(A, B)')
      );

      const detected = [];
      if (pA) detected.push(`Point A = (1, 2, 3)`);
      if (pB) detected.push(`Point B = (4, 6, 3)`);
      if (distVal) detected.push(`Distance = ${distVal.numericValue ?? 5}`);

      if (distVal) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Euclidean distance between points A and B calculated as 5!`,
          detected: detected.join('  •  ')
        };
      }
      if (pA && pB) {
        return {
          verified: false,
          status: 'partial',
          message: `Both 3D points detected: A at (1, 2, 3) and B at (4, 6, 3)! Now enter Distance(A, B).`,
          detected: detected.join('  •  '),
          missing: 'Distance(A, B)',
          suggestion: 'Type Distance(A, B) into the Input Bar.'
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Enter A = (1, 2, 3), B = (4, 6, 3), then enter Distance(A, B).',
        missing: 'Points A and B',
        suggestion: 'Type A = (1, 2, 3).'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q27: Multi-plot: Line l, Plane p, Intersect(l, p) = (2, 2, 2)
    // ─────────────────────────────────────────────────────────────
    case 27: {
      const line = findByType('line')[0] || findByName('l');
      const plane = findByType('plane')[0] || findByName('p');
      const piercePt =
        findPointsNear(2, 2, 2)[0] ||
        objects.find((o) => o.type === 'point' && hasCmd('intersect'));

      const detected = [];
      if (line) detected.push(`Line ${line.name}`);
      if (plane) detected.push(`Plane ${plane.name}`);
      if (piercePt) detected.push(`Pierce Point = (${piercePt.coords.join(', ')})`);

      if (piercePt) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 3D pierce point where line pierces plane detected!`,
          detected: detected.join('  •  ')
        };
      }
      if (line && plane) {
        return {
          verified: false,
          status: 'partial',
          message: `Both line and plane detected! Now type Intersect(l, p).`,
          detected: detected.join('  •  '),
          missing: 'Intersect(l, p)',
          suggestion: 'Type Intersect(l, p) into the Input Bar.'
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Create line l and plane p, then enter Intersect(l, p).',
        missing: 'Line l and Plane p',
        suggestion: 'Type l = Line((0, 0, 0), (1, 1, 1)).'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q28: Multi-plot: Planes p1, p2, Intersect(p1, p2)
    // ─────────────────────────────────────────────────────────────
    case 28: {
      const planes = findByType('plane');
      const intersectLine = findByType('line')[0] || objects.find((o) => hasCmd('intersect'));

      const detected = [];
      planes.forEach((p) => detected.push(`Plane ${p.name}`));
      if (intersectLine) detected.push(`Intersection Line ${intersectLine.name}`);

      if (intersectLine) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Line of intersection between planes p1 and p2 constructed!`,
          detected: detected.join('  •  ')
        };
      }
      if (planes.length >= 2) {
        return {
          verified: false,
          status: 'partial',
          message: `Both planes detected (2/2 planes)! Now type Intersect(p1, p2) to find their line of intersection.`,
          detected: detected.join('  •  '),
          missing: 'Intersect(p1, p2)',
          suggestion: 'Type Intersect(p1, p2) into the Input Bar.'
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Enter p1: x + y + z = 1 and p2: z = 0, then enter Intersect(p1, p2).',
        missing: 'Planes p1 and p2',
        suggestion: 'Type x + y + z = 1.'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q29: Matrix M = {{1, 2}, {3, 4}}
    // ─────────────────────────────────────────────────────────────
    case 29: {
      const mat = objects.find(
        (o) => hasValOrDef('{{1,2},{3,4}}') || hasValOrDef('{{1, 2}, {3, 4}}') || o.name === 'M'
      );
      if (mat) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 2 × 2 Matrix M = {{1, 2}, {3, 4}} entered successfully in GeoGebra matrix syntax!`,
          detected: `Matrix M = {{1, 2}, {3, 4}}`
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Type M = {{1, 2}, {3, 4}} into the Input Bar.',
        missing: 'M = {{1, 2}, {3, 4}}',
        suggestion: 'Type M = {{1, 2}, {3, 4}} into the input bar.'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q30: Multi-plot: Matrix M = {{0, -1}, {1, 0}}, Vector v = (2, 1), w = M * v = (-1, 2)
    // ─────────────────────────────────────────────────────────────
    case 30: {
      const mat = objects.find((o) => hasValOrDef('{{0,-1},{1,0}}') || o.name === 'M');
      const vecV = findVectorsNear(2, 1)[0] || findByName('v');
      const vecW =
        findVectorsNear(-1, 2)[0] ||
        objects.find((o) => o.type === 'vector' && (hasValOrDef('M*v') || hasValOrDef('M v') || o.name === 'w'));

      const detected = [];
      if (mat) detected.push(`Matrix M = {{0, -1}, {1, 0}}`);
      if (vecV) detected.push(formatObj(vecV));
      if (vecW) detected.push(formatObj(vecW));

      if (vecW) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Transformed image vector w = M * v = (-1, 2) rotated 90° counterclockwise plotted!`,
          detected: detected.join('  •  ')
        };
      }
      if (mat && vecV) {
        return {
          verified: false,
          status: 'partial',
          message: `Matrix M and Vector v detected! Now enter w = M * v to apply the linear map.`,
          detected: detected.join('  •  '),
          missing: 'w = M * v',
          suggestion: 'Type w = M * v into the Input Bar.'
        };
      }
      if (mat || vecV) {
        const found = mat ? 'Matrix M' : 'Vector v = (2, 1)';
        const missing = mat ? 'v = (2, 1)' : 'M = {{0, -1}, {1, 0}}';
        return {
          verified: false,
          status: 'partial',
          message: `Detected ${found}. Now enter ${missing}.`,
          detected: detected.join('  •  '),
          missing: missing,
          suggestion: `Type ${missing} into the Input Bar.`
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Enter M = {{0, -1}, {1, 0}}, v = (2, 1), then enter w = M * v.',
        missing: 'Matrix M and Vector v',
        suggestion: 'Type M = {{0, -1}, {1, 0}}.'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q31: Multi-plot: Matrix A = {{1, 2, 3}, {4, 5, 6}}, Transpose(A)
    // ─────────────────────────────────────────────────────────────
    case 31: {
      const mat = objects.find((o) => hasValOrDef('{{1,2,3},{4,5,6}}') || o.name === 'A');
      const transp = objects.find(
        (o) => hasCmd('transpose') || hasValOrDef('{{1,4},{2,5},{3,6}}')
      );

      const detected = [];
      if (mat) detected.push(`Matrix A = {{1, 2, 3}, {4, 5, 6}}`);
      if (transp) detected.push(`Transpose(A)`);

      if (transp) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 3 × 2 Transposed matrix Transpose(A) calculated!`,
          detected: detected.join('  •  ')
        };
      }
      if (mat) {
        return {
          verified: false,
          status: 'partial',
          message: `Matrix A detected! Now type Transpose(A) to swap rows and columns.`,
          detected: detected.join('  •  '),
          missing: 'Transpose(A)',
          suggestion: 'Type Transpose(A) into the Input Bar.'
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Enter A = {{1, 2, 3}, {4, 5, 6}}, then type Transpose(A).',
        missing: 'Matrix A',
        suggestion: 'Type A = {{1, 2, 3}, {4, 5, 6}}.'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q32: Multi-plot: Matrix M = {{2, 4}, {1, 2}}, Determinant(M) = 0
    // ─────────────────────────────────────────────────────────────
    case 32: {
      const mat = objects.find((o) => hasValOrDef('{{2,4},{1,2}}') || o.name === 'M');
      const detVal = objects.find(
        (o) => hasCmd('determinant') || o.numericValue === 0 || hasValOrDef('determinant(M)')
      );

      const detected = [];
      if (mat) detected.push(`Matrix M = {{2, 4}, {1, 2}}`);
      if (detVal) detected.push(`Determinant(M) = 0`);

      if (detVal) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Determinant = 0 calculated! The matrix is singular (non-invertible).`,
          detected: detected.join('  •  ')
        };
      }
      if (mat) {
        return {
          verified: false,
          status: 'partial',
          message: `Matrix M detected! Now enter Determinant(M) to calculate its scalar determinant.`,
          detected: detected.join('  •  '),
          missing: 'Determinant(M)',
          suggestion: 'Type Determinant(M) into the Input Bar.'
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Enter M = {{2, 4}, {1, 2}}, then enter Determinant(M).',
        missing: 'Matrix M',
        suggestion: 'Type M = {{2, 4}, {1, 2}}.'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Q33: Multi-plot: Matrix A = {{1, 2}, {3, 5}}, Invert(A)
    // ─────────────────────────────────────────────────────────────
    case 33: {
      const mat = objects.find((o) => hasValOrDef('{{1,2},{3,5}}') || o.name === 'A');
      const invMat = objects.find((o) => hasCmd('invert') || hasValOrDef('invert(A)'));

      const detected = [];
      if (mat) detected.push(`Matrix A = {{1, 2}, {3, 5}}`);
      if (invMat) detected.push(`Invert(A)`);

      if (invMat) {
        return {
          verified: true,
          status: 'success',
          message: `🎉 Inverse matrix Invert(A) successfully calculated!`,
          detected: detected.join('  •  ')
        };
      }
      if (mat) {
        return {
          verified: false,
          status: 'partial',
          message: `Matrix A detected! Now type Invert(A) to find its inverse.`,
          detected: detected.join('  •  '),
          missing: 'Invert(A)',
          suggestion: 'Type Invert(A) into the Input Bar.'
        };
      }
      return {
        verified: false,
        status: 'partial',
        message: 'Enter A = {{1, 2}, {3, 5}}, then enter Invert(A).',
        missing: 'Matrix A',
        suggestion: 'Type A = {{1, 2}, {3, 5}}.'
      };
    }

    // ─────────────────────────────────────────────────────────────
    // Default fallback: Summarizes ALL detected objects on canvas
    // ─────────────────────────────────────────────────────────────
    default: {
      if (count > 0) {
        const detectedSummaries = objects.map(formatObj);
        return {
          verified: true,
          status: 'success',
          message: `Detected ${count} active object${count > 1 ? 's' : ''} on your GeoGebra board.`,
          detected: detectedSummaries.join('  •  ')
        };
      }
      return {
        verified: false,
        status: 'empty',
        message: 'No construction on board yet. Enter the command in GeoGebra to experiment.'
      };
    }
  }
}
