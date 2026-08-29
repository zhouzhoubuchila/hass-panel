export const HOME_MODE_DEFINITIONS = [
  { id: 'home', zh: '在家', en: 'Home', aliases: ['在家', '回家', 'home mode'] },
  { id: 'away', zh: '离家', en: 'Away', aliases: ['离家', 'away'] },
  { id: 'sleep', zh: '睡眠', en: 'Sleep', aliases: ['睡眠', 'sleep', 'night mode'] },
  { id: 'movie', zh: '观影', en: 'Movie', aliases: ['观影', '影院', 'movie', 'cinema'] },
  { id: 'guest', zh: '访客', en: 'Guest', aliases: ['访客', 'guest'] },
  { id: 'clean', zh: '打扫', en: 'Clean', aliases: ['打扫', '清洁模式', 'clean mode'] },
];

const searchable = (entity) => `${entity.entity_id || ''} ${entity.attributes?.friendly_name || ''}`.toLowerCase().replace(/[._-]+/g, ' ');
const includesAlias = (value, aliases) => aliases.some((alias) => value.includes(alias.toLowerCase()));
const actionFor = (entity, option) => {
  const domain = entity.entity_id.split('.')[0];
  if (domain === 'input_select') return option ? { domain, service: 'select_option', target: { entity_id: entity.entity_id }, data: { option } } : null;
  if (domain === 'automation') return { domain, service: 'trigger', target: { entity_id: entity.entity_id } };
  if (domain === 'input_boolean') return { domain, service: 'turn_on', target: { entity_id: entity.entity_id } };
  if (domain === 'scene' || domain === 'script') return { domain, service: 'turn_on', target: { entity_id: entity.entity_id } };
  return null;
};

export function resolveHomeModes(entities = {}, config = {}) {
  const all = Object.values(entities);
  const configured = config.homeOs?.modes || {};
  return HOME_MODE_DEFINITIONS.map((definition) => {
    const explicit = configured[definition.id];
    const entityId = typeof explicit === 'string' ? explicit : explicit?.entityId;
    const explicitEntity = entityId ? entities[entityId] : null;
    const explicitOption = typeof explicit === 'object' ? explicit.option : null;
    let entity = explicitEntity;
    let option = explicitOption;
    if (!entity) {
      entity = all.find((candidate) => ['scene.', 'script.', 'automation.', 'input_boolean.'].some((prefix) => candidate.entity_id?.startsWith(prefix)) && includesAlias(searchable(candidate), definition.aliases));
    }
    if (!entity) {
      entity = all.find((candidate) => candidate.entity_id?.startsWith('input_select.') && (candidate.attributes?.options || []).some((candidateOption) => includesAlias(String(candidateOption).toLowerCase(), definition.aliases)));
      option = entity?.attributes?.options?.find((candidateOption) => includesAlias(String(candidateOption).toLowerCase(), definition.aliases)) || option;
    }
    const action = entity ? actionFor(entity, option) : null;
    const active = Boolean(entity && ((entity.entity_id.startsWith('input_select.') && entity.state === option) || (entity.entity_id.startsWith('input_boolean.') && entity.state === 'on')));
    return { ...definition, entityId: entity?.entity_id || null, action, active, available: Boolean(action) && !['unknown', 'unavailable'].includes(entity?.state) };
  });
}
