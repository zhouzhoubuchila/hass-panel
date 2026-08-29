const unavailableStates = new Set(['unavailable', 'unknown']);
const byId = (entities, id) => (id ? entities[id] || null : null);
const first = (entities, predicate) => Object.values(entities).find(predicate) || null;
const legacyCard = (config, type) => config?.cards?.find((card) => card.type === type)?.config || {};
const numberValue = (value) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; };

export function resolveHomeOsMapping(entities = {}, config = {}) {
  const explicit = config.homeOs?.entities || {};
  const weatherCard = legacyCard(config, 'WeatherCard');
  const climateCard = legacyCard(config, 'ClimateCard');
  const familyCard = legacyCard(config, 'FamilyCard');
  const weather = byId(entities, explicit.weather || weatherCard.entity_id) || first(entities, (e) => e.entity_id.startsWith('weather.'));
  const temperature = byId(entities, explicit.temperature || climateCard.temperature_entity_id) || weather;
  const humidity = byId(entities, explicit.humidity || climateCard.humidity_entity_id) || weather;
  const moon = byId(entities, explicit.moon) || first(entities, (e) => e.entity_id.startsWith('sensor.') && e.attributes?.device_class === 'enum' && e.entity_id.includes('moon'));
  const configuredPeople = explicit.persons || familyCard.persons?.map((person) => person.entity_id) || [];
  const people = configuredPeople.length ? configuredPeople.map((id) => byId(entities, id)).filter(Boolean) : Object.values(entities).filter((e) => e.entity_id.startsWith('person.'));
  return { weather, temperature, humidity, moon, people };
}

export function createAttentionItems(entities = {}, mapping = {}, config = {}) {
  const items = [];
  const now = new Date().toISOString();
  const settings = config.homeOs?.attention || {};
  const batteryThreshold = settings.batteryThreshold ?? 20;
  const cpuThreshold = settings.cpuTemperatureThreshold ?? 75;
  const consumableThreshold = settings.consumableThreshold ?? 15;
  const mappedIds = new Set([mapping.weather?.entity_id, mapping.temperature?.entity_id, mapping.humidity?.entity_id, mapping.moon?.entity_id, ...mapping.people.map((p) => p.entity_id)].filter(Boolean));
  Object.values(entities).forEach((entity) => {
    const { entity_id: entityId, state, attributes = {} } = entity;
    const name = attributes.friendly_name || entityId;
    const value = numberValue(state);
    const add = (suffix, severity, category, title, description, dismissible = true) => items.push({ id: `${suffix}:${entityId}`, severity, category, title, description, entityId, timestamp: entity.last_changed || now, action: null, dismissible });
    if (attributes.device_class === 'battery' && value !== null && value <= batteryThreshold) add('battery', value <= 10 ? 'critical' : 'warning', 'battery', `${name} ${value}%`, '设备电量偏低');
    if (entityId.startsWith('sensor.') && attributes.unit_of_measurement === '%' && /filter|brush|consum|life|滤芯|耗材|寿命/i.test(`${entityId} ${name}`) && value !== null && value <= consumableThreshold) add('consumable', value <= 5 ? 'critical' : 'warning', 'consumable', `${name} ${value}%`, '耗材寿命即将用尽');
    if (['door', 'window', 'garage_door', 'opening'].includes(attributes.device_class) && state === 'on') add('opening', 'warning', 'security', `${name}未关闭`, '门窗状态需要确认', false);
    if (attributes.device_class === 'temperature' && /pve|cpu|processor/i.test(`${entityId} ${name}`) && value !== null && value >= cpuThreshold) add('temperature', value >= cpuThreshold + 10 ? 'critical' : 'warning', 'homelab', `${name} ${value}°`, '计算节点温度偏高');
    if (entityId.startsWith('update.') && state === 'on') add('update', 'info', 'system', `${name}可更新`, 'Home Assistant 检测到新版本');
    if (mappedIds.has(entityId) && unavailableStates.has(state)) add('offline', 'warning', 'availability', `${name}不可用`, '首页关联实体当前无有效状态', false);
  });
  const rank = { critical: 0, warning: 1, info: 2 };
  return items.sort((a, b) => rank[a.severity] - rank[b.severity] || new Date(b.timestamp) - new Date(a.timestamp));
}

export function buildDashboardModel(entities = {}, config = {}) {
  const mapping = resolveHomeOsMapping(entities, config);
  const attrs = mapping.weather?.attributes || {};
  const temperature = numberValue(mapping.temperature === mapping.weather ? attrs.temperature : mapping.temperature?.state);
  const humidity = numberValue(mapping.humidity === mapping.weather ? attrs.humidity : mapping.humidity?.state);
  const today = Array.isArray(attrs.forecast) ? attrs.forecast[0] || {} : {};
  return { mapping, attention: createAttentionItems(entities, mapping, config), weather: mapping.weather ? { condition: mapping.weather.state, temperature, humidity, apparentTemperature: numberValue(attrs.apparent_temperature), aqi: numberValue(attrs.aqi), windSpeed: numberValue(attrs.wind_speed), friendlyName: attrs.friendly_name, dailyHigh: numberValue(today.temperature), dailyLow: numberValue(today.templow), precipitationProbability: numberValue(today.precipitation_probability) } : null, family: { total: mapping.people.length, home: mapping.people.filter((p) => p.state === 'home').length, people: mapping.people }, moon: mapping.moon?.state || null };
}

export function getTravelAdvice(weather, language = 'zh') {
  if (!weather) return language === 'zh' ? '配置天气实体后生成出行建议' : 'Configure a weather entity for travel advice';
  const advice = [];
  if (/rain|pour|lightning/i.test(weather.condition)) advice.push(language === 'zh' ? '出门带伞' : 'Take an umbrella');
  if (weather.temperature !== null && weather.temperature <= 10) advice.push(language === 'zh' ? '注意保暖' : 'Dress warmly');
  if (weather.temperature !== null && weather.temperature >= 30) advice.push(language === 'zh' ? '注意防暑补水' : 'Stay cool and hydrated');
  if (weather.aqi !== null && weather.aqi > 100) advice.push(language === 'zh' ? '减少长时间户外活动' : 'Limit prolonged outdoor activity');
  if (!advice.length) advice.push(language === 'zh' ? '天气平稳，适合日常出行' : 'Conditions look good for everyday travel');
  return advice.join(language === 'zh' ? '，' : '. ');
}
