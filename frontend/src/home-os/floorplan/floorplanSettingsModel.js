import { D_PLAN_ROOMS } from './proceduralDPlan';

export const FLOORPLAN_FIELDS = ['temperature', 'humidity', 'presence', 'climate', 'light'];

export function createRoomMappings(config = {}) {
  const floorplan = config.homeOs?.floorplan || {};
  const rooms = new Map((floorplan.rooms || []).map((room) => [room.id, room]));
  return D_PLAN_ROOMS.map((definition) => {
    const configured = rooms.get(definition.id) || {};
    const light = (floorplan.lights || []).find((item) => item.objectNames?.includes(definition.lightObject));
    return {
      id: definition.id,
      name: configured.name || definition.name,
      temperature: configured.temperature || '',
      humidity: configured.humidity || '',
      presence: configured.presence || '',
      climate: configured.climate || '',
      light: light?.entityId || '',
    };
  });
}

export function mergeFloorplanConfig(config = {}, mappings = []) {
  const floorplan = config.homeOs?.floorplan || {};
  const dLightObjects = new Set(D_PLAN_ROOMS.map((room) => room.lightObject));
  const preservedLights = (floorplan.lights || []).filter((light) => !(light.objectNames || []).some((name) => dLightObjects.has(name)));
  const definitions = new Map(D_PLAN_ROOMS.map((room) => [room.id, room]));
  const rooms = mappings.map((mapping) => {
    const definition = definitions.get(mapping.id);
    const configured = (floorplan.rooms || []).find((room) => room.id === mapping.id) || {};
    const room = {
      ...configured,
      id: mapping.id,
      name: mapping.name || definition?.name || mapping.id,
      aliases: definition?.aliases || configured.aliases || [],
      lightObject: definition?.lightObject || configured.lightObject,
      objectNames: configured.objectNames || [`Room_${mapping.id}`],
    };
    ['temperature', 'humidity', 'presence', 'climate'].forEach((field) => {
      if (mapping[field]) room[field] = mapping[field];
      else delete room[field];
    });
    return room;
  });
  const mappedLights = mappings.flatMap((mapping) => {
    const definition = definitions.get(mapping.id);
    return mapping.light && definition ? [{ entityId: mapping.light, objectNames: [definition.lightObject] }] : [];
  });
  return {
    ...config,
    homeOs: {
      ...(config.homeOs || {}),
      floorplan: { ...floorplan, layout: 'd99', rooms, lights: [...preservedLights, ...mappedLights] },
    },
  };
}

export function getEntityOptions(entities = {}, field) {
  return Object.values(entities).filter((entity) => {
    const id = entity.entity_id || '';
    if (field === 'light') return id.startsWith('light.');
    if (field === 'climate') return id.startsWith('climate.');
    if (field === 'presence') return id.startsWith('binary_sensor.') && ['occupancy', 'presence', 'motion'].includes(entity.attributes?.device_class);
    return id.startsWith('sensor.') && entity.attributes?.device_class === field;
  }).sort((a, b) => (a.attributes?.friendly_name || a.entity_id).localeCompare(b.attributes?.friendly_name || b.entity_id, 'zh-CN'));
}

