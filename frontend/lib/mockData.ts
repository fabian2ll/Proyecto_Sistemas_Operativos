import type {
  Process,
  GanttEntry,
  SchedulingMetrics,
  SchedulingResult,
  MemoryFrame,
  LRUReplacement,
  MemoryState,
  FileLogEntry,
  FileLog,
} from './types';

// ── MOCK PROCESSES (8 procesos) ──────────────────────────────────
export const MOCK_PROCESSES: Process[] = [
  { pid: 1, name: 'kernel.sys',   priority: 1, burst_time: 15, remaining_time: 0,  arrival_time: 0,  waiting_time: 5,  turnaround_time: 20, response_time: 0,  state: 'TERMINATED', pages_needed: 6, files_accessed: ['archivo_A.txt', 'archivo_B.txt'], start_time: 0,  finish_time: 20, current_priority: 1 },
  { pid: 2, name: 'init.d',       priority: 2, burst_time: 8,  remaining_time: 0,  arrival_time: 0,  waiting_time: 7,  turnaround_time: 15, response_time: 3,  state: 'TERMINATED', pages_needed: 3, files_accessed: ['archivo_C.txt'], start_time: 3,  finish_time: 15, current_priority: 2 },
  { pid: 3, name: 'chrome.exe',   priority: 5, burst_time: 12, remaining_time: 0,  arrival_time: 2,  waiting_time: 9,  turnaround_time: 21, response_time: 6,  state: 'TERMINATED', pages_needed: 5, files_accessed: ['archivo_A.txt', 'archivo_D.txt'], start_time: 8,  finish_time: 23, current_priority: 5 },
  { pid: 4, name: 'python.py',    priority: 3, burst_time: 6,  remaining_time: 0,  arrival_time: 1,  waiting_time: 4,  turnaround_time: 10, response_time: 3,  state: 'TERMINATED', pages_needed: 2, files_accessed: ['archivo_B.txt'], start_time: 4,  finish_time: 11, current_priority: 3 },
  { pid: 5, name: 'nginx.server', priority: 4, burst_time: 10, remaining_time: 3,  arrival_time: 3,  waiting_time: 8,  turnaround_time: 18, response_time: 5,  state: 'RUNNING',    pages_needed: 4, files_accessed: ['archivo_E.txt'], start_time: 8,  finish_time: -1, current_priority: 4 },
  { pid: 6, name: 'mysql.db',     priority: 2, burst_time: 7,  remaining_time: 0,  arrival_time: 4,  waiting_time: 6,  turnaround_time: 13, response_time: 6,  state: 'TERMINATED', pages_needed: 3, files_accessed: ['archivo_C.txt', 'archivo_D.txt'], start_time: 10, finish_time: 17, current_priority: 2 },
  { pid: 7, name: 'ssh.client',   priority: 7, burst_time: 5,  remaining_time: 5,  arrival_time: 5,  waiting_time: 0,  turnaround_time: 0,  response_time: -1, state: 'READY',      pages_needed: 2, files_accessed: ['archivo_A.txt'], start_time: -1, finish_time: -1, current_priority: 7 },
  { pid: 8, name: 'docker.img',   priority: 9, burst_time: 9,  remaining_time: 9,  arrival_time: 8,  waiting_time: 0,  turnaround_time: 0,  response_time: -1, state: 'NEW',        pages_needed: 4, files_accessed: ['archivo_E.txt', 'archivo_B.txt'], start_time: -1, finish_time: -1, current_priority: 9 },
];

// ── MOCK GANTT (30 unidades de tiempo) ───────────────────────────
export const MOCK_GANTT: GanttEntry[] = [
  { pid: 1, name: 'kernel.sys',   start: 0,  end: 3  },
  { pid: 2, name: 'init.d',       start: 3,  end: 6  },
  { pid: 1, name: 'kernel.sys',   start: 6,  end: 9  },
  { pid: 4, name: 'python.py',    start: 9,  end: 12 },
  { pid: 1, name: 'kernel.sys',   start: 12, end: 15 },
  { pid: 2, name: 'init.d',       start: 15, end: 18 },
  { pid: 3, name: 'chrome.exe',   start: 18, end: 21 },
  { pid: 6, name: 'mysql.db',     start: 21, end: 24 },
  { pid: 5, name: 'nginx.server', start: 24, end: 27 },
  { pid: 3, name: 'chrome.exe',   start: 27, end: 30 },
];

