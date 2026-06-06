import React, { useState } from 'react';
import { PRESET_BACKGROUNDS, LAYOUT_OPTIONS } from '../../utils/presetAssets';
import { useUiStore } from '../../store/uiStore';
import { Palette, Layout, Image, Check, X, Link, Moon, Sun, Circle } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Theme definitions ──────────────────────────────────────────────────────────
const THEMES = [
  {
    id: 'dark',
    label: 'Dark',
    category: 'dark',
    preview: { bg: '#0f0f1a', sidebar: '#1a1a2e', bubble: '#7c3aed', accent: '#a855f7' },
    icon: <Moon size={12} />,
  },
  {
    id: 'deep-night',
    label: 'Deep Night',
    category: 'dark',
    preview: { bg: '#000000', sidebar: '#0a0a1a', bubble: '#2563eb', accent: '#60a5fa' },
    icon: <Moon size={12} />,
  },
  {
    id: 'monochrome',
    label: 'Monochrome',
    category: 'dark',
    preview: { bg: '#000000', sidebar: '#111111', bubble: '#2a2a2a', accent: '#ffffff' },
    icon: <Circle size={12} />,
  },
  {
    id: 'light',
    label: 'Light',
    category: 'light',
    preview: { bg: '#e9eef3', sidebar: '#ffffff', bubble: '#7c3aed', accent: '#7c3aed' },
    icon: <Sun size={12} />,
  },
  {
    id: 'warm-light',
    label: 'Warm Light',
    category: 'light',
    preview: { bg: '#f5efe6', sidebar: '#fffbf4', bubble: '#d97706', accent: '#d97706' },
    icon: <Sun size={12} />,
  },
  {
    id: 'inverted',
    label: 'Inverted',
    category: 'light',
    preview: { bg: '#ffffff', sidebar: '#f5f5f5', bubble: '#000000', accent: '#333333' },
    icon: <Circle size={12} />,
  },
];

// ── Theme Swatch ───────────────────────────────────────────────────────────────
function ThemeSwatch({ themeData, isActive, onClick }) {
  const { preview, label, icon, id } = themeData;
  return (
    <button
      onClick={onClick}
      title={label}
      className={`relative flex flex-col gap-0 rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 ${
        isActive
          ? 'shadow-[0_0_12px_var(--accent-glow,rgba(124,58,237,0.4))]'
          : ''
      }`}
      style={{
        border: isActive
          ? '2px solid var(--accent, #7c3aed)'
          : '2px solid var(--border-primary)',
        outline: isActive ? 'none' : '1px solid rgba(128,128,128,0.15)',
      }}
    >
      {/* Mini app preview */}
      <div className="relative w-full h-14" style={{ background: preview.bg }}>
        {/* Sidebar strip */}
        <div className="absolute left-0 top-0 bottom-0 w-8" style={{ background: preview.sidebar, borderRight: '1px solid rgba(128,128,128,0.15)' }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="mx-1 my-1 h-1.5 rounded-sm opacity-60" style={{ background: preview.accent }} />
          ))}
        </div>
        {/* Chat area */}
        <div className="absolute left-8 right-0 top-0 bottom-0 p-1 space-y-1">
          <div className="flex justify-end">
            <div className="w-8 h-1.5 rounded-full" style={{ background: preview.bubble }} />
          </div>
          <div className="flex justify-start">
            <div className="w-6 h-1.5 rounded-full opacity-40" style={{ background: preview.accent, border: '1px solid rgba(128,128,128,0.1)' }} />
          </div>
          <div className="flex justify-end">
            <div className="w-10 h-1.5 rounded-full" style={{ background: preview.bubble }} />
          </div>
        </div>
        {isActive && (
          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: preview.bubble }}>
            <Check size={8} className="text-white" style={{ color: preview.bg }} />
          </div>
        )}
      </div>
      {/* Label */}
      <div
        className="flex items-center justify-center gap-1 py-1 text-[9px] font-bold"
        style={{
          background: preview.sidebar,
          color: preview.accent,
          borderTop: '1px solid rgba(128,128,128,0.1)',
        }}
      >
        {icon}
        {label}
      </div>
    </button>
  );
}

