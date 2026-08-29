const number = (value) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; };
const label = (entity) => entity.attributes?.friendly_name || entity.entity_id;
const normalizedPower = (entity) => { const value = number(entity.state); if (value === null) return null; const unit = (entity.attributes?.unit_of_measurement || '').toLowerCase(); return unit === 'kw' ? value * 1000 : unit === 'mw' ? value * 1000000 : value; };

export function buildEnergyModel(entities = {}) {
  const all = Object.values(entities);
  const powers = all.filter((e) => e.attributes?.device_class === 'power' || ['w', 'kw', 'mw'].includes((e.attributes?.unit_of_measurement || '').toLowerCase())).map((e) => ({ id: e.entity_id, name: label(e), watts: normalizedPower(e), state: e.state, unit: e.attributes?.unit_of_measurement || '' })).filter((e) => e.watts !== null).sort((a, b) => b.watts - a.watts);
  const energy = all.filter((e) => e.attributes?.device_class === 'energy' || ['wh', 'kwh', 'mwh'].includes((e.attributes?.unit_of_measurement || '').toLowerCase())).map((e) => ({ id: e.entity_id, name: label(e), value: number(e.state), unit: e.attributes?.unit_of_measurement || '' })).filter((e) => e.value !== null);
  const cost = all.filter((e) => e.attributes?.device_class === 'monetary' || /electric.*cost|energy.*cost|电费/i.test(`${e.entity_id} ${label(e)}`)).map((e) => ({ id: e.entity_id, name: label(e), value: number(e.state), unit: e.attributes?.unit_of_measurement || '' })).filter((e) => e.value !== null);
  return { configured: Boolean(powers.length || energy.length || cost.length), livePowerWatts: powers.reduce((sum, item) => sum + item.watts, 0), powers, energy, cost };
}

