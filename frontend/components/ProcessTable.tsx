'use client';

import type { Process } from '@/lib/types';

interface ProcessTableProps {
  processes: Process[];
}

const STATE_CLASS: Record<string, string> = {
  NEW:        'badge--new',
  READY:      'badge--ready',
  RUNNING:    'badge--running',
  WAITING:    'badge--waiting',
  TERMINATED: 'badge--terminated',
};

const PRIORITY_COLOR = (p: number) => {
  if (p <= 2) return 'var(--accent-red)';
  if (p <= 4) return 'var(--accent-amber)';
  if (p <= 7) return 'var(--text-primary)';
  return 'var(--text-muted)';
};

export default function ProcessTable({ processes }: ProcessTableProps) {
  return (
    <div className="os-table-wrap">
      <table className="os-table">
        <thead>
          <tr>
            <th>PID</th>
            <th>Nombre</th>
            <th>Prioridad</th>
            <th>Burst</th>
            <th>Llegada</th>
            <th>Estado</th>
            <th>Páginas</th>
            <th>Archivos</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p, i) => (
            <tr key={p.pid} className="anim" style={{ animationDelay: `${i * 40}ms` }}>
              <td>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-green)',
                  fontWeight: 600,
                }}>
                  P{p.pid}
                </span>
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                {p.name}
              </td>
              <td>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  color: PRIORITY_COLOR(p.priority),
                  fontWeight: p.priority <= 3 ? 700 : 400,
                }}>
                  {p.priority}
                  {p.priority <= 3 && (
                    <span style={{ color: 'var(--accent-red)', marginLeft: 2 }}>↑</span>
                  )}
                </span>
              </td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{p.burst_time}</td>
              <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                {p.arrival_time}
              </td>
              <td>
                <span className={`badge ${STATE_CLASS[p.state] || 'badge--new'}`}>
                  {p.state === 'RUNNING' && <span className="badge__dot" />}
                  {p.state}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 40, height: 4, background: 'var(--border)',
                    borderRadius: 2, overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${(p.pages_needed / 6) * 100}%`,
                      height: '100%',
                      background: 'var(--accent-green)',
                      borderRadius: 2,
                    }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                    {p.pages_needed}
                  </span>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {p.files_accessed.map(f => (
                    <span key={f} style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 3,
                      padding: '2px 6px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      color: 'var(--accent-blue)',
                    }}>
                      {f.replace('archivo_', '').replace('.txt', '')}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
