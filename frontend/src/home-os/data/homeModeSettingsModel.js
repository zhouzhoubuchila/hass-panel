import { HOME_MODE_DEFINITIONS } from './homeModeModel';

export function createHomeModeMappings(config = {}) {
  const configured = config.homeOs?.modes || {};
  return HOME_MODE_DEFINITIONS.map((definition) => {
    const value = configured[definition.id];
    return { ...definition, entityId: typeof value === 'string' ? value : value?.entityId || '', option: typeof value === 'object' ? value.option || '' : '' };
  });
}

export function mergeHomeModeConfig(config = {}, mappings = []) {
  const modes = Object.fromEntries(mappings.flatMap(({ id, entityId, option }) => {
    if (!entityId) return [];
    return [[id, entityId.startsWith('input_select.') ? { entityId, option } : { entityId }]];
  }));
  return { ...config, homeOs: { ...(config.homeOs || {}), modes } };
}

export function getHomeModeEntityOptions(entities = {}) {
  const domains = ['scene.', 'script.', 'automation.', 'input_boolean.', 'input_select.'];
  return Object.values(entities).filter((entity) => domains.some((domain) => entity.entity_id?.startsWith(domain))).sort((a, b) => (a.attributes?.friendly_name || a.entity_id).localeCompare(b.attributes?.friendly_name || b.entity_id, 'zh-CN'));
}

export function getHomeModeOptions(entities = {}, entityId = '') {
  return entityId.startsWith('input_select.') ? entities[entityId]?.attributes?.options || [] : [];
}
