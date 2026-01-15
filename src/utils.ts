import { MAX_IMAGE_SIZE, ACCEPTED_IMAGE_TYPES } from './constants';
import type { ImageLoadError } from './types';

// File validation utilities
export const validateImageFile = (file: File): ImageLoadError | null => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      type: 'format',
      message: 'Please select a valid image file.',
      file,
    };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      type: 'size',
      message: 'File size too large. Please select an image smaller than 10MB.',
      file,
    };
  }

  return null;
};

// Image loading utility with error handling
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
};

// URL cleanup utility
export const cleanupObjectURL = (url: string | null) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

// Canvas size calculation utilities
export const calculateCanvasScale = (
  containerWidth: number,
  containerHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  margin = 0.95
): number => {
  if (containerWidth === 0 || containerHeight === 0) return 1;

  const targetRatio = canvasWidth / canvasHeight;
  const containerRatio = containerWidth / containerHeight;

  let scale = 1;
  if (containerRatio > targetRatio) {
    // Container is wider than canvas, constrain by height
    scale = containerHeight / canvasHeight;
  } else {
    // Container is taller than canvas, constrain by width
    scale = containerWidth / canvasWidth;
  }

  return scale * margin;
};

// Layer positioning utilities
export const centerLayer = (
  canvasWidth: number,
  canvasHeight: number,
  layerWidth: number,
  layerHeight: number
) => ({
  x: canvasWidth / 2 - layerWidth / 2,
  y: canvasHeight / 2 - layerHeight / 2,
});

// Text measurement utility (approximate)
export const measureText = (
  text: string,
  fontSize: number,
  fontFamily: string,
  fontWeight: number
): { width: number; height: number } => {
  // Create a temporary canvas to measure text
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { width: text.length * fontSize * 0.6, height: fontSize };
  }

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(text);
  return {
    width: metrics.width,
    height: fontSize * 1.2, // Approximate line height
  };
};

// Debounce utility for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Local storage utilities for future persistence
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silently fail if storage is not available
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail if storage is not available
    }
  },
};