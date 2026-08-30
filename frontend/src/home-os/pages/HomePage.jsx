import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import {
  AirVent, AlertTriangle, Camera, CheckCircle2, CloudSun, Droplets, Gauge,
  Lightbulb, MapPin, Moon, PlugZap, Radio, Sunrise, Sunset, Thermometer,
  CircleDot, Users, Zap,
} from 'lucide-react';
import { useHass } from '@hakit/core';
import { useLanguage } from '../../i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';
import FloorplanPlaceholder from '../floorplan/FloorplanPlaceholder';
import { buildFloorplanState } from '../floorplan/floorplanBinding';
import useHomeDashboard from '../data/useHomeDashboard';
import { getTravelAdvice } from '../data/dashboardModel';
import HomeModeBar from '../components/HomeModeBar';
import '../styles/control-deck.css';

const HomeCalendarMeta = lazy(() => import('../components/HomeCalendarMeta'));

const weatherNames = { sunny: ['晴', 'Sunny'], cloudy: ['多云', 'Cloudy'], partlycloudy: ['局部多云', 'Partly cloudy'], rainy: ['有雨', 'Rainy'], 'clear-night': ['晴夜', 'Clear night'], fog: ['有雾', 'Foggy'], windy: ['有风', 'Windy'], lightning: ['雷雨', 'Thunderstorm'], snowy: ['有雪', 'Snowy'] };
const moonNames = { new_moon: ['新月', 'New moon'], waxing_crescent: ['蛾眉月', 'Waxing crescent'], first_quarter: ['上弦月', 'First quarter'], waxing_gibbous: ['盈凸月', 'Waxing gibbous'], full_moon: ['满月', 'Full moon'], waning_gibbous: ['亏凸月', 'Waning gibbous'], last_quarter: ['下弦月', 'Last quarter'], waning_crescent: ['残月', 'Waning crescent'] };
const unavailable = new Set(['unknown', 'unavailable']);
const EMPTY_ENTITIES = Object.freeze({});
const EMPTY_FLOORPLAN_CONFIG = Object.freeze({});
const entityName = (entity, fallback) => entity?.attributes?.friendly_name || fallback;
const formatSunTime = (value, locale) => value ? new Date(value).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : '—';

function StatusCard({ icon: Icon, label, name, value, active, disabled, onClick }) {
  return <button type="button" className={`home-os-device-card ${active ? 'is-active' : ''}`} disabled={disabled} onClick={onClick}>
    <span className="home-os-device-icon"><Icon size={17} /></span>
    <span><small>{label}</small><strong>{name}</strong><em>{value}</em></span>
  </button>;
}

