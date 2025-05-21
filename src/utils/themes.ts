export interface SliceTheme {
    colors: string[];
    backgroundColor: string;
    fontFamily: string;
    fontSize: {
      title: string;
      axisLabel: string;
      tickLabel: string;
      annotation: string;
    };
    gridColor: string;
    axisColor: string;
    pointSize: number;
    lineColor: string;
    marginDefault: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  }
  
  export const defaultTheme: SliceTheme = {
    colors: [
      '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f',
      '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'
    ],
    backgroundColor: 'transparent',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: {
      title: '16px',
      axisLabel: '14px',
      tickLabel: '12px',
      annotation: '12px',
    },
    gridColor: '#e0e0e0',
    axisColor: '#888',
    pointSize: 5,
    lineColor: '#f28e2c',
    marginDefault: {
      top: 20,
      right: 30,
      bottom: 50,
      left: 60
    }
  };
  
  export const socialScienceTheme: SliceTheme = {
    colors: [
      '#377eb8', '#ff7f00', '#4daf4a', '#e41a1c', '#984ea3',
      '#a65628', '#f781bf', '#999999', '#66c2a5', '#fc8d62'
    ],
    backgroundColor: 'transparent',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: {
      title: '18px',
      axisLabel: '14px',
      tickLabel: '12px',
      annotation: '12px',
    },
    gridColor: '#e0e0e0',
    axisColor: '#888',
    pointSize: 6,
    lineColor: '#e41a1c',
    marginDefault: {
      top: 30,
      right: 40,
      bottom: 60,
      left: 70
    }
  };
  
  export const accessibleTheme: SliceTheme = {
    colors: [
      '#648FFF', '#785EF0', '#DC267F', '#FE6100', '#FFB000',
      '#009E73', '#56B4E9', '#0072B2', '#D55E00', '#CC79A7'
    ],
    backgroundColor: 'transparent',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: {
      title: '18px',
      axisLabel: '16px',
      tickLabel: '14px',
      annotation: '14px',
    },
    gridColor: '#e0e0e0',
    axisColor: '#555',
    pointSize: 8,
    lineColor: '#FE6100',
    marginDefault: {
      top: 30,
      right: 40,
      bottom: 70,
      left: 80
    }
  };