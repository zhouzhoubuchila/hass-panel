import { useMemo } from 'react';
import { useHass } from '@hakit/core';
import { buildHomelabModel } from './homelabModel';
export default function useHomelabDashboard() { const { useStore } = useHass(); const entities = useStore((state) => state.entities); return useMemo(() => buildHomelabModel(entities || {}), [entities]); }

