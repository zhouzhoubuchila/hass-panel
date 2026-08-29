const values = (entities) => Object.values(entities || {});
const nameOf = (entity) => entity.attributes?.friendly_name || entity.entity_id;
const unavailable = (entity) => ['unknown', 'unavailable'].includes(entity.state);

export function buildFamilyModel(entities = {}, now = new Date()) {
  const all = values(entities);
  const people = all.filter((e) => e.entity_id.startsWith('person.')).map((e) => ({ id: e.entity_id, name: nameOf(e), state: e.state, picture: e.attributes?.entity_picture || null, home: e.state === 'home' }));
  const openings = all.filter((e) => e.entity_id.startsWith('binary_sensor.') && ['door', 'window', 'garage_door', 'opening'].includes(e.attributes?.device_class)).map((e) => ({ id: e.entity_id, name: nameOf(e), open: e.state === 'on', available: !unavailable(e) }));
  const presence = all.filter((e) => e.entity_id.startsWith('binary_sensor.') && ['occupancy', 'motion', 'presence'].includes(e.attributes?.device_class)).map((e) => ({ id: e.entity_id, name: nameOf(e), active: e.state === 'on', available: !unavailable(e) }));
  const cameras = all.filter((e) => e.entity_id.startsWith('camera.')).map((e) => ({ id: e.entity_id, name: nameOf(e), available: !unavailable(e), state: e.state }));
  const cameraEventPattern = /camera|doorbell|visitor|person|vehicle|detection|摄像|门铃|访客|人员|车辆|检测/i;
  const cameraEvents = all.filter((e) => {
    const searchable = `${e.entity_id} ${nameOf(e)} ${e.attributes?.event_type || ''}`;
    if (!cameraEventPattern.test(searchable)) return false;
    if (e.entity_id.startsWith('event.')) return true;
    return e.entity_id.startsWith('binary_sensor.') && ['motion', 'occupancy', 'presence', 'sound'].includes(e.attributes?.device_class) && e.state === 'on';
  }).map((e) => ({ id: e.entity_id, name: nameOf(e), type: e.attributes?.event_type || e.attributes?.device_class || e.state, timestamp: e.last_changed ? new Date(e.last_changed) : null, cameraEntityId: e.attributes?.camera_entity_id || null })).filter((event) => !event.timestamp || (!Number.isNaN(event.timestamp.getTime()) && event.timestamp.getTime() >= now.getTime() - 86400000)).sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  const applianceDomains = new Set(['vacuum', 'fan', 'climate', 'media_player', 'humidifier', 'water_heater', 'lawn_mower']);
  const appliances = all.filter((e) => applianceDomains.has(e.entity_id.split('.')[0])).map((e) => ({ id: e.entity_id, name: nameOf(e), state: e.state, active: !['off', 'idle', 'docked', 'standby', 'unavailable', 'unknown'].includes(e.state) }));
  const batteries = all.filter((e) => e.attributes?.device_class === 'battery' && Number.isFinite(Number(e.state))).map((e) => ({ id: e.entity_id, name: nameOf(e), value: Number(e.state) })).sort((a, b) => a.value - b.value);
  const consumables = all.filter((e) => e.entity_id.startsWith('sensor.') && e.attributes?.unit_of_measurement === '%' && /filter|brush|consum|life|滤芯|耗材|寿命/i.test(`${e.entity_id} ${nameOf(e)}`)).map((e) => ({ id: e.entity_id, name: nameOf(e), value: Number(e.state) })).filter((e) => Number.isFinite(e.value)).sort((a, b) => a.value - b.value);
  const horizon = now.getTime() + 7 * 24 * 60 * 60 * 1000;
  const schedule = all.filter((e) => e.entity_id.startsWith('calendar.')).map((e) => {
    const startRaw = e.attributes?.start_time || e.attributes?.start?.dateTime || e.attributes?.start?.date;
    const start = startRaw ? new Date(startRaw) : null;
    return { id: e.entity_id, calendar: nameOf(e), title: e.attributes?.message || nameOf(e), start, location: e.attributes?.location || '', active: e.state === 'on' };
  }).filter((event) => event.active || (event.start && !Number.isNaN(event.start.getTime()) && event.start.getTime() >= now.getTime() - 86400000 && event.start.getTime() <= horizon)).sort((a, b) => (a.start?.getTime() || 0) - (b.start?.getTime() || 0));
  const todoLists = all.filter((e) => e.entity_id.startsWith('todo.')).map((e) => ({ id: e.entity_id, name: nameOf(e), count: Number.isFinite(Number(e.state)) ? Number(e.state) : 0 }));
  return { people, openings, presence, cameras, cameraEvents, appliances, batteries, consumables, schedule, todoLists, alerts: openings.filter((e) => e.open).length + batteries.filter((e) => e.value <= 20).length + consumables.filter((e) => e.value <= 15).length };
}
