// src/components/BarChart.tsx
import React, { useMemo } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';

const Container = styled.div`
  font-family: 'Inter', sans-serif;
  margin: 20px 0;
  position: relative;
`;

const Title = styled.h3`
  text-align: center;
  margin-bottom: 10px;
  color: #333;
`;

const FooterNote = styled.div`
  text-align: center;
  font-size: 0.9em;
  color: #666;
  margin-top: 5px;
`;

export interface BarChartProps {
  // Basic data props (all required)
  data: any[];
  xVariable: string;
  yVariable: string;
  
  // Basic customization (with sensible defaults)
  title?: string;
  groupVariable?: string;
  showErrorBars?: boolean;
  errorVariable?: string;
  
  // Advanced customization
  width?: number;
  height?: number;
  margin?: {top: number; right: number; bottom: number; left: number};
  barOpacity?: number;
  showGrid?: boolean;
  gridColor?: string;
  
  // Advanced axis customization
  xAxisLabel?: string;
  yAxisLabel?: string;
  yDomain?: [number, number];
  
  // Advanced style customization
  colors?: string[];
  backgroundColor?: string;
  
  // Advanced interaction
  onBarClick?: (data: any, group?: string) => void;
  onBarHover?: (data: any, group?: string) => void;
  tooltipContent?: (data: any, group?: string) => React.ReactNode;
}

