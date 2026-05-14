import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <AppRoutes />
      </div>
    </BrowserRouter>
  )
}