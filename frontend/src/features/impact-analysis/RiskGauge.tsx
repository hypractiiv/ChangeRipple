import React from 'react';
import { RiskBand } from '../../types';
import { getRiskColor } from '../../lib/utils';

interface RiskGaugeProps {
  score: number;
  band: RiskBand;
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, band, size = 110 }) => {
  const radius = size * 0.38;
  const strokeWidth = size * 0.1;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score)) / 100;
  const strokeDashoffset = circumference - progress * circumference;

  const bandColors: Record<RiskBand, string> = {
    CRITICAL: '#C62828',
    HIGH: '#FF8F00',
    MEDIUM: '#FBC02D',
    LOW: '#10B981',
  };

  const color = bandColors[band] || '#FBC02D';

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Central Score Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-extrabold tracking-tight font-mono text-slate-100">
          {score.toFixed(1)}
        </span>
        <span
          className={`text-[9px] font-bold font-mono tracking-widest uppercase px-1.5 py-0.2 rounded ${getRiskColor(
            band
          )}`}
        >
          {band}
        </span>
      </div>
    </div>
  );
};
