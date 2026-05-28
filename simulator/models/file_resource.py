"""
Módulo que define la clase FileResource para simular archivos con acceso concurrente.
Utiliza threading.Lock para controlar el acceso exclusivo a cada archivo simulado.
"""

import threading


class FileResource:
    """
    Representa un recurso de archivo simulado con control de concurrencia.

    Cada FileResource modela un archivo del sistema de archivos virtual.
    Utiliza un Lock de Python para garantizar que solo un proceso pueda
    acceder a la vez en modo escritura, simulando el comportamiento real
    de un sistema operativo con bloqueos de archivos.

    Atributos:
        name (str): Nombre del archivo (e.g., "archivo_A.txt").
        lock (threading.Lock): Cerrojo que controla el acceso exclusivo al archivo.
        current_holder (int | None): PID del proceso que tiene el archivo bloqueado, o None.
        access_count (int): Número total de accesos realizados a este archivo.
        conflict_count (int): Número de veces que un proceso tuvo que esperar por este archivo.
    """

    def __init__(self, name: str):
        """
        Inicializa un recurso de archivo simulado.

        Args:
            name (str): Nombre del archivo que este recurso representa.
        """
        self.name = name
        self.lock = threading.Lock()
        self.current_holder = None
        self.access_count = 0
        self.conflict_count = 0

    def acquire(self, pid: int) -> bool:
        """
        Intenta adquirir el bloqueo del archivo sin bloquearse (non-blocking).
        Retorna True si el bloqueo fue adquirido inmediatamente.

        Args:
            pid (int): PID del proceso que intenta adquirir el archivo.

        Returns:
            bool: True si el bloqueo fue obtenido sin espera, False si ya estaba tomado.
        """
        acquired = self.lock.acquire(blocking=False)
        if acquired:
            self.current_holder = pid
        return acquired

    def acquire_blocking(self, pid: int):
        """
        Adquiere el bloqueo del archivo de forma bloqueante.
        El thread se suspende hasta que el archivo esté disponible.

        Args:
            pid (int): PID del proceso que espera el archivo.
        """
        self.lock.acquire(blocking=True)
        self.current_holder = pid

    def release(self):
        """
        Libera el bloqueo del archivo, permitiendo que otros procesos accedan.
        Actualiza el contador de accesos totales.
        """
        self.current_holder = None
        self.access_count += 1
        self.lock.release()

    def is_locked(self) -> bool:
        """
        Verifica si el archivo está actualmente bloqueado por algún proceso.

        Returns:
            bool: True si el archivo está bloqueado, False si está libre.
        """
        return self.current_holder is not None

    def to_dict(self) -> dict:
        """
        Convierte el recurso de archivo a un diccionario serializable como JSON.

        Returns:
            dict: Representación del archivo con sus estadísticas de acceso.
        """
        return {
            "name": self.name,
            "is_locked": self.is_locked(),
            "current_holder": self.current_holder,
            "access_count": self.access_count,
            "conflict_count": self.conflict_count,
        }
