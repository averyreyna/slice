// src/components/ScatterPlot.tsx
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

export interface ScatterPlotProps {
  // Basic data props (all required)
  data: any[];
  xVariable: string;
  yVariable: string;
  
  // Basic customization (with sensible defaults)
  title?: string;
  colorVariable?: string;
  showRegressionLine?: boolean;
  
  // Advanced customization
  width?: number;
  height?: number;
  margin?: {top: number; right: number; bottom: number; left: number};
  pointSize?: number;
  pointOpacity?: number;
  showGrid?: boolean;
  gridColor?: string;
  
  // Advanced axis customization
  xAxisLabel?: string;
  yAxisLabel?: string;
  xDomain?: [number, number];
  yDomain?: [number, number];
  
  // Advanced style customization
  colors?: string[];
  backgroundColor?: string;
  lineColor?: string;
  showRegressionEquation?: boolean;
  
  // Advanced interaction
  onPointClick?: (point: any, index: number) => void;
  onPointHover?: (point: any, index: number) => void;
  tooltipContent?: (point: any) => React.ReactNode;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({
  // Data
  data,
  xVariable,
  yVariable,
  
  // Basic customization
  title,
  colorVariable,
  showRegressionLine = false,
  
  // Layout
  width = 600,
  height = 400,
  margin = {top: 20, right: 30, bottom: 50, left: 60},
  
  // Style
  pointSize = 5,
  pointOpacity = 0.7,
  showGrid = false,
  gridColor = '#eee',
  
  // Axis customization
  xAxisLabel,
  yAxisLabel,
  xDomain,
  yDomain,
  
  // Advanced style
  colors,
  backgroundColor = 'transparent',
  lineColor = '#ff7f0e',
  showRegressionEquation = false,
  
  // Interactions
  onPointClick,
  onPointHover,
  tooltipContent
}) => {
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Use provided axis labels or default to the variable names
  const finalXAxisLabel = xAxisLabel || xVariable;
  const finalYAxisLabel = yAxisLabel || yVariable;

  // Scale creation with domain customization
  const xScale = useMemo(() => {
    const scale = d3.scaleLinear()
      .range([0, chartWidth]);
      
    if (xDomain) {
      scale.domain(xDomain);
    } else {
      scale.domain([
        d3.min(data, d => d[xVariable]) * 0.9 || 0,
        d3.max(data, d => d[xVariable]) * 1.1 || 0
      ]).nice();
    }
    
    return scale;
  }, [data, xVariable, chartWidth, xDomain]);

  const yScale = useMemo(() => {
    const scale = d3.scaleLinear()
      .range([chartHeight, 0]);
      
    if (yDomain) {
      scale.domain(yDomain);
    } else {
      scale.domain([
        d3.min(data, d => d[yVariable]) * 0.9 || 0,
        d3.max(data, d => d[yVariable]) * 1.1 || 0
      ]).nice();
    }
    
    return scale;
  }, [data, yVariable, chartHeight, yDomain]);

  // Color scale with custom colors
  const colorScale = useMemo(() => {
    if (!colorVariable) return () => '#1f77b4';
    
    const uniqueValues = [...new Set(data.map(d => d[colorVariable]))];
    return d3.scaleOrdinal()
      .domain(uniqueValues)
      .range(colors || d3.schemeCategory10);
  }, [data, colorVariable, colors]);

  // Calculate regression line
  const regression = useMemo(() => {
    if (!showRegressionLine) return null;
    
    const xValues = data.map(d => d[xVariable]);
    const yValues = data.map(d => d[yVariable]);
    
    // Simple linear regression
    const n = data.length;
    const sumX = d3.sum(xValues);
    const sumY = d3.sum(yValues);
    const sumXY = d3.sum(xValues.map((x, i) => x * yValues[i]));
    const sumXX = d3.sum(xValues.map(x => x * x));
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return {
      slope,
      intercept,
      x1: xScale.domain()[0],
      y1: slope * xScale.domain()[0] + intercept,
      x2: xScale.domain()[1],
      y2: slope * xScale.domain()[1] + intercept,
      equation: `y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`
    };
  }, [data, xVariable, yVariable, showRegressionLine, xScale]);

  // Event handlers
  const handlePointClick = (point: any, index: number) => {
    if (onPointClick) {
      onPointClick(point, index);
    }
  };
  
  const handlePointHover = (point: any, index: number) => {
    if (onPointHover) {
      onPointHover(point, index);
    }
  };

  // Calculate correlation for display
  const correlation = useMemo(() => {
    if (!showRegressionLine) return null;
    
    const xValues = data.map(d => d[xVariable]);
    const yValues = data.map(d => d[yVariable]);
    
    const xMean = d3.mean(xValues) || 0;
    const yMean = d3.mean(yValues) || 0;
    
    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;
    
    for (let i = 0; i < data.length; i++) {
      const xDiff = xValues[i] - xMean;
      const yDiff = yValues[i] - yMean;
      
      numerator += xDiff * yDiff;
      denominatorX += xDiff * xDiff;
      denominatorY += yDiff * yDiff;
    }
    
    const r = numerator / Math.sqrt(denominatorX * denominatorY);
    return r.toFixed(2);
  }, [data, xVariable, yVariable, showRegressionLine]);

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
              {xScale.ticks(5).map(tick => (
                <line 
                  key={`grid-x-${tick}`}
                  x1={xScale(tick)}
                  y1={0}
                  x2={xScale(tick)}
                  y2={chartHeight}
                  stroke={gridColor}
                  strokeDasharray="3,3"
                />
              ))}
              
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
            
            {xScale.ticks(5).map(tick => (
              <g key={`tick-x-${tick}`} transform={`translate(${xScale(tick)}, 0)`}>
                <line y1={0} y2={5} stroke="#ccc" />
                <text y={20} textAnchor="middle" fontSize={12}>{tick}</text>
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
          
          {/* Regression line */}
          {showRegressionLine && regression && (
            <line
              x1={xScale(regression.x1)}
              y1={yScale(regression.y1)}
              x2={xScale(regression.x2)}
              y2={yScale(regression.y2)}
              stroke={lineColor}
              strokeWidth={2}
              strokeDasharray="5,5"
            />
          )}
          
          {/* Data points */}
          {data.map((d, i) => (
            <circle
              key={i}
              cx={xScale(d[xVariable])}
              cy={yScale(d[yVariable])}
              r={pointSize}
            //   fill={colorScale(colorVariable ? d[colorVariable] : '')}
              opacity={pointOpacity}
              onClick={() => handlePointClick(d, i)}
              onMouseOver={() => handlePointHover(d, i)}
              style={{ cursor: onPointClick ? 'pointer' : 'default' }}
            />
          ))}
          
          {/* Regression equation */}
          {showRegressionLine && showRegressionEquation && regression && (
            <text
              x={chartWidth - 20}
              y={20}
              textAnchor="end"
              fontSize={12}
              fill="#666"
            >
              {regression.equation} (r = {correlation})
            </text>
          )}
          
          {/* Legend for color variable */}
          {colorVariable && (
            <g transform={`translate(${chartWidth - 100}, 0)`}>
              {[...new Set(data.map(d => d[colorVariable]))].map((value, i) => (
                <g key={i} transform={`translate(0, ${i * 20})`}>
                  <circle
                    cx={7}
                    cy={7}
                    r={7}
                    // fill={colorScale(value)}
                  />
                  <text x={20} y={11} fontSize={12}>{value}</text>
                </g>
              ))}
            </g>
          )}
        </g>
      </svg>
      
      {showRegressionLine && !showRegressionEquation && (
        <FooterNote>
          Correlation coefficient (r): {correlation}
        </FooterNote>
      )}
    </Container>
  );
};