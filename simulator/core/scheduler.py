"""
Módulo de planificación de procesos del simulador de sistema operativo.
Implementa los algoritmos Round Robin, SJF y Priority Scheduling (con aging).
"""

import copy
from simulator.models.process import Process


class Scheduler:
    """
    Planificador de procesos con soporte para tres algoritmos.

    Implementa Round Robin (RR), Shortest Job First (SJF) no expropiativo y
    Priority Scheduling expropiativo con envejecimiento (aging) para prevenir
    la inanición de procesos de baja prioridad.

    Atributos:
        quantum (int): Quantum de tiempo para Round Robin.
        last_gantt (list): Último diagrama de Gantt generado.
        last_metrics (list): Últimas métricas por proceso generadas.
        last_averages (dict): Últimos promedios de métricas generados.
    """

    def __init__(self, quantum: int = 3):
        """
        Inicializa el planificador con el quantum dado.

        Args:
            quantum (int): Unidades de tiempo del quantum para Round Robin.
        """
        self.quantum = quantum
        self.last_gantt = []
        self.last_metrics = []
        self.last_averages = {}

    def _deep_copy_processes(self, processes: list[Process]) -> list[Process]:
        """
        Crea copias profundas de los procesos para no modificar los originales.

        Args:
            processes (list[Process]): Lista de procesos originales.

        Returns:
            list[Process]: Lista de copias independientes de los procesos.
        """
        copies = []
        for p in processes:
            pc = Process(
                pid=p.pid,
                name=p.name,
                priority=p.priority,
                burst_time=p.burst_time,
                arrival_time=p.arrival_time,
                pages_needed=p.pages_needed,
                files_accessed=list(p.files_accessed),
            )
            pc.state = "READY"
            copies.append(pc)
        return copies

    def _compute_metrics(self, processes: list[Process]) -> tuple[list, dict]:
        """
        Calcula las métricas finales de planificación para todos los procesos.

        Args:
            processes (list[Process]): Procesos con start_time y finish_time asignados.

        Returns:
            tuple: (lista de métricas por proceso, diccionario de promedios)
        """
        metrics = []
        total_waiting = 0
        total_turnaround = 0
        total_response = 0

        for p in processes:
            wt = p.waiting_time
            tat = p.turnaround_time
            rt = p.response_time if p.response_time >= 0 else 0
            metrics.append({
                "pid": p.pid,
                "name": p.name,
                "waiting_time": wt,
                "turnaround_time": tat,
                "response_time": rt,
                "burst_time": p.burst_time,
                "arrival_time": p.arrival_time,
            })
            total_waiting += wt
            total_turnaround += tat
            total_response += rt

        n = len(processes)
        averages = {
            "avg_waiting": round(total_waiting / n, 2) if n else 0,
            "avg_turnaround": round(total_turnaround / n, 2) if n else 0,
            "avg_response": round(total_response / n, 2) if n else 0,
        }
        return metrics, averages

    # -----------------------------------------------------------------------
    # Round Robin
    # -----------------------------------------------------------------------

    def run_round_robin(self, processes: list[Process], quantum: int = None) -> dict:
        """
        Ejecuta el algoritmo de planificación Round Robin.

        Implementa una cola circular con orden de llegada. Si el proceso no
        termina en el quantum, se devuelve al final de la cola. Es expropiativo.

        Args:
            processes (list[Process]): Lista de procesos a planificar.
            quantum (int | None): Quantum a usar; si es None, usa self.quantum.

        Returns:
            dict: Diccionario con 'gantt_chart', 'metrics' y 'averages'.
        """
        if quantum is None:
            quantum = self.quantum

        procs = self._deep_copy_processes(processes)
        procs.sort(key=lambda p: p.arrival_time)

        time = 0
        queue = []
        gantt = []
        completed = []
        arrived = set()
        remaining = {p.pid: p for p in procs}

        # Agregar procesos que llegan en t=0
        for p in procs:
            if p.arrival_time <= time and p.pid not in arrived:
                queue.append(p)
                arrived.add(p.pid)

        while remaining or queue:
            # Si la cola está vacía pero quedan procesos, avanzar el tiempo
            if not queue:
                next_arrival = min(
                    p.arrival_time for p in procs if p.pid in remaining
                )
                time = next_arrival
                for p in procs:
                    if p.arrival_time <= time and p.pid not in arrived and p.pid in remaining:
                        queue.append(p)
                        arrived.add(p.pid)

            if not queue:
                break

            current = queue.pop(0)
            if current.pid not in remaining:
                continue

            # Registrar tiempo de primera respuesta
            if current.response_time == -1:
                current.response_time = time - current.arrival_time

            # Calcular cuánto ejecuta en este quantum
            exec_time = min(quantum, current.remaining_time)
            start = time
            end = time + exec_time

            gantt.append({
                "pid": current.pid,
                "name": current.name,
                "start": start,
                "end": end,
            })

            current.remaining_time -= exec_time
            time = end

            # Agregar procesos que llegaron durante este quantum
            for p in procs:
                if p.arrival_time <= time and p.pid not in arrived and p.pid in remaining:
                    queue.append(p)
                    arrived.add(p.pid)

            if current.remaining_time == 0:
                # Proceso terminado
                current.finish_time = time
                current.turnaround_time = current.finish_time - current.arrival_time
                current.waiting_time = current.turnaround_time - current.burst_time
                current.state = "TERMINATED"
                del remaining[current.pid]
                completed.append(current)
            else:
                # Vuelve al final de la cola
                queue.append(current)

        metrics, averages = self._compute_metrics(completed)
        self.last_gantt = gantt
        self.last_metrics = metrics
        self.last_averages = averages

        return {"gantt_chart": gantt, "metrics": metrics, "averages": averages}

    # -----------------------------------------------------------------------
    # SJF – Shortest Job First (No expropiativo)
    # -----------------------------------------------------------------------

    def run_sjf(self, processes: list[Process]) -> dict:
        """
        Ejecuta el algoritmo Shortest Job First (SJF) no expropiativo.

        Selecciona el proceso con menor burst_time entre los que han llegado.
        En caso de empate, desempata por arrival_time (el que llegó primero).

        Args:
            processes (list[Process]): Lista de procesos a planificar.

        Returns:
            dict: Diccionario con 'gantt_chart', 'metrics' y 'averages'.
        """
        procs = self._deep_copy_processes(processes)
        remaining = list(procs)
        remaining.sort(key=lambda p: (p.arrival_time, p.burst_time))

        time = 0
        gantt = []
        completed = []

        while remaining:
            # Filtrar procesos que ya llegaron
            available = [p for p in remaining if p.arrival_time <= time]

            if not available:
                # Ningún proceso ha llegado aún; saltar al siguiente
                time = min(p.arrival_time for p in remaining)
                available = [p for p in remaining if p.arrival_time <= time]

            # Seleccionar el de menor burst_time; empate: menor arrival_time
            current = min(available, key=lambda p: (p.burst_time, p.arrival_time))

            # Registrar respuesta
            if current.response_time == -1:
                current.response_time = time - current.arrival_time

            start = time
            end = time + current.burst_time

            gantt.append({
                "pid": current.pid,
                "name": current.name,
                "start": start,
                "end": end,
            })

            time = end
            current.finish_time = time
            current.turnaround_time = time - current.arrival_time
            current.waiting_time = current.turnaround_time - current.burst_time
            current.state = "TERMINATED"
            remaining.remove(current)
            completed.append(current)

        metrics, averages = self._compute_metrics(completed)
        self.last_gantt = gantt
        self.last_metrics = metrics
        self.last_averages = averages

        return {"gantt_chart": gantt, "metrics": metrics, "averages": averages}

    # -----------------------------------------------------------------------
    # Priority Scheduling (Expropiativo con Aging)
    # -----------------------------------------------------------------------

    def run_priority(self, processes: list[Process]) -> dict:
        """
        Ejecuta el algoritmo de Planificación por Prioridad expropiativo con aging.

        Si llega un proceso con mayor prioridad (número menor), desaloja al actual.
        El aging evita la inanición: cada 5 unidades sin ejecutarse, la prioridad
        dinámica del proceso mejora en 1 (el número disminuye en 1, mínimo 1).

        Args:
            processes (list[Process]): Lista de procesos a planificar.

        Returns:
            dict: Diccionario con 'gantt_chart', 'metrics' y 'averages'.
        """
        procs = self._deep_copy_processes(processes)
        for p in procs:
            p.current_priority = p.priority
            p.last_run_time = p.arrival_time  # Para calcular espera sin CPU

        remaining = {p.pid: p for p in procs}
        ready_queue = []
        time = 0
        gantt = []
        completed = []
        arrived_pids = set()
        AGING_INTERVAL = 5

        # Inicializar cola con procesos que llegan en t=0
        for p in procs:
            if p.arrival_time <= time:
                ready_queue.append(p)
                arrived_pids.add(p.pid)

        current_proc = None

        while remaining:
            # Agregar nuevos procesos que hayan llegado
            for p in procs:
                if p.arrival_time <= time and p.pid not in arrived_pids and p.pid in remaining:
                    ready_queue.append(p)
                    arrived_pids.add(p.pid)

            # Aplicar aging a procesos en cola
            for p in ready_queue:
                if p.last_run_time >= 0:
                    wait = time - p.last_run_time
                    if wait >= AGING_INTERVAL:
                        boost = wait // AGING_INTERVAL
                        p.current_priority = max(1, p.current_priority - boost)

            # Si no hay procesos en cola, avanzar al siguiente evento
            if not ready_queue:
                if not remaining:
                    break
                next_arrival = min(
                    p.arrival_time for p in procs if p.pid in remaining and p.pid not in arrived_pids
                )
                if next_arrival <= time:
                    time += 1
                else:
                    time = next_arrival
                continue

            # Seleccionar el de mayor prioridad (número menor); empate: menor arrival_time
            best = min(ready_queue, key=lambda p: (p.current_priority, p.arrival_time))

            # Verificar si hay expropiación
            if current_proc and current_proc.pid in remaining:
                if best.pid != current_proc.pid:
                    # Expropiación
                    current_proc.last_run_time = time
                    current_proc = best
                    ready_queue.remove(best)
                    ready_queue.append(current_proc)  # Reencolar el anterior (si aplica)
                    # Reorganizar para que current_proc sea el que se ejecuta
                    if best in ready_queue:
                        ready_queue.remove(best)
                    current_proc = best
            else:
                if best in ready_queue:
                    ready_queue.remove(best)
                current_proc = best

            if current_proc is None:
                time += 1
                continue

            # Registrar tiempo de primera respuesta
            if current_proc.response_time == -1:
                current_proc.response_time = time - current_proc.arrival_time

            # Ejecutar 1 unidad de tiempo
            start = time
            time += 1
            current_proc.remaining_time -= 1
            current_proc.last_run_time = time

            # Agregar nuevos procesos que llegaron en esta unidad
            for p in procs:
                if p.arrival_time <= time and p.pid not in arrived_pids and p.pid in remaining:
                    ready_queue.append(p)
                    arrived_pids.add(p.pid)

            # Registrar en Gantt (fusionar con entrada anterior si es el mismo proceso)
            if gantt and gantt[-1]["pid"] == current_proc.pid and gantt[-1]["end"] == start:
                gantt[-1]["end"] = time
            else:
                gantt.append({
                    "pid": current_proc.pid,
                    "name": current_proc.name,
                    "start": start,
                    "end": time,
                })

            if current_proc.remaining_time == 0:
                current_proc.finish_time = time
                current_proc.turnaround_time = time - current_proc.arrival_time
                current_proc.waiting_time = current_proc.turnaround_time - current_proc.burst_time
                current_proc.state = "TERMINATED"
                del remaining[current_proc.pid]
                completed.append(current_proc)
                current_proc = None

        metrics, averages = self._compute_metrics(completed)
        self.last_gantt = gantt
        self.last_metrics = metrics
        self.last_averages = averages

        return {"gantt_chart": gantt, "metrics": metrics, "averages": averages}

    def run(self, algorithm: str, processes: list[Process], quantum: int = None) -> dict:
        """
        Despacha la ejecución al algoritmo de planificación correspondiente.

        Args:
            algorithm (str): Nombre del algoritmo ("RR", "SJF" o "PRIORITY").
            processes (list[Process]): Lista de procesos a planificar.
            quantum (int | None): Quantum para Round Robin.

        Returns:
            dict: Resultado del algoritmo seleccionado.

        Raises:
            ValueError: Si el nombre del algoritmo no es reconocido.
        """
        if algorithm == "RR":
            return self.run_round_robin(processes, quantum)
        elif algorithm == "SJF":
            return self.run_sjf(processes)
        elif algorithm == "PRIORITY":
            return self.run_priority(processes)
        else:
            raise ValueError(f"Algoritmo desconocido: '{algorithm}'. Use RR, SJF o PRIORITY.")
