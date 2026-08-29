import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@hakit/core';
import { configApi } from '../../utils/api';
import { buildDashboardModel } from './dashboardModel';

export default function useHomeDashboard() {
  const entities = useStore((state) => state.entities);
  const ready = useStore((state) => state.ready);
  const [config, setConfig] = useState({});
  const [configError, setConfigError] = useState(false);
  useEffect(() => {
    let active = true;
    configApi.getConfig().then((response) => { if (active && response.code === 200) setConfig(response.data || {}); }).catch(() => { if (active) setConfigError(true); });
    return () => { active = false; };
  }, []);
  return useMemo(() => ({ ...buildDashboardModel(entities || {}, config), ready: Boolean(ready), configError }), [entities, config, ready, configError]);
}
