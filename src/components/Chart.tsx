import React from 'react';
import styled from 'styled-components';

const ChartContainer = styled.div`
  font-family: 'Inter', sans-serif;
  margin: 20px 0;
  position: relative;
`;

export interface ChartProps {
  data: any[];
  width?: number;
  height?: number;
  margin?: {top: number; right: number; bottom: number; left: number};
  children?: React.ReactNode;
}

export const Chart: React.FC<ChartProps> = ({
  data,
  width = 600,
  height = 400,
  margin = {top: 20, right: 30, bottom: 40, left: 50},
  children
}) => {
  return (
    <ChartContainer>
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {children}
        </g>
      </svg>
    </ChartContainer>
  );
};