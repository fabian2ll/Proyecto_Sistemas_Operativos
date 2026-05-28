"""
Módulo que define la clase Process (Bloque de Control de Proceso - PCB).
Representa cada proceso en el simulador de sistema operativo.
"""


class Process:
    """
    Bloque de Control de Proceso (PCB).

    Contiene toda la información necesaria para gestionar un proceso
    dentro del simulador de sistema operativo.

    Atributos:
        pid (int): Identificador único del proceso (autoincremental).
        name (str): Nombre descriptivo del proceso.
        priority (int): Prioridad del proceso (1–10, donde 1 es la más alta).
        burst_time (int): Tiempo total de CPU requerido (en unidades de tiempo).
        remaining_time (int): Tiempo restante de CPU (usado en RR y Prioridad expropiativa).
        arrival_time (int): Instante en que el proceso llega al sistema.
        waiting_time (int): Tiempo total que el proceso estuvo esperando en la cola.
        turnaround_time (int): Tiempo total desde la llegada hasta la finalización.
        response_time (int): Tiempo desde la llegada hasta la primera vez en CPU.
        state (str): Estado actual del proceso (NEW, READY, RUNNING, WAITING, TERMINATED).
        pages_needed (int): Número de páginas de memoria que el proceso requiere.
        files_accessed (list[str]): Archivos que el proceso intenta leer/escribir.
        start_time (int): Instante en que el proceso fue ejecutado por primera vez.
        finish_time (int): Instante en que el proceso terminó su ejecución.
        current_priority (int): Prioridad dinámica (modificada por aging).
        last_run_time (int): Última unidad de tiempo en que el proceso fue ejecutado (para aging).
    """

    def __init__(
        self,
        pid: int,
        name: str,
        priority: int,
        burst_time: int,
        arrival_time: int,
        pages_needed: int,
        files_accessed: list,
    ):
        """
        Inicializa un nuevo proceso con los parámetros dados.

        Args:
            pid (int): Identificador único del proceso.
            name (str): Nombre del proceso.
            priority (int): Prioridad inicial (1–10).
            burst_time (int): Tiempo de ráfaga de CPU.
            arrival_time (int): Tiempo de llegada al sistema.
            pages_needed (int): Páginas de memoria requeridas.
            files_accessed (list[str]): Lista de nombres de archivos a acceder.
        """
        self.pid = pid
        self.name = name
        self.priority = priority
        self.burst_time = burst_time
        self.remaining_time = burst_time
        self.arrival_time = arrival_time
        self.waiting_time = 0
        self.turnaround_time = 0
        self.response_time = -1
        self.state = "NEW"
        self.pages_needed = pages_needed
        self.files_accessed = files_accessed
        self.start_time = -1
        self.finish_time = -1
        self.current_priority = priority
        self.last_run_time = -1

    def to_dict(self) -> dict:
        """
        Convierte el proceso a un diccionario serializable como JSON.

        Returns:
            dict: Representación del proceso con todos sus atributos.
        """
        return {
            "pid": self.pid,
            "name": self.name,
            "priority": self.priority,
            "burst_time": self.burst_time,
            "remaining_time": self.remaining_time,
            "arrival_time": self.arrival_time,
            "waiting_time": self.waiting_time,
            "turnaround_time": self.turnaround_time,
            "response_time": self.response_time,
            "state": self.state,
            "pages_needed": self.pages_needed,
            "files_accessed": self.files_accessed,
            "start_time": self.start_time,
            "finish_time": self.finish_time,
            "current_priority": self.current_priority,
        }

    def reset_scheduling_fields(self):
        """
        Reinicia los campos calculados durante la planificación para permitir
        ejecutar múltiples simulaciones con los mismos procesos.
        """
        self.remaining_time = self.burst_time
        self.waiting_time = 0
        self.turnaround_time = 0
        self.response_time = -1
        self.state = "READY"
        self.start_time = -1
        self.finish_time = -1
        self.current_priority = self.priority
        self.last_run_time = -1
