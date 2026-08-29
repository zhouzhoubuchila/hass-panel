import { buildDashboardModel, getTravelAdvice } from './dashboardModel';
const entity = (entity_id, state, attributes = {}) => ({ entity_id, state, attributes, last_changed: '2026-08-30T00:00:00Z' });
test('builds live dashboard data and attention items from HA entities', () => {
  const entities = { 'weather.home': entity('weather.home', 'rainy', { temperature: 31, humidity: 80, friendly_name: '上海' }), 'person.one': entity('person.one', 'home', { friendly_name: '舟舟' }), 'binary_sensor.window': entity('binary_sensor.window', 'on', { device_class: 'window', friendly_name: '卧室窗户' }), 'sensor.battery': entity('sensor.battery', '8', { device_class: 'battery', friendly_name: '门锁' }) };
  const model = buildDashboardModel(entities, {});
  expect(model.weather.temperature).toBe(31);
  expect(model.family.home).toBe(1);
  expect(model.attention.map((item) => item.category)).toEqual(expect.arrayContaining(['battery', 'security']));
  expect(getTravelAdvice(model.weather, 'zh')).toContain('带伞');
});
