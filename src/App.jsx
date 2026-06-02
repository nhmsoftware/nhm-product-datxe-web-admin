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
import Settings from './pages/Settings/Settings';
import AntiFraud from './pages/RiskManagement/AntiFraud';
import PenaltyRules from './pages/RiskManagement/PenaltyRules';
import CancellationConfigs from './pages/RiskManagement/CancellationConfigs';
import Login from './pages/Auth/Login';
import MerchantList from './pages/Merchants/MerchantList';
import Services from './pages/Services/Services';
import CommissionConfig from './pages/Finance/CommissionConfig';
import ChauffeurRides from './pages/Chauffeur/ChauffeurRides';
import ComplaintList from './pages/Operations/ComplaintList';
import RefundList from './pages/Operations/RefundList';
import ViolationList from './pages/Operations/ViolationList';
import DriverFinanceDashboard from './pages/Finance/DriverFinanceDashboard';
import CreditWalletConfig from './pages/Finance/CreditWalletConfig';
import SubscriptionPackageConfig from './pages/Finance/SubscriptionPackageConfig';
import PaymentMethodConfig from './pages/Finance/PaymentMethodConfig';
import FinanceReports from './pages/Finance/FinanceReports';
import BannerList from './pages/Marketing/BannerList';
import NewsList from './pages/Marketing/NewsList';
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
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        containerStyle={{
          zIndex: 99999,
        }}
      />


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

        <Route path="/services" element={
          <ProtectedRoute>
            <Services />
          </ProtectedRoute>
        } />

        <Route path="/finance/commissions" element={
          <ProtectedRoute>
            <CommissionConfig />
          </ProtectedRoute>
        } />

        <Route path="/chauffeur/rides" element={
          <ProtectedRoute>
            <ChauffeurRides />
          </ProtectedRoute>
        } />

        <Route path="/finance/driver-summary" element={
          <ProtectedRoute>
            <DriverFinanceDashboard />
          </ProtectedRoute>
        } />

        <Route path="/finance/credit-wallet-config" element={
          <ProtectedRoute>
            <CreditWalletConfig />
          </ProtectedRoute>
        } />

        <Route path="/finance/subscription-packages" element={
          <ProtectedRoute>
            <SubscriptionPackageConfig />
          </ProtectedRoute>
        } />

        <Route path="/finance/payment-methods" element={
          <ProtectedRoute>
            <PaymentMethodConfig />
          </ProtectedRoute>
        } />

        <Route path="/finance/reports" element={
          <ProtectedRoute>
            <FinanceReports />
          </ProtectedRoute>
        } />

        <Route path="/operations/complaints" element={
          <ProtectedRoute>
            <ComplaintList />
          </ProtectedRoute>
        } />

        <Route path="/operations/refunds" element={
          <ProtectedRoute>
            <RefundList />
          </ProtectedRoute>
        } />

        <Route path="/operations/violations" element={
          <ProtectedRoute>
            <ViolationList />
          </ProtectedRoute>
        } />

        <Route path="/marketing/banners" element={
          <ProtectedRoute>
            <BannerList />
          </ProtectedRoute>
        } />

        <Route path="/marketing/news" element={
          <ProtectedRoute>
            <NewsList />
          </ProtectedRoute>
        } />

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

