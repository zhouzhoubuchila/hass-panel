const valueOf = (entity) => {
  const value = Number(entity?.state);
  return Number.isFinite(value) ? value : null;
};

export function buildFloorplanState(config = {}, entities = {}) {
  const rooms = (config.rooms || []).map((room) => ({
    id: room.id,
    name: room.name || room.id,
    objectNames: room.objectNames || [],
    temperature: valueOf(entities[room.temperature]),
    humidity: valueOf(entities[room.humidity]),
  }));
  const lights = (config.lights || []).map((light) => ({
    entityId: light.entityId,
    objectNames: light.objectNames || [],
    isOn: entities[light.entityId]?.state === 'on',
    available: Boolean(entities[light.entityId]) && !['unknown', 'unavailable'].includes(entities[light.entityId].state),
    onColor: light.onColor || '#ffd391',
    offColor: light.offColor || '#24262b',
  }));
  return { rooms, lights };
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

