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
  const [status, setStatus] = useState('Loading...');

  // Load VAPI SDK using official method
  useEffect(() => {
    // Check if already loaded
    if (window.vapiInstance) {
      setSdkReady(true);
      setStatus('Ready ✓');
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
              hide: true, // Hide default button, we use our own
              position: 'bottom-right',
            },
          });

          // Setup event listeners
          if (window.vapiInstance) {
            window.vapiInstance.on('call-start', () => {
              setStatus('Call Active');
              setIsConnecting(false);
            });

            window.vapiInstance.on('call-end', () => {
              setStatus('Ready ✓');
              setIsConnecting(false);
              setIsSpeaking(false);
              if (isActive) onToggle();
            });

            window.vapiInstance.on('speech-start', () => {
              setIsSpeaking(true);
              setStatus('Speaking...');
            });

            window.vapiInstance.on('speech-end', () => {
              setIsSpeaking(false);
              setStatus('Listening...');
            });

            window.vapiInstance.on('volume-level', (level: number) => {
              setVolumeLevel(level);
            });

            window.vapiInstance.on('error', (error: any) => {
              console.error('VAPI Error:', error);
              setStatus('Error');
              setIsConnecting(false);
            });

            setSdkReady(true);
            setStatus('Ready ✓');
          }
        } catch (err: any) {
          setStatus('Init Error');
          console.error('VAPI init error:', err);
        }
      } else {
        setStatus('SDK Missing');
      }
    };

    script.onerror = () => {
      setStatus('Load Failed');
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
    };
  }, []);

  const handleToggle = async () => {
    if (!window.vapiInstance) {
      alert('VAPI not ready. Status: ' + status);
      return;
    }

    if (isActive) {
      // Stop call
      window.vapiInstance.stop();
      onToggle();
      setStatus('Ready ✓');
    } else {
      // Start call
      setIsConnecting(true);
      setStatus('Connecting...');
      onToggle();

      try {
        await window.vapiInstance.start();
      } catch (error: any) {
        console.error('Start error:', error);
        setStatus('Start Failed');
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

      {/* Status indicator */}
      <div style={{
        position: 'fixed',
        bottom: '96px',
        right: '24px',
        background: 'rgba(0,0,0,0.7)',
        color: status.includes('Error') || status.includes('Failed') ? '#ff6b6b' : '#66D3FA',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontFamily: 'Poppins, sans-serif',
        zIndex: 101,
      }}>
        {status}
      </div>

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
