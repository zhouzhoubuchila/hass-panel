import { buildFloorplanState, entityForObject } from './floorplanBinding';

test('maps HA entity state without coupling it to the renderer', () => {
  const state = buildFloorplanState({ rooms: [{ id: 'living', temperature: 'sensor.temp', humidity: 'sensor.humidity' }], lights: [{ entityId: 'light.ceiling', objectNames: ['CeilingLamp'] }] }, {
    'sensor.temp': { state: '24.3' }, 'sensor.humidity': { state: '56' }, 'light.ceiling': { state: 'on' },
  });
  expect(state.rooms[0]).toMatchObject({ temperature: 24.3, humidity: 56 });
  expect(state.lights[0]).toMatchObject({ isOn: true, available: true });
  expect(entityForObject({ name: 'Bulb', parent: { name: 'CeilingLamp' } }, state.lights)).toBe('light.ceiling');
});

