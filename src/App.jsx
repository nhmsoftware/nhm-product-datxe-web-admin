import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import Dashboard from './pages/Dashboard/Dashboard';
import CustomerList from './pages/Customers/CustomerList';
import DriverList from './pages/Drivers/DriverList';

function App() {
  return (
    <BrowserRouter>
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/drivers" element={<DriverList />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
