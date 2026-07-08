import React from 'react';
import { Mafs, Coordinates, Text, useMovablePoint } from "mafs";
import "mafs/core.css";

export default function GCDVisualizer({ question }) {
  // Try to parse the two numbers from the question prompt
  // e.g. "What is gcd(48, 18)?" or "HCF of 48 and 18"
  // Default to 48 and 18 if we can't parse
  let defaultA = 48;
  let defaultB = 18;

  if (question && question.prompt) {
    const nums = question.prompt.match(/\d+/g);
    if (nums && nums.length >= 2) {
      defaultA = parseInt(nums[0], 10);
      defaultB = parseInt(nums[1], 10);
    }
  }

  const pointA = useMovablePoint([defaultA, 0]);
  const pointB = useMovablePoint([defaultB, 0]);
  
  const a = Math.abs(Math.round(pointA.point[0]));
  const b = Math.abs(Math.round(pointB.point[0]));
  const gcd = computeGCD(a, b);

  return (
    <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Mafs height={250} viewBox={{ x: [-5, Math.max(a, b) + 10], y: [-3, 5] }}>
        <Coordinates.Cartesian />
        {pointA.element}
        {pointB.element}
        <Text x={Math.max(a, b) / 2} y={3} size={24}>GCD({a}, {b}) = {gcd}</Text>
      </Mafs>
      <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px' }}>
        <em>Drag the points to explore how the GCD changes.</em>
      </div>
    </div>
  );
}

function computeGCD(a, b) {
  if (a === 0) return b;
  if (b === 0) return a;
  while (b !== 0) {
    let temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}
