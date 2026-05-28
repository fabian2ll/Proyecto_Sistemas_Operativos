'use client';

import { useEffect, useRef } from 'react';

interface MetricCardProps {
  value: number | string;
  label: string;
  icon?: string;
  color?: 'green' | 'amber' | 'blue' | 'red';
  unit?: string;
  animateCount?: boolean;
  delay?: number;
}

const COLOR_MAP: Record<string, string> = {
  green: 'var(--accent-green)',
  amber: 'var(--accent-amber)',
  blue:  'var(--accent-blue)',
  red:   'var(--accent-red)',
};

const BORDER_MAP: Record<string, string> = {
  green: 'var(--accent-green)',
  amber: 'var(--accent-amber)',
  blue:  'var(--accent-blue)',
  red:   'var(--accent-red)',
};

export default function MetricCard({
  value,
  label,
  icon,
  color = 'green',
  unit,
  animateCount = true,
  delay = 0,
}: MetricCardProps) {
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!animateCount || typeof value !== 'number' || !numRef.current) return;
    const el = numRef.current;
    const target = value as number;
    const isDecimal = !Number.isInteger(target);
    const duration = 600;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      el.textContent = isDecimal ? current.toFixed(1) : Math.round(current).toString();
      if (progress < 1) requestAnimationFrame(tick);
    };

    const timer = setTimeout(() => requestAnimationFrame(tick), delay);
    return () => clearTimeout(timer);
  }, [value, animateCount, delay]);

  return (
    <div
      className="metric-card anim"
      style={{
        borderTop: `2px solid ${BORDER_MAP[color]}`,
        animationDelay: `${delay}ms`,
      }}
    >
      {icon && (
        <div className="metric-card__icon" aria-hidden>{icon}</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Number */}
        <div className="metric-card__value" style={{ color: COLOR_MAP[color] }}>
          {animateCount && typeof value === 'number' ? (
            <span ref={numRef}>0</span>
          ) : (
            <span>{value}</span>
          )}
        </div>

        {/* Unit */}
        {unit && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            lineHeight: 1,
          }}>
            {unit}
          </div>
        )}

        {/* Label */}
        <div className="metric-card__label">{label}</div>
      </div>
    </div>
  );
}
