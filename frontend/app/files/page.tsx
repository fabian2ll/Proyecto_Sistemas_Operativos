'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSimulation } from '@/lib/simulationContext';
import MetricCard from '@/components/MetricCard';
import FileLogTable from '@/components/FileLogTable';

function Skeleton({ w, h }: { w?: number | string; h: number }) {
  return <div className="skeleton" style={{ width: w ?? '100%', height: h, borderRadius: 6 }} />;
}

export default function FilesPage() {
  const { state } = useSimulation();
  const { fileLog, isLoading, status } = state;
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (status === 'running') setShowSkeleton(true);
    else {
      const t = setTimeout(() => setShowSkeleton(false), 400);
      return () => clearTimeout(t);
    }
  }, [status]);

  const loading = isLoading || showSkeleton;

  const maxWait = useMemo(() => {
    if (!fileLog) return 0;
    return Math.max(...fileLog.access_log.map(e => e.wait_duration_ms), 0);
  }, [fileLog]);

  return (
    <div className="content-area">
      <div className="page-header anim">
        <div className="page-breadcrumb">
          <span>OS SIM</span><span>›</span><span>Archivos</span>
        </div>
        <h1 className="page-title">ACCESO CONCURRENTE A ARCHIVOS</h1>
        <div className="mono-label" style={{ marginTop: 6 }}>
          Simulación con{' '}
          <span style={{ color: 'var(--accent-green)' }}>threading.Lock</span>
          {' '}— exclusión mutua real de Python
        </div>
      </div>

      {/* Metric row */}
      {(loading || fileLog) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="metric-card">
                <Skeleton h={44} w={80} /><Skeleton h={12} w={130} style={{ marginTop: 8 }} />
              </div>
            ))
          ) : fileLog && (
            <>
              <MetricCard
                value={fileLog.total_accesses}
                label="Accesos Totales"
                icon="⊞"
                color="green"
                delay={0}
              />
              <MetricCard
                value={fileLog.conflict_count}
                label="Conflictos Detectados"
                icon="●"
                color={fileLog.conflict_count > 0 ? 'red' : 'green'}
                delay={60}
              />
              <MetricCard
                value={maxWait}
                label="Espera Máxima"
                icon="⏱"
                color={maxWait > 150 ? 'red' : 'amber'}
                unit="ms"
                delay={120}
              />
              <MetricCard
                value={5}
                label="Archivos Simulados"
                icon="📄"
                color="blue"
                animateCount={false}
                delay={180}
              />
            </>
          )}
        </div>
      )}

      {/* Conflict alert */}
      {fileLog && !loading && fileLog.conflict_count > 0 && (
        <div className="anim anim-d1" style={{
          background: '#0ea5e910',
          border: '1px solid #0ea5e930',
          borderLeft: '3px solid var(--accent-red)',
          borderRadius: 8,
          padding: '14px 20px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}>
          <span style={{ fontSize: '1.2rem' }}>⚠</span>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--accent-red)', fontSize: '0.9rem', marginBottom: 4 }}>
              {fileLog.conflict_count} conflicto{fileLog.conflict_count !== 1 ? 's' : ''} de acceso detectado{fileLog.conflict_count !== 1 ? 's' : ''}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Los procesos marcados como{' '}
              <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>WAITING</span>
              {' '}tuvieron que esperar porque otro proceso tenía el archivo bloqueado.
              El sistema de locks garantizó exclusión mutua sin deadlocks.
            </div>
          </div>
        </div>
      )}

      {/* File stats */}
      {fileLog && !loading && (
        <div className="os-card anim anim-d2" style={{ marginBottom: 24 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
            <div className="section-title" style={{ fontSize: '0.9rem' }}>ESTADÍSTICAS POR ARCHIVO</div>
          </div>
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {Object.values(fileLog.file_stats).map((stat, i) => (
              <div key={stat.name} className="anim" style={{
                animationDelay: `${i * 50}ms`,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '14px 12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>📄</div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  color: 'var(--accent-blue)',
                  fontWeight: 600,
                  marginBottom: 8,
                  wordBreak: 'break-all',
                }}>
                  {stat.name}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { label: 'Accesos', val: stat.access_count, color: 'var(--accent-green)' },
                    { label: 'Conflictos', val: stat.conflict_count, color: stat.conflict_count > 0 ? 'var(--accent-red)' : 'var(--text-muted)' },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {label}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color }}>
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log table */}
      <div className="os-card os-card--blue anim anim-d3">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div className="section-title">LOG DE ACCESO CONCURRENTE</div>
        </div>
        <div style={{ padding: 24 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Skeleton h={32} />
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} h={40} />
              ))}
            </div>
          ) : fileLog ? (
            <FileLogTable log={fileLog.access_log} />
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12, opacity: 0.2 }}>⊞</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.08em' }}>
                SIN LOG DE ARCHIVOS
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginTop: 8 }}>
                Ejecuta una simulación para ver el registro de accesos
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
