import { D_PLAN_ROOMS, D_PLAN_WALLS, resolveDPlanConfig } from './proceduralDPlan';

test('D plan exposes the supplied three-bedroom layout and safe defaults', () => {
  expect(D_PLAN_ROOMS).toHaveLength(8);
  expect(D_PLAN_ROOMS.filter((room) => room.id.includes('bedroom'))).toHaveLength(3);
  expect(D_PLAN_ROOMS.filter((room) => room.id.includes('bath'))).toHaveLength(2);
  expect(D_PLAN_WALLS.length).toBeGreaterThan(15);
  expect(resolveDPlanConfig().layout).toBe('d99');
});