export default function HomePage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { useStore, callService } = useHass();
  const rawEntities = useStore((state) => state.entities);
  const entities = useMemo(() => rawEntities || EMPTY_ENTITIES, [rawEntities]);
  const dashboard = useHomeDashboard();
  const [now, setNow] = useState(new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 30000); return () => window.clearInterval(timer); }, []);
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  const zh = language === 'zh';
  const weatherLabel = dashboard.weather ? (weatherNames[dashboard.weather.condition]?.[zh ? 0 : 1] || dashboard.weather.condition) : null;
  const greeting = now.getHours() < 6 ? (zh ? '夜深了' : 'Good night') : now.getHours() < 12 ? (zh ? '早上好' : 'Good morning') : now.getHours() < 18 ? (zh ? '下午好' : 'Good afternoon') : (zh ? '晚上好' : 'Good evening');
  const floorplanConfig = useMemo(() => dashboard.config?.homeOs?.floorplan || EMPTY_FLOORPLAN_CONFIG, [dashboard.config]);
  const floorplanState = useMemo(() => buildFloorplanState(floorplanConfig, entities), [floorplanConfig, entities]);
  const devices = useMemo(() => {
    const all = Object.values(entities);
    const first = (domain, test = () => true) => all.find((item) => item.entity_id?.startsWith(`${domain}.`) && test(item)) || null;
    const lights = all.filter((item) => item.entity_id?.startsWith('light.') && !unavailable.has(item.state));
    const sockets = all.filter((item) => item.entity_id?.startsWith('switch.') && /plug|socket|插座|插排/i.test(`${item.entity_id} ${item.attributes?.friendly_name || ''}`));
    const media = first('media_player');
    const climate = first('climate');
    const camera = first('camera');
    const vacuum = first('vacuum');
    const sun = entities['sun.sun'] || first('sun');
    const power = first('sensor', (item) => item.attributes?.device_class === 'power' && Number.isFinite(Number(item.state)));
    return { lights, sockets, media, climate, camera, vacuum, sun, power };
  }, [entities]);
  const lightsOn = devices.lights.filter((item) => item.state === 'on');
  const socketsOn = devices.sockets.filter((item) => item.state === 'on');
  const invoke = (entity, service) => entity && !unavailable.has(entity.state) && callService({ domain: entity.entity_id.split('.')[0], service, target: { entity_id: entity.entity_id } });
  const toggle = (entity) => invoke(entity, entity?.state === 'off' ? 'turn_on' : 'turn_off');
  const summary = dashboard.attention.length ? (zh ? `${dashboard.attention.length} 项状态需要留意` : `${dashboard.attention.length} items need attention`) : (zh ? '全屋状态平稳' : 'Everything looks calm');

  return <div className="home-os-home-page home-os-control-page">
    <section className="home-os-room-strip" aria-label={zh ? '房间环境状态' : 'Room conditions'}>
      {floorplanState.rooms.map((room) => <div className={`home-os-room-chip ${room.presence ? 'is-occupied' : ''}`} key={room.id}>
        <span /><strong>{room.name}</strong><b>{room.temperature ?? '—'}°</b><small>{room.humidity ?? '—'}%</small>
      </div>)}
    </section>

    <div className="home-os-control-deck">
      <aside className="home-os-control-rail home-os-control-rail--left">
        <section className="home-os-control-clock">
          <div><span>{greeting}</span><strong>{now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })}</strong></div>
          <p>{now.toLocaleDateString(locale, { month: 'long', day: 'numeric', weekday: 'long' })}{zh && <Suspense fallback={null}><HomeCalendarMeta date={now} /></Suspense>}</p>
          <div className={`home-os-connection ${dashboard.ready ? 'is-ready' : 'is-waiting'}`}><span /><div><strong>{dashboard.ready ? (zh ? 'HA 实时在线' : 'HA live') : (zh ? '正在连接 HA' : 'Connecting')}</strong><small>{summary}</small></div></div>
        </section>

        <section className="home-os-panel home-os-weather-panel">
          <div className="home-os-panel-title"><span><CloudSun size={17} />{zh ? '天气' : 'Weather'}</span></div>
          {dashboard.weather ? <><div className="home-os-weather-main"><div><strong>{weatherLabel}</strong><small><MapPin size={12} />{dashboard.weather.friendlyName || (zh ? '家庭所在地' : 'Home')}</small></div><b>{dashboard.weather.temperature ?? '—'}°</b></div><div className="home-os-metrics"><span><Thermometer size={13} />{dashboard.weather.apparentTemperature ?? dashboard.weather.temperature ?? '—'}°</span><span><Droplets size={13} />{dashboard.weather.humidity ?? '—'}%</span></div><p className="home-os-advice">{getTravelAdvice(dashboard.weather, language)}</p></> : <div className="home-os-empty-row"><MapPin size={17} /><span>{zh ? '等待天气实体' : 'Waiting for weather'}</span></div>}
        </section>

        <section className="home-os-panel home-os-family-panel">
          <div className="home-os-panel-title"><span><Users size={17} />{zh ? '家庭成员' : 'Household'}</span><b>{dashboard.family.home}/{dashboard.family.total}</b></div>
          <div className="home-os-people">{dashboard.family.people.length ? dashboard.family.people.slice(0, 5).map((person) => <span className={person.state === 'home' ? 'is-home' : ''} key={person.entity_id}>{person.attributes?.friendly_name || person.entity_id.replace('person.', '')}</span>) : <small>{zh ? '等待 person 实体' : 'Waiting for people'}</small>}</div>
        </section>

        <section className="home-os-panel home-os-mini-summary">
          <div className="home-os-panel-title"><span><Radio size={17} />{zh ? '媒体设备' : 'Media'}</span></div>
          <div><strong>{entityName(devices.media, zh ? '未发现播放器' : 'No media player')}</strong><span className={devices.media?.state === 'playing' ? 'is-positive' : ''}>{devices.media?.state === 'playing' ? (zh ? '播放中' : 'Playing') : (zh ? '待机' : 'Idle')}</span></div>
        </section>

        <section className="home-os-panel home-os-mini-summary">
          <div className="home-os-panel-title"><span><Zap size={17} />{zh ? '能源摘要' : 'Energy'}</span><button type="button" onClick={() => navigate('/energy')}>{zh ? '详情' : 'More'}</button></div>
          <div><strong>{devices.power ? `${Number(devices.power.state).toLocaleString(locale)} ${devices.power.attributes?.unit_of_measurement || 'W'}` : '— W'}</strong><span>{zh ? '当前功率' : 'Live power'}</span></div>
        </section>
      </aside>

      <FloorplanPlaceholder config={floorplanConfig} />

      <aside className="home-os-control-rail home-os-control-rail--right">
        <div className="home-os-device-stack">
          <StatusCard icon={Camera} label={zh ? '摄像头' : 'Camera'} name={entityName(devices.camera, zh ? '未发现设备' : 'Not found')} value={devices.camera && !unavailable.has(devices.camera.state) ? (zh ? '在线' : 'Online') : (zh ? '离线' : 'Offline')} active={Boolean(devices.camera && !unavailable.has(devices.camera.state))} disabled={!devices.camera} onClick={() => navigate('/family')} />
          <StatusCard icon={AirVent} label={zh ? '空调' : 'Climate'} name={entityName(devices.climate, zh ? '未发现设备' : 'Not found')} value={devices.climate ? (devices.climate.state === 'off' ? (zh ? '已关闭' : 'Off') : `${devices.climate.attributes?.current_temperature ?? devices.climate.state}°`) : '—'} active={Boolean(devices.climate && devices.climate.state !== 'off')} disabled={!devices.climate} onClick={() => toggle(devices.climate)} />
          <StatusCard icon={PlugZap} label={zh ? '插座' : 'Sockets'} name={devices.sockets.length ? `${devices.sockets.length} ${zh ? '个设备' : 'devices'}` : (zh ? '未发现设备' : 'Not found')} value={`${socketsOn.length} ${zh ? '个开启' : 'on'}`} active={socketsOn.length > 0} disabled={!devices.sockets.length} onClick={() => toggle(devices.sockets[0])} />
          <StatusCard icon={Lightbulb} label={zh ? '全屋灯光' : 'All lights'} name={devices.lights.length ? `${devices.lights.length} ${zh ? '盏灯' : 'lights'}` : (zh ? '未发现灯光' : 'Not found')} value={`${lightsOn.length} ${zh ? '盏开启' : 'on'}`} active={lightsOn.length > 0} disabled={!devices.lights.length} onClick={() => callService({ domain: 'light', service: lightsOn.length ? 'turn_off' : 'turn_on', target: { entity_id: devices.lights.map((item) => item.entity_id) } })} />
          <StatusCard icon={CircleDot} label={zh ? '扫地机' : 'Vacuum'} name={entityName(devices.vacuum, zh ? '未发现设备' : 'Not found')} value={devices.vacuum?.state || '—'} active={Boolean(devices.vacuum && ['cleaning', 'returning'].includes(devices.vacuum.state))} disabled={!devices.vacuum} onClick={() => invoke(devices.vacuum, ['cleaning', 'returning'].includes(devices.vacuum?.state) ? 'pause' : 'start')} />
          <StatusCard icon={Gauge} label={zh ? '系统状态' : 'System'} name={dashboard.ready ? (zh ? '实时连接' : 'Live connection') : (zh ? '正在连接' : 'Connecting')} value={dashboard.attention.length ? `${dashboard.attention.length} ${zh ? '项提醒' : 'alerts'}` : (zh ? '状态正常' : 'Healthy')} active={dashboard.ready && !dashboard.attention.length} disabled={false} onClick={() => navigate('/attention')} />
        </div>
        <HomeModeBar config={dashboard.config} />
        <section className={`home-os-panel home-os-attention ${dashboard.attention.length ? 'has-items' : 'is-clear'}`}>
          <div className="home-os-panel-title"><span>{dashboard.attention.length ? <AlertTriangle size={17} /> : <CheckCircle2 size={17} />}{zh ? '异常中心' : 'Attention'}</span><button type="button" onClick={() => navigate('/attention')}>{zh ? '全部' : 'All'} · {dashboard.attention.length}</button></div>
          {dashboard.attention.length ? <div className="home-os-attention-list">{dashboard.attention.slice(0, 2).map((item) => <div className={`home-os-attention-item is-${item.severity}`} key={item.id}><span /><div><strong>{item.title}</strong><small>{item.description}</small></div></div>)}</div> : <p>{zh ? '门窗、设备与系统均无异常。' : 'Openings, devices and system look normal.'}</p>}
        </section>
      </aside>
    </div>

    <section className="home-os-astro-strip">
      <div><Moon size={18} /><span><small>{zh ? '月相' : 'Moon phase'}</small><strong>{moonNames[dashboard.moon]?.[zh ? 0 : 1] || dashboard.moon || '—'}</strong></span></div>
      <div><Sunrise size={18} /><span><small>{zh ? '日出' : 'Sunrise'}</small><strong>{formatSunTime(devices.sun?.attributes?.next_rising, locale)}</strong></span></div>
      <div><Sunset size={18} /><span><small>{zh ? '日落' : 'Sunset'}</small><strong>{formatSunTime(devices.sun?.attributes?.next_setting, locale)}</strong></span></div>
      <div><CloudSun size={18} /><span><small>{zh ? '出行建议' : 'Travel'}</small><strong>{getTravelAdvice(dashboard.weather, language)}</strong></span></div>
    </section>
  </div>;
}