// ── MOCK METRICS ─────────────────────────────────────────────────
export const MOCK_METRICS: SchedulingMetrics[] = MOCK_PROCESSES
  .filter(p => p.state === 'TERMINATED')
  .map(p => ({
    pid: p.pid,
    name: p.name,
    burst_time: p.burst_time,
    arrival_time: p.arrival_time,
    waiting_time: p.waiting_time,
    turnaround_time: p.turnaround_time,
    response_time: p.response_time,
  }));

// ── MOCK SCHEDULING RESULT ────────────────────────────────────────
export const MOCK_SCHEDULING: SchedulingResult = {
  algorithm: 'RR',
  gantt_chart: MOCK_GANTT,
  metrics: MOCK_METRICS,
  averages: {
    avg_waiting: 6.5,
    avg_turnaround: 16.2,
    avg_response: 3.8,
  },
};

// ── MOCK MEMORY (8 marcos) ───────────────────────────────────────
export const MOCK_FRAMES: MemoryFrame[] = [
  { frame_id: 0, pid: 1, page_id: 0, last_used: 14, is_free: false },
  { frame_id: 1, pid: 1, page_id: 1, last_used: 8,  is_free: false },
  { frame_id: 2, pid: 3, page_id: 0, last_used: 27, is_free: false },
  { frame_id: 3, pid: 2, page_id: 0, last_used: 17, is_free: false },
  { frame_id: 4, pid: 5, page_id: 0, last_used: 24, is_free: false },
  { frame_id: 5, pid: 4, page_id: 1, last_used: 11, is_free: false },
  { frame_id: 6, pid: null, page_id: null, last_used: -1, is_free: true },
  { frame_id: 7, pid: null, page_id: null, last_used: -1, is_free: true },
];

export const MOCK_REPLACEMENTS: LRUReplacement[] = [
  { time: 9,  frame_id: 1, evicted_pid: 2, evicted_page: 1, loaded_pid: 4, loaded_page: 0 },
  { time: 18, frame_id: 5, evicted_pid: 4, evicted_page: 0, loaded_pid: 3, loaded_page: 1 },
  { time: 24, frame_id: 3, evicted_pid: 2, evicted_page: 0, loaded_pid: 5, loaded_page: 0 },
];

export const MOCK_MEMORY: MemoryState = {
  frames: MOCK_FRAMES,
  page_faults: 14,
  replacements: MOCK_REPLACEMENTS,
  total_frames: 8,
  used_frames: 6,
  free_frames: 2,
  page_size: 4,
};

