import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, Check, CheckCircle2, ChevronRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import useHomeDashboard from '../data/useHomeDashboard';
import { ATTENTION_FILTERS, attentionRecordKey, filterAttentionItems, routeForAttention } from '../data/attentionCenterModel';
import '../styles/attention-center.css';

const labels = { all: ['全部', 'All'], critical: ['紧急', 'Critical'], warning: ['警告', 'Warning'], info: ['提示', 'Info'] };
const storageKey = 'home_os_dismissed_attention';
const loadDismissed = () => { try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch (error) { return []; } };

export default function AttentionCenterPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const dashboard = useHomeDashboard();
  const [filter, setFilter] = useState('all');
  const [dismissed, setDismissed] = useState(loadDismissed);
  const visible = useMemo(() => filterAttentionItems(dashboard.attention, filter, dismissed), [dashboard.attention, dismissed, filter]);
  const counts = useMemo(() => Object.fromEntries(ATTENTION_FILTERS.map((value) => [value, filterAttentionItems(dashboard.attention, value, dismissed).length])), [dashboard.attention, dismissed]);
  const dismiss = (item) => {
    const next = [...new Set([...dismissed, attentionRecordKey(item)])].slice(-80);
    setDismissed(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };
  const zh = language === 'zh';

  return <section className="home-os-attention-center">
    <header><button type="button" onClick={() => navigate('/')}><ArrowLeft size={18} /></button><div><span>HOME OS · ATTENTION</span><h1>{zh ? '动态异常中心' : 'Live attention center'}</h1><p>{zh ? '由 Home Assistant 实体实时生成；状态恢复后自动消失。' : 'Generated live from Home Assistant entities and cleared when states recover.'}</p></div><b className={counts.all ? 'has-alerts' : ''}>{counts.all}</b></header>
    <nav>{ATTENTION_FILTERS.map((value) => <button type="button" className={filter === value ? 'is-active' : ''} onClick={() => setFilter(value)} key={value}>{labels[value][zh ? 0 : 1]}<b>{counts[value]}</b></button>)}</nav>
    {visible.length ? <div className="home-os-attention-center-list">{visible.map((item) => <article className={`is-${item.severity}`} key={attentionRecordKey(item)}><div className="home-os-attention-icon">{item.severity === 'critical' ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}</div><div><small>{labels[item.severity]?.[zh ? 0 : 1] || item.severity} · {item.category}</small><h2>{item.title}</h2><p>{item.description}</p><code>{item.entityId}</code></div><div className="home-os-attention-actions">{item.dismissible && <button type="button" onClick={() => dismiss(item)}><Check size={15} />{zh ? '已知晓' : 'Acknowledge'}</button>}<button type="button" onClick={() => navigate(routeForAttention(item))}>{zh ? '去处理' : 'Review'}<ChevronRight size={15} /></button></div></article>)}</div> : <div className="home-os-attention-clear"><CheckCircle2 size={36} /><h2>{zh ? '当前筛选下没有异常' : 'No alerts in this view'}</h2><p>{zh ? '门窗、设备、系统与关键实体状态正常。' : 'Openings, devices, systems and key entities look normal.'}</p></div>}
  </section>;
}
