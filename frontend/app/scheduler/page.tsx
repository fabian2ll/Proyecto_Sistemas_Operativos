'use client';

import { useEffect, useState } from 'react';
import { useSimulation } from '@/lib/simulationContext';
import GanttChart from '@/components/GanttChart';
import MetricCard from '@/components/MetricCard';
import type { SchedulingMetrics } from '@/lib/types';

function GanttSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 24 }}>
      <div className="skeleton" style={{ height: 20, width: 300 }} />
      <div className="skeleton" style={{ height: 40, width: '100%' }} />
      <div className="skeleton" style={{ height: 20, width: '80%' }} />
    </div>
  );
}

function TableSkeleton() {
  return (
    <table className="os-table">
      <tbody>
        {Array.from({ length: 5 }).map((_, i) => (
          <tr key={i}>
            {[50, 90, 60, 60, 60, 60].map((w, j) => (
              <td key={j} style={{ padding: '10px 14px' }}>
                <div className="skeleton" style={{ height: 14, width: w }} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const ALGO_FULL: Record<string, string> = {
  RR: 'Round Robin',
  SJF: 'Shortest Job First',
  PRIORITY: 'Planificación por Prioridad',
};

export default function SchedulerPage() {
  const { state } = useSimulation();
  const { scheduling, config, isLoading, status } = state;
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (status === 'running') {
      setShowSkeleton(true);
    } else {
      const timer = setTimeout(() => setShowSkeleton(false), 400);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const loading = isLoading || showSkeleton;

  return (
    <div className="content-area">
      {/* Header */}
      <div className="page-header anim">
        <div className="page-breadcrumb">
          <span>OS SIM</span><span>›</span><span>Planificación</span>
        </div>
        <h1 className="page-title">PLANIFICACIÓN DE CPU</h1>
      </div>

      {/* Metric cards */}
      {(loading || scheduling) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="metric-card">
                <div className="skeleton" style={{ height: 44, width: 80, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: 120 }} />
              </div>
            ))
          ) : scheduling && (
            <>
              <MetricCard
                value={scheduling.averages.avg_waiting}
                label="Tiempo de Espera Prom."
                icon="⏱"
                color="green"
                unit="unidades"
                delay={0}
              />
              <MetricCard
                value={scheduling.averages.avg_turnaround}
                label="Turnaround Promedio"
                icon="↺"
                color="blue"
                unit="unidades"
                delay={60}
              />
              <MetricCard
                value={scheduling.averages.avg_response}
                label="Response Time Prom."
                icon="⚡"
                color="amber"
                unit="unidades"
                delay={120}
              />
              <MetricCard
                value={scheduling.metrics.length}
                label="Procesos Completados"
                icon="✓"
                color="green"
                delay={180}
                animateCount={false}
              />
            </>
          )}
        </div>
      )}

      {/* Gantt */}
      <div className="os-card os-card--green anim anim-d1" style={{ marginBottom: 24 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div className="section-title">DIAGRAMA DE GANTT</div>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {loading ? <GanttSkeleton /> : scheduling ? (
            <GanttChart
              gantt={scheduling.gantt_chart}
              algorithm={ALGO_FULL[scheduling.algorithm] || scheduling.algorithm}
              quantum={config.quantum}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              — Ejecuta una simulación desde el Dashboard —
            </div>
          )}
        </div>
      </div>

      {/* Metrics table */}
      {(loading || scheduling) && (
        <div className="os-card os-card--blue anim anim-d2">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <div className="section-title">MÉTRICAS POR PROCESO</div>
          </div>
          <div style={{ padding: 0 }}>
            {loading ? <TableSkeleton /> : scheduling && (
              <div className="os-table-wrap" style={{ border: 'none' }}>
                <table className="os-table">
                  <thead>
                    <tr>
                      <th>PID</th>
                      <th>Nombre</th>
                      <th>Burst</th>
                      <th>Llegada</th>
                      <th>T. Espera</th>
                      <th>Turnaround</th>
                      <th>Response</th>
                      <th>Eficiencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduling.metrics.map((m: SchedulingMetrics, i) => {
                      const eff = m.turnaround_time > 0
                        ? Math.round((m.burst_time / m.turnaround_time) * 100)
                        : 100;
                      const waitColor = m.waiting_time === 0
                        ? 'var(--accent-green)'
                        : m.waiting_time > 10
                          ? 'var(--accent-red)'
                          : 'var(--accent-amber)';
                      return (
                        <tr key={m.pid} className="anim" style={{ animationDelay: `${i * 40}ms` }}>
                          <td>
                            <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>
                              P{m.pid}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{m.name}</td>
                          <td>{m.burst_time}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{m.arrival_time}</td>
                          <td>
                            <span style={{ color: waitColor, fontWeight: 600 }}>
                              {m.waiting_time}
                            </span>
                          </td>
                          <td>{m.turnaround_time}</td>
                          <td style={{ color: 'var(--accent-blue)' }}>{m.response_time}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 64, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{
                                  width: `${eff}%`, height: '100%',
                                  background: eff > 70
                                    ? 'var(--accent-green)'
                                    : eff > 40
                                      ? 'var(--accent-amber)'
                                      : 'var(--accent-red)',
                                  borderRadius: 2,
                                  transition: 'width 0.5s ease-out',
                                }} />
                              </div>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {eff}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {!scheduling && !loading && (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 12, opacity: 0.2 }}>⧖</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.08em' }}>
            SIN SIMULACIÓN ACTIVA
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', marginTop: 8 }}>
            Ve al Dashboard → Genera procesos → Ejecuta simulación
          </div>
        </div>
      )}
    </div>
  );
}
