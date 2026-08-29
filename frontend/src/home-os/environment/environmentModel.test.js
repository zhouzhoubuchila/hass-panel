import { buildCalendarModel, buildEnvironmentModel, environmentAdvice, evaluateComfort } from './environmentModel';
const entity = (entity_id, state, attributes = {}) => ({ entity_id, state, attributes });
test('combines HA weather and Chinese calendar data', () => {
  const model = buildEnvironmentModel({ 'weather.home': entity('weather.home', 'rainy', { temperature: 31, humidity: 70, uv_index: 7 }), 'sensor.aqi': entity('sensor.aqi', '120', { device_class: 'aqi' }), 'sun.sun': entity('sun.sun', 'above_horizon', { next_rising: '2026-08-30T21:00:00Z', next_setting: '2026-08-30T09:00:00Z' }) }, {}, new Date('2026-08-30T00:00:00Z'));
  expect(model.weather.temperature).toBe(31); expect(model.air.aqi).toBe(120); expect(model.calendar.lunarDate).toContain('年'); expect(environmentAdvice(model, 'zh')).toContain('带伞'); expect(buildCalendarModel(new Date('2026-08-30')).suitable.length).toBeGreaterThan(0);
});
test('comfort thresholds are configurable', () => {
  expect(evaluateComfort({ temperature: 27, humidity: 60, aqi: 80 })).toBe(false);
  expect(evaluateComfort({ temperature: 27, humidity: 60, aqi: 80 }, { temperatureMax: 28 })).toBe(true);
});
