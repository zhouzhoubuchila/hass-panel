import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import RouteLoading from './RouteLoading';
const Config = lazy(() => import('../../pages/config'));
const LegacyDashboard = lazy(() => import('../../pages/home'));
const EnvironmentPage = lazy(() => import('../pages/EnvironmentPage'));
const FamilyPage = lazy(() => import('../pages/FamilyPage'));
const HomelabPage = lazy(() => import('../pages/HomelabPage'));
const EnergyPage = lazy(() => import('../pages/EnergyPage'));
const FloorplanSettingsPage = lazy(() => import('../pages/FloorplanSettingsPage'));
const HomeModeSettingsPage = lazy(() => import('../pages/HomeModeSettingsPage'));

export default function HomeOsRoutes({ sidebarVisible, setSidebarVisible }) {
  return (
    <Suspense fallback={<RouteLoading />}><Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/environment" element={<EnvironmentPage />} />
      <Route path="/family" element={<FamilyPage />} />
      <Route path="/energy" element={<EnergyPage />} />
      <Route path="/homelab" element={<HomelabPage />} />
      <Route path="/floorplan-settings" element={<FloorplanSettingsPage />} />
      <Route path="/mode-settings" element={<HomeModeSettingsPage />} />
      <Route path="/legacy" element={<LegacyDashboard sidebarVisible={sidebarVisible} setSidebarVisible={setSidebarVisible} />} />
      <Route path="/config" element={<Config sidebarVisible={sidebarVisible} setSidebarVisible={setSidebarVisible} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></Suspense>
  );
}
