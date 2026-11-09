import React from 'react'
import QFormulaConceptApp from '../../lib/concept/QFormulaConceptApp.jsx'
import SimulConceptApp from '../../lib/simul-concept/SimulConceptApp.jsx'

export function QFormulaConceptMode({
  onBack,
  AuthGate,
  QFormulaApp
}) {
  return (
    <AuthGate>
      <QFormulaConceptApp
        onBack={onBack}
        QFormulaApp={QFormulaApp}
      />
    </AuthGate>
  )
}

export function SimulConceptMode({
  onBack,
  AuthGate,
  SimulApp
}) {
  return (
    <AuthGate>
      <SimulConceptApp
        onBack={onBack}
        SimulQuizApp={SimulApp}
      />
    </AuthGate>
  )
}