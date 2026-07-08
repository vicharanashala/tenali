export function getPromptForType(type, q) {
  if (!q) return 'Loading…'
  const sup = (n) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('')

  switch (type) {
    case 'basicarith': case 'addition': return `${q.prompt} = ?`
    case 'quadratic': return `${q.prompt}`
    case 'multiply': return `${q.prompt} = ?`
    case 'sqrt': return `${q.prompt} = ?`
    case 'funceval': return `${q.formula}, evaluate at ${Object.entries(q.vars).map(([k,v]) => `${k} = ${v}`).join(', ')}`
    case 'polymul': return q.p1Display && q.p2Display ? `Expand: (${q.p1Display})(${q.p2Display})` : null
    case 'polyfactor': return q.display ? `Factorise: ${q.display}` : null
    case 'primefactor': return `Find all prime factors of ${q.number}`
    case 'qformula': return `Find the roots of ${q.a}x² ${q.b >= 0 ? '+' : '−'} ${Math.abs(q.b)}x ${q.c >= 0 ? '+' : '−'} ${Math.abs(q.c)} = 0`
    case 'simul': {
      if (!q.eqs) return null
      const fmtEq = (eq) => {
        const parts = []
        if (eq.a) parts.push(`${eq.a === 1 ? '' : eq.a === -1 ? '-' : eq.a}x`)
        if (eq.b) parts.push(`${eq.b > 0 && parts.length ? '+' : ''}${eq.b === 1 ? '' : eq.b === -1 ? '-' : eq.b}y`)
        if (eq.c) parts.push(`${eq.c > 0 && parts.length ? '+' : ''}${eq.c === 1 ? '' : eq.c === -1 ? '-' : eq.c}z`)
        return `${parts.join(' ')} = ${eq.d}`
      }
      return `Solve:\n${q.eqs.map(fmtEq).join('\n')}`
    }
    case 'lineq': return `Find slope (m) and intercept (c) for the line through (${q.x1}, ${q.y1}) and (${q.x2}, ${q.y2})`
    case 'gk': return q.question
    case 'vocab': return `What does "${q.question}" mean?`
    case 'fractionadd': return q.mixed ? `${q.w1} ${q.n1}/${q.d1} + ${q.w2} ${q.n2}/${q.d2} = ?` : `${q.n1}/${q.d1} + ${q.n2}/${q.d2} = ?`
    case 'surds': {
      if (q.type === 'simplify') return `Simplify √${q.n}`
      if (q.type === 'addsub') { const aS = q.a === 1 ? '√'+q.r : q.a+'√'+q.r; const bS = q.b === 1 ? '√'+q.r : q.b+'√'+q.r; return `${aS} ${q.op} ${bS} = ?` }
      if (q.type === 'multiply') { const p1 = q.c1 === 1 ? '√'+q.r1 : q.c1+'√'+q.r1; const p2 = q.c2 === 1 ? '√'+q.r2 : q.c2+'√'+q.r2; return `${p1} × ${p2} = ?` }
      if (q.type === 'rationalise' && q.subtype === 'simple') { const d = q.b===1 ? '√'+q.r : q.b+'√'+q.r; return `Rationalise: ${q.a} / (${d})` }
      if (q.type === 'rationalise' && q.subtype === 'conjugate') { const sg = q.q>0?'+':''; const qS = Math.abs(q.q)===1?(q.q>0?'':'-'):String(q.q); return `Rationalise: ${q.a} / (${q.p}${sg}${qS}√${q.r})` }
      return ''
    }
    case 'indices': return q.prompt ? `${q.prompt} = ?` : ''
    case 'sequences': return q.prompt || ''
    case 'ratio': return q.prompt || ''
    case 'percent': return q.prompt || ''
    case 'sets': return q.prompt || ''
    case 'trig': case 'ineq': case 'coordgeom': case 'prob': case 'stats':
    case 'matrix': case 'vectors': case 'dotprod': case 'transform': case 'mensur':
    case 'bearings': case 'log': case 'diff': case 'bases': case 'circleth':
    case 'integ': case 'stdform': case 'bounds': case 'sdt': case 'variation':
    case 'hcflcm': case 'profitloss': case 'rounding': case 'binomial': case 'complex':
    case 'angles': case 'triangles': case 'congruence': case 'pythag': case 'polygons': case 'similarity':
    case 'squaring': case 'lineareq': case 'decimals': case 'permcomb': case 'limits': case 'invtrig':
    case 'remfactor': case 'heron': case 'shares': case 'banking': case 'gst': case 'section':
    case 'linprog': case 'circmeasure': case 'conics': case 'diffeq': case 'tatsavit':
      return q.prompt || q.question || JSON.stringify(q)
    default: return JSON.stringify(q)
  }
}
