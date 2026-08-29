export const ATTENTION_FILTERS = ['all', 'critical', 'warning', 'info'];

export function attentionRecordKey(item) { return `${item.id}:${item.timestamp}`; }

export function filterAttentionItems(items = [], filter = 'all', dismissed = []) {
  const hidden = new Set(dismissed);
  return items.filter((item) => !hidden.has(attentionRecordKey(item)) && (filter === 'all' || item.severity === filter));
}

export function routeForAttention(item) {
  if (item.category === 'security') return '/family';
  if (['homelab', 'system', 'availability'].includes(item.category)) return '/homelab';
  return '/';
}
