interface Props {
  shape: 'hexagon' | 'circle' | 'diamond';
  color: string;
  size?: number;
}

export function NodeIcon({ shape, color, size = 24 }: Props) {
  const half = size / 2;

  if (shape === 'hexagon') {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      points.push(`${half + half * 0.9 * Math.cos(angle)},${half + half * 0.9 * Math.sin(angle)}`);
    }
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <polygon
          points={points.join(' ')}
          fill={`${color}30`}
          stroke={color}
          strokeWidth="2"
        />
        <polygon
          points={points.join(' ')}
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity="0.3"
          transform={`translate(${half}, ${half}) scale(0.7) translate(${-half}, ${-half})`}
        />
      </svg>
    );
  }

  if (shape === 'diamond') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <polygon
          points={`${half},2 ${size - 2},${half} ${half},${size - 2} 2,${half}`}
          fill={`${color}30`}
          stroke={color}
          strokeWidth="2"
        />
        <line
          x1={half}
          y1={half * 0.6}
          x2={half}
          y2={half * 1.4}
          stroke={color}
          strokeWidth="2"
          opacity="0.5"
        />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={half}
        cy={half}
        r={half - 2}
        fill={`${color}30`}
        stroke={color}
        strokeWidth="2"
      />
      <circle
        cx={half}
        cy={half}
        r={half * 0.3}
        fill={color}
        opacity="0.4"
      />
    </svg>
  );
}
