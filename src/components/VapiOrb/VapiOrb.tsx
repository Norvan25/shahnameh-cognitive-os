import { useEffect, useRef } from 'react';
import './VapiOrb.css';

interface Props {
  isActive: boolean;
  onToggle: () => void;
}

export function VapiOrb({ isActive, onToggle }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const drawWaveform = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.strokeStyle = '#66D3FA';
      ctx.lineWidth = 2;

      const time = Date.now() / 1000;
      
      for (let x = 0; x < width; x++) {
        const y = height / 2 + 
          Math.sin(x * 0.05 + time * 3) * 15 +
          Math.sin(x * 0.02 + time * 2) * 10 +
          Math.sin(x * 0.08 + time * 4) * 5;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      animationRef.current = requestAnimationFrame(drawWaveform);
    };

    drawWaveform();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return (
    <>
      <button 
        className={`vapi-orb ${isActive ? 'active' : ''}`}
        onClick={onToggle}
        aria-label="Toggle voice assistant"
      >
        <div className="orb-inner">
          {isActive ? (
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
        {isActive && (
          <div className="pulse-ring" />
        )}
      </button>

      {isActive && (
        <div className="waveform-container">
          <canvas 
            ref={canvasRef} 
            width={400} 
            height={60}
            className="waveform-canvas"
          />
          <p className="listening-text">Listening... Ask about any character or concept</p>
        </div>
      )}
    </>
  );
}
