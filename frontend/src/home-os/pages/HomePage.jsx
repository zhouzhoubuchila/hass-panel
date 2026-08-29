import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronRight, CloudSun, MapPin, Users } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import FloorplanPlaceholder from '../floorplan/FloorplanPlaceholder';

export default function HomePage() {
  const { language } = useLanguage();
  const [now, setNow] = useState(new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 30000); return () => window.clearInterval(timer); }, []);
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';

  return (
    <div className="home-os-home-page">
      <section className="home-os-greeting">
        <div><span>{now.toLocaleDateString(locale, { month: 'long', day: 'numeric', weekday: 'long' })}</span><h1>{now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })}</h1></div>
        <div className="home-os-connection"><span /><div><strong>{language === 'zh' ? 'Home Assistant 已连接' : 'Home Assistant connected'}</strong><small>{language === 'zh' ? '实时状态通道可用' : 'Live state channel available'}</small></div></div>
      </section>

      <div className="home-os-home-grid">
        <FloorplanPlaceholder />
        <aside className="home-os-summary-rail">
          <section className="home-os-panel home-os-attention">
            <div className="home-os-panel-title"><span><CheckCircle2 size={20} />{language === 'zh' ? '需要你处理' : 'Needs attention'}</span><button type="button" aria-label={language === 'zh' ? '查看详情' : 'View details'}><ChevronRight size={18} /></button></div>
            <strong>{language === 'zh' ? '尚未配置异常规则' : 'Attention rules are not configured'}</strong>
            <p>{language === 'zh' ? 'Phase 2 将从真实 HA 实体汇总异常；这里不会显示模拟告警。' : 'Phase 2 will derive alerts from real HA entities. No mock alerts are shown.'}</p>
          </section>
          <section className="home-os-panel">
            <div className="home-os-panel-title"><span><CloudSun size={20} />{language === 'zh' ? '今日环境' : 'Today outside'}</span></div>
            <div className="home-os-empty-row"><MapPin size={18} /><span>{language === 'zh' ? '选择 weather 实体后显示天气与出行建议' : 'Select a weather entity for conditions and travel advice'}</span></div>
          </section>
          <section className="home-os-panel">
            <div className="home-os-panel-title"><span><Users size={20} />{language === 'zh' ? '家庭状态' : 'Household'}</span></div>
            <div className="home-os-empty-row"><span className="home-os-dot" /><span>{language === 'zh' ? '等待人员与房间实体映射' : 'Waiting for people and room mappings'}</span></div>
          </section>
        </aside>
      </div>
    </div>
  );
}
