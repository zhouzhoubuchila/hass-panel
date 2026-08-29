import { useEffect, useMemo, useState } from 'react';
import { useHass } from '@hakit/core';
import { configApi } from '../../utils/api';
import { buildEnvironmentModel } from './environmentModel';
export default function useEnvironmentDashboard() {
  const { useStore } = useHass();
  const entities = useStore((state) => state.entities);
  const [config, setConfig] = useState({});
  useEffect(() => { let active = true; configApi.getConfig().then((r) => { if (active && r.code === 200) setConfig(r.data || {}); }).catch(() => {}); return () => { active = false; }; }, []);
  return useMemo(() => buildEnvironmentModel(entities || {}, config), [entities, config]);
}

