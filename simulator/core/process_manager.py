"""
Módulo de gestión de procesos del simulador de sistema operativo.
Maneja la creación, seguimiento y reset de los procesos (PCBs).
"""

import random
from simulator.models.process import Process

# Nombres descriptivos para los procesos simulados
PROCESS_NAMES = [
    "chrome.exe", "firefox.exe", "python.py", "node.js", "java.jar",
    "bash.sh", "nginx.conf", "mysql.db", "redis.cache", "docker.img",
    "gcc.out", "ls.bin", "grep.bin", "vim.editor", "ssh.client",
    "httpd.server", "cron.job", "init.d", "kernel.sys", "swap.mem",
]

# Archivos simulados disponibles en el sistema
AVAILABLE_FILES = [
    "archivo_A.txt", "archivo_B.txt", "archivo_C.txt",
    "archivo_D.txt", "archivo_E.txt"
]


class ProcessManager:
    """
    Gestor de procesos del simulador de sistema operativo.

    Responsable de crear, almacenar y gestionar todos los procesos (PCBs)
    de la simulación. Mantiene el estado global de los procesos en memoria.

    Atributos:
        processes (list[Process]): Lista de todos los procesos creados.
        _pid_counter (int): Contador autoincremental para asignar PIDs únicos.
        config (dict): Configuración actual de la simulación.
    """

    def __init__(self):
        """
        Inicializa el gestor de procesos con estado vacío.
        """
        self.processes: list[Process] = []
        self._pid_counter = 1
        self.config = {
            "num_processes": 0,
            "quantum": 3,
            "total_frames": 8,
        }

    def create_processes(
        self,
        num_processes: int,
        quantum: int = 3,
        total_frames: int = 8
    ) -> list[Process]:
        """
        Genera N procesos con valores aleatorios dentro de rangos configurables.

        Cada proceso recibe un PID único, nombre, prioridad, tiempo de ráfaga,
        tiempo de llegada, páginas de memoria requeridas y archivos a acceder,
        todos generados aleatoriamente.

        Args:
            num_processes (int): Cantidad de procesos a crear (5–20).
            quantum (int): Quantum para Round Robin (guardado en config).
            total_frames (int): Total de marcos de memoria (guardado en config).

        Returns:
            list[Process]: Lista de procesos creados.
        """
        self.processes = []
        self._pid_counter = 1

        self.config["num_processes"] = num_processes
        self.config["quantum"] = quantum
        self.config["total_frames"] = total_frames

        used_names = random.sample(
            PROCESS_NAMES,
            min(num_processes, len(PROCESS_NAMES))
        )
        if num_processes > len(PROCESS_NAMES):
            extras = [f"proc_{i}.exe" for i in range(num_processes - len(PROCESS_NAMES))]
            used_names += extras

        for i in range(num_processes):
            pid = self._pid_counter
            self._pid_counter += 1

            name = used_names[i]
            priority = random.randint(1, 10)
            burst_time = random.randint(4, 20)
            arrival_time = random.randint(0, num_processes * 2)
            pages_needed = random.randint(2, 6)

            # Cada proceso accede a entre 1 y 3 archivos aleatorios
            num_files = random.randint(1, 3)
            files_accessed = random.sample(AVAILABLE_FILES, num_files)

            process = Process(
                pid=pid,
                name=name,
                priority=priority,
                burst_time=burst_time,
                arrival_time=arrival_time,
                pages_needed=pages_needed,
                files_accessed=files_accessed,
            )
            process.state = "NEW"
            self.processes.append(process)

        return self.processes

    def get_processes(self) -> list[dict]:
        """
        Retorna la lista de procesos como estructuras serializables en JSON.

        Returns:
            list[dict]: Lista de diccionarios con los atributos de cada proceso.
        """
        return [p.to_dict() for p in self.processes]

    def get_process_objects(self) -> list[Process]:
        """
        Retorna los objetos Process originales para uso interno de los módulos.

        Returns:
            list[Process]: Lista de instancias Process.
        """
        return self.processes

    def reset(self):
        """
        Reinicia completamente el estado del gestor de procesos.
        Elimina todos los procesos y resetea el contador de PIDs.
        Debe llamarse antes de iniciar una nueva simulación desde cero.
        """
        self.processes = []
        self._pid_counter = 1
        self.config = {
            "num_processes": 0,
            "quantum": 3,
            "total_frames": 8,
        }

    def get_config(self) -> dict:
        """
        Retorna la configuración actual de la simulación.

        Returns:
            dict: Diccionario con los parámetros configurados.
        """
        return self.config.copy()

    def load_example_set(self, example_id: int) -> list[Process]:
        """
        Carga un conjunto de procesos de ejemplo predefinido (hardcodeado).

        Permite demostrar el simulador con datos reproducibles para pruebas
        y presentaciones universitarias.

        Args:
            example_id (int): Identificador del ejemplo (1, 2 o 3).

        Returns:
            list[Process]: Lista de procesos del ejemplo seleccionado.

        Raises:
            ValueError: Si el example_id no es válido (debe ser 1, 2 o 3).
        """
        examples = {
            1: [
                # Ejemplo 1: 5 procesos mixtos – ideal para Round Robin
                {"pid": 1, "name": "chrome.exe",  "priority": 3, "burst": 8,  "arrival": 0, "pages": 4, "files": ["archivo_A.txt", "archivo_B.txt"]},
                {"pid": 2, "name": "python.py",   "priority": 1, "burst": 5,  "arrival": 1, "pages": 2, "files": ["archivo_A.txt"]},
                {"pid": 3, "name": "node.js",     "priority": 5, "burst": 12, "arrival": 2, "pages": 5, "files": ["archivo_C.txt"]},
                {"pid": 4, "name": "mysql.db",    "priority": 2, "burst": 6,  "arrival": 3, "pages": 3, "files": ["archivo_B.txt", "archivo_D.txt"]},
                {"pid": 5, "name": "nginx.conf",  "priority": 4, "burst": 9,  "arrival": 4, "pages": 4, "files": ["archivo_E.txt"]},
            ],
            2: [
                # Ejemplo 2: 7 procesos con llegadas dispersas – ideal para SJF
                {"pid": 1, "name": "bash.sh",     "priority": 5, "burst": 3,  "arrival": 0,  "pages": 2, "files": ["archivo_A.txt"]},
                {"pid": 2, "name": "gcc.out",     "priority": 3, "burst": 7,  "arrival": 2,  "pages": 3, "files": ["archivo_B.txt", "archivo_C.txt"]},
                {"pid": 3, "name": "vim.editor",  "priority": 7, "burst": 2,  "arrival": 4,  "pages": 2, "files": ["archivo_A.txt", "archivo_E.txt"]},
                {"pid": 4, "name": "ssh.client",  "priority": 2, "burst": 10, "arrival": 5,  "pages": 5, "files": ["archivo_D.txt"]},
                {"pid": 5, "name": "cron.job",    "priority": 6, "burst": 4,  "arrival": 7,  "pages": 2, "files": ["archivo_C.txt"]},
                {"pid": 6, "name": "httpd.server","priority": 1, "burst": 6,  "arrival": 8,  "pages": 4, "files": ["archivo_A.txt", "archivo_B.txt"]},
                {"pid": 7, "name": "docker.img",  "priority": 4, "burst": 8,  "arrival": 10, "pages": 6, "files": ["archivo_E.txt"]},
            ],
            3: [
                # Ejemplo 3: 6 procesos con prioridades polares – ideal para Priority Scheduling
                {"pid": 1, "name": "kernel.sys",  "priority": 1, "burst": 15, "arrival": 0,  "pages": 6, "files": ["archivo_A.txt", "archivo_B.txt"]},
                {"pid": 2, "name": "init.d",      "priority": 2, "burst": 8,  "arrival": 0,  "pages": 3, "files": ["archivo_C.txt"]},
                {"pid": 3, "name": "swap.mem",    "priority": 9, "burst": 4,  "arrival": 1,  "pages": 2, "files": ["archivo_D.txt", "archivo_E.txt"]},
                {"pid": 4, "name": "ls.bin",      "priority": 8, "burst": 5,  "arrival": 3,  "pages": 2, "files": ["archivo_A.txt"]},
                {"pid": 5, "name": "grep.bin",    "priority": 3, "burst": 10, "arrival": 5,  "pages": 4, "files": ["archivo_B.txt", "archivo_C.txt"]},
                {"pid": 6, "name": "redis.cache", "priority": 10,"burst": 6,  "arrival": 7,  "pages": 3, "files": ["archivo_E.txt"]},
            ],
        }

        if example_id not in examples:
            raise ValueError(f"Ejemplo {example_id} no existe. Use 1, 2 o 3.")

        self.processes = []
        self._pid_counter = 1

        for data in examples[example_id]:
            p = Process(
                pid=data["pid"],
                name=data["name"],
                priority=data["priority"],
                burst_time=data["burst"],
                arrival_time=data["arrival"],
                pages_needed=data["pages"],
                files_accessed=data["files"],
            )
            p.state = "NEW"
            self.processes.append(p)
            self._pid_counter = data["pid"] + 1

        example_configs = {1: 3, 2: 4, 3: 3}
        self.config["quantum"] = example_configs.get(example_id, 3)
        self.config["num_processes"] = len(self.processes)
        self.config["total_frames"] = 8

        return self.processes
