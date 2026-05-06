import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PartnerProvider } from './context/PartnerContext'
import { DataProvider } from './context/DataContext'
import { CoupleProvider } from './context/CoupleContext'
import { ThemeProvider } from './context/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/layout/Layout'
import LandingPage from './pages/LandingPage'
import IntroPage from './pages/IntroPage'
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/LoginPage'
import SurprisePage from './pages/SurprisePage'
import ProfilePage from './pages/ProfilePage'
import PairingPage from './pages/PairingPage'
import NewPlanPage from './pages/NewPlanPage'
import NewTodoPage from './pages/NewTodoPage'
import ExpensesPage from './pages/ExpensesPage'
import SettingsPage from './pages/SettingsPage'
import MoodPage from './pages/MoodPage'
import TimelinePage from './pages/TimelinePage'

// Giriş yapmış → LandingPage (dashboard), yapmamış → IntroPage (tanıtım)
function HomePage() {
  const { currentUser, loading } = useAuth()
  if (loading) return null
  return currentUser ? <LandingPage /> : <IntroPage />
}

function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <PartnerProvider>
          <CoupleProvider>
            <DataProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/intro" element={<IntroPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/surprise" element={<SurprisePage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/pairing" element={<PairingPage />} />
                  <Route path="/new-plan" element={<NewPlanPage />} />
                  <Route path="/new-todo" element={<NewTodoPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/mood" element={<MoodPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Routes>
            </DataProvider>
          </CoupleProvider>
        </PartnerProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
