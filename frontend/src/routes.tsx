import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Layout/Navbar';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Feed from './pages/Feed';
import Profile from './components/Profile';
import { ConfessionCreate } from './components/Confession';
import { Home } from './pages/Home';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserManagement } from './components/admin/UserManagement';
import { ContentModeration } from './components/admin/ContentModeration';
import { PremiumFeatures } from './components/PremiumFeatures';
import { ThemeCustomization } from './components/ThemeCustomization';
import { PrivateVault } from './components/PrivateVault';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/confess"
          element={
            <ProtectedRoute>
              <div className="max-w-2xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Create a Confession</h1>
                <ConfessionCreate />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/college/:collegeName"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/moderation"
          element={
            <ProtectedRoute>
              <ContentModeration />
            </ProtectedRoute>
          }
        />

        {/* Premium Routes */}
        <Route
          path="/premium"
          element={
            <ProtectedRoute>
              <PremiumFeatures />
            </ProtectedRoute>
          }
        />
        <Route
          path="/theme"
          element={
            <ProtectedRoute>
              <ThemeCustomization />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vault"
          element={
            <ProtectedRoute>
              <PrivateVault />
            </ProtectedRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}; 