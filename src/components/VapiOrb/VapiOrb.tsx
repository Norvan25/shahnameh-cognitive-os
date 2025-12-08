import { useEffect, useState, useRef, useCallback } from 'react';
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
  onTranscript?: (text: string, role: 'user' | 'assistant') => void;
}

// =====================================================
// YOUR VAPI CREDENTIALS
// =====================================================
const VAPI_PUBLIC_KEY = '49e26799-5a5d-490a-9805-e4ee9c4a6fea';
const VAPI_ASSISTANT_ID = '19d88bcb-46d6-4eb3-bb2f-5b966e4019ed';
// =====================================================

export function VapiOrb({ onTranscript }: Props) {
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<Array<{role: string, text: string}>>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Request wake lock to keep screen on
  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('Wake lock acquired');
      } catch (err) {
        console.log('Wake lock failed:', err);
      }
    }
  }, []);

  // Release wake lock
  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      console.log('Wake lock released');
    }
  }, []);

  // End call function
  const handleEndCall = useCallback(() => {
    if (window.vapiInstance) {
      window.vapiInstance.stop();
    }
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  useEffect(() => {
    // Add custom styles to override VAPI button appearance
    const style = document.createElement('style');
    style.id = 'vapi-custom-styles';
    style.textContent = `
      /* Override VAPI button styles */
      #vapi-support-btn,
      .vapi-btn,
      [data-vapi-btn] {
        width: 64px !important;
        height: 64px !important;
        border-radius: 50% !important;
        background: linear-gradient(135deg, #66D3FA 0%, #007ACC 100%) !important;
        border: none !important;
        cursor: pointer !important;
        box-shadow: 0 4px 20px rgba(102, 211, 250, 0.4) !important;
        transition: all 0.3s ease !important;
        bottom: 24px !important;
        right: 24px !important;
        position: fixed !important;
        z-index: 100 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      #vapi-support-btn:hover,
      .vapi-btn:hover,
      [data-vapi-btn]:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 6px 30px rgba(102, 211, 250, 0.5) !important;
      }

      /* When call is active - green gradient */
      #vapi-support-btn.vapi-btn-is-active,
      .vapi-btn.vapi-btn-is-active,
      [data-vapi-btn].vapi-btn-is-active,
      #vapi-support-btn[data-active="true"],
      .vapi-btn[data-active="true"] {
        background: linear-gradient(135deg, #009E60 0%, #007ACC 100%) !important;
        box-shadow: 0 4px 20px rgba(0, 158, 96, 0.4) !important;
      }

      /* Hide default icon */
      #vapi-support-btn svg,
      .vapi-btn svg,
      [data-vapi-btn] svg,
      #vapi-support-btn img,
      .vapi-btn img,
      [data-vapi-btn] img {
        display: none !important;
      }

      /* Add custom microphone icon */
      #vapi-support-btn::before,
      .vapi-btn::before,
      [data-vapi-btn]::before {
        content: '';
        width: 28px;
        height: 28px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z'/%3E%3Cpath d='M19 10v2a7 7 0 0 1-14 0v-2'/%3E%3Cline x1='12' y1='19' x2='12' y2='23'/%3E%3Cline x1='8' y1='23' x2='16' y2='23'/%3E%3C/svg%3E");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
      }

      /* Hide any default VAPI branding/text */
      #vapi-support-btn span,
      .vapi-btn span {
        display: none !important;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        #vapi-support-btn,
        .vapi-btn,
        [data-vapi-btn] {
          width: 60px !important;
          height: 60px !important;
          bottom: 20px !important;
          right: 20px !important;
        }

        #vapi-support-btn::before,
        .vapi-btn::before,
        [data-vapi-btn]::before {
          width: 26px;
          height: 26px;
        }
      }
    `;
    document.head.appendChild(style);

    // Load VAPI widget SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js';
    script.defer = true;
    script.async = true;

    script.onload = () => {
      if (window.vapiSDK) {
        window.vapiInstance = window.vapiSDK.run({
          apiKey: VAPI_PUBLIC_KEY,
          assistant: VAPI_ASSISTANT_ID,
          config: {
            position: 'bottom-right',
            offset: '24px',
          },
        });

        // Listen for VAPI events
        if (window.vapiInstance) {
          window.vapiInstance.on('call-start', () => {
            setIsActive(true);
            setCallDuration(0);
            setTranscript([]);
            requestWakeLock();
            
            // Start timer
            timerRef.current = setInterval(() => {
              setCallDuration(prev => prev + 1);
            }, 1000);
          });

          window.vapiInstance.on('call-end', () => {
            setIsActive(false);
            setIsSpeaking(false);
            releaseWakeLock();
            
            // Stop timer
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          });

          window.vapiInstance.on('speech-start', () => {
            setIsSpeaking(true);
          });

          window.vapiInstance.on('speech-end', () => {
            setIsSpeaking(false);
          });

          window.vapiInstance.on('volume-level', (level: number) => {
            setVolumeLevel(level);
          });

          // Listen for transcript messages
          window.vapiInstance.on('message', (message: any) => {
            if (message.type === 'transcript') {
              const role = message.role === 'assistant' ? 'assistant' : 'user';
              const text = message.transcript;
              
              if (message.transcriptType === 'final') {
                setTranscript(prev => [...prev, { role, text }]);
                
                // Send to parent for graph highlighting
                if (onTranscript) {
                  onTranscript(text, role);
                }
              }
            }
          });
        }
      }
    };

    document.body.appendChild(script);

    return () => {
      const styleEl = document.getElementById('vapi-custom-styles');
      if (styleEl) styleEl.remove();
      if (script.parentNode) script.parentNode.removeChild(script);
      if (timerRef.current) clearInterval(timerRef.current);
      releaseWakeLock();
    };
  }, [requestWakeLock, releaseWakeLock, onTranscript]);

  // Waveform animation - more responsive
  useEffect(() => {
    if (!isActive || !canvasRef.current) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
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
      // More responsive to volume
      const baseAmp = isSpeaking ? 8 + volumeLevel * 40 : 4;
      const speed = isSpeaking ? 4 : 2;

      // Background wave (subtle)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(102, 211, 250, 0.2)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * 0.02 + time * 1) * baseAmp * 0.4;
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

      // Main wave (bright)
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
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, isSpeaking, volumeLevel]);

  return (
    <>
      {/* Active Call HUD */}
      {isActive && (
        <div className="vapi-hud">
          {/* Header with status and timer */}
          <div className="vapi-hud-header">
            <div className="vapi-hud-indicator">
              <span className="vapi-hud-dot"></span>
              <span className="vapi-hud-status">
                {isSpeaking ? 'AI Speaking' : 'Listening'}
              </span>
            </div>
            <div className="vapi-hud-timer">
              {formatTime(callDuration)}
            </div>
          </div>

          {/* Waveform */}
          <div className="vapi-hud-wave">
            <canvas 
              ref={canvasRef} 
              width={280} 
              height={50}
              className="vapi-wave-canvas"
            />
          </div>

          {/* Transcript */}
          <div className="vapi-hud-transcript">
            {transcript.length === 0 ? (
              <p className="vapi-transcript-empty">Conversation will appear here...</p>
            ) : (
              transcript.slice(-4).map((item, index) => (
                <div 
                  key={index} 
                  className={`vapi-transcript-item ${item.role}`}
                >
                  <span className="vapi-transcript-role">
                    {item.role === 'assistant' ? '🤖' : '👤'}
                  </span>
                  <span className="vapi-transcript-text">{item.text}</span>
                </div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* End Call Button */}
          <button className="vapi-hud-end-btn" onClick={handleEndCall}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              <line x1="1" y1="1" x2="23" y2="23" stroke="#E63946" strokeWidth="2.5" />
            </svg>
            <span>End Call</span>
          </button>
        </div>
      )}
    </>
  );
}
