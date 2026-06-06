// Pre-defined avatar options for profile picture selection
export const PRESET_AVATARS = [
  {
    id: 'bottts-1',
    label: 'Robot Blue',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=nexus1&backgroundColor=b6e3f4',
  },
  {
    id: 'bottts-2',
    label: 'Robot Purple',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=nexus2&backgroundColor=d1d4f9',
  },
  {
    id: 'bottts-3',
    label: 'Robot Green',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=nexus3&backgroundColor=c0aede',
  },
  {
    id: 'bottts-4',
    label: 'Cyber Fox',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=nexus4&backgroundColor=ffdfbf',
  },
  {
    id: 'pixel-1',
    label: 'Pixel Hero',
    url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=hero1',
  },
  {
    id: 'pixel-2',
    label: 'Pixel Warrior',
    url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=warrior',
  },
  {
    id: 'identicon-1',
    label: 'Identicon A',
    url: 'https://api.dicebear.com/7.x/identicon/svg?seed=alpha&backgroundColor=b6e3f4',
  },
  {
    id: 'identicon-2',
    label: 'Identicon B',
    url: 'https://api.dicebear.com/7.x/identicon/svg?seed=beta&backgroundColor=d1d4f9',
  },
  {
    id: 'lorelei-1',
    label: 'Lorelei A',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=lorelei1',
  },
  {
    id: 'lorelei-2',
    label: 'Lorelei B',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=lorelei2',
  },
  {
    id: 'fun-emoji-1',
    label: 'Emoji Cool',
    url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=cool',
  },
  {
    id: 'fun-emoji-2',
    label: 'Emoji Fire',
    url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=fire',
  },
];

// Pre-defined chat backgrounds
export const PRESET_BACKGROUNDS = [
  {
    id: 'default',
    label: 'Default Theme',
    preview: null,
    // This gets overridden in UICustomizerPanel with the live theme var, 
    // but a fallback gradient ensures it's never invisible
    style: { background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)' },
  },
  {
    id: 'gradient-purple',
    label: 'Nebula',
    preview: null,
    style: { background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
  },
  {
    id: 'gradient-ocean',
    label: 'Ocean Depth',
    preview: null,
    style: { background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' },
  },
  {
    id: 'gradient-forest',
    label: 'Forest Night',
    preview: null,
    style: { background: 'linear-gradient(135deg, #0a3d1f, #1a5c30, #0f2a18)' },
  },
  {
    id: 'gradient-sunset',
    label: 'Sunset',
    preview: null,
    style: { background: 'linear-gradient(135deg, #1a0533, #4a0e5e, #c0392b)' },
  },
  {
    id: 'gradient-midnight',
    label: 'Midnight',
    preview: null,
    style: { background: 'linear-gradient(135deg, #000428, #004e92)' },
  },
  {
    id: 'pattern-dots',
    label: 'Dot Matrix',
    preview: null,
    style: {
      backgroundImage: 'radial-gradient(rgba(124,58,237,0.15) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    },
  },
  {
    id: 'pattern-grid',
    label: 'Cyber Grid',
    preview: null,
    style: {
      backgroundImage:
        'linear-gradient(rgba(124,58,237,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.08) 1px, transparent 1px)',
      backgroundSize: '30px 30px',
    },
  },
  {
    id: 'light-clean',
    label: 'Clean White',
    preview: null,
    style: { background: '#f0f2f5' },
  },
  {
    id: 'light-warm',
    label: 'Warm Cream',
    preview: null,
    style: { background: 'linear-gradient(135deg, #ffecd2, #fcb69f)' },
  },
];

// Layout options
export const LAYOUT_OPTIONS = [
  { id: 'default', label: 'Classic', description: 'Traditional sidebar + chat layout' },
  { id: 'compact', label: 'Compact', description: 'Condensed messages, minimal spacing' },
  { id: 'bubble', label: 'Bubble', description: 'Rounded bubble-heavy design' },
];
