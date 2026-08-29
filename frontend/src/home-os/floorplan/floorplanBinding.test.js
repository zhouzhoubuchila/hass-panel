import { buildFloorplanState, discoverRoomBindings, entityForObject, roomForObject } from './floorplanBinding';

test('maps HA entity state without coupling it to the renderer', () => {
  const state = buildFloorplanState({ rooms: [{ id: 'living', temperature: 'sensor.temp', humidity: 'sensor.humidity' }], lights: [{ entityId: 'light.ceiling', objectNames: ['CeilingLamp'] }] }, {
    'sensor.temp': { state: '24.3' }, 'sensor.humidity': { state: '56' }, 'light.ceiling': { state: 'on' },
  });
  expect(state.rooms[0]).toMatchObject({ temperature: 24.3, humidity: 56 });
  expect(state.lights[0]).toMatchObject({ isOn: true, available: true });
  expect(entityForObject({ name: 'Bulb', parent: { name: 'CeilingLamp' } }, state.lights)).toBe('light.ceiling');
});

test('discovers only room-specific entities and resolves room clicks', () => {
  const room = { id: 'living', aliases: ['客厅'], objectNames: ['Room_living'], lightObject: 'Light_Living' };
  const entities = {
    'sensor.living_temperature': { entity_id: 'sensor.living_temperature', state: '26.4', attributes: { friendly_name: '客厅温度', device_class: 'temperature' } },
    'sensor.bedroom_temperature': { entity_id: 'sensor.bedroom_temperature', state: '25', attributes: { friendly_name: '主卧温度', device_class: 'temperature' } },
    'light.living': { entity_id: 'light.living', state: 'on', attributes: { friendly_name: '客厅灯' } },
  };
  expect(discoverRoomBindings(room, entities)).toMatchObject({ temperature: 'sensor.living_temperature', light: 'light.living' });
  const state = buildFloorplanState({ rooms: [room] }, entities);
  expect(state.rooms[0].temperature).toBe(26.4);
  expect(state.lights[0].entityId).toBe('light.living');
  expect(roomForObject({ name: 'Room_living', userData: {}, parent: null }, state.rooms)?.id).toBe('living');
});

