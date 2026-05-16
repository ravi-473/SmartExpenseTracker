// src/App.jsx - Main Application Component
// Sets up React Router and wraps everything in AuthProvider

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AIInsightsPage from './pages/AIInsightsPage';
import OCRScannerPage from './pages/OCRScannerPage';
import SMSParserPage from './pages/SMSParserPage';
import ProfilePage from './pages/ProfilePage';
import Layout from './components/common/Layout';

// ============================================
// Protected Route Component
// ============================================
// If user is not logged in, redirect to /login
// Otherwise, render the requested page
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ============================================
// Public Route Component
// ============================================
// If user IS logged in and tries to visit /login, redirect to dashboard
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected routes - wrapped in Layout (sidebar + header) */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="ai-insights" element={<AIInsightsPage />} />
        <Route path="ocr-scanner" element={<OCRScannerPage />} />
        <Route path="sms-parser" element={<SMSParserPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Catch all - redirect unknown routes */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: '#1f2937',
              color: '#f9fafb',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
