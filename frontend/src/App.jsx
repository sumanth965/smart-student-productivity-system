import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import './App.css'
import './output.css'
import Dashboard from './pages/Dasboard'
import DeadlineReminder from './pages/Deadlinereminder'
import AIModule from './pages/Aimodule '
import AdminTeacher from './pages/AdminTeacher'
import Tasks from './pages/Tasks'
import CalendarPage from './pages/Calendar'
import { ThemeProvider } from './contexts/ThemeContext'
import AnimatedSection from './components/AnimatedSection'


function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AnimatedSection><LandingPage /></AnimatedSection>} />
          <Route path="/login" element={<AnimatedSection><LoginPage /></AnimatedSection>} />
          {/* <Route path="/register" element={<AnimatedSection><RegisterPage /></AnimatedSection>} /> */}
          <Route path="/dashboard" element={<AnimatedSection><Dashboard /></AnimatedSection>} />
          <Route path="/tasks" element={<AnimatedSection><Tasks /></AnimatedSection>} />
          <Route path="/calendar" element={<AnimatedSection><CalendarPage /></AnimatedSection>} />
          <Route path="/deadline" element={<AnimatedSection><DeadlineReminder /></AnimatedSection>} />
          <Route path="/ai" element={<AnimatedSection><AIModule /></AnimatedSection>} />
          <Route path="/admin" element={<AnimatedSection><AdminTeacher /></AnimatedSection>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
