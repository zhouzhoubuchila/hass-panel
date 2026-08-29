import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHass } from '@hakit/core';
import { AirVent, AlertTriangle, CircleDot, Droplets, Lightbulb, Radio, Settings2, Thermometer, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { buildFloorplanState, deviceForObject, entityForObject, roomForObject } from './floorplanBinding';
import { createProceduralDPlan } from './proceduralDPlan';

export default function ThreeFloorplan({ config, onUse2D }) {
  const containerRef = useRef(null);
  const runtimeRef = useRef(null);
  const { callService, useStore } = useHass();
  const entities = useStore((state) => state.entities);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const floorplanState = useMemo(() => buildFloorplanState(config, entities || {}), [config, entities]);

  useEffect(() => {
    let active = true;
    let frame;
    const container = containerRef.current;
    Promise.all([import('three'), import('three/addons/controls/OrbitControls.js')]).then(([THREE, { OrbitControls }]) => {
      if (!active || !container) return;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 1000);
      const position = config.camera?.position || [6, 7, 8];
      camera.position.set(...position);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      const lowQuality = config.quality === 'low' || window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches;
      renderer.setPixelRatio(lowQuality ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = !lowQuality;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x27221a, 2.2));
      const keyLight = new THREE.DirectionalLight(0xffe5bf, 2.4);
      keyLight.position.set(5, 10, 6);
      keyLight.castShadow = true;
      scene.add(keyLight);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.target.set(...(config.camera?.target || [0, 0, 0]));
      controls.maxPolarAngle = Math.PI / 2.05;
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const runtime = { THREE, scene, camera, renderer, controls, root: null, raycaster, pointer };
      runtimeRef.current = runtime;
      const animate = () => { controls.update(); renderer.render(scene, camera); frame = window.requestAnimationFrame(animate); };
      animate();
      if (config.modelUrl) {
        import('three/addons/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
          new GLTFLoader().load(config.modelUrl, (gltf) => {
            if (!active) return;
            runtime.root = gltf.scene;
            scene.add(gltf.scene);
            setStatus('ready');
          }, undefined, () => active && setStatus('error'));
        }).catch(() => active && setStatus('error'));
      } else {
        runtime.root = createProceduralDPlan(THREE);
        scene.add(runtime.root);
        setStatus('ready');
      }
      const resize = () => { if (!container.clientWidth || !container.clientHeight) return; camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight); };
      const observer = new ResizeObserver(resize);
      observer.observe(container);
      runtime.observer = observer;
    }).catch(() => active && setStatus('error'));
    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
      const runtime = runtimeRef.current;
      runtime?.observer?.disconnect();
      runtime?.controls?.dispose();
      runtime?.renderer?.dispose();
      runtime?.renderer?.domElement?.remove();
      runtimeRef.current = null;
    };
  }, [config.camera, config.layout, config.modelUrl, config.quality]);

  useEffect(() => {
    const root = runtimeRef.current?.root;
    if (!root) return;
    root.traverse((object) => {
      if (!object.isMesh) return;
      const binding = floorplanState.lights.find((light) => light.objectNames.includes(object.name));
      const hotspotRoom = floorplanState.rooms.find((room) => room.id === object.userData?.roomId);
      const device = object.userData?.deviceType === 'vacuum' ? floorplanState.vacuum : hotspotRoom?.devices.find((item) => item.type === object.userData?.deviceType);
      if (object.userData?.deviceType) {
        object.visible = Boolean(device);
        if (!device) return;
        if (!object.userData.homeOsMaterialCloned) {
          object.material = object.material.clone();
          object.userData.homeOsMaterialCloned = true;
        }
        const activeColors = { presence: '#55b983', climate: '#64b5e8', curtain: '#78a6d0', media: '#aa86df', vacuum: '#f2a84b' };
        const color = device.available && !device.error ? (device.active ? activeColors[device.type] : '#68706e') : '#e36060';
        object.material.color.set(color);
        object.material.emissive?.set(color);
        object.material.emissiveIntensity = device.active ? 1.25 : 0.12;
        return;
      }
      if (!binding) return;
      if (!object.userData.homeOsMaterialCloned) {
        object.material = object.material.clone();
        object.userData.homeOsMaterialCloned = true;
      }
      object.material.emissive?.set(binding.isOn ? binding.onColor : binding.offColor);
      if ('emissiveIntensity' in object.material) object.material.emissiveIntensity = binding.isOn ? 1.8 : 0.08;
      if (!object.userData.homeOsPointLight && runtimeRef.current?.THREE) {
        const glow = new runtimeRef.current.THREE.PointLight(binding.onColor, 0, 4.2, 2);
        glow.position.y = 1.45;
        object.add(glow);
        object.userData.homeOsPointLight = glow;
      }
      object.userData.homeOsPointLight.intensity = binding.isOn ? 2.3 : 0;
    });
  }, [floorplanState, status]);

  const controlDevice = (device) => {
    if (!device?.available || device.type === 'presence') return;
    const actions = {
      climate: { domain: 'climate', service: device.state === 'off' ? 'turn_on' : 'turn_off' },
      curtain: { domain: 'cover', service: 'toggle' },
      media: { domain: 'media_player', service: 'media_play_pause' },
      vacuum: { domain: 'vacuum', service: ['cleaning', 'returning'].includes(device.state) ? 'pause' : 'start' },
    };
    const action = actions[device.type];
    if (action) callService({ ...action, target: { entity_id: device.entityId } });
  };

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    const room = floorplanState.rooms.find((item) => item.id === selectedRoomId);
    const roomObject = room && runtime.root?.getObjectByName(room.objectNames[0]);
    const target = roomObject?.position || { x: 0, y: 0, z: 0 };
    runtime.controls.target.set(target.x, 0, target.z);
    runtime.controls.update();
  }, [floorplanState.rooms, selectedRoomId]);

  const handlePointer = (event) => {
    const runtime = runtimeRef.current;
    if (!runtime?.root) return;
    const rect = runtime.renderer.domElement.getBoundingClientRect();
    runtime.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    runtime.raycaster.setFromCamera(runtime.pointer, runtime.camera);
    const hit = runtime.raycaster.intersectObject(runtime.root, true)[0];
    const entityId = hit && entityForObject(hit.object, floorplanState.lights);
    if (entityId) {
      callService({ domain: 'light', service: 'toggle', target: { entity_id: entityId } });
      return;
    }
    const device = hit && deviceForObject(hit.object, floorplanState.rooms, [floorplanState.vacuum]);
    if (device) {
      controlDevice(device);
      return;
    }
    const room = hit && roomForObject(hit.object, floorplanState.rooms);
    if (room) setSelectedRoomId((current) => current === room.id ? null : room.id);
  };

  const selectedRoom = floorplanState.rooms.find((room) => room.id === selectedRoomId);
  const selectedDevices = selectedRoom ? [...selectedRoom.devices, ...(selectedRoom.id === 'living_dining' && floorplanState.vacuum ? [floorplanState.vacuum] : [])] : [];

  return <section className="home-os-floorplan home-os-floorplan--3d" aria-label={language === 'zh' ? '3D 户型' : '3D floorplan'}>
    <div ref={containerRef} className="home-os-three-canvas" onClick={handlePointer} />
    {status !== 'ready' && <div className="home-os-three-status"><strong>{status === 'error' ? (language === 'zh' ? '模型加载失败' : 'Model failed to load') : (language === 'zh' ? '正在加载 3D 户型' : 'Loading 3D floorplan')}</strong><small>{status === 'error' ? config.modelUrl : 'GLB / GLTF'}</small></div>}
    <div className="home-os-floorplan-readouts">
      <button type="button" onClick={() => navigate('/floorplan-settings')}><Settings2 size={14} />{language === 'zh' ? '实体映射' : 'Map entities'}</button>
      <button type="button" onClick={onUse2D}>2D</button>
      {floorplanState.rooms.slice(0, 3).map((room) => <div key={room.id}><strong>{room.name}</strong><span><Thermometer size={13} />{room.temperature ?? '—'}°</span><span><Droplets size={13} />{room.humidity ?? '—'}%</span></div>)}
      {floorplanState.lights.slice(0, 3).map((light) => <button type="button" disabled={!light.available} onClick={() => callService({ domain: 'light', service: 'toggle', target: { entity_id: light.entityId } })} key={light.entityId}><Lightbulb size={14} />{light.entityId.split('.').pop()}<i className={light.isOn ? 'is-on' : ''} /></button>)}
    </div>
    {floorplanState.alerts.length > 0 && <button type="button" className="home-os-floorplan-alert" onClick={() => setSelectedRoomId(floorplanState.alerts[0].roomId)}><AlertTriangle size={13} />{language === 'zh' ? `${floorplanState.alerts.length} 个设备异常` : `${floorplanState.alerts.length} device alerts`}</button>}
    {selectedRoom && <aside className="home-os-room-focus"><button type="button" className="home-os-room-close" onClick={() => setSelectedRoomId(null)}><X size={13} /></button><strong>{selectedRoom.name}</strong><span>{selectedRoom.temperature ?? '—'}° · {selectedRoom.humidity ?? '—'}%</span><small>{selectedRoom.presence === null ? (language === 'zh' ? '未发现人体传感器' : 'No presence sensor') : selectedRoom.presence ? (language === 'zh' ? '有人活动' : 'Occupied') : (language === 'zh' ? '无人活动' : 'Clear')}</small><div className="home-os-room-devices">{selectedDevices.map((device) => <button type="button" disabled={!device.available || device.type === 'presence'} className={device.active ? 'is-active' : ''} onClick={() => controlDevice(device)} key={device.type}>{device.type === 'climate' ? <AirVent size={13} /> : device.type === 'media' ? <Radio size={13} /> : <CircleDot size={13} />}{device.type}</button>)}</div></aside>}
    <span className="home-os-floorplan-badge">{config.modelUrl ? 'FLOORPLAN' : 'D · 99.91 M²'} · LIVE</span>
  </section>;
}

