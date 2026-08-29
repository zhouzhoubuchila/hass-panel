import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHass } from '@hakit/core';
import { Droplets, Lightbulb, Thermometer } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { buildFloorplanState, entityForObject } from './floorplanBinding';
import { createProceduralDPlan } from './proceduralDPlan';

export default function ThreeFloorplan({ config }) {
  const containerRef = useRef(null);
  const runtimeRef = useRef(null);
  const { callService, useStore } = useHass();
  const entities = useStore((state) => state.entities);
  const { language } = useLanguage();
  const [status, setStatus] = useState('loading');
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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
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
  }, [config.camera, config.layout, config.modelUrl]);

  useEffect(() => {
    const root = runtimeRef.current?.root;
    if (!root) return;
    root.traverse((object) => {
      if (!object.isMesh) return;
      const binding = floorplanState.lights.find((light) => light.objectNames.includes(object.name));
      if (!binding) return;
      if (!object.userData.homeOsMaterialCloned) {
        object.material = object.material.clone();
        object.userData.homeOsMaterialCloned = true;
      }
      object.material.emissive?.set(binding.isOn ? binding.onColor : binding.offColor);
      if ('emissiveIntensity' in object.material) object.material.emissiveIntensity = binding.isOn ? 1.8 : 0.08;
    });
  }, [floorplanState, status]);

  const handlePointer = (event) => {
    const runtime = runtimeRef.current;
    if (!runtime?.root) return;
    const rect = runtime.renderer.domElement.getBoundingClientRect();
    runtime.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    runtime.raycaster.setFromCamera(runtime.pointer, runtime.camera);
    const hit = runtime.raycaster.intersectObject(runtime.root, true)[0];
    const entityId = hit && entityForObject(hit.object, floorplanState.lights);
    if (entityId) callService({ domain: 'light', service: 'toggle', target: { entity_id: entityId } });
  };

  return <section className="home-os-floorplan home-os-floorplan--3d" aria-label={language === 'zh' ? '3D 户型' : '3D floorplan'}>
    <div ref={containerRef} className="home-os-three-canvas" onClick={handlePointer} />
    {status !== 'ready' && <div className="home-os-three-status"><strong>{status === 'error' ? (language === 'zh' ? '模型加载失败' : 'Model failed to load') : (language === 'zh' ? '正在加载 3D 户型' : 'Loading 3D floorplan')}</strong><small>{status === 'error' ? config.modelUrl : 'GLB / GLTF'}</small></div>}
    <div className="home-os-floorplan-readouts">
      {floorplanState.rooms.slice(0, 3).map((room) => <div key={room.id}><strong>{room.name}</strong><span><Thermometer size={13} />{room.temperature ?? '—'}°</span><span><Droplets size={13} />{room.humidity ?? '—'}%</span></div>)}
      {floorplanState.lights.slice(0, 3).map((light) => <button type="button" disabled={!light.available} onClick={() => callService({ domain: 'light', service: 'toggle', target: { entity_id: light.entityId } })} key={light.entityId}><Lightbulb size={14} />{light.entityId.split('.').pop()}<i className={light.isOn ? 'is-on' : ''} /></button>)}
    </div>
    <span className="home-os-floorplan-badge">{config.modelUrl ? 'FLOORPLAN' : 'D · 99.91 M²'} · LIVE</span>
  </section>;
}

