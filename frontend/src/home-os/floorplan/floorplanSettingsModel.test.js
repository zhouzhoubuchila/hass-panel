import { createGlobalMappings, createRoomMappings, getEntityOptions, mergeFloorplanConfig } from './floorplanSettingsModel';

test('floorplan settings preserve unrelated config and produce explicit mappings', () => {
  const original = { cards: [{ id: 1 }], globalConfig: { theme: 'dark' }, homeOs: { attention: { battery: 20 } } };
  const mappings = createRoomMappings(original);
  mappings[0].temperature = 'sensor.living_temperature';
  mappings[0].light = 'light.living';
  const merged = mergeFloorplanConfig(original, mappings);
  expect(merged.cards).toEqual(original.cards);
  expect(merged.homeOs.attention).toEqual({ battery: 20 });
  expect(merged.homeOs.floorplan.rooms[0].temperature).toBe('sensor.living_temperature');
  expect(merged.homeOs.floorplan.lights[0]).toEqual({ entityId: 'light.living', objectNames: ['Light_LivingDining'] });
  expect(createGlobalMappings({ homeOs: { floorplan: { vacuum: 'vacuum.dreame' } } })).toEqual({ vacuum: 'vacuum.dreame' });
});

test('entity options respect domain and device class', () => {
  const entities = {
    temp: { entity_id: 'sensor.temp', attributes: { device_class: 'temperature' } },
    humidity: { entity_id: 'sensor.humidity', attributes: { device_class: 'humidity' } },
  };
  expect(getEntityOptions(entities, 'temperature').map((entity) => entity.entity_id)).toEqual(['sensor.temp']);
});