export const BarChart: React.FC<BarChartProps> = ({
  // Data
  data,
  xVariable,
  yVariable,
  
  // Basic customization
  title,
  groupVariable,
  showErrorBars = false,
  errorVariable,
  
  // Layout
  width = 600,
  height = 400,
  margin = {top: 20, right: 30, bottom: 60, left: 60},
  
  // Style
  barOpacity = 0.8,
  showGrid = false,
  gridColor = '#eee',
  
  // Axis customization
  xAxisLabel,
  yAxisLabel,
  yDomain,
  
  // Advanced style
  colors,
  backgroundColor = 'transparent',
  
  // Interactions
  onBarClick,
  onBarHover,
  tooltipContent
}) => {
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Use provided axis labels or default to the variable names
  const finalXAxisLabel = xAxisLabel || xVariable;
  const finalYAxisLabel = yAxisLabel || yVariable;

  // Process data
  const processedData = useMemo(() => {
    if (!groupVariable) {
      // Simple aggregation by xVariable
      const groups = d3.group(data, d => d[xVariable]);
      return Array.from(groups, ([key, values]) => ({
        key,
        value: d3.mean(values, d => d[yVariable]) || 0,
        error: showErrorBars ? 
          (errorVariable ? 
            d3.mean(values, d => d[errorVariable]) || 0 : 
            d3.deviation(values, d => d[yVariable]) || 0) : 0
      }));
    } else {
      // Grouped bars by xVariable and groupVariable
      const nestedData: any[] = [];
      const groups = d3.group(data, d => d[xVariable]);
      
      groups.forEach((values, key) => {
        const subgroups = d3.group(values, d => d[groupVariable]);
        
        subgroups.forEach((subValues, subKey) => {
          nestedData.push({
            key,
            group: subKey,
            value: d3.mean(subValues, d => d[yVariable]) || 0,
            error: showErrorBars ? 
              (errorVariable ? 
                d3.mean(subValues, d => d[errorVariable]) || 0 : 
                d3.deviation(subValues, d => d[yVariable]) || 0) : 0
          });
        });
      });
      
      return nestedData;
    }
  }, [data, xVariable, yVariable, groupVariable, showErrorBars, errorVariable]);

  // Scales
  const xScale = useMemo(() => {
    const keys = [...new Set(processedData.map(d => d.key))];
    
    if (!groupVariable) {
      return d3.scaleBand()
        .domain(keys)
        .range([0, chartWidth])
        .padding(0.2);
    } else {
      return d3.scaleBand()
        .domain(keys)
        .range([0, chartWidth])
        .padding(0.3);
    }
  }, [processedData, chartWidth, groupVariable]);

  const xGroupScale = useMemo(() => {
    if (!groupVariable) return null;
    
    const groups = [...new Set(processedData.map(d => d.group))];
    return d3.scaleBand()
      .domain(groups)
      .range([0, xScale.bandwidth()])
      .padding(0.05);
  }, [processedData, xScale, groupVariable]);

  const yScale = useMemo(() => {
    const maxValue = d3.max(processedData, d => d.value + d.error) || 0;
    
    if (yDomain) {
      return d3.scaleLinear()
        .domain(yDomain)
        .range([chartHeight, 0]);
    }
    
    return d3.scaleLinear()
      .domain([0, maxValue * 1.1]) // Add 10% padding
      .range([chartHeight, 0])
      .nice();
  }, [processedData, chartHeight, yDomain]);

  const colorScale = useMemo(() => {
    if (!groupVariable) return () => '#1f77b4';
    
    const groups = [...new Set(processedData.map(d => d.group))];
    return d3.scaleOrdinal()
      .domain(groups)
      .range(colors || d3.schemeCategory10);
  }, [processedData, groupVariable, colors]);

  // Event handlers
  const handleBarClick = (d: any) => {
    if (onBarClick) {
      onBarClick(d, d.group);
    }
  };
  
  const handleBarHover = (d: any) => {
    if (onBarHover) {
      onBarHover(d, d.group);
    }
  };

  return (
    <Container>
      {title && <Title>{title}</Title>}
      
      <svg width={width} height={height}>
        <rect 
          x={0} 
          y={0} 
          width={width} 
          height={height} 
          fill={backgroundColor} 
          rx={4}
        />
        
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid lines */}
          {showGrid && (
            <>
              {yScale.ticks(5).map(tick => (
                <line 
                  key={`grid-y-${tick}`}
                  x1={0}
                  y1={yScale(tick)}
                  x2={chartWidth}
                  y2={yScale(tick)}
                  stroke={gridColor}
                  strokeDasharray="3,3"
                />
              ))}
            </>
          )}
        
          {/* X-axis */}
          <g transform={`translate(0, ${chartHeight})`}>
            <line x1={0} y1={0} x2={chartWidth} y2={0} stroke="#ccc" />
            
            {xScale.domain().map(key => (
              <g key={`tick-x-${key}`} transform={`translate(${xScale(key)! + xScale.bandwidth()/2}, 0)`}>
                <line y1={0} y2={5} stroke="#ccc" />
                <text y={20} textAnchor="middle" fontSize={12}>{key}</text>
              </g>
            ))}
            
            <text 
              x={chartWidth / 2} 
              y={40} 
              textAnchor="middle" 
              fontSize={14}
            >
              {finalXAxisLabel}
            </text>
          </g>
          
          {/* Y-axis */}
          <g>
            <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#ccc" />
            
            {yScale.ticks(5).map(tick => (
              <g key={`tick-y-${tick}`} transform={`translate(0, ${yScale(tick)})`}>
                <line x1={-5} x2={0} stroke="#ccc" />
                <text x={-10} dy=".32em" textAnchor="end" fontSize={12}>{tick}</text>
              </g>
            ))}
            
            <text 
              transform={`translate(${-40}, ${chartHeight / 2}) rotate(-90)`}
              textAnchor="middle" 
              fontSize={14}
            >
              {finalYAxisLabel}
            </text>
          </g>
          
          {/* Bars */}
          {processedData.map((d, i) => {
            const x = groupVariable 
              ? xScale(d.key)! + xGroupScale!(d.group)! 
              : xScale(d.key)!;
            
            const barWidth = groupVariable 
              ? xGroupScale!.bandwidth() 
              : xScale.bandwidth();
              
            return (
              <g key={i}>
                {/* Bar */}
                <rect
                  x={x}
                  y={yScale(d.value)}
                  width={barWidth}
                  height={chartHeight - yScale(d.value)}
                //   fill={colorScale(groupVariable ? d.group : '')}
                  opacity={barOpacity}
                  onClick={() => handleBarClick(d)}
                  onMouseOver={() => handleBarHover(d)}
                  style={{ cursor: onBarClick ? 'pointer' : 'default' }}
                />
                
                {/* Error bar */}
                {showErrorBars && d.error > 0 && (
                  <>
                    <line 
                      x1={x + barWidth/2}
                      y1={yScale(d.value - d.error)}
                      x2={x + barWidth/2}
                      y2={yScale(d.value + d.error)}
                      stroke="black"
                      strokeWidth={1}
                    />
                    <line 
                      x1={x + barWidth/2 - 5}
                      y1={yScale(d.value - d.error)}
                      x2={x + barWidth/2 + 5}
                      y2={yScale(d.value - d.error)}
                      stroke="black"
                      strokeWidth={1}
                    />
                    <line 
                      x1={x + barWidth/2 - 5}
                      y1={yScale(d.value + d.error)}
                      x2={x + barWidth/2 + 5}
                      y2={yScale(d.value + d.error)}
                      stroke="black"
                      strokeWidth={1}
                    />
                  </>
                )}
              </g>
            );
          })}
          
          {/* Legend for grouped bars */}
          {groupVariable && (
            <g transform={`translate(${chartWidth - 100}, 0)`}>
              {Array.from(new Set(processedData.map(d => d.group))).map((group, i) => (
                <g key={i} transform={`translate(0, ${i * 20})`}>
                  <rect
                    x={0}
                    y={0}
                    width={15}
                    height={15}
                    // fill={colorScale(group)}
                  />
                  <text x={20} y={12} fontSize={12}>{group}</text>
                </g>
              ))}
            </g>
          )}
        </g>
      </svg>
      
      {showErrorBars && (
        <FooterNote>
          Error bars show {errorVariable ? errorVariable : 'standard deviation'}
        </FooterNote>
      )}
    </Container>
  );
};