
import React, { useState, useEffect, useCallback } from 'react';
import { AppState } from '../types';

interface CalibrationViewProps {
  onComplete: () => void;
}

const CALIBRATION_POINTS = [
  { x: 10, y: 10 }, { x: 50, y: 10 }, { x: 90, y: 10 },
  { x: 10, y: 50 }, { x: 50, y: 50 }, { x: 90, y: 50 },
  { x: 10, y: 90 }, { x: 50, y: 90 }, { x: 90, y: 90 },
];

const CalibrationView: React.FC<CalibrationViewProps> = ({ onComplete }) => {
  const [pointIndex, setPointIndex] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const CLICKS_PER_POINT = 3;

  const currentPoint = CALIBRATION_POINTS[pointIndex];

  const handlePointClick = () => {
    if (clickCount + 1 >= CLICKS_PER_POINT) {
      if (pointIndex + 1 >= CALIBRATION_POINTS.length) {
        onComplete();
      } else {
        setPointIndex(prev => prev + 1);
        setClickCount(0);
      }
    } else {
      setClickCount(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0b] flex items-center justify-center overflow-hidden">
      <div className="absolute top-8 left-0 right-0 text-center">
        <h2 className="text-2xl font-bold text-cyan-400 mb-2">Eye Tracker Calibration</h2>
        <p className="text-slate-400">
          Stare at the red ball and click it <b>{CLICKS_PER_POINT} times</b> at each position.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {CALIBRATION_POINTS.map((_, i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full ${i <= pointIndex ? 'bg-cyan-500' : 'bg-slate-700'}`} 
            />
          ))}
        </div>
      </div>

      <button
        onClick={handlePointClick}
        style={{ 
          left: `${currentPoint.x}%`, 
          top: `${currentPoint.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
        className="absolute w-12 h-12 bg-red-600 rounded-full border-4 border-white shadow-[0_0_20px_rgba(220,38,38,0.8)] transition-all duration-300 hover:scale-110 active:scale-90 flex items-center justify-center"
      >
        <span className="text-white font-bold text-xs">{CLICKS_PER_POINT - clickCount}</span>
      </button>

      <div className="absolute bottom-8 text-slate-500 text-sm italic">
        Calibration helps the system understand your gaze coordinates.
      </div>
    </div>
  );
};

export default CalibrationView;
