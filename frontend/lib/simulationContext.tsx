'use client';

import React, {
  createContext, useContext, useReducer, useCallback
} from 'react';
import type {
  SimulationState, SimulationConfig, Process,
  SchedulingResult, MemoryState, FileLog,
} from './types';
import {
  MOCK_PROCESSES, MOCK_SCHEDULING, MOCK_MEMORY, MOCK_FILE_LOG,
} from './mockData';

// ── ACTIONS ──────────────────────────────────────────────────────
type Action =
  | { type: 'SET_CONFIG'; payload: Partial<SimulationConfig> }
  | { type: 'SET_PROCESSES'; payload: Process[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STATUS'; payload: SimulationState['status'] }
  | { type: 'SET_RESULTS'; payload: { scheduling: SchedulingResult; memory: MemoryState; fileLog: FileLog } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' };

// ── INITIAL STATE ────────────────────────────────────────────────
const initialState: SimulationState = {
  config: {
    num_processes: 8,
    quantum: 3,
    total_frames: 8,
    algorithm: 'RR',
  },
  processes: [],
  scheduling: null,
  memory: null,
  fileLog: null,
  status: 'idle',
  isLoading: false,
  errorMessage: null,
};

// ── REDUCER ──────────────────────────────────────────────────────
function reducer(state: SimulationState, action: Action): SimulationState {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } };
    case 'SET_PROCESSES':
      return { ...state, processes: action.payload, status: 'setup' };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_RESULTS':
      return {
        ...state,
        scheduling: action.payload.scheduling,
        memory: action.payload.memory,
        fileLog: action.payload.fileLog,
        status: 'done',
        isLoading: false,
      };
    case 'SET_ERROR':
      return { ...state, errorMessage: action.payload, isLoading: false, status: 'error' };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

// ── CONTEXT ──────────────────────────────────────────────────────
interface SimulationContextValue {
  state: SimulationState;
  setConfig: (cfg: Partial<SimulationConfig>) => void;
  generateProcesses: () => Promise<void>;
  runSimulation: () => Promise<void>;
  reset: () => void;
  loadExample: (id: number) => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ── PROVIDER ─────────────────────────────────────────────────────
export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setConfig = useCallback((cfg: Partial<SimulationConfig>) => {
    dispatch({ type: 'SET_CONFIG', payload: cfg });
  }, []);

  const generateProcesses = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await fetch(`${API}/simulation/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          num_processes: state.config.num_processes,
          quantum: state.config.quantum,
          total_frames: state.config.total_frames,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      dispatch({ type: 'SET_PROCESSES', payload: data.processes });
    } catch {
      // Fallback: usar datos mock si el backend no está disponible
      const sliced = MOCK_PROCESSES.slice(0, state.config.num_processes);
      dispatch({ type: 'SET_PROCESSES', payload: sliced });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.config]);

  const runSimulation = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_STATUS', payload: 'running' });

    // Simular 800ms de "procesamiento"
    await new Promise(r => setTimeout(r, 800));

    try {
      const res = await fetch(`${API}/simulation/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm: state.config.algorithm }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      dispatch({
        type: 'SET_RESULTS',
        payload: {
          scheduling: {
            algorithm: state.config.algorithm,
            gantt_chart: data.gantt_chart,
            metrics: data.metrics,
            averages: data.averages,
          },
          memory: data.memory_state,
          fileLog: data.file_log,
        },
      });
    } catch {
      // Fallback mock
      dispatch({
        type: 'SET_RESULTS',
        payload: {
          scheduling: { ...MOCK_SCHEDULING, algorithm: state.config.algorithm },
          memory: MOCK_MEMORY,
          fileLog: MOCK_FILE_LOG,
        },
      });
    }
  }, [state.config.algorithm]);

  const reset = useCallback(async () => {
    try { await fetch(`${API}/simulation/reset`, { method: 'POST' }); } catch {}
    dispatch({ type: 'RESET' });
  }, []);

  const loadExample = useCallback(async (id: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await fetch(`${API}/simulation/load-example/${id}`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      dispatch({ type: 'SET_PROCESSES', payload: data.processes });
      const algoMap: Record<number, SimulationConfig['algorithm']> = { 1: 'RR', 2: 'SJF', 3: 'PRIORITY' };
      dispatch({ type: 'SET_CONFIG', payload: { algorithm: algoMap[id] || 'RR' } });
    } catch {
      dispatch({ type: 'SET_PROCESSES', payload: MOCK_PROCESSES });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  return (
    <SimulationContext.Provider value={{ state, setConfig, generateProcesses, runSimulation, reset, loadExample }}>
      {children}
    </SimulationContext.Provider>
  );
}

// ── HOOK ─────────────────────────────────────────────────────────
export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}
