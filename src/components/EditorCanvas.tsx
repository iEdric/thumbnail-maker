import React, { useRef, useEffect, useState, forwardRef, memo } from 'react';
import { EditorState, Layer } from '../types';
import { DraggableLayer } from './DraggableLayer';

interface EditorCanvasProps {
  state: EditorState;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDeselect: () => void;
}

export const EditorCanvas = memo(forwardRef<HTMLDivElement, EditorCanvasProps>(({
  state,
  onSelectLayer,
  onUpdateLayer,
  onDeselect,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Auto-fit canvas to container using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const calculateScale = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth === 0 || clientHeight === 0) return;

        // Target ratio 16:9
        const targetRatio = state.canvasSize.width / state.canvasSize.height;
        const containerRatio = clientWidth / clientHeight;

        let newScale = 1;
        if (containerRatio > targetRatio) {
           // Container is wider than canvas, constrain by height
           newScale = clientHeight / state.canvasSize.height;
        } else {
           // Container is taller than canvas, constrain by width
           newScale = clientWidth / state.canvasSize.width;
        }
        // Add a small margin (0.95) for aesthetics
        setScale(newScale * 0.95);
      }
    };

    calculateScale();

    const resizeObserver = new ResizeObserver(() => {
      calculateScale();
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [state.canvasSize]);

  // Background Styles
  const backgroundStyle: React.CSSProperties = {
    filter: `brightness(${state.background.brightness}%) contrast(${state.background.contrast}%) saturate(${state.background.saturate}%) blur(${state.background.blur}px)`,
    backgroundImage: state.background.url ? `url(${state.background.url})` : 'none',
    backgroundSize: state.background.size,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0,
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative overflow-hidden"
      onPointerDown={(e) => {
        if (e.target === containerRef.current) {
           onDeselect();
        }
      }}
    >
      {/* Pattern background for empty state */}
      {!state.background.url && (
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
      )}

      {/* The Actual Scaled Canvas */}
      <div
        id="editor-canvas-root"
        ref={ref}
        style={{
          width: state.canvasSize.width,
          height: state.canvasSize.height,
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          backgroundColor: '#000', // Default black base
          position: 'relative',
          boxShadow: '0 0 50px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          flexShrink: 0, // Prevent flex compression
        }}
      >
        {/* Render Background Layer */}
        <div style={backgroundStyle} />

        {/* Overlay Color */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: state.background.overlayColor,
            opacity: state.background.overlayOpacity,
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />

        {/* Layers */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
          {state.layers.map(layer => (
            <DraggableLayer
              key={layer.id}
              layer={layer}
              isSelected={state.selectedLayerId === layer.id}
              scaleFactor={scale}
              onSelect={onSelectLayer}
              onUpdate={onUpdateLayer}
            />
          ))}
        </div>
      </div>
    </div>
  );
}));
