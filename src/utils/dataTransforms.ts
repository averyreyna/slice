// src/utils/dataTransforms.ts (updated)
import * as d3 from 'd3';

// Basic statistics
export const calculateMean = (data: any[], variable: string): number => {
  return d3.mean(data, d => d[variable]) || 0;
};

export const calculateMedian = (data: any[], variable: string): number => {
  return d3.median(data, d => d[variable]) || 0;
};

export const calculateStandardDeviation = (data: any[], variable: string): number => {
  return d3.deviation(data, d => d[variable]) || 0;
};

export const calculateQuantiles = (data: any[], variable: string, q: number[] = [0.25, 0.5, 0.75]): number[] => {
  return q.map(quantile => d3.quantile(data.map(d => d[variable]), quantile) || 0);
};

// Data transformations
export const groupByCategory = (data: any[], category: string) => {
  return Array.from(d3.group(data, d => d[category]), ([key, values]) => ({ 
    key, 
    values 
  }));
};

export const summarizeByGroup = (data: any[], groupVar: string, valueVar: string) => {
  const groups = d3.group(data, d => d[groupVar]);
  
  return Array.from(groups, ([key, values]) => ({
    group: key,
    count: values.length,
    mean: d3.mean(values, d => d[valueVar]) || 0,
    median: d3.median(values, d => d[valueVar]) || 0,
    stdDev: d3.deviation(values, d => d[valueVar]) || 0,
    min: d3.min(values, d => d[valueVar]) || 0,
    max: d3.max(values, d => d[valueVar]) || 0
  }));
};

export const longToWide = (data: any[], id: string, variable: string, value: string) => {
  // Transform long format data to wide format
  const result: {[key: string]: any} = {};
  
  data.forEach(row => {
    const idValue = row[id];
    if (!result[idValue]) {
      result[idValue] = {};
    }
    result[idValue][row[variable]] = row[value];
  });
  
  return Object.values(result);
};

export const wideToLong = (data: any[], idColumn: string, valueColumns: string[]): any[] => {
  const result: any[] = [];
  
  data.forEach(row => {
    const idValue = row[idColumn];
    
    valueColumns.forEach(column => {
      result.push({
        [idColumn]: idValue,
        variable: column,
        value: row[column],
      });
    });
  });
  
  return result;
};

// Specific social science transformations
export const calculateCorrelationMatrix = (data: any[], variables: string[]): { 
  variables: string[],
  matrix: number[][]
} => {
  const n = variables.length;
  const matrix = Array(n).fill(0).map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1; // Diagonal is always 1
      } else {
        const xValues = data.map(d => d[variables[i]]);
        const yValues = data.map(d => d[variables[j]]);
        
        // Calculate correlation
        const xMean = d3.mean(xValues) || 0;
        const yMean = d3.mean(yValues) || 0;
        
        let numerator = 0;
        let denominatorX = 0;
        let denominatorY = 0;
        
        for (let k = 0; k < data.length; k++) {
          const xDiff = xValues[k] - xMean;
          const yDiff = yValues[k] - yMean;
          
          numerator += xDiff * yDiff;
          denominatorX += xDiff * xDiff;
          denominatorY += yDiff * yDiff;
        }
        
        const correlation = numerator / Math.sqrt(denominatorX * denominatorY);
        matrix[i][j] = correlation;
      }
    }
  }
  
  return {
    variables,
    matrix
  };
};

export const calculateFrequencies = (data: any[], variable: string): { 
  value: string | number, 
  count: number,
  percentage: number 
}[] => {
  const counts = d3.rollup(
    data,
    v => v.length,
    d => d[variable]
  );
  
  const total = data.length;
  
  return Array.from(counts, ([value, count]) => ({
    value,
    count,
    percentage: (count / total) * 100
  })).sort((a, b) => b.count - a.count);
};

export const createBins = (data: any[], variable: string, binCount: number = 10): {
  binStart: number,
  binEnd: number,
  count: number,
  percentage: number
}[] => {
  const values = data.map(d => d[variable]);
  const extent = d3.extent(values) as [number, number];
  const bins = d3.bin().domain(extent).thresholds(binCount)(values);
  
  const total = data.length;
  
  return bins.map(bin => ({
    binStart: bin.x0 || 0,
    binEnd: bin.x1 || 0,
    count: bin.length,
    percentage: (bin.length / total) * 100
  }));
};

// Missing data handling
export const countMissingValues = (data: any[]): { variable: string, count: number, percentage: number }[] => {
  if (data.length === 0) return [];
  
  const variables = Object.keys(data[0]);
  const results: { variable: string, count: number, percentage: number }[] = [];
  
  for (const variable of variables) {
    const missingCount = data.filter(d => d[variable] === null || d[variable] === undefined || d[variable] === '').length;
    results.push({
      variable,
      count: missingCount,
      percentage: (missingCount / data.length) * 100
    } as { variable: string, count: number, percentage: number });
  }
  
  return results.sort((a, b) => b.count - a.count);
};

export const imputeMissingValues = (data: any[], variable: string, method: 'mean' | 'median' | 'mode' = 'mean'): any[] => {
  // Clone data to avoid mutating original
  const newData = JSON.parse(JSON.stringify(data));
  
  let valueToImpute;
  
  if (method === 'mean') {
    valueToImpute = calculateMean(
      data.filter(d => d[variable] !== null && d[variable] !== undefined && d[variable] !== ''),
      variable
    );
  } else if (method === 'median') {
    valueToImpute = calculateMedian(
      data.filter(d => d[variable] !== null && d[variable] !== undefined && d[variable] !== ''),
      variable
    );
  } else if (method === 'mode') {
    // Find the mode (most common value)
    const frequencies = calculateFrequencies(
      data.filter(d => d[variable] !== null && d[variable] !== undefined && d[variable] !== ''),
      variable
    );
    valueToImpute = frequencies[0]?.value || 0;
  }
  
  // Impute missing values
  newData.forEach((d: any) => {
    if (d[variable] === null || d[variable] === undefined || d[variable] === '') {
      d[variable] = valueToImpute;
    }
  });
  
  return newData;
};