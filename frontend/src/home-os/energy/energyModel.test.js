import { buildEnergyModel } from './energyModel';
const e = (entity_id, state, device_class, unit) => ({ entity_id, state, attributes: { device_class, unit_of_measurement: unit, friendly_name: entity_id } });
test('uses only real HA power and energy entities', () => { const model = buildEnergyModel({ a: e('sensor.grid_power', '1.2', 'power', 'kW'), b: e('sensor.solar_power', '300', 'power', 'W'), c: e('sensor.total_energy', '42', 'energy', 'kWh') }); expect(model.configured).toBe(true); expect(model.livePowerWatts).toBe(1500); expect(model.energy[0].value).toBe(42); expect(buildEnergyModel({}).configured).toBe(false); });

