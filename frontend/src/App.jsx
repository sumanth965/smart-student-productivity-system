import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import './App.css'
import './output.css'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dasboard'
import DeadlineReminder from './pages/Deadlinereminder'
import AIModule from './pages/Aimodule '


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/deadline" element={<DeadlineReminder />} />
        <Route path="/ai" element={<AIModule />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
