import { buildHomelabModel, PRIORITY } from './homelabModel';
const entity = (entity_id, state, attributes = {}) => ({ entity_id, state, attributes });
test('prioritizes known PVE and host entities', () => { const model = buildHomelabModel({ [PRIORITY.pveTemperature]: entity(PRIORITY.pveTemperature, '62.5', { device_class: 'temperature', unit_of_measurement: '°C' }), [PRIORITY.primaryHost]: entity(PRIORITY.primaryHost, 'on'), x: entity('sensor.immortalwrt_ping', '8', { unit_of_measurement: 'ms' }) }); expect(model.overview.temperature.value).toBe(62.5); expect(model.overview.host.online).toBe(true); expect(model.router[0].value).toBe(8); });

