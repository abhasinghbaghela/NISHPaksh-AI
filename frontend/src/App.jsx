import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CasesProvider } from './context/CasesContext';
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import NewTestWizard from './pages/NewTestWizard';
import Cases from './pages/Cases';
import EvidenceVault from './pages/EvidenceVault';
import ChainOfCustody from './pages/ChainOfCustody';
import FslVerification from './pages/FslVerification';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import SyncStatus from './pages/SyncStatus';
import Notifications from './pages/Notifications';
import HelpSop from './pages/HelpSop';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <CasesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/new-test" element={<ProtectedRoute><NewTestWizard /></ProtectedRoute>} />
            <Route path="/cases" element={<ProtectedRoute><Cases /></ProtectedRoute>} />
            <Route path="/vault" element={<ProtectedRoute><EvidenceVault /></ProtectedRoute>} />
            <Route path="/custody" element={<ProtectedRoute><ChainOfCustody /></ProtectedRoute>} />
            <Route path="/fsl" element={<ProtectedRoute><FslVerification /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/sync" element={<ProtectedRoute><SyncStatus /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><HelpSop /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </CasesProvider>
    </AuthProvider>
  );
}
