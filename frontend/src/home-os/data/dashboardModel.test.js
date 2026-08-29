import { buildDashboardModel, getTravelAdvice } from './dashboardModel';
const entity = (entity_id, state, attributes = {}) => ({ entity_id, state, attributes, last_changed: '2026-08-30T00:00:00Z' });
test('builds live dashboard data and attention items from HA entities', () => {
  const entities = { 'weather.home': entity('weather.home', 'rainy', { temperature: 31, humidity: 80, friendly_name: '上海', forecast: [{ temperature: 33, templow: 25, precipitation_probability: 70 }] }), 'person.one': entity('person.one', 'home', { friendly_name: '舟舟' }), 'binary_sensor.window': entity('binary_sensor.window', 'on', { device_class: 'window', friendly_name: '卧室窗户' }), 'sensor.battery': entity('sensor.battery', '8', { device_class: 'battery', friendly_name: '门锁' }), 'sensor.vacuum_filter_life': entity('sensor.vacuum_filter_life', '12', { unit_of_measurement: '%', friendly_name: '扫地机滤芯寿命' }) };
  const model = buildDashboardModel(entities, {});
  expect(model.weather.temperature).toBe(31);
  expect(model.weather).toMatchObject({ dailyHigh: 33, dailyLow: 25, precipitationProbability: 70 });
  expect(model.family.home).toBe(1);
  expect(model.attention.map((item) => item.category)).toEqual(expect.arrayContaining(['battery', 'security', 'consumable']));
  expect(getTravelAdvice(model.weather, 'zh')).toContain('带伞');
});
