import React, { useMemo, useState } from 'react';
import { AlertTriangle, Box, Lightbulb, Settings2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHass } from '@hakit/core';
import { useLanguage } from '../../i18n/LanguageContext';
import { buildFloorplanState } from './floorplanBinding';
import { D_PLAN_ROOMS } from './proceduralDPlan';
import '../styles/rendered-floorplan.css';

const HOTSPOTS = {
  kitchen: [31, 19], guest_bath: [47, 22], north_bedroom: [66, 20], primary_bath: [87, 27],
  living_dining: [31, 59], west_bedroom: [62, 65], east_bedroom: [83, 65], balcony: [31, 87],
};

export default function RenderedFloorplan({ config, onUseModel }) {
  const { useStore, callService } = useHass();
  const entities = useStore((state) => state.entities);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const state = useMemo(() => buildFloorplanState(config, entities || {}), [config, entities]);
  const definitions = useMemo(() => new Map(D_PLAN_ROOMS.map((room) => [room.id, room])), []);
  const selectedRoom = state.rooms.find((room) => room.id === selectedRoomId);

  const lightFor = (roomId) => {
    const definition = definitions.get(roomId);
    return definition && state.lights.find((light) => light.objectNames.includes(definition.lightObject));
  };

  const activate = (room) => {
    const light = lightFor(room.id);
    setSelectedRoomId(room.id);
    if (light?.available) callService({ domain: 'light', service: 'toggle', target: { entity_id: light.entityId } });
  };

  return <section className="home-os-floorplan home-os-floorplan--rendered" aria-label={language === 'zh' ? '3D 户型中控' : '3D floorplan control'}>
    <img className="home-os-rendered-plan" src={`${process.env.PUBLIC_URL}/home-os-assets/d99-night-v1.png`} alt="99.91 平方米三室两厅两卫 3D 户型" />
    <div className="home-os-rendered-vignette" />
    <div className="home-os-plan-toolbar">
      <button type="button" onClick={() => navigate('/floorplan-settings')}><Settings2 size={16} />{language === 'zh' ? '实体映射' : 'Entities'}</button>
      <button type="button" onClick={onUseModel}><Box size={16} />{language === 'zh' ? '模型视图' : 'Model'}</button>
    </div>
    {state.rooms.map((room) => {
      const position = HOTSPOTS[room.id];
      if (!position) return null;
      const light = lightFor(room.id);
      const alert = state.alerts.some((item) => item.roomId === room.id);
      return <button
        type="button"
        className={`home-os-room-hotspot ${light?.isOn ? 'is-on' : ''} ${alert ? 'has-alert' : ''}`}
        style={{ left: `${position[0]}%`, top: `${position[1]}%` }}
        onClick={() => activate(room)}
        aria-label={`${room.name}${light?.available ? (language === 'zh' ? '，切换灯光' : ', toggle light') : ''}`}
        key={room.id}
      ><span><Lightbulb size={17} /></span><strong>{room.name}</strong><small>{room.temperature ?? '—'}° · {room.humidity ?? '—'}%</small></button>;
    })}
    {state.alerts.length > 0 && <button type="button" className="home-os-floorplan-alert" onClick={() => setSelectedRoomId(state.alerts[0].roomId)}><AlertTriangle size={14} />{language === 'zh' ? `${state.alerts.length} 个设备异常` : `${state.alerts.length} alerts`}</button>}
    {selectedRoom && <aside className="home-os-room-focus"><button type="button" className="home-os-room-close" onClick={() => setSelectedRoomId(null)}><X size={14} /></button><strong>{selectedRoom.name}</strong><span>{selectedRoom.temperature ?? '—'}° · {selectedRoom.humidity ?? '—'}%</span><small>{selectedRoom.presence === true ? (language === 'zh' ? '有人活动' : 'Occupied') : selectedRoom.presence === false ? (language === 'zh' ? '当前无人' : 'Clear') : (language === 'zh' ? '点击房间图标控制灯光' : 'Tap the room control to toggle its light')}</small></aside>}
    <span className="home-os-floorplan-badge">N ↑ · D · 99.91 M² · LIVE</span>
  </section>;
}
