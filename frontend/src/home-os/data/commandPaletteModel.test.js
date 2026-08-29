import { buildCommandItems, filterCommandItems, safeEntityAction } from './commandPaletteModel';

test('command palette finds pages and HA entities', () => {
  const items = buildCommandItems({ 'light.living': { entity_id: 'light.living', state: 'on', attributes: { friendly_name: '客厅灯' } } }, 'zh');
  expect(filterCommandItems(items, '客厅灯')[0].secondary).toBe('light.living');
  expect(filterCommandItems(items, 'PVE')[0].path).toBe('/homelab');
});

test('only explicitly safe domains receive direct control actions', () => {
  expect(safeEntityAction({ entity_id: 'light.living', state: 'on' })).toEqual({ domain: 'light', service: 'turn_off', target: { entity_id: 'light.living' } });
  expect(safeEntityAction({ entity_id: 'cover.bedroom', state: 'closed' }).service).toBe('open_cover');
  expect(safeEntityAction({ entity_id: 'button.shutdown_pve', state: 'unknown' })).toBeNull();
  expect(safeEntityAction({ entity_id: 'script.shutdown_pve', state: 'off' })).toBeNull();
});
