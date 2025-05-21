// src/components/withTooltip.tsx
import React, { useState } from 'react';
import { Tooltip } from './Tooltip';

export interface WithTooltipProps {
  tooltipFormat?: (d: any) => React.ReactNode;
}

export function withTooltip<P extends object>(Component: React.ComponentType<P>) {
  return (props: P & WithTooltipProps) => {
    const [tooltip, setTooltip] = useState<{
      visible: boolean;
      data: any;
      x: number;
      y: number;
    }>({
      visible: false,
      data: null,
      x: 0,
      y: 0
    });

    const handleMouseOver = (data: any, event: React.MouseEvent) => {
      setTooltip({
        visible: true,
        data,
        x: event.clientX,
        y: event.clientY
      });
    };

    const handleMouseMove = (event: React.MouseEvent) => {
      if (tooltip.visible) {
        setTooltip({
          ...tooltip,
          x: event.clientX,
          y: event.clientY
        });
      }
    };

    const handleMouseOut = () => {
      setTooltip({ ...tooltip, visible: false });
    };

    const defaultTooltipFormat = (data: any) => {
      if (!data) return null;
      
      return (
        <div>
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <strong>{key}:</strong> {String(value)}
            </div>
          ))}
        </div>
      );
    };

    const { tooltipFormat, ...rest } = props;

    return (
      <div style={{ position: 'relative' }} onMouseMove={handleMouseMove}>
        <Component
          {...rest as P}
          onPointHover={(data: any, _index: number, event: React.MouseEvent) => 
            handleMouseOver(data, event)}
          onPointLeave={handleMouseOut}
        />
        
        <Tooltip
          visible={tooltip.visible}
          x={tooltip.x}
          y={tooltip.y}
          content={tooltipFormat ? 
            tooltipFormat(tooltip.data) : 
            defaultTooltipFormat(tooltip.data)}
        />
      </div>
    );
  };
}