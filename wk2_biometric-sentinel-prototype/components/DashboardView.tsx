import React, { useState, useEffect, useMemo } from 'react';
import { KeyboardMetrics, GazePoint } from '../types';

interface DashboardViewProps {
  keyboard: KeyboardMetrics;
  gaze: GazePoint | null;
  isRecording?: boolean;
  onToggleRecording?: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ keyboard, gaze, isRecording = true, onToggleRecording }) => {
  const [gazeHistory, setGazeHistory] = useState<GazePoint[]>([]);
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    if (gaze && gaze.x !== undefined && gaze.y !== undefined) {
      // Keep only last 5 minutes of data (300 samples at ~1 sample per second)
      setGazeHistory(prev => [...prev, gaze].slice(-300));
    }
  }, [gaze?.x, gaze?.y, gaze?.timestamp]);

  const topKeysData = useMemo(() => {
    const counts = keyboard.keyCounts || {};
    return Object.entries(counts)
      .filter(([_, value]) => value != null && !isNaN(Number(value))) // 严格过滤
      .map(([name, value]) => ({ 
        name: String(name), 
        value: Math.max(0, Number(value)) 
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [keyboard.keyCounts]);

  const rhythmData = useMemo(() => {
    const latencies = keyboard.latencies || [];
    return latencies
      .map((l, i) => ({ 
        key: `${i}`,
        value: Math.max(1, Math.round(Number(l) || 1)) // Minimum 1ms to avoid 0 values
      }))
      .filter(item => !isNaN(item.value) && item.value > 0);
  }, [keyboard.latencies]);

  const avgLatency = useMemo(() => {
    const lats = keyboard.latencies || [];
    if (lats.length === 0) return 0;
    const sum = lats.reduce((a, b) => (a as number) + (b as number), 0);
    return Math.round(Number(sum) / lats.length);
  }, [keyboard.latencies]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-slate-200 p-6 flex flex-col gap-6">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            BIOMETRIC SENTINEL
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Real-time Human-Computer Interaction Monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-mono text-cyan-400">GAZE: {gaze ? `${Math.round(gaze.x)}, ${Math.round(gaze.y)}` : 'OFFLINE'}</span>
          </div>
          
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${
            isRecording 
              ? 'bg-red-900/30 border-red-500' 
              : 'bg-slate-900 border-slate-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className={`text-sm font-mono font-bold ${isRecording ? 'text-red-400' : 'text-slate-400'}`}>
              {isRecording ? 'REC' : 'PAUSED'}
            </span>
          </div>
          
          {onToggleRecording && (
            <button
              onClick={onToggleRecording}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                isRecording
                  ? 'bg-amber-600/20 border border-amber-600 text-amber-400 hover:bg-amber-600/30'
                  : 'bg-cyan-600/20 border border-cyan-600 text-cyan-400 hover:bg-cyan-600/30'
              }`}
            >
              {isRecording ? 'PAUSE' : 'RESUME'}
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Typing Area & Metrics */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Input */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Stimulus Input Interface</h3>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Start typing here to generate biometric data..."
              className="w-full h-48 bg-black/40 border border-slate-700 rounded-xl p-4 text-xl font-light focus:outline-none focus:border-cyan-500/50 transition-colors resize-none placeholder:text-slate-700"
            />
            <div className="mt-4 flex gap-8">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white">{keyboard.kpm}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">KPM (Speed)</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white">{keyboard.totalKeys}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Total Strikes</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white">
                  {avgLatency}ms
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Avg Latency</span>
              </div>
            </div>
          </section>

          {/* Typing Rhythm Data Matrix */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 min-h-[300px]">
            <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">Latency Stream (ms)</h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {rhythmData.length > 0 ? (
                [...rhythmData].reverse().slice(0, 32).map((item, i) => (
                  <div 
                    key={i} 
                    className="bg-black/40 border border-slate-800 p-2 rounded flex flex-col items-center justify-center"
                  >
                    <span className={`text-lg font-mono font-bold ${item.value > 200 ? 'text-amber-500' : 'text-cyan-400'}`}>
                      {item.value}
                    </span>
                    <span className="text-[8px] text-slate-600">SEQ_{item.key}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-full h-48 w-full flex items-center justify-center text-slate-700 font-mono italic text-sm">
                  READY_TO_CAPTURE...
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Key Frequency & AI */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Key Frequency */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 min-h-[300px]">
            <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">Key Press Distribution</h3>
            <div className="grid grid-cols-4 gap-3">
              {topKeysData.length > 0 ? (
                topKeysData.map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-black/40 border border-slate-800 p-3 rounded-lg flex flex-col items-center justify-center hover:border-cyan-500/50 transition-colors"
                  >
                    <span className="text-2xl font-mono font-bold text-cyan-400 mb-1">
                      {item.name}
                    </span>
                    <span className="text-sm font-mono text-amber-500 font-bold">
                      ×{item.value}
                    </span>
                    <span className="text-[10px] text-slate-600 mt-1">
                      HITS
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-full h-32 w-full flex items-center justify-center text-slate-700 font-mono italic text-sm">
                  AWAITING_INPUT...
                </div>
              )}
            </div>
          </section>

          {/* Gaze Monitor Mini-Map */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
             <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Gaze Heatmap (Recent)</h3>
             <div className="aspect-video bg-black/60 rounded-lg relative overflow-hidden border border-slate-800">
               {gazeHistory.map((pt, i) => (
                 <div 
                   key={i}
                   className="absolute w-2 h-2 rounded-full bg-cyan-400/30"
                   style={{ 
                     left: `${(pt.x / window.innerWidth) * 100}%`,
                     top: `${(pt.y / window.innerHeight) * 100}%`,
                     transform: 'translate(-50%, -50%)'
                   }}
                 />
               ))}
               {gaze && (
                 <div 
                   className="absolute w-4 h-4 rounded-full border-2 border-cyan-400 bg-white/10 shadow-[0_0_10px_#22d3ee]"
                   style={{ 
                     left: `${(gaze.x / window.innerWidth) * 100}%`,
                     top: `${(gaze.y / window.innerHeight) * 100}%`,
                     transform: 'translate(-50%, -50%)',
                     transition: 'all 0.05s linear'
                   }}
                 />
               )}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
