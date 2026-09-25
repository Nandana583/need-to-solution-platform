import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProviderDashboardPage } from './pages/ProviderDashboardPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

// MVP Feature Pages
import { PostNeedPage } from './pages/PostNeedPage';
import { NeedDetailPage } from './pages/NeedDetailPage';
import { MyNeedsPage } from './pages/MyNeedsPage';
import { BrowseProvidersPage } from './pages/BrowseProvidersPage';
import { ProviderDetailPage } from './pages/ProviderDetailPage';
import { BrowseResourcesPage } from './pages/BrowseResourcesPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { ShareResourcePage } from './pages/ShareResourcePage';
import { BookingsPage } from './pages/BookingsPage';
import { SharesPage } from './pages/SharesPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-darkBg text-slate-100 selection:bg-primary-500 selection:text-white">
          {/* Toast Notification Container */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(15, 23, 42, 0.9)',
                color: '#f8fafc',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '1rem',
                fontSize: '0.875rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />

          {/* Navigation Bar */}
          <Navbar />

          {/* Main Content Router */}
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/providers" element={<BrowseProvidersPage />} />
              <Route path="/providers/:id" element={<ProviderDetailPage />} />
              <Route path="/resources" element={<BrowseResourcesPage />} />
              <Route path="/resources/:id" element={<ResourceDetailPage />} />

              {/* Protected Routes (Any Authenticated User) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
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
                path="/needs"
                element={
                  <ProtectedRoute>
                    <MyNeedsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/needs/new"
                element={
                  <ProtectedRoute>
                    <PostNeedPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/needs/:id"
                element={
                  <ProtectedRoute>
                    <NeedDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resources/new"
                element={
                  <ProtectedRoute>
                    <ShareResourcePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <BookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shares"
                element={
                  <ProtectedRoute>
                    <SharesPage />
                  </ProtectedRoute>
                }
              />

              {/* Provider Protected Route */}
              <Route
                path="/providers/manage"
                element={
                  <ProtectedRoute requiredRole="provider">
                    <ProviderDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
