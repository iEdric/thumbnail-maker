// Canvas and UI constants
export const CANVAS_SIZE = {
  width: 1920,
  height: 1080,
} as const;

export const DEFAULT_TEXT_LAYER = {
  fontSize: 100,
  fontFamily: 'Inter' as const,
  color: '#ffffff',
  fontWeight: 800,
  rotation: 0,
  opacity: 1,
  shadow: {
    blur: 10,
    color: 'rgba(0,0,0,0.8)',
    offsetX: 5,
    offsetY: 5,
  },
  strokeColor: '#000000',
  strokeWidth: 0,
  uppercase: true,
} as const;

export const DEFAULT_IMAGE_LAYER = {
  width: 400,
  rotation: 0,
  opacity: 1,
  shadow: null,
} as const;

export const INITIAL_TEXT_LAYER = {
  id: '1',
  type: 'text' as const,
  text: 'NEON COVER',
  x: 600,
  y: 400,
  fontSize: 120,
  fontFamily: 'Oswald' as const,
  color: '#00ffff',
  fontWeight: 700,
  rotation: 0,
  opacity: 1,
  shadow: {
    blur: 20,
    color: '#000000',
    offsetX: 8,
    offsetY: 8,
  },
  strokeColor: '#000000',
  strokeWidth: 0,
  uppercase: true,
} as const;

// UI Constants
export const CONTROL_PANEL_WIDTH = 320; // w-80 in Tailwind

// Export settings
export const EXPORT_SETTINGS = {
  quality: 1,
  width: CANVAS_SIZE.width,
  height: CANVAS_SIZE.height,
  pixelRatio: 1,
  style: {
    transform: 'scale(1)',
    transformOrigin: 'top left',
  },
} as const;

// Timing constants
export const EXPORT_DELAY = 100; // ms to wait for React to render deselection

// File handling
export const ACCEPTED_IMAGE_TYPES = 'image/*' as const;
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// Color presets
export const TEXT_COLOR_PRESETS = [
  '#ffffff', '#000000', '#ff00ff', '#00ffff', '#ffff00', '#ff0000', '#00ff00'
] as const;

export const OVERLAY_COLOR_PRESETS = [
  '#000000', '#ffffff', '#ff00ff', '#00ffff', '#0000ff', '#ff0000'
] as const;

// Font families
export const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Playfair Display', label: 'Playfair' },
  { value: 'Roboto Mono', label: 'Mono' },
] as const;

// Font weights
export const FONT_WEIGHTS = [
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 600, label: 'Bold' },
  { value: 800, label: 'Black' },
] as const;

// Filter ranges
export const FILTER_RANGES = {
  brightness: { min: 0, max: 200, default: 100 },
  contrast: { min: 0, max: 200, default: 100 },
  saturate: { min: 0, max: 200, default: 100 },
  blur: { min: 0, max: 20, default: 0 },
} as const;

// Layer ranges
export const LAYER_RANGES = {
  rotation: { min: -180, max: 180, default: 0 },
  opacity: { min: 0, max: 1, step: 0.05, default: 1 },
  fontSize: { min: 20, max: 300, default: 100 },
  strokeWidth: { min: 0, max: 20, default: 0 },
  shadowBlur: { min: 0, max: 50, default: 10 },
  imageWidth: { min: 50, max: 1000, default: 400 },
  borderWidth: { min: 0, max: 20, default: 0 },
} as const;

// Export filename
export const EXPORT_FILENAME_PREFIX = 'neon-cover';