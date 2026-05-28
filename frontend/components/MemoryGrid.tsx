'use client';

import { useState, useEffect } from 'react';
import type { MemoryFrame } from '@/lib/types';

interface MemoryGridProps {
  frames: MemoryFrame[];
}

// Same HSL palette as GanttChart
function pidColor(pid: number): string {
  const hue = (150 + ((pid - 1) * 24)) % 360;
  return `hsl(${hue}, 80%, 55%)`;
}

export default function MemoryGrid({ frames }: MemoryGridProps) {
  const [flashedFrames, setFlashedFrames] = useState<Set<number>>(new Set());

  // Trigger flash animation for occupied frames on mount
  useEffect(() => {
    const occupied = frames.filter(f => !f.is_free).map(f => f.frame_id);
    if (occupied.length === 0) return;
    const timer = setTimeout(() => {
      setFlashedFrames(new Set(occupied));
      setTimeout(() => setFlashedFrames(new Set()), 400);
    }, 300);
    return () => clearTimeout(timer);
  }, [frames]);

  // Unique PIDs in use
  const activePids = [...new Set(frames.filter(f => !f.is_free && f.pid !== null).map(f => f.pid!))];

  return (
    <div>
      <div className="memory-grid">
        {frames.map((frame, i) => {
          const isFlashing = flashedFrames.has(frame.frame_id);
          const color = frame.pid !== null ? pidColor(frame.pid) : '';

          if (frame.is_free) {
            return (
              <div
                key={frame.frame_id}
                className="frame-cell frame-cell--free anim"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="frame-cell__id">F{frame.frame_id}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>LIBRE</span>
              </div>
            );
          }

          return (
            <div
              key={frame.frame_id}
              className={`frame-cell frame-cell--occupied anim${isFlashing ? ' frame-cell--flash' : ''}`}
              style={{
                animationDelay: `${i * 40}ms`,
                borderColor: color,
                background: `${color}18`,
                boxShadow: `0 0 12px ${color}30`,
              }}
            >
              <span className="frame-cell__id" style={{ color: 'var(--text-muted)' }}>
                F{frame.frame_id}
              </span>
              <span className="frame-cell__pid" style={{ color }}>
                P{frame.pid}
              </span>
              <span className="frame-cell__page" style={{ color }}>
                pg {frame.page_id}
              </span>
              <span style={{
                fontSize: '0.58rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}>
                t={frame.last_used}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 16,
        paddingTop: 12,
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 12, height: 12, borderRadius: 2,
            border: '1px dashed var(--border)',
            background: 'var(--bg-surface)',
          }} />
          <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Libre ({frames.filter(f => f.is_free).length})
          </span>
        </div>
        {activePids.map(pid => (
          <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 12, height: 12, borderRadius: 2,
              background: pidColor(pid),
              boxShadow: `0 0 6px ${pidColor(pid)}70`,
            }} />
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              P{pid}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
