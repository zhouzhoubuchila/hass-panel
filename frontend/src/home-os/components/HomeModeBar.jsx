import React, { useEffect, useMemo, useState } from 'react';
import { Check, HousePlug, Settings2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHass } from '@hakit/core';
import { useLanguage } from '../../i18n/LanguageContext';
import { resolveHomeModes } from '../data/homeModeModel';
import '../styles/home-modes.css';

export default function HomeModeBar({ config }) {
  const { useStore, callService } = useHass();
  const entities = useStore((state) => state.entities);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [pending, setPending] = useState(null);
  const modes = useMemo(() => resolveHomeModes(entities || {}, config || {}), [config, entities]);
  const mapped = modes.filter((mode) => mode.available);
  useEffect(() => {
    if (!pending) return undefined;
    const timer = window.setTimeout(() => setPending(null), 4000);
    return () => window.clearTimeout(timer);
  }, [pending]);
  const activate = (mode) => {
    if (pending !== mode.id) { setPending(mode.id); return; }
    callService(mode.action);
    setPending(null);
  };
  return <section className="home-os-mode-bar"><div><HousePlug size={16} /><span><strong>{language === 'zh' ? '家庭模式' : 'Home modes'}</strong><small>{mapped.length ? (language === 'zh' ? '再次点击确认执行' : 'Click again to confirm') : (language === 'zh' ? '等待 HA Scene / Script / Helper' : 'Waiting for HA scenes, scripts or helpers')}</small></span></div><nav>{modes.map((mode) => <button type="button" disabled={!mode.available} className={`${mode.active ? 'is-active' : ''} ${pending === mode.id ? 'is-pending' : ''}`} onClick={() => activate(mode)} key={mode.id}>{pending === mode.id ? <Check size={13} /> : mode.active ? <ShieldCheck size={13} /> : null}{language === 'zh' ? mode.zh : mode.en}</button>)}<button type="button" className="home-os-mode-settings-link" onClick={() => navigate('/mode-settings')} aria-label={language === 'zh' ? '配置家庭模式' : 'Configure home modes'}><Settings2 size={14} /></button></nav></section>;
}
