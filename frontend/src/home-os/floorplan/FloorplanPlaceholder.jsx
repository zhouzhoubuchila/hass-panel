import React, { useMemo } from 'react';
import ThreeFloorplan from './ThreeFloorplan';
import { resolveDPlanConfig } from './proceduralDPlan';

export default function FloorplanPlaceholder({ config }) {
  const resolvedConfig = useMemo(() => resolveDPlanConfig(config), [config]);
  return <ThreeFloorplan config={resolvedConfig} />;
}

