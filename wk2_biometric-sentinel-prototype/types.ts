
export interface GazePoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface KeyboardMetrics {
  keyCounts: Record<string, number>;
  latencies: number[]; // Time between key presses in ms
  kpm: number; // Keys per minute
  totalKeys: number;
  recentRhythm: number[]; // Sample of last 20 latencies
}

export type AppState = 'IDLE' | 'CALIBRATING' | 'MONITORING';

// WebGazer global type definition
declare global {
  interface Window {
    webgazer: any;
  }
}
