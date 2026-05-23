import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FeedProvider } from './contexts/FeedContext';
import { EventProvider } from './contexts/EventContext';
import { OrgProvider } from './contexts/OrgContext';
import { ToastProvider } from './contexts/ToastContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

/* Lazy-loaded pages for code splitting */
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const FeedPage = lazy(() => import('./pages/FeedPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const OrganizationsPage = lazy(() => import('./pages/OrganizationsPage'));
const OrgDetailPage = lazy(() => import('./pages/OrgDetailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/* Loading Screen */
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-spinner" />
    <p className="loading-text">Loading CampusConnect...</p>
  </div>
);

/* Protected Route — redirects to login if not authenticated */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

/* Public Route — redirects to feed if already authenticated */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/feed" replace />;
  return children;
};

/* App Layout — wraps authenticated pages with navbar */
const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="main-content">
      <Suspense fallback={<LoadingScreen />}>
        {children}
      </Suspense>
    </main>
  </>
);

/* Application Routes */
const AppRoutes = () => (
  <Suspense fallback={<LoadingScreen />}>
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected routes */}
      <Route path="/feed" element={
        <ProtectedRoute><AppLayout><FeedPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/profile/:userId?" element={
        <ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/events" element={
        <ProtectedRoute><AppLayout><EventsPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/events/:eventId" element={
        <ProtectedRoute><AppLayout><EventDetailPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/organizations" element={
        <ProtectedRoute><AppLayout><OrganizationsPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/organizations/:orgId" element={
        <ProtectedRoute><AppLayout><OrgDetailPage /></AppLayout></ProtectedRoute>
      } />

      {/* Redirects & fallback */}
      <Route path="/" element={<Navigate to="/feed" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

/* Root App Component */
const App = () => (
  <ToastProvider>
    <AuthProvider>
      <FeedProvider>
        <EventProvider>
          <OrgProvider>
            <AppRoutes />
            <Toast />
          </OrgProvider>
        </EventProvider>
      </FeedProvider>
    </AuthProvider>
  </ToastProvider>
);

export default App;
