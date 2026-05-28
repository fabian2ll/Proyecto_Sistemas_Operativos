// ── Process / PCB ────────────────────────────────────────────────
export interface Process {
  pid: number;
  name: string;
  priority: number;
  burst_time: number;
  remaining_time: number;
  arrival_time: number;
  waiting_time: number;
  turnaround_time: number;
  response_time: number;
  state: 'NEW' | 'READY' | 'RUNNING' | 'WAITING' | 'TERMINATED';
  pages_needed: number;
  files_accessed: string[];
  start_time: number;
  finish_time: number;
  current_priority: number;
}

// ── Gantt ────────────────────────────────────────────────────────
export interface GanttEntry {
  pid: number;
  name: string;
  start: number;
  end: number;
}

// ── Scheduling result ────────────────────────────────────────────
export interface SchedulingMetrics {
  pid: number;
  name: string;
  burst_time: number;
  arrival_time: number;
  waiting_time: number;
  turnaround_time: number;
  response_time: number;
}

export interface SchedulingAverages {
  avg_waiting: number;
  avg_turnaround: number;
  avg_response: number;
}

export interface SchedulingResult {
  algorithm: string;
  gantt_chart: GanttEntry[];
  metrics: SchedulingMetrics[];
  averages: SchedulingAverages;
}

// ── Memory ───────────────────────────────────────────────────────
export interface MemoryFrame {
  frame_id: number;
  pid: number | null;
  page_id: number | null;
  last_used: number;
  is_free: boolean;
}

export interface LRUReplacement {
  time: number;
  frame_id: number;
  evicted_pid: number;
  evicted_page: number;
  loaded_pid: number;
  loaded_page: number;
}

export interface MemoryState {
  frames: MemoryFrame[];
  page_faults: number;
  replacements: LRUReplacement[];
  total_frames: number;
  used_frames: number;
  free_frames: number;
  page_size: number;
}

// ── File access ──────────────────────────────────────────────────
export type FileAction = 'READ' | 'WRITE';
export type FileStatus = 'OK' | 'WAITING';

export interface FileLogEntry {
  id: number;
  timestamp: string;
  pid: number;
  process_name: string;
  file_name: string;
  action: FileAction;
  status: FileStatus;
  wait_duration_ms: number;
}

export interface FileStat {
  name: string;
  is_locked: boolean;
  current_holder: number | null;
  access_count: number;
  conflict_count: number;
}

export interface FileLog {
  access_log: FileLogEntry[];
  conflict_count: number;
  file_stats: Record<string, FileStat>;
  total_accesses: number;
}

// ── Simulation config ────────────────────────────────────────────
export interface SimulationConfig {
  num_processes: number;
  quantum: number;
  total_frames: number;
  algorithm: 'RR' | 'SJF' | 'PRIORITY';
}

// ── Full simulation state ────────────────────────────────────────
export interface SimulationState {
  config: SimulationConfig;
  processes: Process[];
  scheduling: SchedulingResult | null;
  memory: MemoryState | null;
  fileLog: FileLog | null;
  status: 'idle' | 'setup' | 'running' | 'done' | 'error';
  isLoading: boolean;
  errorMessage: string | null;
}
