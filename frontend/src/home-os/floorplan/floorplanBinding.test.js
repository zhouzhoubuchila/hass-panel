import { buildFloorplanState, deviceForObject, discoverRoomBindings, entityForObject, roomForObject } from './floorplanBinding';

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

test('maps interactive room devices without exposing unavailable controls', () => {
  const room = { id: 'living', aliases: ['客厅'], objectNames: ['Room_living'], curtain: 'cover.living' };
  const state = buildFloorplanState({ rooms: [room] }, {
    'cover.living': { entity_id: 'cover.living', state: 'open', attributes: { friendly_name: '客厅窗帘' } },
  });
  expect(state.rooms[0].devices[0]).toMatchObject({ type: 'curtain', active: true, available: true });
  expect(deviceForObject({ userData: { roomId: 'living', deviceType: 'curtain' }, parent: null }, state.rooms)?.entityId).toBe('cover.living');
});

test('discovers a whole-home vacuum and promotes failures to alerts', () => {
  const state = buildFloorplanState({ rooms: [] }, {
    'vacuum.dreame': { entity_id: 'vacuum.dreame', state: 'error', attributes: { friendly_name: '追觅扫地机器人' } },
  });
  expect(state.vacuum).toMatchObject({ entityId: 'vacuum.dreame', error: true });
  expect(state.alerts).toHaveLength(1);
});

