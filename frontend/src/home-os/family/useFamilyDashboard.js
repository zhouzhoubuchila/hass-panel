import { useMemo } from 'react';
import { useHass } from '@hakit/core';
import { buildFamilyModel } from './familyModel';
export default function useFamilyDashboard() { const { useStore } = useHass(); const entities = useStore((state) => state.entities); return useMemo(() => buildFamilyModel(entities || {}), [entities]); }

