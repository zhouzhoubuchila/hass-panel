import { buildFamilyModel } from './familyModel';
const e = (entity_id, state, device_class, extra = {}) => ({ entity_id, state, attributes: { device_class, friendly_name: entity_id, ...extra } });
test('summarizes real family and security entities', () => { const model = buildFamilyModel({ p: e('person.one', 'home'), w: e('binary_sensor.window', 'on', 'window'), b: e('sensor.lock_battery', '12', 'battery', { unit_of_measurement: '%' }), c: e('camera.entry', 'idle') }); expect(model.people[0].home).toBe(true); expect(model.openings[0].open).toBe(true); expect(model.cameras).toHaveLength(1); expect(model.alerts).toBe(2); });
test('collects upcoming HA calendar events and todo counts', () => { const model = buildFamilyModel({ cal: e('calendar.family', 'off', null, { message: '体检', start_time: '2026-08-31T09:00:00+08:00' }), todo: e('todo.shopping', '3') }, new Date('2026-08-30T08:00:00+08:00')); expect(model.schedule[0].title).toBe('体检'); expect(model.todoLists[0].count).toBe(3); });

