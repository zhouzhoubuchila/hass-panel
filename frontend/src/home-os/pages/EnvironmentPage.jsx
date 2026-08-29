import React from 'react';
import { CalendarDays, CloudRain, CloudSun, Droplets, Eye, Gauge, Moon, Sparkles, Sunrise, Sunset, Thermometer, Wind } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import useEnvironmentDashboard from '../environment/useEnvironmentDashboard';
import { environmentAdvice } from '../environment/environmentModel';

const formatTime = (value, locale) => value ? new Date(value).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : '—';
export default function EnvironmentPage() {
  const { language } = useLanguage();
  const model = useEnvironmentDashboard();
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  return <section className="home-os-environment-page">
    <header className="home-os-page-heading"><span>{language === 'zh' ? '环境与生活方式' : 'Environment & lifestyle'}</span><h1>{model.weather?.name || (language === 'zh' ? '家庭环境' : 'Home environment')}</h1><p>{environmentAdvice(model, language)}</p></header>
    <div className="home-os-environment-grid">
      <article className="home-os-env-card home-os-env-hero"><div className="home-os-env-title"><CloudSun size={19} />{language === 'zh' ? '当前天气' : 'Current weather'}</div>{model.weather ? <><div className="home-os-env-temperature"><strong>{model.weather.temperature ?? '—'}°</strong><span>{model.weather.condition}</span></div><div className="home-os-env-metrics"><span><Thermometer size={15} />{model.weather.apparentTemperature ?? model.weather.temperature ?? '—'}°</span><span><Droplets size={15} />{model.weather.humidity ?? '—'}%</span><span><Wind size={15} />{model.weather.windSpeed ?? '—'}</span><span><Gauge size={15} />{model.weather.pressure ?? '—'}</span><span><Eye size={15} />{model.weather.visibility ?? '—'}</span></div></> : <p className="home-os-env-empty">{language === 'zh' ? '等待 weather 实体' : 'Waiting for a weather entity'}</p>}</article>
      <article className="home-os-env-card"><div className="home-os-env-title"><Sparkles size={19} />{language === 'zh' ? '空气与体感' : 'Air & comfort'}</div><div className="home-os-env-score"><strong>{model.air.aqi ?? '—'}</strong><span>AQI</span></div><div className="home-os-env-pills"><span>UV {model.air.uv ?? '—'}</span><span><CloudRain size={13} />{model.air.precipitation ?? '—'}</span><span className={model.comfort ? 'is-good' : ''}>{model.comfort === null ? (language === 'zh' ? '数据不足' : 'No data') : model.comfort ? (language === 'zh' ? '舒适' : 'Comfortable') : (language === 'zh' ? '需调节' : 'Adjust')}</span></div></article>
      <article className="home-os-env-card"><div className="home-os-env-title"><Sunrise size={19} />{language === 'zh' ? '日月节律' : 'Sun & moon'}</div><div className="home-os-sun-times"><span><Sunrise size={16} />{formatTime(model.sun.sunrise, locale)}</span><span><Sunset size={16} />{formatTime(model.sun.sunset, locale)}</span><span><Moon size={16} />{model.moon || '—'}</span></div></article>
      <article className="home-os-env-card home-os-calendar-card"><div className="home-os-env-title"><CalendarDays size={19} />{language === 'zh' ? '今日历法' : 'Chinese calendar'}</div><strong>{model.calendar.lunarDate}</strong><p>{model.calendar.yearGanZhi} · {model.calendar.zodiac}{language === 'zh' ? '年' : ''} · {model.calendar.jieQi}</p><div className="home-os-almanac"><div><b>{language === 'zh' ? '宜' : 'Good'}</b><span>{model.calendar.suitable.join(' · ')}</span></div><div><b>{language === 'zh' ? '忌' : 'Avoid'}</b><span>{model.calendar.avoid.join(' · ')}</span></div></div></article>
    </div>
  </section>;
}

