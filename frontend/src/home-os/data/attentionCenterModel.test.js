import { attentionRecordKey, filterAttentionItems, routeForAttention } from './attentionCenterModel';

test('attention center filters severity and exact dismissed event records', () => {
  const items = [{ id: 'door:a', timestamp: '1', severity: 'warning' }, { id: 'battery:b', timestamp: '2', severity: 'critical' }];
  expect(filterAttentionItems(items, 'critical')).toEqual([items[1]]);
  expect(filterAttentionItems(items, 'all', [attentionRecordKey(items[0])])).toEqual([items[1]]);
});

test('attention center routes operational categories to the right workspace', () => {
  expect(routeForAttention({ category: 'security' })).toBe('/family');
  expect(routeForAttention({ category: 'homelab' })).toBe('/homelab');
  expect(routeForAttention({ category: 'battery' })).toBe('/');
});
