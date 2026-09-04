const fs = require('fs');

if (fs.existsSync('client/src/components/HintSystem/useHints.jsx')) fs.unlinkSync('client/src/components/HintSystem/useHints.jsx');
if (fs.existsSync('client/src/components/HintSystem/HintModal.jsx')) fs.unlinkSync('client/src/components/HintSystem/HintModal.jsx');

const execSync = require('child_process').execSync;
execSync('git restore client/src/App.jsx');

let code = fs.readFileSync('client/src/App.jsx', 'utf8');

const s1 = code.indexOf('function ProgressiveHintPanel');
const e1 = code.indexOf('\nfunction useQuizHintsAndXp');
let panelCodeRaw = code.slice(s1, e1);

panelCodeRaw = panelCodeRaw.replace(/<span style=\{\{ fontSize: '1.1rem' \}\}>💡<\/span>/g, '');
panelCodeRaw = panelCodeRaw.replace(/<span style=\{\{ fontSize: '1.3rem' \}\}>💡<\/span> Hint Dashboard/g, 'Hint Dashboard');
panelCodeRaw = panelCodeRaw.replace(/<span>⚠️ \{errorMsg\}<\/span>/g, '<span>{errorMsg}</span>');
panelCodeRaw = panelCodeRaw.replace(/function ProgressiveHintPanel/g, 'export function HintModal');

const s2 = code.indexOf('function useQuizHintsAndXp');
const e2 = code.indexOf('\nfunction XpSummaryCard');
let hookCodeRaw = code.slice(s2, e2);
hookCodeRaw = hookCodeRaw.replace('function useQuizHintsAndXp', 'export function useQuizHintsAndXp');

const hintModalJsx = `import React, { useState, useEffect } from 'react';
import { API, getLocalXp, setLocalXp, changeXp, splitSvgHints, renderSvgBlock } from '../../App.jsx';

` + panelCodeRaw;

const useHintsJsx = `import { useState, useEffect, useRef } from 'react';
import { API, setLocalXp } from '../../App.jsx';

` + hookCodeRaw;

if (!fs.existsSync('client/src/components/HintSystem')) fs.mkdirSync('client/src/components/HintSystem', {recursive: true});
fs.writeFileSync('client/src/components/HintSystem/HintModal.jsx', hintModalJsx);
fs.writeFileSync('client/src/components/HintSystem/useHints.jsx', useHintsJsx);

// Slice FIRST before replacing anything in App.jsx to preserve indices
code = code.slice(0, s1) + code.slice(e2);

// THEN replace the exports and usages
code = code.replace('const API =', 'export const API =');
code = code.replace('function getLocalXp(', 'export function getLocalXp(');
code = code.replace('function setLocalXp(', 'export function setLocalXp(');
code = code.replace('function changeXp(', 'export function changeXp(');
code = code.replace('function splitSvgHints(', 'export function splitSvgHints(');
code = code.replace('function renderSvgBlock(', 'export function renderSvgBlock(');

const importStmt = `import { HintModal } from './components/HintSystem/HintModal.jsx';\nimport { useQuizHintsAndXp } from './components/HintSystem/useHints.jsx';\n`;
code = code.replace("import { useEffect, useState, useRef, useMemo } from 'react'", importStmt + "import { useEffect, useState, useRef, useMemo } from 'react'");

code = code.replace(/<ProgressiveHintPanel/g, '<HintModal');

fs.writeFileSync('client/src/App.jsx', code);
console.log('Extraction complete');
