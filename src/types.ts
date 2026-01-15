
import type { ACCEPTED_IMAGE_TYPES } from './constants';

// Basic types
export type FontFamily = 'Inter' | 'Oswald' | 'Playfair Display' | 'Roboto Mono';
export type FontWeight = 300 | 400 | 600 | 800;
export type BackgroundSize = 'cover' | 'contain';
export type LayerType = 'text' | 'image';

// Utility types
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface TextShadow {
  blur: number;
  color: string;
  offsetX: number;
  offsetY: number;
}

export interface BaseLayer {
  id: string;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  shadow: TextShadow | null;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: FontFamily;
  color: string;
  fontWeight: FontWeight;
  strokeColor: string;
  strokeWidth: number;
  uppercase: boolean;
  background?: string;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
  width: number;
  height: number;
  borderColor?: string;
  borderWidth?: number;
}

export type Layer = TextLayer | ImageLayer;

export interface BackgroundSettings {
  url: string | null;
  size: BackgroundSize;
  brightness: number; // 0-200, default 100
  contrast: number;   // 0-200, default 100
  saturate: number;   // 0-200, default 100
  blur: number;       // 0-20, default 0
  overlayColor: string;
  overlayOpacity: number;
}

export interface EditorState {
  layers: Layer[];
  selectedLayerId: string | null;
  background: BackgroundSettings;
  canvasSize: Size;
}

// Event handler types
export interface FileUploadEvent extends React.ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & {
    files: FileList;
  };
}

// Error types
export interface ImageLoadError {
  type: 'load' | 'format' | 'size';
  message: string;
  file?: File;
}

// Utility functions for type guards
export const isTextLayer = (layer: Layer): layer is TextLayer => {
  return layer.type === 'text';
};

export const isImageLayer = (layer: Layer): layer is ImageLayer => {
  return layer.type === 'image';
};

export const INITIAL_BACKGROUND: BackgroundSettings = {
  url: null,
  size: 'cover',
  brightness: 100,
  contrast: 100,
  saturate: 100,
  blur: 0,
  overlayColor: '#000000',
  overlayOpacity: 0.2,
};
