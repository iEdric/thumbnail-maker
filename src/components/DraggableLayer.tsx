import React, { useRef, useState, memo } from 'react';
import { Layer } from '../types';

interface DraggableLayerProps {
  layer: Layer;
  isSelected: boolean;
  scaleFactor: number; // To handle the difference between UI display size and actual 1920x1080
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Layer>) => void;
}

export const DraggableLayer = memo<DraggableLayerProps>(({
  layer,
  isSelected,
  scaleFactor,
  onSelect,
  onUpdate,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent text selection
    onSelect(layer.id);

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ x: layer.x, y: layer.y });

    elementRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const dx = (e.clientX - dragStart.x) / scaleFactor;
    const dy = (e.clientY - dragStart.y) / scaleFactor;

    onUpdate(layer.id, {
      x: initialPos.x + dx,
      y: initialPos.y + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    elementRef.current?.releasePointerCapture(e.pointerId);
  };

  const commonStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${layer.x}px`,
    top: `${layer.y}px`,
    transform: `rotate(${layer.rotation}deg)`,
    opacity: layer.opacity,
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    zIndex: isSelected ? 50 : 10,
    filter: layer.shadow
      ? `drop-shadow(${layer.shadow.offsetX}px ${layer.shadow.offsetY}px ${layer.shadow.blur}px ${layer.shadow.color})`
      : 'none',
  };

  if (layer.type === 'text') {
    return (
      <div
        ref={elementRef}
        style={{
          ...commonStyle,
          fontSize: `${layer.fontSize}px`,
          fontFamily: layer.fontFamily,
          color: layer.color,
          fontWeight: layer.fontWeight,
          textTransform: layer.uppercase ? 'uppercase' : 'none',
          whiteSpace: 'nowrap',
          WebkitTextStroke: layer.strokeWidth > 0 ? `${layer.strokeWidth}px ${layer.strokeColor}` : 'none',
          backgroundColor: layer.background || 'transparent',
          padding: layer.background ? '0.2em 0.4em' : '0',
          // Text shadow handled via filter drop-shadow in commonStyle for consistency or standard text-shadow
          textShadow: layer.shadow && !layer.background // Prefer standard text-shadow for text unless it has background
            ? `${layer.shadow.offsetX}px ${layer.shadow.offsetY}px ${layer.shadow.blur}px ${layer.shadow.color}`
            : 'none',
          filter: layer.background && layer.shadow ? commonStyle.filter : 'none', // Apply drop-shadow to box if bg exists
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`transition-shadow duration-100 ${
          isSelected ? 'outline outline-2 outline-neon-cyan' : 'hover:outline hover:outline-1 hover:outline-white/30'
        }`}
      >
        {layer.text}
      </div>
    );
  }

  if (layer.type === 'image') {
    return (
      <div
        ref={elementRef}
        style={{
          ...commonStyle,
          width: layer.width,
          height: layer.height,
          border: layer.borderWidth ? `${layer.borderWidth}px solid ${layer.borderColor || '#fff'}` : 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`transition-shadow duration-100 ${
          isSelected ? 'outline outline-2 outline-neon-cyan' : 'hover:outline hover:outline-1 hover:outline-white/30'
        }`}
      >
        <img
          src={layer.src}
          alt="layer"
          className="w-full h-full block pointer-events-none"
        />
      </div>
    );
  }

  return null;
});
