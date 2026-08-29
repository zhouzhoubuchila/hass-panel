import React from 'react';
import { Box, Layers3 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import ThreeFloorplan from './ThreeFloorplan';

export default function FloorplanPlaceholder({ config }) {
  const { language } = useLanguage();
  if (config?.modelUrl) return <ThreeFloorplan config={config} />;
  return (
    <section className="home-os-floorplan" aria-label={language === 'zh' ? '户型区域' : 'Floorplan area'}>
      <div className="home-os-floorplan-grid" />
      <div className="home-os-floorplan-placeholder">
        <span className="home-os-floorplan-icon"><Layers3 size={34} /><Box size={22} /></span>
        <strong>{language === 'zh' ? '3D 户型将在这里呈现' : 'Your 3D home will live here'}</strong>
        <p>{language === 'zh' ? '3D 引擎与实体绑定层已就绪。添加真实 GLB 模型后自动启用，当前不会生成虚构房间。' : 'The 3D engine and entity bindings are ready. Add a real GLB model to enable them; no rooms are invented.'}</p>
      </div>
      <span className="home-os-floorplan-badge">FLOORPLAN · READY</span>
    </section>
  );
}

