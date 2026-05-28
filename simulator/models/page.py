"""
Módulo que define las clases Page y Frame para el sistema de paginación.
Representan las páginas lógicas de los procesos y los marcos físicos de memoria.
"""


class Page:
    """
    Representa una página lógica de un proceso.

    Una página es una unidad de memoria lógica del proceso que puede
    ser cargada en un marco físico de la memoria principal.

    Atributos:
        page_id (int): Número de página dentro del proceso.
        pid (int): PID del proceso al que pertenece esta página.
        loaded (bool): Indica si la página está actualmente en memoria.
        frame_id (int | None): Marco físico donde está cargada, o None si no está en memoria.
        last_used (int): Última unidad de tiempo en que fue accedida (para LRU).
    """

    def __init__(self, page_id: int, pid: int):
        """
        Inicializa una página lógica de un proceso.

        Args:
            page_id (int): Número de la página dentro del espacio de direcciones del proceso.
            pid (int): PID del proceso propietario de esta página.
        """
        self.page_id = page_id
        self.pid = pid
        self.loaded = False
        self.frame_id = None
        self.last_used = -1

    def to_dict(self) -> dict:
        """
        Convierte la página a un diccionario serializable como JSON.

        Returns:
            dict: Representación de la página con todos sus atributos.
        """
        return {
            "page_id": self.page_id,
            "pid": self.pid,
            "loaded": self.loaded,
            "frame_id": self.frame_id,
            "last_used": self.last_used,
        }


class Frame:
    """
    Representa un marco físico de memoria (frame).

    Un marco es una unidad de memoria física que puede contener
    una página de cualquier proceso activo en el sistema.

    Atributos:
        frame_id (int): Identificador único del marco físico.
        pid (int | None): PID del proceso cuya página está cargada, o None si está libre.
        page_id (int | None): Número de página cargada en este marco, o None si está libre.
        last_used (int): Unidad de tiempo del último acceso a este marco (para LRU).
        is_free (bool): Indica si el marco está disponible para ser asignado.
    """

    def __init__(self, frame_id: int):
        """
        Inicializa un marco físico de memoria vacío.

        Args:
            frame_id (int): Identificador único del marco.
        """
        self.frame_id = frame_id
        self.pid = None
        self.page_id = None
        self.last_used = -1
        self.is_free = True

    def load_page(self, pid: int, page_id: int, time: int):
        """
        Carga una página en este marco físico.

        Args:
            pid (int): PID del proceso propietario de la página.
            page_id (int): Número de la página a cargar.
            time (int): Unidad de tiempo actual (para registro LRU).
        """
        self.pid = pid
        self.page_id = page_id
        self.last_used = time
        self.is_free = False

    def free(self):
        """
        Libera el marco, dejándolo disponible para futuras asignaciones.
        Reinicia todos los campos a su estado vacío.
        """
        self.pid = None
        self.page_id = None
        self.last_used = -1
        self.is_free = True

    def to_dict(self) -> dict:
        """
        Convierte el marco a un diccionario serializable como JSON.

        Returns:
            dict: Representación del marco con todos sus atributos.
        """
        return {
            "frame_id": self.frame_id,
            "pid": self.pid,
            "page_id": self.page_id,
            "last_used": self.last_used,
            "is_free": self.is_free,
        }
