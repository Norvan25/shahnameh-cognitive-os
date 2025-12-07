import { useEffect, useState, useRef } from 'react';
import './VapiOrb.css';

declare global {
  interface Window {
    vapiSDK?: {
      run: (config: any) => any;
    };
    vapiInstance?: any;
  }
}

// =====================================================
// YOUR VAPI CREDENTIALS
// =====================================================
const VAPI_PUBLIC_KEY = '49e26799-5a5d-490a-9805-e4ee9c4a6fea';
const VAPI_ASSISTANT_ID = '19d88bcb-46d6-4eb3-bb2f-5b966e4019ed';
// =====================================================

export function VapiOrb() {
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

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

      /* Style the icon inside */
      #vapi-support-btn svg,
      .vapi-btn svg,
      [data-vapi-btn] svg {
        width: 28px !important;
        height: 28px !important;
        color: white !important;
        fill: white !important;
      }

      #vapi-support-btn img,
      .vapi-btn img,
      [data-vapi-btn] img {
        width: 28px !important;
        height: 28px !important;
        filter: brightness(0) invert(1) !important;
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
          width: 56px !important;
          height: 56px !important;
          bottom: 16px !important;
          right: 16px !important;
        }

        #vapi-support-btn svg,
        .vapi-btn svg,
        #vapi-support-btn img,
        .vapi-btn img {
          width: 24px !important;
          height: 24px !important;
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
          });

          window.vapiInstance.on('call-end', () => {
            setIsActive(false);
            setIsSpeaking(false);
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
        }
      }
    };

    document.body.appendChild(script);

    return () => {
      const styleEl = document.getElementById('vapi-custom-styles');
      if (styleEl) styleEl.remove();
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

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
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      // Draw multiple wave layers
      const time = Date.now() / 1000;
      const baseAmp = isSpeaking ? 12 + volumeLevel * 25 : 6;

      // Background wave (subtle)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(102, 211, 250, 0.3)';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * 0.03 + time * 1.5) * baseAmp * 0.5;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Middle wave
      ctx.beginPath();
      ctx.strokeStyle = isSpeaking ? 'rgba(102, 211, 250, 0.6)' : 'rgba(0, 158, 96, 0.5)';
      ctx.lineWidth = 2;
      for (let x = 0; x < width; x++) {
        const y = height / 2 + 
          Math.sin(x * 0.04 + time * 2.5) * baseAmp * 0.7 +
          Math.sin(x * 0.02 + time * 1.8) * baseAmp * 0.3;
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
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';

      for (let x = 0; x < width; x++) {
        const y = height / 2 + 
          Math.sin(x * 0.05 + time * 3) * baseAmp +
          Math.sin(x * 0.02 + time * 2) * baseAmp * 0.5 +
          Math.sin(x * 0.08 + time * 4) * baseAmp * 0.3;
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
          <div className="vapi-hud-header">
            <div className="vapi-hud-indicator">
              <span className="vapi-hud-dot"></span>
              <span className="vapi-hud-status">
                {isSpeaking ? 'AI Speaking' : 'Listening'}
              </span>
            </div>
            <div className="vapi-hud-icon">
              {isSpeaking ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
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
          </div>
          <div className="vapi-hud-wave">
            <canvas 
              ref={canvasRef} 
              width={220} 
              height={50}
              className="vapi-wave-canvas"
            />
          </div>
        </div>
      )}
    </>
  );
}
