'use client';

import { useState, useMemo } from 'react';
import type { FileLogEntry } from '@/lib/types';

interface FileLogTableProps {
  log: FileLogEntry[];
}

type Filter = 'all' | 'OK' | 'WAITING';

const FILES = ['archivo_A.txt', 'archivo_B.txt', 'archivo_C.txt', 'archivo_D.txt', 'archivo_E.txt'];

function waitClass(ms: number): string {
  if (ms === 0) return 'wait--none';
  if (ms < 100) return 'wait--medium';
  return 'wait--high';
}

export default function FileLogTable({ log }: FileLogTableProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [fileFilter, setFileFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return log.filter(entry => {
      const statusOk = filter === 'all' || entry.status === filter;
      const fileOk = fileFilter === 'all' || entry.file_name === fileFilter;
      return statusOk && fileOk;
    });
  }, [log, filter, fileFilter]);

  return (
    <div>
      {/* Filter controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {/* Status filter tabs */}
        <div className="filter-tabs">
          {(['all', 'OK', 'WAITING'] as Filter[]).map(f => (
            <button
              key={f}
              className={`filter-tab${filter === f ? ' filter-tab--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Todos' : f}
              {f !== 'all' && (
                <span style={{
                  marginLeft: 5,
                  fontSize: '0.68rem',
                  opacity: 0.8,
                }}>
                  ({log.filter(e => e.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* File filter dropdown */}
        <select
          className="os-select"
          value={fileFilter}
          onChange={e => setFileFilter(e.target.value)}
        >
          <option value="all">Todos los archivos</option>
          {FILES.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <span style={{
          marginLeft: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
        }}>
          {filtered.length} / {log.length} entradas
        </span>
      </div>

      {/* Table */}
      <div className="log-table-wrap">
        <table className="os-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>PID</th>
              <th>Proceso</th>
              <th>Archivo</th>
              <th>Acción</th>
              <th>Estado</th>
              <th>Espera (ms)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{
                  textAlign: 'center',
                  padding: '28px',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  — Sin entradas —
                </td>
              </tr>
            ) : (
              filtered.map((entry, i) => (
                <tr
                  key={entry.id}
                  className={`anim${entry.status === 'WAITING' ? ' row--waiting' : ''}`}
                  style={{ animationDelay: `${i * 25}ms` }}
                >
                  <td style={{ color: 'var(--text-muted)' }}>{entry.timestamp}</td>
                  <td>
                    <span style={{
                      fontWeight: 600,
                      color: 'var(--accent-green)',
                    }}>
                      P{entry.pid}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{entry.process_name}</td>
                  <td>
                    <span style={{ color: 'var(--accent-blue)' }}>
                      📄 {entry.file_name}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 3,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      background: entry.action === 'READ' ? '#0f52ba15' : '#64748b15',
                      color: entry.action === 'READ' ? 'var(--accent-blue)' : 'var(--accent-amber)',
                      border: `1px solid ${entry.action === 'READ' ? '#0f52ba30' : '#64748b30'}`,
                    }}>
                      {entry.action === 'READ' ? '↓ READ' : '↑ WRITE'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${entry.status === 'OK' ? 'badge--ready' : 'badge--waiting'}`}>
                      {entry.status === 'OK' ? (
                        <>✓ OK</>
                      ) : (
                        <><span className="badge__dot" /> WAITING</>
                      )}
                    </span>
                  </td>
                  <td>
                    <span className={`${waitClass(entry.wait_duration_ms)}`}>
                      {entry.wait_duration_ms > 0
                        ? `${entry.wait_duration_ms.toFixed(1)} ms`
                        : '—'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
