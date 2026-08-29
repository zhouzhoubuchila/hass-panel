import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CornerDownLeft, Search, ShieldCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHass } from '@hakit/core';
import { useLanguage } from '../../i18n/LanguageContext';
import { buildCommandItems, filterCommandItems } from '../data/commandPaletteModel';
import '../styles/command-palette.css';

export default function CommandPalette({ open, setOpen }) {
  const { language } = useLanguage();
  const { useStore, callService } = useHass();
  const entities = useStore((state) => state.entities);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState(null);
  const items = useMemo(() => buildCommandItems(entities || {}, language), [entities, language]);
  const results = useMemo(() => filterCommandItems(items, query), [items, query]);

  useEffect(() => {
    const keydown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen((value) => !value); }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [setOpen]);
  useEffect(() => { if (open) { setQuery(''); setPending(null); window.setTimeout(() => inputRef.current?.focus(), 30); } }, [open]);
  useEffect(() => { if (!pending) return undefined; const timer = window.setTimeout(() => setPending(null), 4000); return () => window.clearTimeout(timer); }, [pending]);
  if (!open) return null;

  const run = (item) => {
    if (item.action) {
      if (pending !== item.id) { setPending(item.id); return; }
      callService(item.action);
    } else navigate(item.path);
    setOpen(false);
  };
  return <div className="home-os-command-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}><section className="home-os-command-palette" role="dialog" aria-modal="true" aria-label={language === 'zh' ? '全局搜索' : 'Global search'}><header><Search size={18} /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === 'zh' ? '搜索页面、设备、实体或动作…' : 'Search pages, devices, entities or actions…'} /><button type="button" onClick={() => setOpen(false)}><X size={17} /></button></header><div className="home-os-command-results">{results.map((item) => <button type="button" className={pending === item.id ? 'is-pending' : ''} onClick={() => run(item)} key={item.id}><span>{pending === item.id ? <Check size={16} /> : item.action ? <ShieldCheck size={16} /> : <CornerDownLeft size={16} />}</span><div><strong>{item.label}</strong><small>{item.secondary || (language === 'zh' ? '打开页面' : 'Open page')}</small></div><em>{pending === item.id ? (language === 'zh' ? '再次点击确认' : 'Click again') : item.action ? (language === 'zh' ? '安全控制' : 'Safe control') : item.state || ''}</em></button>)}{!results.length && <p>{language === 'zh' ? '没有匹配结果' : 'No matching results'}</p>}</div><footer><span>Ctrl K</span>{language === 'zh' ? '打开 / 关闭' : 'Open / close'}<b>{language === 'zh' ? '高风险动作不会出现在快捷执行中' : 'High-risk actions are excluded from quick execution'}</b></footer></section></div>;
}
