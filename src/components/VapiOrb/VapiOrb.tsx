import { useEffect, useRef, useState } from 'react';
import './VapiOrb.css';

declare global {
  interface Window {
    vapiSDK?: {
      run: (config: any) => any;
    };
    vapiInstance?: any;
  }
}

interface Props {
  isActive: boolean;
  onToggle: () => void;
}

// =====================================================
// YOUR VAPI CREDENTIALS
// =====================================================
const VAPI_PUBLIC_KEY = '49e26799-5a5d-490a-9805-e4ee9c4a6fea';
const VAPI_ASSISTANT_ID = '19d88bcb-46d6-4eb3-bb2f-5b966e4019ed';
// =====================================================

export function VapiOrb({ isActive, onToggle }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [sdkReady, setSdkReady] = useState(false);

  // Load VAPI SDK and hide default button
  useEffect(() => {
    // Add CSS to hide default VAPI button
    const style = document.createElement('style');
    style.textContent = `
      #vapi-support-btn,
      [id^="vapi"],
      .vapi-btn,
      iframe[src*="vapi"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        position: absolute !important;
        left: -9999px !important;
      }
    `;
    document.head.appendChild(style);

    // Check if already loaded
    if (window.vapiInstance) {
      setSdkReady(true);
      setupListeners(window.vapiInstance);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js';
    script.defer = true;
    script.async = true;

    script.onload = () => {
      if (window.vapiSDK) {
        try {
          window.vapiInstance = window.vapiSDK.run({
            apiKey: VAPI_PUBLIC_KEY,
            assistant: VAPI_ASSISTANT_ID,
            config: {
              hide: true,
              position: 'bottom-left', // Move away from our button
            },
          });

          if (window.vapiInstance) {
            setupListeners(window.vapiInstance);
            setSdkReady(true);
          }
        } catch (err) {
          console.error('VAPI init error:', err);
        }
      }
    };

    document.body.appendChild(script);

    return () => {
      style.remove();
    };
  }, []);

  const setupListeners = (vapi: any) => {
    vapi.on('call-start', () => {
      setIsConnecting(false);
      // Sync our state with VAPI
      if (!isActive) onToggle();
    });

    vapi.on('call-end', () => {
      setIsConnecting(false);
      setIsSpeaking(false);
      // Sync our state with VAPI
      if (isActive) onToggle();
    });

    vapi.on('speech-start', () => {
      setIsSpeaking(true);
    });

    vapi.on('speech-end', () => {
      setIsSpeaking(false);
    });

    vapi.on('volume-level', (level: number) => {
      setVolumeLevel(level);
    });

    vapi.on('error', (error: any) => {
      console.error('VAPI Error:', error);
      setIsConnecting(false);
    });
  };

  const handleToggle = async () => {
    if (!window.vapiInstance) {
      console.error('VAPI not ready');
      return;
    }

    if (isActive) {
      window.vapiInstance.stop();
      onToggle();
    } else {
      setIsConnecting(true);
      onToggle();
      
      try {
        await window.vapiInstance.start();
      } catch (error) {
        console.error('Start error:', error);
        setIsConnecting(false);
        onToggle();
      }
    }
  };

  // Waveform animation
  useEffect(() => {
    if (!isActive || !canvasRef.current) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = isSpeaking ? '#66D3FA' : '#009E60';
      ctx.lineWidth = 2;

      const time = Date.now() / 1000;
      const amp = isSpeaking ? 15 + volumeLevel * 30 : 8;

      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 +
          Math.sin(x * 0.05 + time * 3) * amp +
          Math.sin(x * 0.02 + time * 2) * amp * 0.6;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }

      ctx.stroke();
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isActive, isSpeaking, volumeLevel]);

  return (
    <>
      <button
        className={`vapi-orb ${isActive ? 'active' : ''} ${isConnecting ? 'connecting' : ''} ${isSpeaking ? 'speaking' : ''}`}
        onClick={handleToggle}
        aria-label="Toggle voice assistant"
        disabled={isConnecting || !sdkReady}
        style={{ opacity: sdkReady ? 1 : 0.5 }}
      >
        <div className="orb-inner">
          {isConnecting ? (
            <div className="connecting-spinner" />
          ) : isActive ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </div>
        {isActive && !isConnecting && (
          <div className={`pulse-ring ${isSpeaking ? 'speaking' : ''}`} />
        )}
      </button>

      {isActive && (
        <div className="waveform-container">
          <canvas ref={canvasRef} width={400} height={60} className="waveform-canvas" />
          <p className="listening-text">
            {isConnecting ? 'Connecting...' : isSpeaking ? 'Speaking...' : 'Listening...'}
          </p>
        </div>
      )}
    </>
  );
}
