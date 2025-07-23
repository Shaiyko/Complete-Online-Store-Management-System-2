import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './components/EnhancedNotificationSystem';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import PointOfSale from './pages/PointOfSale';
import Members from './pages/Members';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="products" element={
                <ProtectedRoute roles={['owner', 'admin']}>
                  <Products />
                </ProtectedRoute>
              } />
              <Route path="pos" element={<PointOfSale />} />
              <Route path="members" element={<Members />} />
              <Route path="suppliers" element={
                <ProtectedRoute roles={['owner', 'admin']}>
                  <Suppliers />
                </ProtectedRoute>
              } />
              <Route path="reports" element={
                <ProtectedRoute roles={['owner', 'admin']}>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute roles={['owner']}>
                  <Settings />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;