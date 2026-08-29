import { resolveHomeModes } from './homeModeModel';

test('maps HA input select and scene modes to executable service calls', () => {
  const entities = {
    select: { entity_id: 'input_select.family_mode', state: '睡眠', attributes: { options: ['在家', '睡眠', '离家'] } },
    movie: { entity_id: 'scene.movie_time', state: 'scening', attributes: { friendly_name: '观影模式' } },
  };
  const modes = resolveHomeModes(entities);
  expect(modes.find((mode) => mode.id === 'sleep')).toMatchObject({ active: true, action: { domain: 'input_select', service: 'select_option', data: { option: '睡眠' } } });
  expect(modes.find((mode) => mode.id === 'movie')).toMatchObject({ entityId: 'scene.movie_time', action: { service: 'turn_on' } });
});
