'use client';

import { useState } from 'react';
import type { GanttEntry } from '@/lib/types';

interface GanttChartProps {
  gantt: GanttEntry[];
  algorithm?: string;
  quantum?: number;
}

const NEUTRAL_PALETTE = [
  '#cbd5e1',
  '#b8c3d0',
  '#a4b3c4',
  '#90a2b6',
  '#7c92a8',
  '#6a839a',
];

// Genera una paleta neutral y desaturada para que el Gantt combine con la UI
function generatePalette(n: number): string[] {
  const palette: string[] = [];
  for (let i = 0; i < n; i++) {
    palette.push(NEUTRAL_PALETTE[i % NEUTRAL_PALETTE.length]);
  }
  return palette;
}

const TICK_INTERVAL = 5; // Marcas del eje cada 5 unidades

export default function GanttChart({ gantt, algorithm = 'RR', quantum = 3 }: GanttChartProps) {
  const [tooltip, setTooltip] = useState<{
    entry: GanttEntry; x: number; y: number;
  } | null>(null);

  if (!gantt || gantt.length === 0) return (
    <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
      Sin datos de Gantt
    </div>
  );

  const totalTime = Math.max(...gantt.map(e => e.end));
  const uniquePids = [...new Set(gantt.map(e => e.pid))];
  const palette = generatePalette(uniquePids.length);
  const colorMap: Record<number, string> = {};
  uniquePids.forEach((pid, i) => { colorMap[pid] = palette[i]; });

  const timeMarks: number[] = [];
  for (let t = 0; t <= totalTime; t += TICK_INTERVAL) timeMarks.push(t);
  if (!timeMarks.includes(totalTime)) timeMarks.push(totalTime);

  // Pixel resolution: 1 unit = 20px min, but scale to fit if large
  const PX_PER_UNIT = Math.max(14, Math.min(28, 800 / totalTime));

  return (
    <div>
      {/* Subtitle */}
      <div className="mono-label" style={{ marginBottom: 16 }}>
        Algoritmo: <span style={{ color: 'var(--accent-green)' }}>{algorithm}</span>
        {algorithm === 'RR' && (
          <span style={{ marginLeft: 12 }}>
            | Quantum: <span style={{ color: 'var(--accent-green)' }}>{quantum}</span>
          </span>
        )}
        <span style={{ marginLeft: 12 }}>
          | Duración total: <span style={{ color: 'var(--accent-green)' }}>{totalTime}</span> u.t.
        </span>
        <span style={{ marginLeft: 12 }}>
          | Cambios de contexto: <span style={{ color: 'var(--accent-amber)' }}>{gantt.length - 1}</span>
        </span>
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        {uniquePids.map(pid => {
          const entry = gantt.find(e => e.pid === pid);
          return (
            <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 12, height: 12, borderRadius: 3,
                background: colorMap[pid],
                  boxShadow: `0 0 6px ${colorMap[pid]}40`,
              }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                P{pid} {entry ? `(${entry.name})` : ''}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="gantt-wrap" style={{ position: 'relative' }}>
        {/* Vertical grid lines */}
        <div style={{
          position: 'relative',
          width: totalTime * PX_PER_UNIT,
          minWidth: '100%',
        }}>
          {/* Background grid */}
          <div className="gantt-grid" style={{ width: totalTime * PX_PER_UNIT, position: 'relative', height: 40 }}>
            {timeMarks.map(t => (
              <div
                key={t}
                className="gantt-vline"
                style={{ left: t * PX_PER_UNIT }}
              />
            ))}

            {/* Bars */}
            {gantt.map((entry, i) => {
              const left = entry.start * PX_PER_UNIT;
              const width = (entry.end - entry.start) * PX_PER_UNIT;
              const duration = entry.end - entry.start;
              const color = colorMap[entry.pid];

              return (
                <div
                  key={i}
                  className="gantt-bar"
                  style={{
                    left,
                    width,
                    background: color,
                    boxShadow: `0 0 8px ${color}35`,
                    animationDelay: `${i * 40}ms`,
                    animationDuration: `${300 + i * 30}ms`,
                  }}
                  onMouseEnter={e => setTooltip({
                    entry,
                    x: e.clientX,
                    y: e.clientY,
                  })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {width > 28 && (
                    <span className="gantt-bar__label">
                      P{entry.pid}{width > 60 ? ` ${entry.name}` : ''}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time axis */}
          <div className="gantt-axis" style={{ width: totalTime * PX_PER_UNIT, position: 'relative', height: 20, marginTop: 4 }}>
            {timeMarks.map(t => (
              <div
                key={t}
                className="gantt-tick"
                style={{ left: t * PX_PER_UNIT }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="os-tooltip"
          style={{ top: tooltip.y - 8, left: tooltip.x }}
        >
          <div style={{ color: colorMap[tooltip.entry.pid], fontWeight: 600, marginBottom: 6 }}>
            P{tooltip.entry.pid} — {tooltip.entry.name}
          </div>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <span style={{ color: 'var(--text-muted)' }}>Inicio: </span>
            <span style={{ color: 'var(--accent-green)' }}>{tooltip.entry.start}</span>
            {'  '}
            <span style={{ color: 'var(--text-muted)' }}>Fin: </span>
            <span style={{ color: 'var(--accent-green)' }}>{tooltip.entry.end}</span>
            {'  '}
            <span style={{ color: 'var(--text-muted)' }}>Dur: </span>
            <span style={{ color: 'var(--accent-amber)' }}>{tooltip.entry.end - tooltip.entry.start}</span>
          </div>
        </div>
      )}
    </div>
  );
}
