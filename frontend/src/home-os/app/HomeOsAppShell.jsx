import React, { useState } from 'react';
import { Languages, LayoutDashboard, Map, Moon, Search, Settings, SlidersHorizontal, Sun } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useHass } from '@hakit/core';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../theme/ThemeContext';
import { primaryNavigation } from './navigation';
import HomeOsRoutes from './HomeOsRoutes';
import HomeOsErrorBoundary from './HomeOsErrorBoundary';
import CommandPalette from '../components/CommandPalette';
import '../styles/home-os.css';
import '../styles/readability.css';

export default function HomeOsAppShell() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const { useStore } = useHass();
  const ready = useStore((state) => state.ready);
  const kiosk = new URLSearchParams(window.location.search).get('kiosk') === '1' || localStorage.getItem('home_os_kiosk') === 'true';
  const isUtilityPage = pathname === '/legacy' || pathname === '/config';

  const nav = primaryNavigation.map((item) => ({ ...item, text: item.label[language] || item.label.zh }));

  return (
    <div className={`home-os-shell ${isUtilityPage ? 'home-os-shell--utility' : ''} ${kiosk ? 'home-os-shell--kiosk' : ''}`}>
      {!ready && <div className="home-os-offline-banner">{language === 'zh' ? '正在等待 Home Assistant 实时连接…' : 'Waiting for the Home Assistant live connection…'}</div>}
      <aside className="home-os-sidebar" aria-label={language === 'zh' ? '主导航' : 'Primary navigation'}>
        <NavLink to="/" className="home-os-brand" aria-label="Home OS">
          <span className="home-os-brand-mark">H</span>
          <span><strong>Home OS</strong><small>{language === 'zh' ? '家庭中枢' : 'Living system'}</small></span>
        </NavLink>
        <nav className="home-os-nav">
          {nav.map(({ path, text, icon: Icon }) => (
            <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `home-os-nav-link ${isActive ? 'is-active' : ''}`}>
              <Icon size={19} strokeWidth={1.8} /><span>{text}</span>
            </NavLink>
          ))}
        </nav>
        <div className="home-os-sidebar-footer">
          <NavLink to="/mode-settings" className="home-os-nav-link"><SlidersHorizontal size={18} /><span>{language === 'zh' ? '家庭模式' : 'Home modes'}</span></NavLink>
          <NavLink to="/floorplan-settings" className="home-os-nav-link"><Map size={18} /><span>{language === 'zh' ? '户型映射' : 'Floorplan'}</span></NavLink>
          <NavLink to="/legacy" className="home-os-nav-link"><LayoutDashboard size={18} /><span>{language === 'zh' ? '原面板' : 'Legacy'}</span></NavLink>
          <NavLink to="/config" className="home-os-nav-link"><Settings size={18} /><span>{language === 'zh' ? '设置' : 'Settings'}</span></NavLink>
        </div>
      </aside>

      <div className="home-os-workspace">
        {!isUtilityPage && (
          <header className="home-os-topbar">
            <div><span className="home-os-eyebrow">HOME ASSISTANT</span><strong>{language === 'zh' ? '家里，一切尽在掌握' : 'Everything at home, at a glance'}</strong></div>
            <div className="home-os-actions">
              <button type="button" onClick={() => setCommandOpen(true)} aria-label={language === 'zh' ? '全局搜索' : 'Global search'}><Search size={18} /></button>
              <button type="button" onClick={toggleLanguage} aria-label={language === 'zh' ? '切换语言' : 'Switch language'}><Languages size={18} /></button>
              <button type="button" onClick={toggleTheme} aria-label={language === 'zh' ? '切换主题' : 'Switch theme'}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
            </div>
          </header>
        )}
        <main className="home-os-main"><HomeOsErrorBoundary language={language}><HomeOsRoutes sidebarVisible={sidebarVisible} setSidebarVisible={setSidebarVisible} /></HomeOsErrorBoundary></main>
      </div>

      {!isUtilityPage && (
        <nav className="home-os-mobile-nav" aria-label={language === 'zh' ? '移动导航' : 'Mobile navigation'}>
          {nav.map(({ path, text, icon: Icon }) => (
            <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => isActive ? 'is-active' : ''}>
              <Icon size={20} /><span>{text}</span>
            </NavLink>
          ))}
        </nav>
      )}
      <CommandPalette open={commandOpen} setOpen={setCommandOpen} />
    </div>
  );
}
