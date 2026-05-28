'use client';

interface AccessEntry {
  timestamp: string;
  pid: number;
  process_name: string;
  file_name: string;
  action: 'READ' | 'WRITE';
  status: 'OK' | 'WAITING';
  wait_duration_ms: number;
}

interface FileLogProps {
  log: AccessEntry[];
}

const ACTION_STYLES = {
  READ: 'bg-accent/20 text-accent',
  WRITE: 'bg-warning/20 text-warning',
};

const STATUS_STYLES = {
  OK: 'bg-success/20 text-success',
  WAITING: 'bg-yellow-500/20 text-yellow-400',
};

export default function FileLog({ log }: FileLogProps) {
  if (log.length === 0) {
    return (
      <div className="text-center py-10 text-text-dim">
        <p>No hay entradas en el log de accesos.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
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
          {log.map((entry, i) => (
            <tr
              key={i}
              className={entry.status === 'WAITING' ? 'bg-yellow-500/5' : ''}
            >
              <td className="font-mono text-xs text-text-dim">{entry.timestamp}</td>
              <td>
                <span className="badge badge-blue font-mono">P{entry.pid}</span>
              </td>
              <td className="font-mono text-xs">{entry.process_name}</td>
              <td>
                <span className="font-mono text-xs text-accent">📄 {entry.file_name}</span>
              </td>
              <td>
                <span className={`badge text-xs ${ACTION_STYLES[entry.action]}`}>
                  {entry.action === 'READ' ? '↓ READ' : '↑ WRITE'}
                </span>
              </td>
              <td>
                <span className={`badge text-xs ${STATUS_STYLES[entry.status]}`}>
                  {entry.status === 'OK' ? '✓ OK' : '⟳ WAITING'}
                </span>
              </td>
              <td>
                {entry.wait_duration_ms > 0 ? (
                  <span className="font-mono text-warning font-semibold">
                    {entry.wait_duration_ms.toFixed(1)} ms
                  </span>
                ) : (
                  <span className="text-text-dim font-mono text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
