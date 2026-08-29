import { createHomeModeMappings, getHomeModeEntityOptions, getHomeModeOptions, mergeHomeModeConfig } from './homeModeSettingsModel';

test('home mode settings preserve unrelated configuration', () => {
  const original = { cards: [{ id: 1 }], homeOs: { floorplan: { layout: 'd99' }, modes: { home: 'scene.home' } } };
  const mappings = createHomeModeMappings(original).map((mode) => mode.id === 'away' ? { ...mode, entityId: 'input_select.family_mode', option: '离家' } : mode);
  const merged = mergeHomeModeConfig(original, mappings);
  expect(merged.cards).toEqual([{ id: 1 }]);
  expect(merged.homeOs.floorplan).toEqual({ layout: 'd99' });
  expect(merged.homeOs.modes.home).toEqual({ entityId: 'scene.home' });
  expect(merged.homeOs.modes.away).toEqual({ entityId: 'input_select.family_mode', option: '离家' });
});

test('home mode settings expose only supported HA controls and selector options', () => {
  const entities = {
    'scene.home': { entity_id: 'scene.home', attributes: { friendly_name: '回家' } },
    'light.kitchen': { entity_id: 'light.kitchen', attributes: {} },
    'input_select.family_mode': { entity_id: 'input_select.family_mode', attributes: { options: ['在家', '离家'] } },
  };
  expect(getHomeModeEntityOptions(entities).map((entity) => entity.entity_id)).toEqual(['scene.home', 'input_select.family_mode']);
  expect(getHomeModeOptions(entities, 'input_select.family_mode')).toEqual(['在家', '离家']);
  expect(getHomeModeOptions(entities, 'scene.home')).toEqual([]);
});
