import { useMemo } from 'react';
import { useHass } from '@hakit/core';
import { buildEnergyModel } from './energyModel';
export default function useEnergyDashboard() { const { useStore } = useHass(); const entities = useStore((state) => state.entities); return useMemo(() => buildEnergyModel(entities || {}), [entities]); }

