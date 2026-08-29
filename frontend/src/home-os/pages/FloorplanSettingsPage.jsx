import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Home, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHass } from '@hakit/core';
import { useLanguage } from '../../i18n/LanguageContext';
import { configApi } from '../../utils/api';
import { FLOORPLAN_FIELDS, createRoomMappings, getEntityOptions, mergeFloorplanConfig } from '../floorplan/floorplanSettingsModel';
import '../styles/floorplan-settings.css';

const labels = {
  temperature: ['温度', 'Temperature'], humidity: ['湿度', 'Humidity'], presence: ['人体存在', 'Presence'],
  climate: ['空调', 'Climate'], light: ['主灯', 'Main light'],
};

export default function FloorplanSettingsPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { useStore } = useHass();
  const entities = useStore((state) => state.entities);
  const [config, setConfig] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [status, setStatus] = useState('loading');
  const localeIndex = language === 'zh' ? 0 : 1;
  const options = useMemo(() => Object.fromEntries(FLOORPLAN_FIELDS.map((field) => [field, getEntityOptions(entities || {}, field)])), [entities]);

  useEffect(() => {
    let active = true;
    configApi.getConfig().then((response) => {
      if (!active) return;
      const nextConfig = response.data || {};
      setConfig(nextConfig);
      setMappings(createRoomMappings(nextConfig));
      setStatus('ready');
    }).catch(() => active && setStatus('error'));
    return () => { active = false; };
  }, []);

  const update = (roomId, field, value) => setMappings((current) => current.map((room) => room.id === roomId ? { ...room, [field]: value } : room));
  const save = async () => {
    setStatus('saving');
    try {
      const nextConfig = mergeFloorplanConfig(config, mappings);
      await configApi.saveConfig(nextConfig);
      setConfig(nextConfig);
      setStatus('saved');
      window.setTimeout(() => setStatus('ready'), 1600);
    } catch (error) {
      setStatus('error');
    }
  };
  const reset = () => setMappings(createRoomMappings({}));

  return <div className="home-os-floorplan-settings">
    <header>
      <button type="button" onClick={() => navigate('/')}><ArrowLeft size={18} /></button>
      <div><span>HOME OS · FLOORPLAN</span><h1>{language === 'zh' ? '户型实体映射' : 'Floorplan entity mapping'}</h1><p>{language === 'zh' ? '留空时继续使用安全自动发现；手动选择始终优先。' : 'Blank fields keep safe auto-discovery enabled; explicit selections always win.'}</p></div>
      <button type="button" className="is-reset" onClick={reset}><RotateCcw size={16} />{language === 'zh' ? '恢复自动' : 'Use auto'}</button>
    </header>
    {status === 'loading' ? <div className="home-os-settings-message">{language === 'zh' ? '正在读取配置…' : 'Loading configuration…'}</div> : status === 'error' && !config ? <div className="home-os-settings-message is-error">{language === 'zh' ? '配置读取失败，请检查后端连接。' : 'Could not load configuration.'}</div> : <>
      <div className="home-os-room-mapping-list">
        {mappings.map((room) => <section key={room.id}>
          <div className="home-os-room-mapping-title"><Home size={17} /><strong>{room.name}</strong><small>{room.id}</small></div>
          <div className="home-os-room-mapping-fields">
            {FLOORPLAN_FIELDS.map((field) => <label key={field}><span>{labels[field][localeIndex]}</span><input list={`home-os-${field}-entities`} value={room[field]} placeholder={language === 'zh' ? '自动发现' : 'Auto-discover'} onChange={(event) => update(room.id, field, event.target.value)} /></label>)}
          </div>
        </section>)}
      </div>
      {FLOORPLAN_FIELDS.map((field) => <datalist id={`home-os-${field}-entities`} key={field}>{options[field].map((entity) => <option value={entity.entity_id} key={entity.entity_id}>{entity.attributes?.friendly_name || entity.entity_id}</option>)}</datalist>)}
      <button type="button" className={`home-os-settings-save is-${status}`} disabled={status === 'saving'} onClick={save}><Check size={19} />{status === 'saving' ? (language === 'zh' ? '保存中…' : 'Saving…') : status === 'saved' ? (language === 'zh' ? '已保存' : 'Saved') : (language === 'zh' ? '保存映射' : 'Save mappings')}</button>
    </>}
  </div>;
}

