const values = (entities) => Object.values(entities || {});
const nameOf = (entity) => entity.attributes?.friendly_name || entity.entity_id;
const unavailable = (entity) => ['unknown', 'unavailable'].includes(entity.state);

export function buildFamilyModel(entities = {}) {
  const all = values(entities);
  const people = all.filter((e) => e.entity_id.startsWith('person.')).map((e) => ({ id: e.entity_id, name: nameOf(e), state: e.state, picture: e.attributes?.entity_picture || null, home: e.state === 'home' }));
  const openings = all.filter((e) => e.entity_id.startsWith('binary_sensor.') && ['door', 'window', 'garage_door', 'opening'].includes(e.attributes?.device_class)).map((e) => ({ id: e.entity_id, name: nameOf(e), open: e.state === 'on', available: !unavailable(e) }));
  const presence = all.filter((e) => e.entity_id.startsWith('binary_sensor.') && ['occupancy', 'motion', 'presence'].includes(e.attributes?.device_class)).map((e) => ({ id: e.entity_id, name: nameOf(e), active: e.state === 'on', available: !unavailable(e) }));
  const cameras = all.filter((e) => e.entity_id.startsWith('camera.')).map((e) => ({ id: e.entity_id, name: nameOf(e), available: !unavailable(e), state: e.state }));
  const applianceDomains = new Set(['vacuum', 'fan', 'climate', 'media_player', 'humidifier', 'water_heater', 'lawn_mower']);
  const appliances = all.filter((e) => applianceDomains.has(e.entity_id.split('.')[0])).map((e) => ({ id: e.entity_id, name: nameOf(e), state: e.state, active: !['off', 'idle', 'docked', 'standby', 'unavailable', 'unknown'].includes(e.state) }));
  const batteries = all.filter((e) => e.attributes?.device_class === 'battery' && Number.isFinite(Number(e.state))).map((e) => ({ id: e.entity_id, name: nameOf(e), value: Number(e.state) })).sort((a, b) => a.value - b.value);
  const consumables = all.filter((e) => e.entity_id.startsWith('sensor.') && e.attributes?.unit_of_measurement === '%' && /filter|brush|consum|life|滤芯|耗材|寿命/i.test(`${e.entity_id} ${nameOf(e)}`)).map((e) => ({ id: e.entity_id, name: nameOf(e), value: Number(e.state) })).filter((e) => Number.isFinite(e.value)).sort((a, b) => a.value - b.value);
  return { people, openings, presence, cameras, appliances, batteries, consumables, alerts: openings.filter((e) => e.open).length + batteries.filter((e) => e.value <= 20).length + consumables.filter((e) => e.value <= 15).length };
}

