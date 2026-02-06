
import { useState, useEffect, useRef, useCallback } from 'react';
import { KeyboardMetrics } from '../types';

export const useKeyboardTracker = (isActive: boolean) => {
  const [metrics, setMetrics] = useState<KeyboardMetrics>({
    keyCounts: {},
    latencies: [],
    kpm: 0,
    totalKeys: 0,
    recentRhythm: []
  });

  const lastKeyTimeRef = useRef<number | null>(null);
  const pressHistoryRef = useRef<number[]>([]);
  const isActiveRef = useRef(isActive);
  const handleKeyDownRef = useRef<((e: KeyboardEvent) => void) | null>(null);

  // Keep ref in sync with prop
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Setup keyboard listener only once
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActiveRef.current) return;

      const now = performance.now();
      
      setMetrics(prev => {
        const newKeyCounts = { ...prev.keyCounts };
        newKeyCounts[e.key] = (newKeyCounts[e.key] || 0) + 1;

        let latency = 0;
        if (lastKeyTimeRef.current !== null) {
          latency = now - lastKeyTimeRef.current;
        }

        // Keep last 300 latencies (5 min worth at ~1 keystroke/second)
        const newLatencies = [...prev.latencies, latency].slice(-300);
        const newRhythm = [...prev.recentRhythm, latency].slice(-20);

        return {
          ...prev,
          keyCounts: newKeyCounts,
          latencies: newLatencies,
          totalKeys: prev.totalKeys + 1,
          recentRhythm: newRhythm
        };
      });

      pressHistoryRef.current.push(now);
      lastKeyTimeRef.current = now;
    };

    handleKeyDownRef.current = handleKeyDown;
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      if (handleKeyDownRef.current) {
        window.removeEventListener('keydown', handleKeyDownRef.current);
      }
    };
  }, []);

  // KPM Calculation every second
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const now = performance.now();
      const oneMinuteAgo = now - 60000;
      // Filter keys pressed in the last minute
      pressHistoryRef.current = pressHistoryRef.current.filter(t => t > oneMinuteAgo);
      setMetrics(prev => ({ ...prev, kpm: pressHistoryRef.current.length }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  return metrics;
};
