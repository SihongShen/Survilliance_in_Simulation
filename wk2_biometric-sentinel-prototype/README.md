# Biometric Sentinel - Data Collection Prototype

A real-time monitoring system for capturing human-computer interaction metrics, including keyboard dynamics and eye tracking data. This prototype collects biometric data and displays it in an interactive dashboard. **Collab wiz Gemini**

## Features

- **Keyboard Dynamics Tracking**: Captures typing speed (KPM), keystroke frequency, and inter-key latencies
- **Eye Gaze Tracking**: Records eye movement coordinates with WebGazer.js
- **Real-time Dashboard**: Visualizes collected data
  - Typing Rhythm Dynamics
  - Key Distribution
  - Gaze Heatmap (spatial visualization)
  - Live metrics (KPM, Total Strikes, Average Latency)

## Prerequisites

- Node.js (v18+)
- Modern web browser with camera access (for eye tracking)
- Keyboard access

## Installation & Setup

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
   > Note: `--legacy-peer-deps` is required due to React 19 compatibility with recharts

3. Run the development server:
   ```bash
   npm run dev
   ```
   
   **Or use the quick start script:**
   - **macOS/Linux**: `./start.sh`
   - **Windows**: `start.bat`

4. Open your browser to `http://localhost:3000`

5. Choose a monitoring mode:
   - **START WITH EYE TRACKING**: Full biometric collection (keyboard + eye gaze)
   - **START KEYBOARD ONLY**: Keyboard dynamics only (recommended for testing/development)

## Build for Production

```bash
npm run build
npm run preview
```

## Environment Configuration

The `.env.local` file contains application settings:

```
VITE_WEBGAZER_ENABLED=true
VITE_APP_TITLE=Biometric Sentinel
VITE_APP_DESCRIPTION=Real-time Human-Computer Interaction Monitoring System
```

## Architecture

### Key Components
- **App.tsx**: Main application logic and state management
- **DashboardView.tsx**: Real-time data visualization
- **useKeyboardTracker.ts**: Keyboard metrics collection hook
- **types.ts**: TypeScript interface definitions

### State Flow
1. User clicks "START MONITORING" button
2. App requests camera and keyboard permissions
3. WebGazer begins eye tracking, keyboard listener activates
4. Dashboard displays live metrics

## Data Collection

### Keyboard Metrics
- Individual key counts
- Inter-keystroke latencies (in milliseconds)
- Keys per minute (KPM)
- Total keystrokes

### Eye Tracking Data
- X, Y coordinates
- Timestamps
- Historical gaze points (last 50 samples)

## Technical Stack

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **WebGazer.js**: Eye tracking (via script tag in HTML)
- **Tailwind CSS**: Styling

## Notes

- Eye tracking requires adequate lighting conditions
- Camera calibration is automatic
- All data collection is real-time and local (no backend required)
- Keyboard and camera permissions must be granted in browser

