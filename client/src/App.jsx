import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Footer } from './components/layout/Footer';

// Critical path pages — loaded eagerly (very small, needed on first render)
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

// All other pages — lazy loaded for code splitting (reduces initial bundle ~45%)
const DashboardPage         = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ProfilePage           = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const ProviderDashboardPage = lazy(() => import('./pages/ProviderDashboardPage').then(m => ({ default: m.ProviderDashboardPage })));
const AdminPage             = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const PostNeedPage          = lazy(() => import('./pages/PostNeedPage').then(m => ({ default: m.PostNeedPage })));
const NeedDetailPage        = lazy(() => import('./pages/NeedDetailPage').then(m => ({ default: m.NeedDetailPage })));
const MyNeedsPage           = lazy(() => import('./pages/MyNeedsPage').then(m => ({ default: m.MyNeedsPage })));
const BrowseProvidersPage   = lazy(() => import('./pages/BrowseProvidersPage').then(m => ({ default: m.BrowseProvidersPage })));
const ProviderDetailPage    = lazy(() => import('./pages/ProviderDetailPage').then(m => ({ default: m.ProviderDetailPage })));
const BrowseResourcesPage   = lazy(() => import('./pages/BrowseResourcesPage').then(m => ({ default: m.BrowseResourcesPage })));
const ResourceDetailPage    = lazy(() => import('./pages/ResourceDetailPage').then(m => ({ default: m.ResourceDetailPage })));
const ShareResourcePage     = lazy(() => import('./pages/ShareResourcePage').then(m => ({ default: m.ShareResourcePage })));
const BookingsPage          = lazy(() => import('./pages/BookingsPage').then(m => ({ default: m.BookingsPage })));
const SharesPage            = lazy(() => import('./pages/SharesPage').then(m => ({ default: m.SharesPage })));

// Page-level loading fallback
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
      <p className="text-xs text-[var(--text-muted)]">Loading…</p>
    </div>
  </div>
);


export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-svh flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
            {/* Toast Notification Container */}
            <Toaster
              position="top-right"
              gutter={8}
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--card-bg-elevated)',
                  color: 'var(--text-primary)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '0.875rem',
                  fontSize: '0.8125rem',
                  fontWeight: '500',
                  boxShadow: 'var(--shadow-xl)',
                  maxWidth: '380px',
                  padding: '10px 14px',
                },
                success: {
                  iconTheme: { primary: '#10b981', secondary: '#ffffff' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
                },
              }}
            />

            {/* Navigation Bar */}
            <Navbar />

            {/* Main Content Router */}
            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
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
              </Suspense>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