// ── Main Panel ─────────────────────────────────────────────────────────────────
export function UICustomizerPanel({ onClose }) {
  const {
    theme, setTheme,
    chatBg, customBgUrl, setChatBg, setCustomBgUrl,
    chatLayout, setChatLayout,
  } = useUiStore();

  const [activeTab, setActiveTab] = useState('theme');
  const [customUrl, setCustomUrl] = useState(customBgUrl || '');

  const handleCustomBg = () => {
    if (!customUrl.trim()) { toast.error('Please enter a valid image URL.'); return; }
    setCustomBgUrl(customUrl.trim());
    toast.success('Custom background applied!');
  };

  const darkThemes = THEMES.filter(t => t.category === 'dark');
  const lightThemes = THEMES.filter(t => t.category === 'light');

  const tabStyle = (id) =>
    `flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-bold border-b-2 -mb-px transition-colors ${
      activeTab === id
        ? 'border-[var(--accent,#7c3aed)] text-[var(--text-accent,#a855f7)]'
        : 'border-transparent text-[var(--text-muted,rgba(255,255,255,0.3))] hover:text-[var(--text-secondary,rgba(255,255,255,0.6))]'
    }`;

  // Determine if current theme is dark-ish (for swatch border visibility)
  const isCurrentDark = theme === 'dark' || theme === 'deep-night' || theme === 'monochrome';

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <h2 className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
          <Palette size={14} style={{ color: 'var(--accent)' }} />
          Customize
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <X size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <button className={tabStyle('theme')} onClick={() => setActiveTab('theme')}>
          <Palette size={10} /> Theme
        </button>
        <button className={tabStyle('background')} onClick={() => setActiveTab('background')}>
          <Image size={10} /> Background
        </button>
        <button className={tabStyle('layout')} onClick={() => setActiveTab('layout')}>
          <Layout size={10} /> Layout
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* ── THEME TAB ───────────────────────────────────────────────────── */}
        {activeTab === 'theme' && (
          <>
            {/* Dark themes */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <Moon size={9} /> Dark Themes
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {darkThemes.map(t => (
                  <ThemeSwatch
                    key={t.id}
                    themeData={t}
                    isActive={theme === t.id}
                    onClick={() => { setTheme(t.id); toast.success(`"${t.label}" theme applied!`); }}
                  />
                ))}
              </div>
            </div>

            {/* Light themes */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <Sun size={9} /> Light Themes
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {lightThemes.map(t => (
                  <ThemeSwatch
                    key={t.id}
                    themeData={t}
                    isActive={theme === t.id}
                    onClick={() => { setTheme(t.id); toast.success(`"${t.label}" theme applied!`); }}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── BACKGROUND TAB ──────────────────────────────────────────────── */}
        {activeTab === 'background' && (
          <>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Chat Background</p>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_BACKGROUNDS.map(bg => {
                  // Determine if this swatch is a light-colored one
                  const isLightSwatch = bg.id === 'light-clean' || bg.id === 'light-warm' || bg.id === 'default';
                  const swatchBorderColor = chatBg === bg.id
                    ? 'var(--accent)'
                    : isLightSwatch && isCurrentDark
                      ? 'rgba(255,255,255,0.35)'
                      : !isLightSwatch && !isCurrentDark
                        ? 'rgba(0,0,0,0.22)'
                        : 'var(--border-primary)';

                  // Build swatch inline style
                  const swatchStyle = {
                    border: `2px solid ${swatchBorderColor}`,
                    boxShadow: chatBg === bg.id ? '0 0 10px var(--accent-glow)' : 'none',
                  };
                  if (bg.id === 'default') {
                    swatchStyle.background = 'var(--bg-chat, #0f0f1a)';
                  } else if (bg.style.backgroundImage) {
                    swatchStyle.backgroundImage = bg.style.backgroundImage;
                    swatchStyle.backgroundSize = bg.style.backgroundSize;
                    swatchStyle.backgroundColor = 'var(--bg-app)';
                  } else {
                    swatchStyle.background = bg.style.background;
                  }

                  return (
                    <button
                      key={bg.id}
                      onClick={() => { setChatBg(bg.id); toast.success(`"${bg.label}" background applied!`); }}
                      className="relative h-12 rounded-lg overflow-hidden transition-all hover:scale-105"
                      style={swatchStyle}
                    >
                      <span
                        className="absolute bottom-0 left-0 right-0 py-0.5 text-[9px] font-bold text-center"
                        style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                      >
                        {bg.label}
                      </span>
                      {chatBg === bg.id && (
                        <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                          <Check size={8} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Custom Image URL</p>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <Link size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="url"
                    value={customUrl}
                    onChange={e => setCustomUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg pl-7 pr-2 py-2 text-[10px] outline-none"
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-input)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <button
                  onClick={handleCustomBg}
                  className="px-3 py-2 rounded-lg text-[10px] font-bold text-white transition-colors"
                  style={{ background: 'var(--accent)' }}
                >
                  Apply
                </button>
              </div>
              {chatBg === 'custom' && customBgUrl && (
                <div
                  className="mt-1.5 h-14 rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${customBgUrl})`, border: '1px solid var(--border-active)' }}
                />
              )}
            </div>
          </>
        )}

        {/* ── LAYOUT TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'layout' && (
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Chat Layout</p>
            {LAYOUT_OPTIONS.map(layout => (
              <button
                key={layout.id}
                onClick={() => { setChatLayout(layout.id); toast.success(`"${layout.label}" layout applied!`); }}
                className="w-full text-left p-3 rounded-lg transition-all"
                style={{
                  background: chatLayout === layout.id ? 'var(--bg-active)' : 'var(--bg-card)',
                  border: chatLayout === layout.id ? '2px solid var(--border-active)' : '2px solid var(--border-primary)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{layout.label}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{layout.description}</div>
                  </div>
                  {chatLayout === layout.id && (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent)' }}>
                      <Check size={9} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Layout Preview */}
                <div className="mt-2 flex flex-col gap-0.5 opacity-60">
                  {layout.id === 'compact' && (
                    <>
                      <div className="flex justify-end"><div className="w-16 h-1.5 rounded-sm" style={{ background: 'var(--accent)' }} /></div>
                      <div className="flex justify-start"><div className="w-12 h-1.5 rounded-sm" style={{ background: 'var(--bg-input)' }} /></div>
                      <div className="flex justify-end"><div className="w-20 h-1.5 rounded-sm" style={{ background: 'var(--accent)' }} /></div>
                    </>
                  )}
                  {layout.id === 'bubble' && (
                    <>
                      <div className="flex justify-end"><div className="w-16 h-4 rounded-full" style={{ background: 'var(--accent)' }} /></div>
                      <div className="flex justify-start"><div className="w-12 h-4 rounded-full" style={{ background: 'var(--bg-input)' }} /></div>
                      <div className="flex justify-end"><div className="w-20 h-4 rounded-full" style={{ background: 'var(--accent)' }} /></div>
                    </>
                  )}
                  {layout.id === 'default' && (
                    <>
                      <div className="flex justify-end"><div className="w-16 h-3 rounded-xl" style={{ background: 'var(--accent)' }} /></div>
                      <div className="flex justify-start"><div className="w-12 h-3 rounded-xl" style={{ background: 'var(--bg-input)' }} /></div>
                      <div className="flex justify-end"><div className="w-20 h-3 rounded-xl" style={{ background: 'var(--accent)' }} /></div>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UICustomizerPanel;
