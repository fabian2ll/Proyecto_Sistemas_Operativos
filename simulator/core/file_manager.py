"""
Módulo de gestión de archivos con acceso concurrente usando threads de Python.
Simula el control de acceso a archivos compartidos mediante locks.
"""

import threading
import time as time_module
from simulator.models.file_resource import FileResource
from simulator.models.process import Process

# Archivos simulados del sistema
SIMULATED_FILES = [
    "archivo_A.txt",
    "archivo_B.txt",
    "archivo_C.txt",
    "archivo_D.txt",
    "archivo_E.txt",
]


class FileManager:
    """
    Gestor de acceso concurrente a archivos del sistema simulado.

    Simula el acceso simultáneo de múltiples procesos a archivos compartidos
    usando threads reales de Python y locks para controlar el acceso exclusivo.
    Registra cada evento de acceso con timestamps, estados y tiempos de espera.

    Atributos:
        files (dict[str, FileResource]): Mapa de nombre de archivo a recurso simulado.
        access_log (list[dict]): Registro cronológico de todos los accesos.
        conflict_count (int): Número total de conflictos (procesos que esperaron).
        _log_lock (threading.Lock): Lock interno para acceso seguro al log compartido.
    """

    def __init__(self):
        """
        Inicializa el gestor de archivos con los 5 archivos simulados.
        """
        self.files: dict[str, FileResource] = {
            name: FileResource(name) for name in SIMULATED_FILES
        }
        self.access_log: list[dict] = []
        self.conflict_count = 0
        self._log_lock = threading.Lock()

    def reset(self):
        """
        Reinicia el gestor de archivos a su estado inicial.
        Recrea todos los FileResource y limpia el log de accesos.
        """
        self.files = {name: FileResource(name) for name in SIMULATED_FILES}
        self.access_log = []
        self.conflict_count = 0

    def _process_file_access(self, process: Process, file_name: str, action: str):
        """
        Ejecuta el acceso de un proceso a un archivo específico.

        Intenta adquirir el lock de forma no bloqueante. Si el archivo
        está ocupado, registra el conflicto y espera bloqueándose hasta
        que sea liberado. Simula un acceso de entre 50 y 200 ms.

        Args:
            process (Process): Proceso que realiza el acceso.
            file_name (str): Nombre del archivo a acceder.
            action (str): Tipo de acceso ("READ" o "WRITE").
        """
        file_resource = self.files[file_name]
        timestamp = time_module.strftime("%H:%M:%S")
        wait_start = time_module.time()

        # Intentar adquirir sin bloqueo
        acquired_immediately = file_resource.acquire(process.pid)

        if not acquired_immediately:
            # Conflicto: el archivo está bloqueado
            with self._log_lock:
                self.access_log.append({
                    "timestamp": timestamp,
                    "pid": process.pid,
                    "process_name": process.name,
                    "file_name": file_name,
                    "action": action,
                    "status": "WAITING",
                    "wait_duration_ms": 0,
                })
                self.conflict_count += 1
                file_resource.conflict_count += 1

            # Esperar bloqueándose hasta que se libere
            file_resource.acquire_blocking(process.pid)

        wait_end = time_module.time()
        wait_ms = round((wait_end - wait_start) * 1000, 2)

        # Simular duración del acceso (50–200 ms)
        access_duration = 0.05 + (process.pid % 5) * 0.03
        time_module.sleep(access_duration)

        # Liberar el lock
        file_resource.release()

        # Registrar el acceso exitoso
        with self._log_lock:
            self.access_log.append({
                "timestamp": time_module.strftime("%H:%M:%S"),
                "pid": process.pid,
                "process_name": process.name,
                "file_name": file_name,
                "action": action,
                "status": "OK",
                "wait_duration_ms": wait_ms if not acquired_immediately else 0.0,
            })

    def run_simulation(self, processes: list[Process]) -> dict:
        """
        Ejecuta la simulación de acceso concurrente a archivos.

        Lanza un thread por cada par (proceso, archivo) para que todos
        los accesos ocurran simultáneamente. Espera a que todos los threads
        terminen antes de retornar el resultado.

        Args:
            processes (list[Process]): Lista de procesos que acceden a archivos.

        Returns:
            dict: Resultado con 'access_log', 'conflict_count' y estadísticas
                  por archivo.
        """
        self.reset()
        threads = []

        for process in processes:
            for file_name in process.files_accessed:
                if file_name in self.files:
                    # Determinar acción: PIDs pares leen, impares escriben
                    action = "READ" if process.pid % 2 == 0 else "WRITE"
                    t = threading.Thread(
                        target=self._process_file_access,
                        args=(process, file_name, action),
                        daemon=True,
                    )
                    threads.append(t)

        # Lanzar todos los threads simultáneamente
        for t in threads:
            t.start()

        # Esperar a que todos terminen
        for t in threads:
            t.join(timeout=10.0)

        return self.get_log()

    def get_log(self) -> dict:
        """
        Retorna el log completo de accesos y las estadísticas de la simulación.

        Returns:
            dict: Diccionario con 'access_log', 'conflict_count' y
                  'file_stats' con estadísticas por archivo.
        """
        file_stats = {
            name: res.to_dict()
            for name, res in self.files.items()
        }
        return {
            "access_log": sorted(self.access_log, key=lambda x: x["timestamp"]),
            "conflict_count": self.conflict_count,
            "file_stats": file_stats,
            "total_accesses": len([e for e in self.access_log if e["status"] == "OK"]),
        }
