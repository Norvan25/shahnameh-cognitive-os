import { useEffect, useRef, useState } from 'react';
import './VapiOrb.css';

declare global {
  interface Window {
    vapiSDK?: any;
  }
}

interface Props {
  isActive: boolean;
  onToggle: () => void;
}

// =====================================================
// YOUR VAPI CREDENTIALS
// =====================================================
const VAPI_PUBLIC_KEY = '66c0ce2f-9976-4555-9cb0-df2b11c36778';
const VAPI_ASSISTANT_ID = '19d88bcb-46d6-4eb3-bb2f-5b966e4019ed';
// =====================================================

export function VapiOrb({ isActive, onToggle }: Props) {
  const vapiRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  // Load VAPI SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/vapi-web.min.js';
    script.async = true;
    script.onload = () => {
      if (window.vapiSDK) {
        vapiRef.current = new window.vapiSDK(VAPI_PUBLIC_KEY);
        setupVapiListeners();
      }
    };
    document.body.appendChild(script);

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
      document.body.removeChild(script);
    };
  }, []);

  const setupVapiListeners = () => {
    if (!vapiRef.current) return;

    vapiRef.current.on('call-start', () => {
      setIsConnecting(false);
    });

    vapiRef.current.on('call-end', () => {
      setIsConnecting(false);
      setIsSpeaking(false);
      if (isActive) onToggle();
    });

    vapiRef.current.on('speech-start', () => setIsSpeaking(true));
    vapiRef.current.on('speech-end', () => setIsSpeaking(false));
    vapiRef.current.on('volume-level', (level: number) => setVolumeLevel(level));
    vapiRef.current.on('error', () => setIsConnecting(false));
  };

  const handleToggle = async () => {
    if (!vapiRef.current) return;

    if (isActive) {
      vapiRef.current.stop();
      onToggle();
    } else {
      setIsConnecting(true);
      onToggle();
      try {
        await vapiRef.current.start(VAPI_ASSISTANT_ID);
      } catch (error) {
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
        disabled={isConnecting}
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
