import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import Dashboard from './pages/Dashboard/Dashboard';
import ScheduledDispatchBoard from './pages/Rides/ScheduledDispatchBoard';
import CustomerList from './pages/Customers/CustomerList';
import DriverList from './pages/Drivers/DriverList';
import VoucherList from './pages/Vouchers/VoucherList';
import { Toaster } from 'react-hot-toast';
import Pricing from './pages/Pricing/Pricing';
import Services from './pages/Services/Services';
import Settings from './pages/Settings/Settings';
import AntiFraud from './pages/RiskManagement/AntiFraud';
import PenaltyRules from './pages/RiskManagement/PenaltyRules';
import CancellationConfigs from './pages/RiskManagement/CancellationConfigs';
import Login from './pages/Auth/Login';
import MerchantList from './pages/Merchants/MerchantList';
import authService from './services/authService';



// Protected Route Component
const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <>
      <Sidebar />
      <main className="main-content">
        <Navbar />
        {children}
      </main>
    </>
  );
};

function App() {
  return (
    <BrowserRouter basename={import.meta.env.DEV ? '/' : '/admin'} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" reverseOrder={false} />


      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/customers" element={
          <ProtectedRoute>
            <CustomerList />
          </ProtectedRoute>
        } />
        
        <Route path="/drivers" element={
          <ProtectedRoute>
            <DriverList />
          </ProtectedRoute>
        } />

        <Route path="/drivers/pending" element={
          <ProtectedRoute>
            <DriverList />
          </ProtectedRoute>
        } />
        
        <Route path="/merchants" element={
          <ProtectedRoute>
            <MerchantList />
          </ProtectedRoute>
        } />

        <Route path="/vouchers" element={
          <ProtectedRoute>
            <VoucherList />
          </ProtectedRoute>
        } />

        
        <Route path="/pricing" element={
          <ProtectedRoute>
            <Pricing />
          </ProtectedRoute>
        } />

        <Route path="/services" element={
          <ProtectedRoute>
            <Services />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        <Route path="/risk/anti-fraud" element={
          <ProtectedRoute>
            <AntiFraud />
          </ProtectedRoute>
        } />

        <Route path="/risk/penalty-rules" element={
          <ProtectedRoute>
            <PenaltyRules />
          </ProtectedRoute>
        } />

        <Route path="/risk/cancellation-configs" element={
          <ProtectedRoute>
            <CancellationConfigs />
          </ProtectedRoute>
        } />

        <Route path="/rides/scheduled" element={
          <ProtectedRoute>
            <ScheduledDispatchBoard />
          </ProtectedRoute>
        } />

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

