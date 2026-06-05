import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { PresenceProvider } from './context/PresenceContext'
import Layout from './components/Layout'
import ThemePicker from './components/ThemePicker'
import BetaBadge from './components/BetaBadge'
import BackgroundSettings from './components/BackgroundSettings'
import FavoriteSongUpdateModal from './components/FavoriteSongUpdateModal'
import PresenceUpdateModal from './components/PresenceUpdateModal'
import Seo from './components/Seo'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DiscoverPage from './pages/DiscoverPage'
import EditProfilePage from './pages/EditProfilePage'
import MatchesPage from './pages/MatchesPage'
import ChatPage from './pages/ChatPage'
import UserProfilePage from './pages/UserProfilePage'

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <PresenceProvider>
          <AppProvider>
          <BrowserRouter>
            <Seo />
            <BetaBadge />
            <BackgroundSettings />
            <ThemePicker />
            <FavoriteSongUpdateModal />
            <PresenceUpdateModal />
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<LandingPage />} />
                <Route
                  path="login"
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="register"
                  element={
                    <GuestRoute>
                      <RegisterPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="discover"
                  element={
                    <ProtectedRoute>
                      <DiscoverPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <EditProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="matches"
                  element={
                    <ProtectedRoute>
                      <MatchesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="chat/:matchId"
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="user/:userId"
                  element={
                    <ProtectedRoute>
                      <UserProfilePage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </AppProvider>
          </PresenceProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
