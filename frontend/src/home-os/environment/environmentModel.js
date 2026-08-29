import { Solar } from 'lunar-javascript';
import { resolveHomeOsMapping } from '../data/dashboardModel';

const numeric = (value) => { const n = Number(value); return Number.isFinite(n) ? n : null; };
const findEntity = (entities, id, predicate) => id ? entities[id] || null : Object.values(entities).find(predicate) || null;

export function buildCalendarModel(date = new Date()) {
  const lunar = Solar.fromDate(date).getLunar();
  return { lunarDate: lunar.toString(), yearGanZhi: lunar.getYearInGanZhi(), zodiac: lunar.getYearShengXiao(), jieQi: lunar.getJieQi() || lunar.getNextJieQi()?.getName() || null, jieQiIsToday: Boolean(lunar.getJieQi()), suitable: lunar.getDayYi().slice(0, 5), avoid: lunar.getDayJi().slice(0, 5) };
}

export function buildEnvironmentModel(entities = {}, config = {}, date = new Date()) {
  const mapping = resolveHomeOsMapping(entities, config);
  const explicit = config.homeOs?.entities || {};
  const attrs = mapping.weather?.attributes || {};
  const aqiEntity = findEntity(entities, explicit.aqi, (e) => e.attributes?.device_class === 'aqi' || /(^|_)aqi($|_)/i.test(e.entity_id));
  const uvEntity = findEntity(entities, explicit.uv, (e) => /uv(_index)?$/i.test(e.entity_id) || /紫外线|uv index/i.test(e.attributes?.friendly_name || ''));
  const rainEntity = findEntity(entities, explicit.precipitation, (e) => /precipitation|rain/i.test(e.entity_id) && numeric(e.state) !== null);
  const sun = findEntity(entities, explicit.sun || 'sun.sun', () => false);
  const temperature = numeric(mapping.temperature === mapping.weather ? attrs.temperature : mapping.temperature?.state);
  const humidity = numeric(mapping.humidity === mapping.weather ? attrs.humidity : mapping.humidity?.state);
  const aqi = numeric(aqiEntity?.state ?? attrs.aqi);
  const uv = numeric(uvEntity?.state ?? attrs.uv_index);
  const precipitation = numeric(rainEntity?.state ?? attrs.precipitation);
  const comfort = temperature === null || humidity === null ? null : temperature >= 20 && temperature <= 26 && humidity >= 40 && humidity <= 65 && (aqi === null || aqi <= 100);
  return { weather: mapping.weather ? { condition: mapping.weather.state, name: attrs.friendly_name, temperature, apparentTemperature: numeric(attrs.apparent_temperature), humidity, pressure: numeric(attrs.pressure), windSpeed: numeric(attrs.wind_speed), visibility: numeric(attrs.visibility) } : null, air: { aqi, uv, precipitation }, sun: { sunrise: sun?.attributes?.next_rising || null, sunset: sun?.attributes?.next_setting || null }, moon: mapping.moon?.state || null, comfort, calendar: buildCalendarModel(date) };
}

export function environmentAdvice(model, language = 'zh') {
  const messages = [];
  const { weather, air } = model;
  if (!weather) return language === 'zh' ? '配置 weather 实体后生成生活建议' : 'Configure a weather entity for lifestyle advice';
  if (/rain|pour|lightning/i.test(weather.condition) || (air.precipitation ?? 0) > 0) messages.push(language === 'zh' ? '带伞' : 'take an umbrella');
  if ((air.uv ?? 0) >= 6) messages.push(language === 'zh' ? '做好防晒' : 'use sun protection');
  if ((air.aqi ?? 0) > 100) messages.push(language === 'zh' ? '减少户外停留' : 'limit outdoor time');
  if ((weather.temperature ?? 20) >= 30) messages.push(language === 'zh' ? '注意补水' : 'stay hydrated');
  if ((weather.temperature ?? 20) <= 10) messages.push(language === 'zh' ? '注意保暖' : 'dress warmly');
  if (!messages.length) messages.push(language === 'zh' ? '体感舒适，适合日常出行' : 'comfortable for everyday travel');
  return language === 'zh' ? `今日建议：${messages.join('、')}` : `Today: ${messages.join(', ')}`;
}

