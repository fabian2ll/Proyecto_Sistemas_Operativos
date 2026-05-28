'use client';

import { useEffect, useState } from 'react';
import { useSimulation } from '@/lib/simulationContext';
import MetricCard from '@/components/MetricCard';
import MemoryGrid from '@/components/MemoryGrid';

function Skeleton({ w, h }: { w?: number | string; h: number }) {
  return <div className="skeleton" style={{ width: w ?? '100%', height: h, borderRadius: 6 }} />;
}

export default function MemoryPage() {
  const { state } = useSimulation();
  const { memory, isLoading, status } = state;
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (status === 'running') setShowSkeleton(true);
    else {
      const t = setTimeout(() => setShowSkeleton(false), 400);
      return () => clearTimeout(t);
    }
  }, [status]);

  const loading = isLoading || showSkeleton;
  const usagePct = memory ? Math.round((memory.used_frames / memory.total_frames) * 100) : 0;

  return (
    <div className="content-area">
      <div className="page-header anim">
        <div className="page-breadcrumb">
          <span>OS SIM</span><span>›</span><span>Memoria</span>
        </div>
        <h1 className="page-title">GESTIÓN DE MEMORIA</h1>
      </div>

      {(loading || memory) && (
        <div style={{ display: 'grid', gridTemplateColumns: '5fr 6fr', gap: 24, alignItems: 'start' }}>

          {/* LEFT — Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Page faults big metric */}
            {loading ? (
              <div className="metric-card">
                <Skeleton h={60} w={100} />
                <div style={{ height: 8 }} />
                <Skeleton h={14} w={160} />
              </div>
            ) : memory && (
              <MetricCard
                value={memory.page_faults}
                label="PAGE FAULTS TOTALES"
                color="amber"
                icon="⚠"
                delay={0}
              />
            )}

            {/* Mini metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="metric-card" style={{ padding: 14 }}>
                    <Skeleton h={36} w={60} /><Skeleton h={12} w={90} style={{ marginTop: 6 }} />
                  </div>
                ))
              ) : memory && (
                <>
                  <MetricCard
                    value={`${memory.used_frames}/${memory.total_frames}`}
                    label="Marcos Ocupados"
                    icon="▦"
                    color="blue"
                    animateCount={false}
                    delay={60}
                  />
                  <MetricCard
                    value={usagePct}
                    label="Uso de Memoria %"
                    icon="◈"
                    color={usagePct > 80 ? 'red' : 'green'}
                    unit="%"
                    delay={120}
                  />
                  <MetricCard
                    value={memory.replacements.length}
                    label="Reemplazos LRU"
                    icon="↺"
                    color="amber"
                    delay={180}
                  />
                </>
              )}
            </div>

            {/* Replacement table */}
            <div className="os-card os-card--amber anim anim-d2">
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <div className="section-title" style={{ fontSize: '0.9rem' }}>REEMPLAZOS LRU</div>
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={32} />)}
                  </div>
                ) : memory?.replacements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                    ✓ Sin reemplazos
                  </div>
                ) : (
                  <table className="os-table" style={{ fontSize: '0.72rem' }}>
                    <thead>
                      <tr>
                        <th>t</th>
                        <th>Marco</th>
                        <th>Evict.</th>
                        <th>Cargado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memory?.replacements.map((r, i) => (
                        <tr key={i} className="anim" style={{ animationDelay: `${i * 40}ms` }}>
                          <td style={{ color: 'var(--text-muted)' }}>{r.time}</td>
                          <td>
                            <span style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 3, fontWeight: 600 }}>
                              F{r.frame_id}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--accent-red)' }}>P{r.evicted_pid}</span>
                            <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>pg{r.evicted_page}</span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--accent-green)' }}>P{r.loaded_pid}</span>
                            <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>pg{r.loaded_page}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — Grid */}
          <div className="os-card os-card--blue anim anim-d1">
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div className="section-title">ESTADO DE MARCOS DE PÁGINA</div>
              {memory && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    padding: '4px 10px',
                    color: 'var(--accent-green)',
                  }}>
                    {memory.free_frames} libres
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    padding: '4px 10px',
                    color: 'var(--text-secondary)',
                  }}>
                    {memory.total_frames} total
                  </span>
                </div>
              )}
            </div>
            <div style={{ padding: 24 }}>
              {loading ? (
                <div className="memory-grid">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: 6 }} />
                  ))}
                </div>
              ) : memory ? (
                <MemoryGrid frames={memory.frames} />
              ) : (
                <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  — Sin datos de memoria —
                </div>
              )}

              {/* Usage bar */}
              {memory && !loading && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      Uso de memoria
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: usagePct > 80 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                      {usagePct}%
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${usagePct}%`,
                      background: usagePct > 80
                        ? 'linear-gradient(90deg, var(--accent-amber), var(--accent-red))'
                        : 'linear-gradient(90deg, var(--accent-green), var(--accent-blue))',
                      borderRadius: 3,
                      transition: 'width 0.6s ease-out',
                    }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!memory && !loading && (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 12, opacity: 0.2 }}>▦</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.08em' }}>
            SIN DATOS DE MEMORIA
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', marginTop: 8 }}>
            Ejecuta una simulación para visualizar el estado de los marcos
          </div>
        </div>
      )}
    </div>
  );
}
