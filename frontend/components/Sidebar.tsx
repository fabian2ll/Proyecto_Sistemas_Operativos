'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSimulation } from '@/lib/simulationContext';

const NAV_ITEMS = [
  { href: '/',          icon: '⬡', label: 'Dashboard',     sub: 'Configuración' },
  { href: '/scheduler', icon: '⧖', label: 'Planificación', sub: 'Gantt & Métricas' },
  { href: '/memory',    icon: '▦', label: 'Memoria',        sub: 'Paginación LRU' },
  { href: '/files',     icon: '⊞', label: 'Archivos',       sub: 'Concurrencia' },
];

const STATUS_LABELS: Record<string, string> = {
  idle:    'EN ESPERA',
  setup:   'PROCESOS LISTOS',
  running: 'EJECUTANDO...',
  done:    'SIMULACIÓN COMPLETA',
  error:   'ERROR',
};

export default function Sidebar() {
  const pathname = usePathname();
  const { state } = useSimulation();
  const isRunning = state.status === 'running';
  const isDone = state.status === 'done';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-title">OS SIM</div>
        <div className="sidebar__logo-version">v1.0 — UPTC</div>
        <div className="sidebar__logo-line" />
      </div>

      {/* Nav */}
      <nav className="sidebar__nav">
        <div style={{
          fontSize: '0.65rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '4px 12px 8px',
        }}>
          MÓDULOS
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.href.replace('/', '') || 'home'}`}
              className={`sidebar__item${isActive ? ' sidebar__item--active' : ''}`}
            >
              <span className="sidebar__item-icon">{item.icon}</span>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                <span style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {item.sub}
                </span>
              </div>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="os-divider" style={{ margin: '12px 8px' }} />

        {/* Quick stats */}
        {state.processes.length > 0 && (
          <div style={{
            padding: '8px 12px',
            background: 'var(--bg-elevated)',
            borderRadius: '6px',
            margin: '0 4px',
          }}>
            <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
              ESTADO ACTUAL
            </div>
            {[
              { label: 'Procesos', val: state.processes.length, color: 'var(--accent-green)' },
              { label: 'Algoritmo', val: state.config.algorithm, color: 'var(--accent-blue)' },
              { label: 'Quantum', val: state.config.quantum, color: 'var(--text-secondary)' },
              { label: 'Marcos', val: state.config.total_frames, color: 'var(--text-secondary)' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>
                  {label}
                </span>
                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color }}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        <div className="sidebar__status">
          <span className={`status-dot${isRunning ? ' status-dot--amber' : isDone ? '' : ' status-dot--muted'}`} />
          {STATUS_LABELS[state.status] || 'EN ESPERA'}
        </div>
        <div style={{
          marginTop: 8,
          fontSize: '0.65rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
        }}>
          API: localhost:5000
        </div>
      </div>
    </aside>
  );
}
