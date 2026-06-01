import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import useUiStore from './store/uiStore';
import Spinner from './components/ui/Spinner';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import AddContactPage from './pages/AddContactPage';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route (prevents logged in users from seeing auth forms)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return children;
};

export function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const initTheme = useUiStore((state) => state.initTheme);

  useEffect(() => {
    // Run authentication verify checking
    checkAuth();
    // Configure default dark/light class on body
    initTheme();
  }, [checkAuth, initTheme]);

  return (
    <Router>
      <div className="min-h-screen select-none overflow-hidden transition-all duration-200">
        
        {/* React Hot Toast Configuration */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#161A22',
              color: '#F1F5F9',
              border: '1px solid #2A3144',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '500',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22C55E',
                secondary: '#161A22',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#161A22',
              },
            },
          }}
        />

        <Routes>
          {/* Public Hero Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Pages (Public Only) */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />

          {/* Secure Protected Dashboard Views */}
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-contact" 
            element={
              <ProtectedRoute>
                <AddContactPage />
              </ProtectedRoute>
            } 
          />

          {/* Fallback Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
