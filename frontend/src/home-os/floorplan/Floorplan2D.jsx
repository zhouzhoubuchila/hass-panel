import React, { useMemo, useState } from 'react';
import { AlertTriangle, Box, Lightbulb, Settings2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHass } from '@hakit/core';
import { useLanguage } from '../../i18n/LanguageContext';
import { buildFloorplanState } from './floorplanBinding';
import { D_PLAN_FURNITURE, D_PLAN_ROOMS, D_PLAN_WALLS } from './proceduralDPlan';
import '../styles/floorplan-2d.css';

export default function Floorplan2D({ config, onUse3D }) {
  const { useStore, callService } = useHass();
  const entities = useStore((state) => state.entities);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const state = useMemo(() => buildFloorplanState(config, entities || {}), [config, entities]);
  const definitions = useMemo(() => new Map(D_PLAN_ROOMS.map((room) => [room.id, room])), []);
  const selectedRoom = state.rooms.find((room) => room.id === selectedRoomId);
  const selectedDevices = selectedRoom ? [...selectedRoom.devices, ...(selectedRoom.id === 'living_dining' && state.vacuum ? [state.vacuum] : [])] : [];
  const selectedDefinition = selectedRoom && definitions.get(selectedRoom.id);
  const selectedLight = selectedDefinition && state.lights.find((light) => light.objectNames.includes(selectedDefinition.lightObject));

  return <section className="home-os-floorplan home-os-floorplan--2d" aria-label={language === 'zh' ? '2D 户型' : '2D floorplan'}>
    <div className="home-os-floorplan-readouts">
      <button type="button" onClick={() => navigate('/floorplan-settings')}><Settings2 size={14} />{language === 'zh' ? '实体映射' : 'Map entities'}</button>
      <button type="button" onClick={onUse3D}><Box size={14} />3D</button>
    </div>
    <svg viewBox="-5.8 -4.6 11.6 9.2" role="img">
      {D_PLAN_ROOMS.map((room) => {
        const live = state.rooms.find((item) => item.id === room.id);
        const alert = state.alerts.some((item) => item.roomId === room.id);
        const occupied = live?.presence === true;
        return <g key={room.id} className={`${selectedRoomId === room.id ? 'is-selected' : ''} ${alert ? 'has-alert' : ''} ${occupied ? 'is-occupied' : ''}`} onClick={() => setSelectedRoomId(room.id)}>
          <rect x={room.x - room.width / 2} y={room.z - room.depth / 2} width={room.width} height={room.depth} fill={room.color} />
          <text x={room.x} y={room.z - 0.08}>{room.name}</text>
          <text className="home-os-room-value" x={room.x} y={room.z + 0.28}>{live?.temperature ?? '—'}° · {live?.humidity ?? '—'}%</text>
          {alert && <circle className="home-os-svg-alert" cx={room.x + room.width * .34} cy={room.z - room.depth * .32} r=".1" />}
        </g>;
      })}
      <g className="home-os-svg-furniture">{D_PLAN_FURNITURE.map((item) => <rect x={item.x - item.width / 2} y={item.z - item.depth / 2} width={item.width} height={item.depth} rx=".08" data-kind={item.kind} key={item.id} />)}</g>
      <g className="home-os-svg-walls">{D_PLAN_WALLS.map(([x1, z1, x2, z2], index) => <line x1={x1} y1={z1} x2={x2} y2={z2} key={index} />)}</g>
      <g className="home-os-svg-north"><path d="M -5.25 -3.55 L -5.25 -4.05 M -5.25 -4.05 L -5.4 -3.78 M -5.25 -4.05 L -5.1 -3.78" /><text x="-5.25" y="-4.18">N</text></g>
    </svg>
    {state.alerts.length > 0 && <button type="button" className="home-os-floorplan-alert" onClick={() => setSelectedRoomId(state.alerts[0].roomId)}><AlertTriangle size={13} />{language === 'zh' ? `${state.alerts.length} 个设备异常` : `${state.alerts.length} device alerts`}</button>}
    {selectedRoom && <aside className="home-os-room-focus"><button type="button" className="home-os-room-close" onClick={() => setSelectedRoomId(null)}><X size={13} /></button><strong>{selectedRoom.name}</strong><span>{selectedRoom.temperature ?? '—'}° · {selectedRoom.humidity ?? '—'}%</span><small>{selectedDevices.length ? selectedDevices.map((device) => `${device.type}: ${device.state}`).join(' · ') : (language === 'zh' ? '暂无映射设备' : 'No mapped devices')}</small>{selectedLight && <button type="button" className={`home-os-2d-light ${selectedLight.isOn ? 'is-on' : ''}`} disabled={!selectedLight.available} onClick={() => callService({ domain: 'light', service: 'toggle', target: { entity_id: selectedLight.entityId } })}><Lightbulb size={13} />{language === 'zh' ? '切换主灯' : 'Toggle light'}</button>}</aside>}
    <span className="home-os-floorplan-badge">N ↑ · D · 99.91 M² · 2D</span>
  </section>;
}
