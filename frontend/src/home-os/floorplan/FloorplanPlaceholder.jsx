import React from 'react';
import { Box, Layers3 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function FloorplanPlaceholder() {
  const { language } = useLanguage();
  return (
    <section className="home-os-floorplan" aria-label={language === 'zh' ? '户型区域' : 'Floorplan area'}>
      <div className="home-os-floorplan-grid" />
      <div className="home-os-floorplan-placeholder">
        <span className="home-os-floorplan-icon"><Layers3 size={34} /><Box size={22} /></span>
        <strong>{language === 'zh' ? '3D 户型将在这里呈现' : 'Your 3D home will live here'}</strong>
        <p>{language === 'zh' ? '等待真实户型图或 GLB 模型；当前不会生成虚构房间。' : 'Waiting for a real floorplan or GLB model. No rooms are invented.'}</p>
      </div>
      <span className="home-os-floorplan-badge">FLOORPLAN · READY</span>
    </section>
  );
}
