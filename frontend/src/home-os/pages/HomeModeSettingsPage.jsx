import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHass } from '@hakit/core';
import { useLanguage } from '../../i18n/LanguageContext';
import { configApi } from '../../utils/api';
import { createHomeModeMappings, getHomeModeEntityOptions, getHomeModeOptions, mergeHomeModeConfig } from '../data/homeModeSettingsModel';
import '../styles/floorplan-settings.css';
import '../styles/home-mode-settings.css';

export default function HomeModeSettingsPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { useStore } = useHass();
  const entities = useStore((state) => state.entities);
  const [config, setConfig] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [status, setStatus] = useState('loading');
  const entityOptions = useMemo(() => getHomeModeEntityOptions(entities || {}), [entities]);

  useEffect(() => {
    let active = true;
    configApi.getConfig().then((response) => {
      if (!active) return;
      const nextConfig = response.data || {};
      setConfig(nextConfig);
      setMappings(createHomeModeMappings(nextConfig));
      setStatus('ready');
    }).catch(() => active && setStatus('error'));
    return () => { active = false; };
  }, []);

  const update = (id, field, value) => setMappings((current) => current.map((mode) => mode.id === id ? { ...mode, [field]: value, ...(field === 'entityId' ? { option: '' } : {}) } : mode));
  const save = async () => {
    setStatus('saving');
    try {
      const nextConfig = mergeHomeModeConfig(config, mappings);
      await configApi.saveConfig(nextConfig);
      setConfig(nextConfig);
      setStatus('saved');
      window.setTimeout(() => setStatus('ready'), 1600);
    } catch (error) { setStatus('error'); }
  };
  const reset = () => setMappings(createHomeModeMappings({}));

  return <div className="home-os-floorplan-settings home-os-mode-settings">
    <header>
      <button type="button" onClick={() => navigate('/')}><ArrowLeft size={18} /></button>
      <div><span>HOME OS · MODES</span><h1>{language === 'zh' ? '家庭模式映射' : 'Home mode mapping'}</h1><p>{language === 'zh' ? '绑定 Home Assistant 场景、脚本、自动化或 Helper；留空时仍会安全自动发现。' : 'Bind Home Assistant scenes, scripts, automations or helpers. Blank fields keep safe discovery enabled.'}</p></div>
      <button type="button" className="is-reset" onClick={reset}><RotateCcw size={16} />{language === 'zh' ? '恢复自动' : 'Use auto'}</button>
    </header>
    {status === 'loading' ? <div className="home-os-settings-message">{language === 'zh' ? '正在读取配置…' : 'Loading configuration…'}</div> : status === 'error' && !config ? <div className="home-os-settings-message is-error">{language === 'zh' ? '配置读取失败，请检查后端连接。' : 'Could not load configuration.'}</div> : <>
      <div className="home-os-mode-mapping-list">{mappings.map((mode) => {
        const options = getHomeModeOptions(entities || {}, mode.entityId);
        return <section key={mode.id}>
          <div className="home-os-mode-mapping-title"><SlidersHorizontal size={17} /><span><strong>{language === 'zh' ? mode.zh : mode.en}</strong><small>{mode.id}</small></span></div>
          <label><span>{language === 'zh' ? 'HA 实体' : 'HA entity'}</span><select value={mode.entityId} onChange={(event) => update(mode.id, 'entityId', event.target.value)}><option value="">{language === 'zh' ? '自动发现' : 'Auto-discover'}</option>{entityOptions.map((entity) => <option value={entity.entity_id} key={entity.entity_id}>{entity.attributes?.friendly_name || entity.entity_id} · {entity.entity_id}</option>)}</select></label>
          {mode.entityId.startsWith('input_select.') && <label><span>{language === 'zh' ? '选项值' : 'Option'}</span><select value={mode.option} onChange={(event) => update(mode.id, 'option', event.target.value)}><option value="">{language === 'zh' ? '请选择' : 'Select'}</option>{options.map((option) => <option value={option} key={option}>{option}</option>)}</select></label>}
        </section>;
      })}</div>
      <button type="button" className={`home-os-settings-save is-${status}`} disabled={status === 'saving'} onClick={save}><Check size={19} />{status === 'saving' ? (language === 'zh' ? '保存中…' : 'Saving…') : status === 'saved' ? (language === 'zh' ? '已保存' : 'Saved') : (language === 'zh' ? '保存模式' : 'Save modes')}</button>
    </>}
  </div>;
}
