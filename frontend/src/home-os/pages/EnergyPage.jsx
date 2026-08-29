import React from 'react';
import { Activity, CircleDollarSign, Gauge, PlugZap, Zap } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import useEnergyDashboard from '../energy/useEnergyDashboard';
import '../styles/energy.css';

export default function EnergyPage() {
  const { language } = useLanguage(); const model = useEnergyDashboard(); const zh = language === 'zh';
  if (!model.configured) return <section className="home-os-energy-page home-os-energy-empty"><span><Zap size={32} /></span><h1>{zh ? '尚未配置能源数据' : 'Energy data is not configured'}</h1><p>{zh ? '接入 Home Assistant Energy、功率或电费实体后，这里会自动显示真实数据。' : 'Connect Home Assistant energy, power or cost entities to populate this page.'}</p></section>;
  return <section className="home-os-energy-page"><header className="home-os-page-heading"><span>{zh ? '能源' : 'ENERGY'}</span><h1>{zh ? '家庭用能' : 'Home energy'}</h1><p>{zh ? '仅显示 Home Assistant 当前提供的真实数据' : 'Only current Home Assistant data is shown'}</p></header><div className="home-os-energy-overview"><div><Activity size={19} /><span>{zh ? '实时功率汇总' : 'Live power total'}</span><strong>{model.livePowerWatts >= 1000 ? `${(model.livePowerWatts / 1000).toFixed(2)} kW` : `${model.livePowerWatts.toFixed(0)} W`}</strong></div><div><Gauge size={19} /><span>{zh ? '功率数据源' : 'Power sources'}</span><strong>{model.powers.length}</strong></div><div><CircleDollarSign size={19} /><span>{zh ? '费用实体' : 'Cost sources'}</span><strong>{model.cost.length}</strong></div></div><div className="home-os-energy-grid"><article><h2><PlugZap size={18} />{zh ? '实时功率' : 'Live power'}</h2>{model.powers.slice(0, 12).map((x) => <div key={x.id}><b>{x.name}</b><span>{x.watts >= 1000 ? `${(x.watts / 1000).toFixed(2)} kW` : `${x.watts.toFixed(0)} W`}</span></div>)}</article><article><h2><Zap size={18} />{zh ? '累计电量' : 'Energy totals'}</h2>{model.energy.length ? model.energy.slice(0, 12).map((x) => <div key={x.id}><b>{x.name}</b><span>{x.value} {x.unit}</span></div>) : <p>{zh ? '没有 energy 实体' : 'No energy entities'}</p>}</article><article><h2><CircleDollarSign size={18} />{zh ? '费用' : 'Cost'}</h2>{model.cost.length ? model.cost.slice(0, 12).map((x) => <div key={x.id}><b>{x.name}</b><span>{x.value} {x.unit}</span></div>) : <p>{zh ? '没有费用实体' : 'No cost entities'}</p>}</article></div></section>;
}

