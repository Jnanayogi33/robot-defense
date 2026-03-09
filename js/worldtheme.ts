// worldtheme.ts — Per-world visual themes
export interface WorldTheme {
  id: number;
  // Tile colors
  tileFill: string;
  tileAccent: string;
  tileDetail: string;
  // Path colors
  pathFill: string;
  pathBorder: string;
  pathBorderGlow: string;
  pathCenter: string;
  // Arrow color
  arrowColor: string;
  // Background
  bgColor: string;
  bgLine: string;
  // Ambient particles
  ambientColor: string;
  ambientDirection: 'up' | 'down' | 'drift';
  // UI accent
  accent: string;
}

export const WORLD_THEMES: Record<number, WorldTheme> = {
  1: {
    id: 1,
    tileFill:      '#1a1a1f',
    tileAccent:    '#222228',
    tileDetail:    '#2a2a30',
    pathFill:      '#2d2010',
    pathBorder:    '#8B6914',
    pathBorderGlow:'#c8901a',
    pathCenter:    '#6b5010',
    arrowColor:    '#d4902a',
    bgColor:       '#0d0d12',
    bgLine:        '#16161e',
    ambientColor:  '#ff6020',
    ambientDirection: 'up',
    accent:        '#ff9020',
  },
  2: {
    id: 2,
    tileFill:      '#101820',
    tileAccent:    '#141e28',
    tileDetail:    '#1a2535',
    pathFill:      '#0c1824',
    pathBorder:    '#1a5080',
    pathBorderGlow:'#2080c0',
    pathCenter:    '#153060',
    arrowColor:    '#3090d0',
    bgColor:       '#080c12',
    bgLine:        '#10161e',
    ambientColor:  '#2080ff',
    ambientDirection: 'down',
    accent:        '#2090ff',
  },
  3: {
    id: 3,
    tileFill:      '#120808',
    tileAccent:    '#1a0a0a',
    tileDetail:    '#220c0c',
    pathFill:      '#1e0808',
    pathBorder:    '#882010',
    pathBorderGlow:'#cc2010',
    pathCenter:    '#661008',
    arrowColor:    '#ff3020',
    bgColor:       '#090404',
    bgLine:        '#140808',
    ambientColor:  '#ff2010',
    ambientDirection: 'drift',
    accent:        '#ff3020',
  },
};

let _currentWorldId = 1;
export function setWorldTheme(id: number): void { _currentWorldId = id; }
export function getWorldTheme(): WorldTheme { return WORLD_THEMES[_currentWorldId] ?? WORLD_THEMES[1]; }
