import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Config from '../../pages/config';
import LegacyDashboard from '../../pages/home';
import HomePage from '../pages/HomePage';
import EnvironmentPage from '../pages/EnvironmentPage';
import PlaceholderPage from '../pages/PlaceholderPage';

export default function HomeOsRoutes({ sidebarVisible, setSidebarVisible }) {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/environment" element={<EnvironmentPage />} />
      <Route path="/family" element={<PlaceholderPage type="family" />} />
      <Route path="/energy" element={<PlaceholderPage type="energy" />} />
      <Route path="/homelab" element={<PlaceholderPage type="homelab" />} />
      <Route path="/legacy" element={<LegacyDashboard sidebarVisible={sidebarVisible} setSidebarVisible={setSidebarVisible} />} />
      <Route path="/config" element={<Config sidebarVisible={sidebarVisible} setSidebarVisible={setSidebarVisible} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

