'use client';

import { useState } from 'react';
import { useSimulation } from '@/lib/simulationContext';
import ProcessTable from '@/components/ProcessTable';

import { useRouter } from 'next/navigation';

const ALGO_OPTIONS = [
  { id: 'RR' as const,       label: 'RR',       desc: 'Round Robin' },
  { id: 'SJF' as const,      label: 'SJF',      desc: 'Shortest Job' },
  { id: 'PRIORITY' as const, label: 'PRIORIDAD', desc: 'Por Prioridad' },
];

function SkeletonRow() {
  return (
    <tr>
      {[60, 80, 50, 50, 60, 70, 50].map((w, i) => (
        <td key={i} style={{ padding: '12px 14px' }}>
          <div className="skeleton" style={{ width: w, height: 14 }} />
        </td>
      ))}
    </tr>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { state, setConfig, generateProcesses, runSimulation, loadExample } = useSimulation();
  const { config, processes, isLoading, status } = state;
  const [localLoading, setLocalLoading] = useState(false);

  const handleGenerate = async () => {
    setLocalLoading(true);
    await generateProcesses();
    setLocalLoading(false);
  };

  const handleRun = async () => {
    await runSimulation();
    router.push('/scheduler');
  };

  const hasProcesses = processes.length > 0;

  return (
    <div className="content-area">
      {/* Header */}
      <div className="page-header anim">
        <div className="page-breadcrumb">
          <span>OS SIM</span><span>›</span><span>Dashboard</span>
        </div>
        <h1 className="page-title">PANEL DE CONTROL</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
        {/* LEFT — Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Config card */}
          <div className="os-card os-card--green anim anim-d1">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <div className="section-title" style={{ fontSize: '1rem' }}>
                CONFIGURACIÓN DEL SIMULADOR
              </div>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Número de procesos */}
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 8,
                }}>
                  Número de Procesos
                </label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="range" min={5} max={20} step={1}
                    value={config.num_processes}
                    onChange={e => setConfig({ num_processes: +e.target.value })}
                    className="os-range"
                    style={{ flex: 1 }}
                    id="slider-num-processes"
                  />
                  <input
                    id="input-num-processes"
                    type="number" min={5} max={20}
                    value={config.num_processes}
                    onChange={e => setConfig({ num_processes: Math.max(5, Math.min(20, +e.target.value)) })}
                    className="os-input"
                    style={{ width: 64 }}
                  />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Rango: 5 – 20
                </div>
              </div>

              {/* Quantum */}
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 8,
                }}>
                  Quantum (Round Robin)
                </label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="range" min={1} max={10} step={1}
                    value={config.quantum}
                    onChange={e => setConfig({ quantum: +e.target.value })}
                    className="os-range"
                    style={{ flex: 1 }}
                    id="slider-quantum"
                  />
                  <input
                    id="input-quantum"
                    type="number" min={1} max={10}
                    value={config.quantum}
                    onChange={e => setConfig({ quantum: Math.max(1, Math.min(10, +e.target.value)) })}
                    className="os-input"
                    style={{ width: 64 }}
                  />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Rango: 1 – 10 unidades
                </div>
              </div>

              {/* Marcos de memoria */}
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 8,
                }}>
                  Marcos de Memoria
                </label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="range" min={4} max={16} step={1}
                    value={config.total_frames}
                    onChange={e => setConfig({ total_frames: +e.target.value })}
                    className="os-range"
                    style={{ flex: 1 }}
                    id="slider-frames"
                  />
                  <input
                    id="input-frames"
                    type="number" min={4} max={16}
                    value={config.total_frames}
                    onChange={e => setConfig({ total_frames: Math.max(4, Math.min(16, +e.target.value)) })}
                    className="os-input"
                    style={{ width: 64 }}
                  />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Rango: 4 – 16 marcos
                </div>
              </div>

              {/* Algoritmo */}
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 8,
                }}>
                  Algoritmo de Planificación
                </label>
                <div className="algo-toggle">
                  {ALGO_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      id={`btn-algo-${opt.id.toLowerCase()}`}
                      className={`algo-btn${config.algorithm === opt.id ? ' algo-btn--active' : ''}`}
                      onClick={() => setConfig({ algorithm: opt.id })}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  {ALGO_OPTIONS.find(o => o.id === config.algorithm)?.desc}
                  {config.algorithm === 'PRIORITY' && ' — con aging anti-inanición'}
                </div>
              </div>

              {/* Divider */}
              <div className="os-divider" />

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
                <button
                  id="btn-generate"
                  className="btn-primary"
                  onClick={handleGenerate}
                  disabled={localLoading}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {localLoading
                    ? <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(15,23,42,0.18)', borderTopColor: '#0f52ba', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> GENERANDO...</>
                    : <>⬡ GENERAR PROCESOS</>
                  }
                </button>
                <button
                  id="btn-run"
                  className="btn-secondary"
                  onClick={handleRun}
                  disabled={!hasProcesses || isLoading}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {isLoading ? '⧖ EJECUTANDO...' : '▶ EJECUTAR SIMULACIÓN'}
                </button>
              </div>
            </div>
          </div>

          {/* Example sets */}
          <div className="os-card anim anim-d2">
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
              <div className="section-title" style={{ fontSize: '0.9rem' }}>EJEMPLOS PREDEFINIDOS</div>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { id: 1, label: 'Ejemplo 1', desc: '5 procesos · Round Robin', algo: 'RR' },
                { id: 2, label: 'Ejemplo 2', desc: '7 procesos · SJF',         algo: 'SJF' },
                { id: 3, label: 'Ejemplo 3', desc: '6 procesos · Prioridad',   algo: 'PRIORITY' },
              ].map(ex => (
                <button
                  key={ex.id}
                  id={`btn-example-${ex.id}`}
                  className="btn-ghost"
                  onClick={() => loadExample(ex.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ex.label}</div>
                    <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: 1 }}>{ex.desc}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-green)', border: '1px solid #0f52ba30', borderRadius: 3, padding: '2px 8px' }}>
                    {ex.algo}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Process preview */}
        <div className="os-card os-card--blue anim anim-d2" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div className="section-title" style={{ fontSize: '1rem' }}>
              PROCESOS GENERADOS
            </div>
            {hasProcesses && (
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { label: 'Total', val: processes.length, color: 'var(--accent-green)' },
                  { label: 'Burst Prom.', val: (processes.reduce((a,p)=>a+p.burst_time,0)/processes.length).toFixed(1), color: 'var(--accent-amber)' },
                  { label: 'Páginas', val: processes.reduce((a,p)=>a+p.pages_needed,0), color: 'var(--accent-blue)' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 600, color }}>{val}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 500 }}>
            {localLoading ? (
              <table className="os-table">
                <tbody>
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            ) : hasProcesses ? (
              <ProcessTable processes={processes} />
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 300,
                gap: 12,
                color: 'var(--text-muted)',
              }}>
                <div style={{ fontSize: '3rem', opacity: 0.3 }}>⬡</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  Configura y genera procesos para comenzar
                </div>
                <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-body)', color: 'var(--text-muted)', opacity: 0.7 }}>
                  O carga uno de los ejemplos predefinidos →
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
