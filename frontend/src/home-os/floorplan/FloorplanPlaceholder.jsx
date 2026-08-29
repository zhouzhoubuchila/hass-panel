import React, { useMemo, useState } from 'react';
import Floorplan2D from './Floorplan2D';
import ThreeFloorplan from './ThreeFloorplan';
import { resolveDPlanConfig } from './proceduralDPlan';

export default function FloorplanPlaceholder({ config }) {
  const resolvedConfig = useMemo(() => resolveDPlanConfig(config), [config]);
  const [view, setView] = useState(() => localStorage.getItem('home_os_floorplan_view') || resolvedConfig.viewMode || (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? '2d' : '3d'));
  const changeView = (nextView) => { setView(nextView); localStorage.setItem('home_os_floorplan_view', nextView); };
  const webglAvailable = useMemo(() => {
    try { const canvas = document.createElement('canvas'); return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')); } catch (error) { return false; }
  }, []);
  if (view === '2d' || !webglAvailable) return <Floorplan2D config={resolvedConfig} onUse3D={() => changeView('3d')} />;
  return <ThreeFloorplan config={resolvedConfig} onUse2D={() => changeView('2d')} />;
}

