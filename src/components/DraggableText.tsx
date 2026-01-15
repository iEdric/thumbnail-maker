import React, { useRef, useState, useEffect, memo } from 'react';
import { TextLayer } from '../types';

interface DraggableTextProps {
  layer: TextLayer;
  isSelected: boolean;
  scaleFactor: number; // To handle the difference between UI display size and actual 1920x1080
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TextLayer>) => void;
}

export const DraggableText = memo<DraggableTextProps>(({
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

  // Construct styles
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${layer.x}px`,
    top: `${layer.y}px`,
    fontSize: `${layer.fontSize}px`,
    fontFamily: layer.fontFamily,
    color: layer.color,
    fontWeight: layer.fontWeight,
    transform: `rotate(${layer.rotation}deg)`,
    opacity: layer.opacity,
    textTransform: layer.uppercase ? 'uppercase' : 'none',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    textShadow: layer.shadow
      ? `${layer.shadow.offsetX}px ${layer.shadow.offsetY}px ${layer.shadow.blur}px ${layer.shadow.color}`
      : 'none',
    WebkitTextStroke: layer.strokeWidth > 0 ? `${layer.strokeWidth}px ${layer.strokeColor}` : 'none',
    backgroundColor: layer.background || 'transparent',
    padding: layer.background ? '0.2em 0.4em' : '0',
    zIndex: isSelected ? 50 : 10,
  };

  return (
    <div
      ref={elementRef}
      style={style}
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
});
