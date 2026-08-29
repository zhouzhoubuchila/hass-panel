import { CloudSun, Home, Server, Users, Zap } from 'lucide-react';

export const primaryNavigation = [
  { path: '/', label: { zh: '首页', en: 'Home' }, icon: Home },
  { path: '/environment', label: { zh: '环境', en: 'Environment' }, icon: CloudSun },
  { path: '/family', label: { zh: '家庭', en: 'Family' }, icon: Users },
  { path: '/energy', label: { zh: '能源', en: 'Energy' }, icon: Zap },
  { path: '/homelab', label: { zh: '设备', en: 'Homelab' }, icon: Server },
];
