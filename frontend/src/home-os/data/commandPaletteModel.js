const NAVIGATION = [
  { id: 'nav-home', path: '/', zh: '首页与 3D 户型', en: 'Home and 3D floorplan', keywords: 'home floorplan 户型' },
  { id: 'nav-environment', path: '/environment', zh: '环境、天气与出行', en: 'Environment, weather and travel', keywords: 'weather temperature 天气 温度 空气' },
  { id: 'nav-family', path: '/family', zh: '家庭、安防与设备', en: 'Family, security and devices', keywords: 'door camera appliance 门窗 摄像头 家电' },
  { id: 'nav-energy', path: '/energy', zh: '能源', en: 'Energy', keywords: 'power electricity 电量 功率' },
  { id: 'nav-homelab', path: '/homelab', zh: 'Homelab 与家庭网络', en: 'Homelab and home network', keywords: 'pve router network server 路由 网络 服务器' },
  { id: 'nav-attention', path: '/attention', zh: '动态异常中心', en: 'Live attention center', keywords: 'alert warning 异常 警告' },
];

const domainRoute = (domain) => {
  if (['person', 'binary_sensor', 'camera', 'vacuum', 'fan', 'climate', 'media_player', 'humidifier', 'water_heater'].includes(domain)) return '/family';
  if (['update'].includes(domain)) return '/homelab';
  return '/';
};

export function safeEntityAction(entity) {
  if (!entity || ['unknown', 'unavailable'].includes(entity.state)) return null;
  const [domain] = entity.entity_id.split('.');
  if (['light', 'switch', 'fan', 'input_boolean'].includes(domain)) return { domain, service: entity.state === 'on' ? 'turn_off' : 'turn_on', target: { entity_id: entity.entity_id } };
  if (domain === 'cover') return { domain, service: entity.state === 'open' ? 'close_cover' : 'open_cover', target: { entity_id: entity.entity_id } };
  if (domain === 'vacuum') return { domain, service: ['cleaning', 'returning'].includes(entity.state) ? 'return_to_base' : 'start', target: { entity_id: entity.entity_id } };
  return null;
}

export function buildCommandItems(entities = {}, language = 'zh') {
  const navigation = NAVIGATION.map((item) => ({ ...item, type: 'navigation', label: language === 'zh' ? item.zh : item.en }));
  const entityItems = Object.values(entities).map((entity) => {
    const domain = entity.entity_id.split('.')[0];
    return { id: `entity-${entity.entity_id}`, type: 'entity', label: entity.attributes?.friendly_name || entity.entity_id, secondary: entity.entity_id, keywords: `${entity.entity_id} ${entity.state}`, path: domainRoute(domain), action: safeEntityAction(entity), state: entity.state };
  });
  return [...navigation, ...entityItems];
}

export function filterCommandItems(items = [], query = '', limit = 12) {
  const needle = query.trim().toLowerCase();
  if (!needle) return items.filter((item) => item.type === 'navigation').slice(0, limit);
  return items.map((item) => {
    const label = item.label.toLowerCase();
    const haystack = `${label} ${item.secondary || ''} ${item.keywords || ''}`.toLowerCase();
    const score = label.startsWith(needle) ? 0 : haystack.includes(needle) ? 1 : 9;
    return { item, score };
  }).filter(({ score }) => score < 9).sort((a, b) => a.score - b.score || a.item.label.localeCompare(b.item.label, 'zh-CN')).slice(0, limit).map(({ item }) => item);
}
