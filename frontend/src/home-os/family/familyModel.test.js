import { buildFamilyModel } from './familyModel';
const e = (entity_id, state, device_class, extra = {}) => ({ entity_id, state, attributes: { device_class, friendly_name: entity_id, ...extra } });
test('summarizes real family and security entities', () => { const model = buildFamilyModel({ p: e('person.one', 'home'), w: e('binary_sensor.window', 'on', 'window'), b: e('sensor.lock_battery', '12', 'battery', { unit_of_measurement: '%' }), c: e('camera.entry', 'idle') }); expect(model.people[0].home).toBe(true); expect(model.openings[0].open).toBe(true); expect(model.cameras).toHaveLength(1); expect(model.alerts).toBe(2); });

