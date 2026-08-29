import React from 'react';
import { Activity, Box, Cpu, Gauge, Network, Router, Server, ShieldCheck, Wifi } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import useHomelabDashboard from '../homelab/useHomelabDashboard';
import '../styles/homelab.css';

const Section = ({ icon: Icon, title, items, empty }) => <article className="home-os-lab-card"><h2><Icon size={18} />{title}<b>{items.length}</b></h2>{items.length ? <div className="home-os-lab-metrics">{items.map((item) => <span className={item.available ? '' : 'is-offline'} key={item.id}><b>{item.name}</b><small>{String(item.value)} {item.unit}</small></span>)}</div> : <p>{empty}</p>}</article>;
export default function HomelabPage() {
  const { language } = useLanguage(); const model = useHomelabDashboard(); const zh = language === 'zh';
  return <section className="home-os-homelab-page"><header className="home-os-page-heading"><span>HOMELAB</span><h1>{zh ? '家庭基础设施' : 'Home infrastructure'}</h1><p>{model.overview.alerts ? (zh ? `${model.overview.alerts} 个基础设施实体不可用` : `${model.overview.alerts} infrastructure entities unavailable`) : (zh ? '关键基础设施状态正常' : 'Core infrastructure looks healthy')}</p></header>
    <div className="home-os-lab-overview"><div><Cpu size={19} /><span>PVE CPU</span><strong>{model.overview.temperature ? `${model.overview.temperature.value}${model.overview.temperature.unit}` : '—'}</strong></div><div className={model.overview.host?.online ? 'is-online' : ''}><Server size={19} /><span>192.168.8.200</span><strong>{model.overview.host ? (model.overview.host.online ? (zh ? '在线' : 'Online') : (zh ? '离线' : 'Offline')) : (zh ? '未发现' : 'Not found')}</strong></div><div className={model.overview.alerts ? 'is-warning' : 'is-online'}><ShieldCheck size={19} /><span>{zh ? '基础设施告警' : 'Infrastructure alerts'}</span><strong>{model.overview.alerts}</strong></div></div>
    <div className="home-os-lab-grid"><Section icon={Box} title="Proxmox VE" items={model.pve} empty={zh ? '尚未发现 PVE 实体' : 'No PVE entities found'} /><Section icon={Activity} title="Home Assistant" items={model.ha} empty={zh ? '尚未发现 HA 系统实体' : 'No HA system entities found'} /><Section icon={Wifi} title="TP-Link" items={model.tplink} empty={zh ? '尚未发现 TP-Link 实体' : 'No TP-Link entities found'} /><Section icon={Router} title="ImmortalWrt" items={model.router} empty={zh ? '尚未发现路由器实体' : 'No router entities found'} /><Section icon={Gauge} title={zh ? '互联网质量' : 'Internet quality'} items={model.internet} empty={zh ? '尚未配置延迟/速率实体' : 'Latency and speed entities not configured'} /><Section icon={Network} title={zh ? '异常设备' : 'Unavailable'} items={model.unavailable} empty={zh ? '没有离线基础设施实体' : 'No unavailable infrastructure entities'} /></div>
  </section>;
}

