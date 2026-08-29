const valueOf = (entity) => {
  const value = Number(entity?.state);
  return Number.isFinite(value) ? value : null;
};

const normalized = (value = '') => String(value).toLowerCase().replace(/[._-]+/g, ' ');
const searchable = (entity) => normalized(`${entity?.entity_id || ''} ${entity?.attributes?.friendly_name || ''}`);
const matchesRoom = (entity, room) => (room.aliases || []).some((alias) => searchable(entity).includes(normalized(alias)));
const deviceClassIs = (entity, value) => entity?.attributes?.device_class === value;

export function discoverRoomBindings(room, entities = {}) {
  const matched = Object.values(entities).filter((entity) => matchesRoom(entity, room));
  const sensor = (deviceClass) => matched.find((entity) => entity.entity_id?.startsWith('sensor.') && deviceClassIs(entity, deviceClass))?.entity_id;
  return {
    temperature: sensor('temperature'),
    humidity: sensor('humidity'),
    presence: matched.find((entity) => entity.entity_id?.startsWith('binary_sensor.') && ['occupancy', 'presence', 'motion'].includes(entity.attributes?.device_class))?.entity_id,
    climate: matched.find((entity) => entity.entity_id?.startsWith('climate.'))?.entity_id,
    curtain: matched.find((entity) => entity.entity_id?.startsWith('cover.'))?.entity_id,
    media: matched.find((entity) => entity.entity_id?.startsWith('media_player.'))?.entity_id,
    light: matched.find((entity) => entity.entity_id?.startsWith('light.'))?.entity_id,
  };
}

export function buildFloorplanState(config = {}, entities = {}) {
  const discoveries = new Map((config.rooms || []).map((room) => [room.id, discoverRoomBindings(room, entities)]));
  const rooms = (config.rooms || []).map((room) => {
    const found = discoveries.get(room.id);
    const presenceEntity = entities[room.presence || found.presence];
    const climateEntity = entities[room.climate || found.climate];
    const curtainEntity = entities[room.curtain || found.curtain];
    const mediaEntity = entities[room.media || found.media];
    const asDevice = (type, entity) => entity ? {
      type,
      roomId: room.id,
      entityId: entity.entity_id,
      state: entity.state,
      available: !['unknown', 'unavailable'].includes(entity.state),
      active: type === 'presence' ? entity.state === 'on' : type === 'climate' ? entity.state !== 'off' : type === 'curtain' ? entity.state !== 'closed' : entity.state === 'playing',
    } : null;
    return {
      id: room.id,
      name: room.name || room.id,
      objectNames: room.objectNames || [],
      temperature: valueOf(entities[room.temperature || found.temperature]),
      humidity: valueOf(entities[room.humidity || found.humidity]),
      presence: presenceEntity ? presenceEntity.state === 'on' : null,
      climate: climateEntity?.state || null,
      devices: [asDevice('presence', presenceEntity), asDevice('climate', climateEntity), asDevice('curtain', curtainEntity), asDevice('media', mediaEntity)].filter(Boolean),
    };
  });
  const configuredLights = config.lights || [];
  const automaticLights = configuredLights.length ? [] : (config.rooms || []).flatMap((room) => {
    const entityId = discoveries.get(room.id)?.light;
    return entityId && room.lightObject ? [{ entityId, objectNames: [room.lightObject] }] : [];
  });
  const lights = [...configuredLights, ...automaticLights].map((light) => ({
    entityId: light.entityId,
    objectNames: light.objectNames || [],
    isOn: entities[light.entityId]?.state === 'on',
    available: Boolean(entities[light.entityId]) && !['unknown', 'unavailable'].includes(entities[light.entityId].state),
    onColor: light.onColor || '#ffd391',
    offColor: light.offColor || '#24262b',
  }));
  const vacuumEntity = entities[config.vacuum] || Object.values(entities).find((entity) => entity.entity_id?.startsWith('vacuum.'));
  const vacuum = vacuumEntity ? {
    type: 'vacuum',
    roomId: 'living_dining',
    entityId: vacuumEntity.entity_id,
    state: vacuumEntity.state,
    available: !['unknown', 'unavailable'].includes(vacuumEntity.state),
    active: ['cleaning', 'returning'].includes(vacuumEntity.state),
    error: vacuumEntity.state === 'error',
  } : null;
  const allDevices = [...rooms.flatMap((room) => room.devices), ...(vacuum ? [vacuum] : [])];
  const alerts = allDevices.filter((device) => !device.available || device.error).map((device) => ({ id: device.entityId, type: device.type, state: device.state, roomId: device.roomId }));
  return { rooms, lights, vacuum, alerts };
}

export function entityForObject(object, lights = []) {
  let current = object;
  while (current) {
    for (const light of lights) {
      if (light.objectNames.includes(current.name)) return light.entityId;
    }
    current = current.parent;
  }
  return null;
}

export function roomForObject(object, rooms = []) {
  let current = object;
  while (current) {
    for (const room of rooms) {
      if (room.id === current.userData?.roomId || room.objectNames.includes(current.name)) return room;
    }
    current = current.parent;
  }
  return null;
}

export function deviceForObject(object, rooms = [], globalDevices = []) {
  let current = object;
  while (current) {
    if (current.userData?.deviceType && current.userData?.roomId) {
      for (const device of globalDevices) {
        if (device?.type === current.userData.deviceType) return device;
      }
      for (const room of rooms) {
        if (room.id !== current.userData.roomId) continue;
        for (const device of room.devices) {
          if (device.type === current.userData.deviceType) return device;
        }
      }
      return null;
    }
    current = current.parent;
  }
  return null;
}

