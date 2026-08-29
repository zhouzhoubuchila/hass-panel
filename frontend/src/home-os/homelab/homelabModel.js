const PRIORITY = { pveTemperature: 'sensor.1_node_pve_cpu_temperature', primaryHost: 'binary_sensor.192_168_8_200' };
const label = (entity) => entity.attributes?.friendly_name || entity.entity_id;
const numeric = (state) => { const value = Number(state); return Number.isFinite(value) ? value : null; };
const available = (entity) => entity && !['unknown', 'unavailable'].includes(entity.state);
const metric = (entity) => entity ? { id: entity.entity_id, name: label(entity), value: numeric(entity.state) ?? entity.state, unit: entity.attributes?.unit_of_measurement || '', available: available(entity) } : null;

export function buildHomelabModel(entities = {}) {
  const all = Object.values(entities);
  const match = (pattern) => all.filter((entity) => pattern.test(`${entity.entity_id} ${label(entity)}`));
  const pveEntities = match(/pve|proxmox/i);
  const routerEntities = match(/immortalwrt|openwrt|router|gateway|路由/i);
  const tplinkEntities = match(/tp[-_ ]?link|deco/i);
  const internetEntities = match(/internet|wan|latency|ping|packet.loss|download.speed|upload.speed|公网|延迟/i);
  const haEntities = match(/home.assistant|hass|supervisor/i);
  const primaryTemperature = entities[PRIORITY.pveTemperature] || pveEntities.find((e) => e.attributes?.device_class === 'temperature');
  const primaryHost = entities[PRIORITY.primaryHost] || all.find((e) => e.entity_id.startsWith('binary_sensor.') && /192_168_8_200|primary.host/i.test(e.entity_id));
  const section = (items, limit = 8) => items.filter((entity, index, source) => source.findIndex((candidate) => candidate.entity_id === entity.entity_id) === index).slice(0, limit).map(metric);
  const unavailable = all.filter((e) => /pve|proxmox|immortalwrt|openwrt|router|tp[-_ ]?link|deco|home.assistant|hass|supervisor/i.test(`${e.entity_id} ${label(e)}`) && !available(e));
  return {
    overview: { temperature: metric(primaryTemperature), host: primaryHost ? { ...metric(primaryHost), online: ['on', 'home', 'connected'].includes(primaryHost.state) } : null, alerts: unavailable.length },
    pve: section(pveEntities), ha: section(haEntities), tplink: section(tplinkEntities), router: section(routerEntities), internet: section(internetEntities), unavailable: unavailable.map(metric),
  };
}

export { PRIORITY };

