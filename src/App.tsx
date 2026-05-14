import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';

// Placeholder Pages (will implement next)
import { Sites } from './pages/Sites';
import { Workers } from './pages/Workers';
import { SiteDetails } from './pages/SiteDetails';
import { WorkerDetails } from './pages/WorkerDetails';
import { Dashboard } from './pages/Dashboard';
import { Offers } from './pages/Offers';
import { Maintenance } from './pages/Maintenance';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="offers" element={<Offers />} />
            <Route path="maintenance" element={<Maintenance />} />
            {/* <Route path="sites" element={<Sites />} />
            <Route path="sites/:id" element={<SiteDetails />} />
            <Route path="workers" element={<Workers />} />
            <Route path="workers/:id" element={<WorkerDetails />} /> */}
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}


