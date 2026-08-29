import React from 'react';
import { CloudSun, Server, Users, Zap } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

const pages = {
  environment: { icon: CloudSun, zh: ['环境', '天气、空气、月相与房间舒适度'], en: ['Environment', 'Weather, air, moon phase and room comfort'] },
  family: { icon: Users, zh: ['家庭', '成员、安防、设备与家庭模式'], en: ['Family', 'People, security, devices and household modes'] },
  energy: { icon: Zap, zh: ['能源', '用电数据尚未配置'], en: ['Energy', 'Energy data is not configured'] },
  homelab: { icon: Server, zh: ['Homelab', 'PVE、Home Assistant 与家庭网络'], en: ['Homelab', 'PVE, Home Assistant and the home network'] },
};

export default function PlaceholderPage({ type }) {
  const { language } = useLanguage();
  const page = pages[type] || pages.environment;
  const [title, description] = page[language] || page.zh;
  const Icon = page.icon;
  return <section className="home-os-placeholder-page"><span><Icon size={30} /></span><p>HOME OS · PHASE 1</p><h1>{title}</h1><strong>{description}</strong><small>{language === 'zh' ? '页面骨架已就绪，等待真实实体与 Provider 配置。' : 'The page shell is ready for real entities and provider configuration.'}</small></section>;
}
