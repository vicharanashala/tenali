/**
 * useProctor — Hook to access proctor context.
 */

import { useContext } from 'react'
import ProctorContext from './ProctorContext'

export default function useProctor() {
  const ctx = useContext(ProctorContext)
  if (!ctx) throw new Error('useProctor must be used within ProctorProvider')
  return ctx
}
