import { primaryNavigation } from './home-os/app/navigation';

jest.mock('lucide-react', () => ({
  CloudSun: () => null,
  Home: () => null,
  Server: () => null,
  Users: () => null,
  Zap: () => null,
}));

test('Home OS exposes five unique primary routes', () => {
  expect(primaryNavigation).toHaveLength(5);
  expect(new Set(primaryNavigation.map((item) => item.path)).size).toBe(5);
});
