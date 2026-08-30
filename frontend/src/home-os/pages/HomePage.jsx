import React, { lazy, Suspense, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, CloudSun, Droplets, MapPin, Moon, Thermometer, Users } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';
import FloorplanPlaceholder from '../floorplan/FloorplanPlaceholder';
import useHomeDashboard from '../data/useHomeDashboard';
import { getTravelAdvice } from '../data/dashboardModel';
import HomeModeBar from '../components/HomeModeBar';
import '../styles/control-deck.css';

const HomeCalendarMeta = lazy(() => import('../components/HomeCalendarMeta'));

const weatherNames = { sunny: ['晴', 'Sunny'], cloudy: ['多云', 'Cloudy'], partlycloudy: ['局部多云', 'Partly cloudy'], rainy: ['有雨', 'Rainy'], 'clear-night': ['晴夜', 'Clear night'], fog: ['有雾', 'Foggy'], windy: ['有风', 'Windy'], lightning: ['雷雨', 'Thunderstorm'], snowy: ['有雪', 'Snowy'] };
const moonIcons = { new_moon: '●', waxing_crescent: '◔', first_quarter: '◑', waxing_gibbous: '◕', full_moon: '○', waning_gibbous: '◕', last_quarter: '◐', waning_crescent: '◔' };

export default function HomePage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const dashboard = useHomeDashboard();
  const [now, setNow] = useState(new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 30000); return () => window.clearInterval(timer); }, []);
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  const weatherLabel = dashboard.weather ? (weatherNames[dashboard.weather.condition]?.[language === 'zh' ? 0 : 1] || dashboard.weather.condition) : null;
  const summary = dashboard.attention.length ? (language === 'zh' ? `今天有 ${dashboard.attention.length} 项状态需要留意` : `${dashboard.attention.length} items need attention today`) : (language === 'zh' ? '家庭状态平稳，暂无需要处理的事项' : 'Your home is calm. Nothing needs attention');

  return <div className="home-os-home-page home-os-control-page">
    <div className="home-os-control-deck">
      <aside className="home-os-control-rail home-os-control-rail--left">
        <section className="home-os-control-clock">
          <span>{now.toLocaleDateString(locale, { month: 'long', day: 'numeric', weekday: 'long' })}{language === 'zh' && <Suspense fallback={null}><HomeCalendarMeta date={now} /></Suspense>}</span>
          <h1>{now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })}</h1>
          <p>{summary}</p>
          <div className={`home-os-connection ${dashboard.ready ? 'is-ready' : 'is-waiting'}`}><span /><div><strong>{dashboard.ready ? (language === 'zh' ? 'HA 实时在线' : 'HA live') : (language === 'zh' ? '正在连接 HA' : 'Connecting')}</strong><small>{language === 'zh' ? '实体状态实时同步' : 'Live entity sync'}</small></div></div>
        </section>
        <section className="home-os-panel home-os-weather-panel">
          <div className="home-os-panel-title"><span><CloudSun size={20} />{language === 'zh' ? '环境' : 'Weather'}</span></div>
          {dashboard.weather ? <><div className="home-os-weather-main"><div><strong>{weatherLabel}</strong><small><MapPin size={13} />{dashboard.weather.friendlyName || (language === 'zh' ? '家庭所在地' : 'Home')}</small></div><b>{dashboard.weather.temperature ?? '—'}°</b></div><div className="home-os-metrics"><span><Thermometer size={15} />{dashboard.weather.apparentTemperature ?? dashboard.weather.temperature ?? '—'}°</span><span><Droplets size={15} />{dashboard.weather.humidity ?? '—'}%</span><span><Moon size={15} />{moonIcons[dashboard.moon] || '—'}</span></div><p className="home-os-advice">{getTravelAdvice(dashboard.weather, language)}</p></> : <div className="home-os-empty-row"><MapPin size={18} /><span>{language === 'zh' ? '等待天气实体' : 'Waiting for weather'}</span></div>}
        </section>
        <section className="home-os-panel">
          <div className="home-os-panel-title"><span><Users size={20} />{language === 'zh' ? '家庭成员' : 'Household'}</span></div>
          {dashboard.family.total ? <><div className="home-os-family-count"><strong>{dashboard.family.home}</strong><span>/ {dashboard.family.total} {language === 'zh' ? '人在家' : 'home'}</span></div><div className="home-os-people">{dashboard.family.people.slice(0, 5).map((person) => <span className={person.state === 'home' ? 'is-home' : ''} key={person.entity_id}>{person.attributes?.friendly_name || person.entity_id.replace('person.', '')}</span>)}</div></> : <div className="home-os-empty-row"><span className="home-os-dot" /><span>{language === 'zh' ? '等待 person 实体' : 'Waiting for people'}</span></div>}
        </section>
      </aside>
      <FloorplanPlaceholder config={dashboard.config?.homeOs?.floorplan} />
      <aside className="home-os-control-rail home-os-control-rail--right">
        <HomeModeBar config={dashboard.config} />
        <section className={`home-os-panel home-os-attention ${dashboard.attention.length ? 'has-items' : 'is-clear'}`}>
          <div className="home-os-panel-title"><span>{dashboard.attention.length ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}{language === 'zh' ? '需要你处理' : 'Needs attention'}</span><button type="button" onClick={() => navigate('/attention')}>{language === 'zh' ? '查看全部' : 'View all'} · {dashboard.attention.length}</button></div>
          {dashboard.attention.length ? <div className="home-os-attention-list">{dashboard.attention.slice(0, 4).map((item) => <div className={`home-os-attention-item is-${item.severity}`} key={item.id}><span /><div><strong>{item.title}</strong><small>{item.description}</small></div></div>)}</div> : <><strong>{language === 'zh' ? '家庭状态正常' : 'Household status normal'}</strong><p>{language === 'zh' ? '门窗、设备电量、系统更新和关键实体均无异常。' : 'Openings, batteries, updates and mapped entities look normal.'}</p></>}
        </section>
      </aside>
    </div>
  </div>;
}
