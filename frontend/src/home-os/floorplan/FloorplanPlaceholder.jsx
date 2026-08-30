import React, { useMemo, useState } from 'react';
import Floorplan2D from './Floorplan2D';
import ThreeFloorplan from './ThreeFloorplan';
import RenderedFloorplan from './RenderedFloorplan';
import { resolveDPlanConfig } from './proceduralDPlan';

export default function FloorplanPlaceholder({ config }) {
  const resolvedConfig = useMemo(() => resolveDPlanConfig(config), [config]);
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('home_os_floorplan_view');
    if (saved === '3d' && !resolvedConfig.modelUrl) return 'rendered';
    return saved || resolvedConfig.viewMode || 'rendered';
  });
  const changeView = (nextView) => { setView(nextView); localStorage.setItem('home_os_floorplan_view', nextView); };
  const webglAvailable = useMemo(() => {
    try { const canvas = document.createElement('canvas'); return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')); } catch (error) { return false; }
  }, []);
  if (view === '2d') return <Floorplan2D config={resolvedConfig} onUse3D={() => changeView('rendered')} />;
  if (view === '3d' && webglAvailable) return <ThreeFloorplan config={resolvedConfig} onUse2D={() => changeView('rendered')} />;
  return <RenderedFloorplan config={resolvedConfig} onUseModel={() => changeView(webglAvailable ? '3d' : '2d')} />;
}
