import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { SimulationProvider } from '@/lib/simulationContext';

export const metadata: Metadata = {
  title: 'SimuladorOS — UPTC Sistemas Operativos',
  description:
    'Simulador académico de sistema operativo: gestión de procesos, planificación CPU (RR, SJF, Prioridad), paginación de memoria LRU y acceso concurrente a archivos. UPTC — Sistemas Operativos.',
  keywords: 'sistemas operativos, simulador, UPTC, planificación, paginación, procesos, Round Robin, LRU',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Bebas+Neue&family=Sora:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SimulationProvider>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ flex: 1, minHeight: '100vh', overflowY: 'auto' }}>
              {children}
            </main>
          </div>
        </SimulationProvider>
      </body>
    </html>
  );
}
