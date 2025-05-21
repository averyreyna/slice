// src/components/Tooltip.tsx
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const TooltipContainer = styled.div`
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  pointer-events: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  z-index: 1000;
  max-width: 200px;
  transition: opacity 0.2s;
  opacity: 0;
  
  &.visible {
    opacity: 1;
  }
`;

export interface TooltipProps {
  visible: boolean;
  x: number;
  y: number;
  content: React.ReactNode;
  offset?: { x: number; y: number };
}

export const Tooltip: React.FC<TooltipProps> = ({
  visible,
  x,
  y,
  content,
  offset = { x: 10, y: -10 }
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  
  useEffect(() => {
    if (visible && ref.current) {
      // Calculate position to ensure tooltip stays within viewport
      const tooltipRect = ref.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Initial position
      let left = x + offset.x;
      let top = y + offset.y;
      
      // Adjust if tooltip would overflow right edge
      if (left + tooltipRect.width > viewportWidth) {
        left = x - tooltipRect.width - offset.x;
      }
      
      // Adjust if tooltip would overflow bottom edge
      if (top + tooltipRect.height > viewportHeight) {
        top = y - tooltipRect.height - offset.y;
      }
      
      // Adjust if tooltip would overflow top edge
      if (top < 0) {
        top = 0;
      }
      
      setPosition({ left, top });
    }
  }, [visible, x, y, offset]);

  return (
    <TooltipContainer
      ref={ref}
      className={visible ? 'visible' : ''}
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`
      }}
    >
      {content}
    </TooltipContainer>
  );
};