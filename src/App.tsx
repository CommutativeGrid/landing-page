import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CoursesPage from './pages/CoursesPage'
import CPDViewerPage from './pages/CPDViewerPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/cpd-viewer" element={<CPDViewerPage />} />
    </Routes>
  )
}

export default App
