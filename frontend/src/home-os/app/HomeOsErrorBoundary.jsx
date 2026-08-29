import React from 'react';
import { AlertTriangle } from 'lucide-react';
export default class HomeOsErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('Home OS render error', error, info); }
  render() {
    if (!this.state.error) return this.props.children;
    const zh = this.props.language === 'zh';
    return <section className="home-os-error"><AlertTriangle size={30} /><h1>{zh ? '页面暂时无法显示' : 'This page could not be displayed'}</h1><p>{this.state.error.message}</p><button type="button" onClick={() => window.location.reload()}>{zh ? '重新加载' : 'Reload'}</button></section>;
  }
}

