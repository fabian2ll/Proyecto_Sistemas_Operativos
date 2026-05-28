"""
Módulo de gestión de memoria del simulador de sistema operativo.
Implementa paginación por demanda con algoritmo de reemplazo LRU.
"""

from simulator.models.page import Frame, Page
from simulator.models.process import Process


class MemoryManager:
    """
    Gestor de memoria basado en paginación por demanda con reemplazo LRU.

    Mantiene un conjunto de marcos físicos de memoria. Las páginas se cargan
    únicamente cuando el proceso las necesita (por demanda). Cuando no hay
    marcos libres, aplica LRU (Least Recently Used) para decidir qué página
    desalojar y reemplazar.

    Atributos:
        total_frames (int): Número total de marcos físicos disponibles.
        page_size (int): Tamaño simbólico de cada página (solo para visualización).
        frames (list[Frame]): Lista de marcos físicos de memoria.
        page_faults (int): Contador total de fallos de página ocurridos.
        replacements (list[dict]): Historial de cada reemplazo LRU realizado.
        page_table (dict): Tabla de páginas: {(pid, page_id): Frame}.
    """

    def __init__(self, total_frames: int = 8, page_size: int = 4):
        """
        Inicializa el gestor de memoria con los parámetros dados.

        Args:
            total_frames (int): Número de marcos físicos disponibles.
            page_size (int): Tamaño simbólico de página (KB, solo visual).
        """
        self.total_frames = total_frames
        self.page_size = page_size
        self.frames: list[Frame] = [Frame(i) for i in range(total_frames)]
        self.page_faults = 0
        self.replacements: list[dict] = []
        self.page_table: dict[tuple, Frame] = {}

    def reset(self, total_frames: int = None, page_size: int = None):
        """
        Reinicia el estado completo del gestor de memoria.

        Permite opcionalmente cambiar el número de marcos y tamaño de página
        al momento del reset.

        Args:
            total_frames (int | None): Nuevo número de marcos; si None, mantiene el actual.
            page_size (int | None): Nuevo tamaño de página; si None, mantiene el actual.
        """
        if total_frames is not None:
            self.total_frames = total_frames
        if page_size is not None:
            self.page_size = page_size

        self.frames = [Frame(i) for i in range(self.total_frames)]
        self.page_faults = 0
        self.replacements = []
        self.page_table = {}

    def _get_free_frame(self) -> Frame:
        """
        Busca y retorna el primer marco físico libre.

        Returns:
            Frame | None: El primer marco libre, o None si no hay ninguno disponible.
        """
        for frame in self.frames:
            if frame.is_free:
                return frame
        return None

    def _lru_evict(self) -> Frame:
        """
        Selecciona el marco a desalojar usando el algoritmo LRU.

        Busca el marco ocupado con el valor de 'last_used' más antiguo
        (el menor valor), que corresponde al menos recientemente usado.

        Returns:
            Frame: El marco seleccionado para reemplazo.
        """
        occupied = [f for f in self.frames if not f.is_free]
        # El LRU es el que tiene el last_used más pequeño
        return min(occupied, key=lambda f: f.last_used)

    def access_page(self, pid: int, page_id: int, time: int) -> dict:
        """
        Simula el acceso a una página de memoria de un proceso.

        Si la página ya está en memoria, actualiza su timestamp de uso (LRU).
        Si no está (page fault), la carga en un marco libre o reemplaza una
        existente usando LRU.

        Args:
            pid (int): PID del proceso que accede a la página.
            page_id (int): Número de página lógica del proceso.
            time (int): Unidad de tiempo actual (para el registro LRU).

        Returns:
            dict: Resultado del acceso con campos 'page_fault', 'frame_id',
                  y 'replacement' (si hubo reemplazo).
        """
        key = (pid, page_id)
        result = {"page_fault": False, "frame_id": None, "replacement": None}

        if key in self.page_table:
            # La página ya está en memoria: actualizar LRU
            frame = self.page_table[key]
            frame.last_used = time
            result["frame_id"] = frame.frame_id
            return result

        # Page fault
        self.page_faults += 1
        result["page_fault"] = True
        frame = self._get_free_frame()

        if frame is not None:
            # Hay marco libre
            frame.load_page(pid, page_id, time)
            self.page_table[key] = frame
            result["frame_id"] = frame.frame_id
        else:
            # No hay marco libre: aplicar LRU
            evict_frame = self._lru_evict()
            evicted_pid = evict_frame.pid
            evicted_page = evict_frame.page_id

            # Registrar el reemplazo
            replacement_record = {
                "time": time,
                "evicted_pid": evicted_pid,
                "evicted_page": evicted_page,
                "loaded_pid": pid,
                "loaded_page": page_id,
                "frame_id": evict_frame.frame_id,
            }
            self.replacements.append(replacement_record)
            result["replacement"] = replacement_record

            # Eliminar la página antigua de la tabla de páginas
            old_key = (evicted_pid, evicted_page)
            if old_key in self.page_table:
                del self.page_table[old_key]

            # Cargar la nueva página en el marco liberado
            evict_frame.load_page(pid, page_id, time)
            self.page_table[key] = evict_frame
            result["frame_id"] = evict_frame.frame_id

        return result

    def simulate_process_execution(self, process: Process, time: int) -> list[dict]:
        """
        Simula la ejecución de un proceso accediendo a todas sus páginas.

        Cada proceso accede secuencialmente a sus páginas (0 hasta pages_needed-1).
        Solo carga la página en el instante en que se necesita (por demanda).

        Args:
            process (Process): El proceso cuyas páginas se cargarán.
            time (int): Unidad de tiempo actual de la simulación.

        Returns:
            list[dict]: Lista de resultados de acceso para cada página del proceso.
        """
        results = []
        for page_id in range(process.pages_needed):
            result = self.access_page(process.pid, page_id, time + page_id)
            results.append(result)
        return results

    def get_state(self) -> dict:
        """
        Retorna el estado actual completo del gestor de memoria como JSON.

        Returns:
            dict: Estado con 'frames', 'page_faults', 'replacements' y
                  'page_size' para visualización en el frontend.
        """
        return {
            "frames": [f.to_dict() for f in self.frames],
            "page_faults": self.page_faults,
            "replacements": self.replacements,
            "page_size": self.page_size,
            "total_frames": self.total_frames,
            "used_frames": sum(1 for f in self.frames if not f.is_free),
            "free_frames": sum(1 for f in self.frames if f.is_free),
        }

    def simulate_from_gantt(self, gantt: list[dict], processes: list[Process]) -> dict:
        """
        Ejecuta la simulación de memoria usando el diagrama de Gantt generado
        por el planificador.

        Cada entrada del Gantt representa que un proceso está en CPU. Durante
        ese tiempo, sus páginas se cargan por demanda en los marcos disponibles.

        Args:
            gantt (list[dict]): Diagrama de Gantt del planificador.
            processes (list[Process]): Lista de procesos para buscar pages_needed.

        Returns:
            dict: Estado final de memoria después de la simulación.
        """
        self.reset(self.total_frames)
        proc_map = {p.pid: p for p in processes}

        for entry in gantt:
            pid = entry["pid"]
            time = entry["start"]
            if pid in proc_map:
                process = proc_map[pid]
                self.simulate_process_execution(process, time)

        return self.get_state()
