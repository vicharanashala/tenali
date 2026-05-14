import { Routes, Route } from 'react-router-dom'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<h1 className="text-6xl font-display text-teal-400">Hello Tenali</h1>} />
    </Routes>
  )
}