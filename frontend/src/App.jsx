import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import './App.css'
import './output.css'
import Dashboard from './pages/Dasboard'
import DeadlineReminder from './pages/Deadlinereminder'
import AIModule from './pages/Aimodule'
import AdminTeacher from './pages/AdminTeacher'
import Tasks from './pages/Tasks'
import CalendarPage from './pages/Calendar'
import { ThemeProvider } from './contexts/ThemeContext'


function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* <Route path="/register" element={<AnimatedSection><RegisterPage /></AnimatedSection>} /> */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/deadline" element={<DeadlineReminder />} />
          <Route path="/ai" element={<AIModule />} />
          <Route path="/admin" element={<AdminTeacher />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
