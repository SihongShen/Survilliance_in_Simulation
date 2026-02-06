
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, GazePoint } from './types';
import CalibrationView from './components/CalibrationView';
import DashboardView from './components/DashboardView';
import { useKeyboardTracker } from './hooks/useKeyboardTracker';
import webgazer from 'webgazer';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [currentGaze, setCurrentGaze] = useState<GazePoint | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [useEyeTracking, setUseEyeTracking] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  
  const keyboardMetrics = useKeyboardTracker(isRecording);
  const webgazerStarted = useRef(false);
  const currentGazeRef = useRef<GazePoint | null>(null);

  const initWebGazer = useCallback(async () => {
    if (!useEyeTracking) {
      setAppState('MONITORING');
      return;
    }

    try {
      await webgazer
        .setRegression('ridge')
        .setGazeListener((data: any, elapsedTime: number) => {
          if (data) {
            const gazePoint = {
              x: data.x,
              y: data.y,
              timestamp: elapsedTime
            };
            currentGazeRef.current = gazePoint;
            setCurrentGaze(gazePoint);
          }
        })
        .saveDataAcrossSessions(true)
        .begin();
      
      // We'll manage visibility ourself
      webgazer.showVideoPreview(false)
        .showPredictionPoints(false);
        
      webgazerStarted.current = true;
      // Start calibration after WebGazer is ready
      setAppState('CALIBRATING');
    } catch (err: any) {
      console.error('WebGazer initialization error:', err);
      setCameraError(err.message || "Failed to start eye tracker. Please ensure camera access is granted and try refreshing the page.");
    }
  }, [useEyeTracking]);

  const startMonitoring = () => {
    setAppState('MONITORING');
    setIsRecording(true);
  };

  useEffect(() => {
    // Cleanup WebGazer on unmount
    return () => {
      if (webgazerStarted.current) {
        try {
          webgazer.pause();
          webgazer.end();
        } catch (err) {
          console.warn('WebGazer cleanup error:', err);
        }
      }
    };
  }, []);

  if (cameraError) {
    return (
      <div className="h-screen bg-black flex items-center justify-center p-8">
        <div className="bg-red-900/20 border border-red-500 rounded-xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Hardware Error</h1>
          <p className="text-red-200 mb-6">{cameraError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {appState === 'IDLE' && (
        <div className="h-screen flex flex-col items-center justify-center p-4 text-center">
          <div className="w-24 h-24 mb-8 text-cyan-500 animate-pulse">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tighter">BIOMETRIC SENTINEL</h1>
          <p className="text-slate-400 max-w-lg mb-8 text-lg">
            This prototype system performs high-fidelity capture of human interaction metrics including eye movements and keyboard dynamics.
          </p>
          
          <div className="flex flex-col gap-4 mb-8">
            <button 
              onClick={initWebGazer}
              className="group relative px-12 py-4 bg-white text-black font-black text-xl rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">START WITH EYE TRACKING</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <button 
              onClick={() => {
                setUseEyeTracking(false);
                setAppState('MONITORING');
                setIsRecording(true);
              }}
              className="px-12 py-4 bg-slate-700 text-white font-semibold text-lg rounded-full hover:bg-slate-600 transition-all"
            >
              START KEYBOARD ONLY
            </button>
          </div>
          
          <p className="mt-6 text-xs text-slate-600 uppercase tracking-widest">Camera and Keyboard Access Required</p>
        </div>
      )}

      {appState === 'MONITORING' && (
        <DashboardView 
          keyboard={keyboardMetrics}
          gaze={currentGaze}
          isRecording={isRecording}
          onToggleRecording={() => setIsRecording(!isRecording)}
        />
      )}

      {appState === 'CALIBRATING' && (
        <CalibrationView onComplete={startMonitoring} />
      )}
    </div>
  );
};

export default App;
