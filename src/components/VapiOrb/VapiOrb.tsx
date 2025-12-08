import { useEffect, useState, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import './VapiOrb.css';

interface Props {
  onTranscript?: (text: string, role: 'user' | 'assistant') => void;
}

// =====================================================
// YOUR VAPI CREDENTIALS
// =====================================================
const VAPI_PUBLIC_KEY = '49e26799-5a5d-490a-9805-e4ee9c4a6fea';
const VAPI_ASSISTANT_ID = '19d88bcb-46d6-4eb3-bb2f-5b966e4019ed';
// =====================================================

export function VapiOrb({ onTranscript }: Props) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<Array<{role: string, text: string}>>([]);
  
  const vapiRef = useRef<Vapi | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakeLockRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Format call duration as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Screen wake lock for mobile
  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('Screen wake lock acquired');
      } catch (err) {
        console.log('Wake lock request failed:', err);
      }
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      console.log('Screen wake lock released');
    }
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  // Initialize VAPI SDK
  useEffect(() => {
    // Create VAPI instance
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    // Event: Call started
    vapi.on('call-start', () => {
      console.log('VAPI: Call started');
      setIsConnecting(false);
      setIsConnected(true);
      setCallDuration(0);
      setTranscript([]);
      requestWakeLock();
      
      // Start timer
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    });

    // Event: Call ended
    vapi.on('call-end', () => {
      console.log('VAPI: Call ended');
      setIsConnected(false);
      setIsConnecting(false);
      setIsSpeaking(false);
      releaseWakeLock();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    });

    // Event: AI started speaking
    vapi.on('speech-start', () => {
      setIsSpeaking(true);
    });

    // Event: AI stopped speaking
    vapi.on('speech-end', () => {
      setIsSpeaking(false);
    });

    // Event: Volume level (for waveform)
    vapi.on('volume-level', (level: number) => {
      setVolumeLevel(level);
    });

    // Event: Error
    vapi.on('error', (error: any) => {
      console.error('VAPI Error:', error);
      setIsConnecting(false);
      setIsConnected(false);
    });

    // Event: Messages (transcripts)
    vapi.on('message', (message: any) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const role = message.role === 'assistant' ? 'assistant' : 'user';
        const text = message.transcript;
        
        console.log(`Transcript [${role}]: ${text}`);
        setTranscript(prev => [...prev, { role, text }]);
        
        // Callback for graph highlighting
        if (onTranscript) {
          onTranscript(text, role);
        }
      }
    });

    // Cleanup on unmount
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      releaseWakeLock();
    };
  }, [requestWakeLock, releaseWakeLock, onTranscript]);

  // Toggle call on/off
  const handleCallToggle = useCallback(() => {
    if (!vapiRef.current) return;

    if (isConnected) {
      // End call
      vapiRef.current.stop();
    } else if (!isConnecting) {
      // Start call
      setIsConnecting(true);
      vapiRef.current.start(VAPI_ASSISTANT_ID);
    }
  }, [isConnected, isConnecting]);

  // Waveform animation
  useEffect(() => {
    if (!isConnected || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      const time = Date.now() / 1000;
      const baseAmp = isSpeaking ? 8 + volumeLevel * 40 : 4;
      const speed = isSpeaking ? 4 : 2;

      // Background wave
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(102, 211, 250, 0.2)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * 0.02 + time) * baseAmp * 0.4;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Middle wave
      ctx.beginPath();
      ctx.strokeStyle = isSpeaking ? 'rgba(102, 211, 250, 0.5)' : 'rgba(0, 158, 96, 0.4)';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < width; x++) {
        const y = height / 2 + 
          Math.sin(x * 0.03 + time * speed * 0.8) * baseAmp * 0.6 +
          Math.sin(x * 0.05 + time * speed * 0.5) * baseAmp * 0.3;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Main wave with gradient
      ctx.beginPath();
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      if (isSpeaking) {
        gradient.addColorStop(0, '#66D3FA');
        gradient.addColorStop(0.5, '#00D9FF');
        gradient.addColorStop(1, '#66D3FA');
      } else {
        gradient.addColorStop(0, '#009E60');
        gradient.addColorStop(0.5, '#00D9FF');
        gradient.addColorStop(1, '#009E60');
      }
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      for (let x = 0; x < width; x++) {
        const y = height / 2 + 
          Math.sin(x * 0.04 + time * speed) * baseAmp +
          Math.sin(x * 0.02 + time * speed * 0.7) * baseAmp * 0.5 +
          Math.sin(x * 0.06 + time * speed * 1.3) * baseAmp * 0.25;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isConnected, isSpeaking, volumeLevel]);

  // Determine button state
  const getButtonState = () => {
    if (isConnecting) return 'connecting';
    if (isConnected) return 'active';
    return 'idle';
  };

  const buttonState = getButtonState();

  return (
    <>
      {/* ==================== CALL BUTTON ==================== */}
      <button 
        className={`vapi-call-btn vapi-call-btn--${buttonState}`}
        onClick={handleCallToggle}
        disabled={isConnecting}
        aria-label={isConnected ? 'End call' : 'Start call'}
      >
        {/* Outer glow ring */}
        <span className="vapi-call-btn__glow"></span>
        
        {/* Inner glow ring */}
        <span className="vapi-call-btn__inner-glow"></span>
        
        {/* Icon container */}
        <span className="vapi-call-btn__icon">
          {isConnecting ? (
            // Connecting spinner
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          ) : isConnected ? (
            // End call icon (phone with X)
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            // Microphone icon
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </span>
      </button>

      {/* ==================== ACTIVE CALL HUD ==================== */}
      {isConnected && (
        <div className="vapi-hud">
          {/* Header */}
          <div className="vapi-hud__header">
            <div className="vapi-hud__status">
              <span className="vapi-hud__dot"></span>
              <span className="vapi-hud__label">
                {isSpeaking ? 'AI Speaking' : 'Listening'}
              </span>
            </div>
            <div className="vapi-hud__timer">
              {formatTime(callDuration)}
            </div>
          </div>

          {/* Waveform */}
          <div className="vapi-hud__wave">
            <canvas 
              ref={canvasRef} 
              width={280} 
              height={50}
              className="vapi-hud__canvas"
            />
          </div>

          {/* Transcript */}
          <div className="vapi-hud__transcript">
            {transcript.length === 0 ? (
              <p className="vapi-hud__empty">Conversation will appear here...</p>
            ) : (
              transcript.slice(-4).map((item, index) => (
                <div key={index} className={`vapi-hud__message vapi-hud__message--${item.role}`}>
                  <span className="vapi-hud__message-icon">
                    {item.role === 'assistant' ? '🤖' : '👤'}
                  </span>
                  <span className="vapi-hud__message-text">{item.text}</span>
                </div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* End Call Button */}
          <button className="vapi-hud__end-btn" onClick={handleCallToggle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <span>End Call</span>
          </button>
        </div>
      )}
    </>
  );
}
