import React, { useState, useCallback, useRef, useEffect } from 'react';
import { EditorState, TextLayer, ImageLayer, INITIAL_BACKGROUND, Layer, FileUploadEvent } from './types';
import { EditorCanvas } from './components/EditorCanvas';
import { ControlPanel } from './components/ControlPanel';
import { nanoid } from 'nanoid';
import * as htmlToImage from 'html-to-image';
import { HashRouter } from 'react-router-dom';
import {
  CANVAS_SIZE,
  INITIAL_TEXT_LAYER,
  DEFAULT_TEXT_LAYER,
  DEFAULT_IMAGE_LAYER,
  EXPORT_SETTINGS,
  EXPORT_DELAY,
  EXPORT_FILENAME_PREFIX,
} from './constants';
import { validateImageFile, loadImage, centerLayer, cleanupObjectURL } from './utils';

// Main application component for the NeonCover thumbnail maker
const App: React.FC = () => {
  // Canvas reference for export functionality
  const canvasRef = useRef<HTMLDivElement>(null);

  // Application state
  const [state, setState] = useState<EditorState>({
    layers: [INITIAL_TEXT_LAYER],
    selectedLayerId: INITIAL_TEXT_LAYER.id,
    background: INITIAL_BACKGROUND,
    canvasSize: CANVAS_SIZE,
  });

  // Background management handlers
  const handleUpdateBackground = useCallback((updates: Partial<EditorState['background']>) => {
    setState(prev => ({
      ...prev,
      background: { ...prev.background, ...updates },
    }));
  }, []);

  // Layer management handlers
  const handleAddLayer = useCallback((text: string = 'NEW TEXT') => {
    const newLayer: TextLayer = {
      id: nanoid(),
      type: 'text',
      text,
      x: state.canvasSize.width / 2 - 200, // Roughly center
      y: state.canvasSize.height / 2 - 50,
      ...DEFAULT_TEXT_LAYER,
    };
    setState(prev => ({
      ...prev,
      layers: [...prev.layers, newLayer],
      selectedLayerId: newLayer.id,
    }));
  }, [state.canvasSize]);

  // File upload handlers
  const handleAddImageLayer = useCallback(async (e: FileUploadEvent) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      alert(validationError.message);
      return;
    }

    const url = URL.createObjectURL(file);

    try {
      // Load and validate image
      const img = await loadImage(url);
      const aspect = img.width / img.height;
      const width = DEFAULT_IMAGE_LAYER.width;
      const height = width / aspect;

      const centerPos = centerLayer(state.canvasSize.width, state.canvasSize.height, width, height);

      const newLayer: ImageLayer = {
         id: nanoid(),
         type: 'image',
         src: url,
         ...centerPos,
         width,
         height,
         ...DEFAULT_IMAGE_LAYER,
      };

      setState(prev => ({
        ...prev,
        layers: [...prev.layers, newLayer],
        selectedLayerId: newLayer.id,
      }));
    } catch (error) {
      console.error('Failed to load image:', error);
      alert('Failed to load image. Please try again.');
      cleanupObjectURL(url);
    }

    // Clear the input value to allow re-uploading the same file
    e.target.value = '';
  }, [state.canvasSize]);

  // Layer manipulation handlers
  const handleUpdateLayer = useCallback((id: string, updates: Partial<Layer>) => {
    setState(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, ...updates } : l) as Layer[],
    }));
  }, []);

  const handleDeleteLayer = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      layers: prev.layers.filter(l => l.id !== id),
      selectedLayerId: null,
    }));
  }, []);

  // Selection handlers
  const handleSelectLayer = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedLayerId: id }));
  }, []);

  // Background image upload handler
  const handleUploadBackground = useCallback((e: FileUploadEvent) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      alert(validationError.message);
      return;
    }

    const url = URL.createObjectURL(file);
    setState(prev => ({
      ...prev,
      background: { ...prev.background, url },
    }));

    // Clear the input value to allow re-uploading the same file
    e.target.value = '';
  }, []);

  // Export functionality
  const handleExport = useCallback(async () => {
    if (!canvasRef.current) {
      alert('Canvas not found. Please try again.');
      return;
    }

    // Deselect before export to remove UI borders
    setState(prev => ({ ...prev, selectedLayerId: null }));

    try {
      // Wait for React to render the deselection
      await new Promise(resolve => setTimeout(resolve, EXPORT_DELAY));

      const dataUrl = await htmlToImage.toPng(canvasRef.current, EXPORT_SETTINGS);

      const link = document.createElement('a');
      link.download = `${EXPORT_FILENAME_PREFIX}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
      alert('Could not export image. Please try again.');
    }
  }, []);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup background image URL
      if (state.background.url) {
        cleanupObjectURL(state.background.url);
      }

      // Cleanup all layer image URLs
      state.layers.forEach(layer => {
        if (layer.type === 'image') {
          cleanupObjectURL(layer.src);
        }
      });
    };
  }, []);

  return (
    <HashRouter>
      <div className="fixed inset-0 overflow-hidden flex bg-black text-white font-sans selection:bg-neon-pink selection:text-white">
        
        {/* Main Workspace */}
        <div className="flex-1 flex flex-col relative min-w-0">
          {/* Header/Nav */}
          <div className="h-14 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex items-center px-6 justify-between z-10 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-neon-pink to-neon-cyan rounded-lg"></div>
              <h1 className="font-display font-bold text-xl tracking-wider">NEON<span className="text-slate-400">COVER</span></h1>
            </div>
            <div className="text-xs text-slate-500 font-mono">1920 x 1080px</div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 relative overflow-hidden bg-gray-900">
             <EditorCanvas 
                ref={canvasRef}
                state={state}
                onSelectLayer={handleSelectLayer}
                onUpdateLayer={handleUpdateLayer}
                onDeselect={() => handleSelectLayer(null)}
              />
          </div>
        </div>

        {/* Sidebar Controls */}
        <ControlPanel 
          state={state}
          onUpdateBackground={handleUpdateBackground}
          onUpdateLayer={handleUpdateLayer}
          onAddLayer={handleAddLayer}
          onAddImageLayer={handleAddImageLayer}
          onDeleteLayer={handleDeleteLayer}
          onSelectLayer={handleSelectLayer}
          onExport={handleExport}
          onUploadImage={handleUploadBackground}
        />
      </div>
    </HashRouter>
  );
};

export default App;
