import { useEffect, useRef, useState } from 'react';
import './VapiOrb.css';

declare global {
  interface Window {
    Vapi?: any;
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
  const vapiRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load VAPI Web SDK (correct one for custom UI)
  useEffect(() => {
    const script = document.createElement('script');
    // Use the WEB SDK, not the HTML widget SDK
    script.src = 'https://unpkg.com/@vapi-ai/web@latest/dist/vapi.umd.js';
    script.async = true;

    script.onload = () => {
      console.log('VAPI script loaded, window.Vapi:', !!window.Vapi);
      
      if (window.Vapi) {
        try {
          // Create instance with public key
          vapiRef.current = new window.Vapi(VAPI_PUBLIC_KEY);
          console.log('VAPI instance created:', !!vapiRef.current);
          
          // Setup listeners
          vapiRef.current.on('call-start', () => {
            console.log('Call started');
            setIsConnecting(false);
            setError(null);
          });

          vapiRef.current.on('call-end', () => {
            console.log('Call ended');
            setIsConnecting(false);
            setIsSpeaking(false);
            if (isActive) onToggle();
          });

          vapiRef.current.on('speech-start', () => {
            setIsSpeaking(true);
          });

          vapiRef.current.on('speech-end', () => {
            setIsSpeaking(false);
          });

          vapiRef.current.on('volume-level', (level: number) => {
            setVolumeLevel(level);
          });

          vapiRef.current.on('error', (err: any) => {
            console.error('VAPI error:', err);
            setError(err?.message || 'Connection error');
            setIsConnecting(false);
          });

          vapiRef.current.on('message', (msg: any) => {
            console.log('VAPI message:', msg);
          });

          setSdkReady(true);
          setError(null);
        } catch (err: any) {
          console.error('Failed to create VAPI instance:', err);
          setError('Failed to initialize');
        }
      } else {
        setError('SDK not found');
      }
    };

    script.onerror = () => {
      setError('Failed to load SDK');
    };

    document.body.appendChild(script);

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handleToggle = async () => {
    console.log('Button clicked, sdkReady:', sdkReady, 'vapiRef:', !!vapiRef.current);
    
    if (!vapiRef.current) {
      setError('SDK not ready');
      return;
    }

    if (isActive) {
      console.log('Stopping call...');
      vapiRef.current.stop();
      onToggle();
    } else {
      console.log('Starting call with assistant:', VAPI_ASSISTANT_ID);
      setIsConnecting(true);
      setError(null);
      onToggle();
      
      try {
        // Start call with assistant ID
        await vapiRef.current.start(VAPI_ASSISTANT_ID);
        console.log('Call start initiated');
      } catch (err: any) {
        console.error('Failed to start:', err);
        setError(err?.message || 'Failed to start');
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

      {/* Status/Error display */}
      {error && (
        <div style={{
          position: 'fixed',
          bottom: '96px',
          right: '24px',
          background: 'rgba(230, 57, 70, 0.9)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'Poppins, sans-serif',
          zIndex: 101,
        }}>
          {error}
        </div>
      )}

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