// ── MOCK FILE LOG (20 entradas) ───────────────────────────────────
export const MOCK_FILE_LOG: FileLog = {
  total_accesses: 20,
  conflict_count: 6,
  file_stats: {
    'archivo_A.txt': { name: 'archivo_A.txt', is_locked: false, current_holder: null, access_count: 5, conflict_count: 2 },
    'archivo_B.txt': { name: 'archivo_B.txt', is_locked: false, current_holder: null, access_count: 4, conflict_count: 1 },
    'archivo_C.txt': { name: 'archivo_C.txt', is_locked: false, current_holder: null, access_count: 3, conflict_count: 1 },
    'archivo_D.txt': { name: 'archivo_D.txt', is_locked: false, current_holder: null, access_count: 4, conflict_count: 2 },
    'archivo_E.txt': { name: 'archivo_E.txt', is_locked: false, current_holder: null, access_count: 4, conflict_count: 0 },
  },
  access_log: [
    { id: 1,  timestamp: '13:00:01', pid: 1, process_name: 'kernel.sys',   file_name: 'archivo_A.txt', action: 'WRITE', status: 'OK',      wait_duration_ms: 0 },
    { id: 2,  timestamp: '13:00:01', pid: 2, process_name: 'init.d',       file_name: 'archivo_C.txt', action: 'READ',  status: 'OK',      wait_duration_ms: 0 },
    { id: 3,  timestamp: '13:00:01', pid: 3, process_name: 'chrome.exe',   file_name: 'archivo_A.txt', action: 'READ',  status: 'WAITING', wait_duration_ms: 87.3 },
    { id: 4,  timestamp: '13:00:01', pid: 5, process_name: 'nginx.server', file_name: 'archivo_E.txt', action: 'WRITE', status: 'OK',      wait_duration_ms: 0 },
    { id: 5,  timestamp: '13:00:02', pid: 4, process_name: 'python.py',    file_name: 'archivo_B.txt', action: 'WRITE', status: 'OK',      wait_duration_ms: 0 },
    { id: 6,  timestamp: '13:00:02', pid: 6, process_name: 'mysql.db',     file_name: 'archivo_D.txt', action: 'WRITE', status: 'OK',      wait_duration_ms: 0 },
    { id: 7,  timestamp: '13:00:02', pid: 7, process_name: 'ssh.client',   file_name: 'archivo_A.txt', action: 'READ',  status: 'WAITING', wait_duration_ms: 124.7 },
    { id: 8,  timestamp: '13:00:02', pid: 3, process_name: 'chrome.exe',   file_name: 'archivo_D.txt', action: 'READ',  status: 'WAITING', wait_duration_ms: 65.1 },
    { id: 9,  timestamp: '13:00:03', pid: 1, process_name: 'kernel.sys',   file_name: 'archivo_B.txt', action: 'WRITE', status: 'OK',      wait_duration_ms: 0 },
    { id: 10, timestamp: '13:00:03', pid: 8, process_name: 'docker.img',   file_name: 'archivo_E.txt', action: 'READ',  status: 'WAITING', wait_duration_ms: 213.4 },
    { id: 11, timestamp: '13:00:03', pid: 2, process_name: 'init.d',       file_name: 'archivo_C.txt', action: 'WRITE', status: 'OK',      wait_duration_ms: 0 },
    { id: 12, timestamp: '13:00:03', pid: 6, process_name: 'mysql.db',     file_name: 'archivo_C.txt', action: 'READ',  status: 'WAITING', wait_duration_ms: 52.8 },
    { id: 13, timestamp: '13:00:04', pid: 4, process_name: 'python.py',    file_name: 'archivo_B.txt', action: 'READ',  status: 'OK',      wait_duration_ms: 0 },
    { id: 14, timestamp: '13:00:04', pid: 5, process_name: 'nginx.server', file_name: 'archivo_E.txt', action: 'READ',  status: 'OK',      wait_duration_ms: 0 },
    { id: 15, timestamp: '13:00:04', pid: 3, process_name: 'chrome.exe',   file_name: 'archivo_A.txt', action: 'WRITE', status: 'OK',      wait_duration_ms: 87.3 },
    { id: 16, timestamp: '13:00:04', pid: 1, process_name: 'kernel.sys',   file_name: 'archivo_A.txt', action: 'READ',  status: 'OK',      wait_duration_ms: 0 },
    { id: 17, timestamp: '13:00:05', pid: 7, process_name: 'ssh.client',   file_name: 'archivo_A.txt', action: 'WRITE', status: 'OK',      wait_duration_ms: 124.7 },
    { id: 18, timestamp: '13:00:05', pid: 6, process_name: 'mysql.db',     file_name: 'archivo_D.txt', action: 'WRITE', status: 'OK',      wait_duration_ms: 0 },
    { id: 19, timestamp: '13:00:05', pid: 8, process_name: 'docker.img',   file_name: 'archivo_E.txt', action: 'WRITE', status: 'OK',      wait_duration_ms: 213.4 },
    { id: 20, timestamp: '13:00:05', pid: 8, process_name: 'docker.img',   file_name: 'archivo_B.txt', action: 'READ',  status: 'OK',      wait_duration_ms: 0 },
  ],
};
