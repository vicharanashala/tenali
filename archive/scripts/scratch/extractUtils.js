const fs = require('fs');
let code = fs.readFileSync('client/src/App.jsx', 'utf8');

// The things to extract
const thingsToExtract = [
  'export const API = import.meta.env.VITE_API_BASE_URL || \'\';',
  'const XP_TOKEN_KEY = \'tenali-xp\';',
];

const start1 = code.indexOf('export function getLocalXp(');
const end1 = code.indexOf('export function changeXp(');
const end2 = code.indexOf('function useTimer(', end1);

const xpFns = code.slice(start1, end2);

const start3 = code.indexOf('export function splitSvgHints(');
const end3 = code.indexOf('// ─── Number Pad Component ───────────────────────────────────────────────────');
const svgFns = code.slice(start3, end3);

const utilsContent = `import React from 'react';

export const API = import.meta.env.VITE_API_BASE_URL || '';

const XP_TOKEN_KEY = 'tenali-xp';

${xpFns}

${svgFns}
`;

fs.writeFileSync('client/src/utils.js', utilsContent);

// Remove them from App.jsx
code = code.replace('export const API = import.meta.env.VITE_API_BASE_URL || \'\';', '');
code = code.replace('const XP_TOKEN_KEY = \'tenali-xp\';', '');
code = code.replace(xpFns, '');
code = code.replace(svgFns, '');

// Prepend import to App.jsx
const importStmt = `import { API, getLocalXp, setLocalXp, changeXp, splitSvgHints, renderSvgBlock } from './utils';\n`;
code = code.replace("import { useEffect, useState, useRef, useMemo } from 'react'", importStmt + "import { useEffect, useState, useRef, useMemo } from 'react'");

fs.writeFileSync('client/src/App.jsx', code);
console.log('Utils extracted!');
