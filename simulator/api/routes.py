"""
Módulo de rutas REST de la API del simulador de sistema operativo.
Define todos los endpoints para comunicación con el frontend Next.js.
"""

from flask import Blueprint, jsonify, request
from simulator.core.process_manager import ProcessManager
from simulator.core.scheduler import Scheduler
from simulator.core.memory_manager import MemoryManager
from simulator.core.file_manager import FileManager

api_bp = Blueprint("api", __name__)

# ── Estado global de la simulación (en memoria) ──────────────────────────────
process_manager = ProcessManager()
scheduler = Scheduler()
memory_manager = MemoryManager()
file_manager = FileManager()

# Resultado más reciente de la simulación
_last_result: dict = {}


# ── Endpoints ─────────────────────────────────────────────────────────────────

@api_bp.route("/simulation/setup", methods=["POST"])
def setup_simulation():
    """
    Configura la simulación y genera los procesos aleatorios.

    Body JSON esperado:
        num_processes (int): Número de procesos a generar (5–20).
        quantum (int): Quantum para Round Robin (1–10).
        total_frames (int): Número de marcos de memoria (4–16).

    Returns:
        JSON: Lista de procesos generados con todos sus atributos.
        400: Si faltan parámetros o los valores están fuera de rango.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Se requiere un cuerpo JSON"}), 400

    num_processes = data.get("num_processes", 8)
    quantum = data.get("quantum", 3)
    total_frames = data.get("total_frames", 8)

    # Validaciones
    if not (5 <= num_processes <= 20):
        return jsonify({"error": "num_processes debe estar entre 5 y 20"}), 400
    if not (1 <= quantum <= 10):
        return jsonify({"error": "quantum debe estar entre 1 y 10"}), 400
    if not (4 <= total_frames <= 16):
        return jsonify({"error": "total_frames debe estar entre 4 y 16"}), 400

    processes = process_manager.create_processes(num_processes, quantum, total_frames)
    memory_manager.reset(total_frames)
    scheduler.quantum = quantum

    return jsonify({
        "processes": [p.to_dict() for p in processes],
        "config": process_manager.get_config(),
    }), 200


@api_bp.route("/simulation/run", methods=["POST"])
def run_simulation():
    """
    Ejecuta la simulación completa con el algoritmo de planificación seleccionado.

    Body JSON esperado:
        algorithm (str): Algoritmo a usar ("RR", "SJF" o "PRIORITY").

    Returns:
        JSON: Resultado con gantt_chart, metrics, averages, memory_state y file_log.
        400: Si el algoritmo no es válido o no hay procesos configurados.
        500: Si ocurre un error interno durante la simulación.
    """
    global _last_result

    data = request.get_json()
    if not data:
        return jsonify({"error": "Se requiere un cuerpo JSON"}), 400

    algorithm = data.get("algorithm", "RR").upper()
    if algorithm not in ("RR", "SJF", "PRIORITY"):
        return jsonify({"error": "Algoritmo debe ser RR, SJF o PRIORITY"}), 400

    processes = process_manager.get_process_objects()
    if not processes:
        return jsonify({"error": "No hay procesos configurados. Llame primero a /setup"}), 400

    try:
        config = process_manager.get_config()
        quantum = config.get("quantum", 3)

        # 1. Planificación
        scheduling_result = scheduler.run(algorithm, processes, quantum)

        # 2. Memoria: simular basándose en el Gantt generado
        total_frames = config.get("total_frames", 8)
        memory_manager.reset(total_frames)
        memory_state = memory_manager.simulate_from_gantt(
            scheduling_result["gantt_chart"], processes
        )

        # 3. Archivos: acceso concurrente real con threads
        file_log = file_manager.run_simulation(processes)

        _last_result = {
            "algorithm": algorithm,
            "gantt_chart": scheduling_result["gantt_chart"],
            "metrics": scheduling_result["metrics"],
            "averages": scheduling_result["averages"],
            "memory_state": memory_state,
            "file_log": file_log,
            "config": config,
        }

        return jsonify(_last_result), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


@api_bp.route("/simulation/state", methods=["GET"])
def get_simulation_state():
    """
    Retorna el estado actual completo de la simulación.

    Returns:
        JSON: Estado con procesos, configuración y último resultado de simulación.
    """
    return jsonify({
        "processes": process_manager.get_processes(),
        "config": process_manager.get_config(),
        "memory_state": memory_manager.get_state(),
        "last_result": _last_result,
        "has_simulation": bool(_last_result),
    }), 200


@api_bp.route("/simulation/reset", methods=["POST"])
def reset_simulation():
    """
    Reinicia completamente el estado de la simulación.

    Returns:
        JSON: Mensaje de confirmación del reset.
    """
    global _last_result
    process_manager.reset()
    memory_manager.reset()
    file_manager.reset()
    _last_result = {}
    return jsonify({"message": "Simulación reiniciada correctamente", "status": "ok"}), 200


@api_bp.route("/simulation/examples", methods=["GET"])
def get_examples():
    """
    Retorna los tres conjuntos de procesos de ejemplo predefinidos.

    Los ejemplos son datos hardcodeados reproducibles, ideales para
    demostrar el simulador en presentaciones universitarias.

    Returns:
        JSON: Lista con los tres conjuntos de ejemplo y sus metadatos.
    """
    examples = []
    descriptions = {
        1: "5 procesos mixtos — ideal para demostrar Round Robin",
        2: "7 procesos con llegadas dispersas — ideal para SJF",
        3: "6 procesos con prioridades polares — ideal para Priority Scheduling",
    }
    recommended_algorithms = {
        1: "RR",
        2: "SJF",
        3: "PRIORITY",
    }

    for example_id in [1, 2, 3]:
        procs = process_manager.load_example_set(example_id)
        examples.append({
            "id": example_id,
            "description": descriptions[example_id],
            "recommended_algorithm": recommended_algorithms[example_id],
            "processes": [p.to_dict() for p in procs],
            "num_processes": len(procs),
        })

    # Resetear después de cargar ejemplos
    process_manager.reset()

    return jsonify({"examples": examples}), 200


@api_bp.route("/simulation/load-example/<int:example_id>", methods=["POST"])
def load_example(example_id: int):
    """
    Carga un conjunto de ejemplo específico como estado activo de la simulación.

    Args:
        example_id (int): ID del ejemplo a cargar (1, 2 o 3).

    Returns:
        JSON: Lista de procesos cargados y configuración.
        400: Si el ID de ejemplo no es válido.
    """
    try:
        procs = process_manager.load_example_set(example_id)
        config = process_manager.get_config()
        memory_manager.reset(config.get("total_frames", 8))
        scheduler.quantum = config.get("quantum", 3)
        return jsonify({
            "processes": [p.to_dict() for p in procs],
            "config": config,
            "message": f"Ejemplo {example_id} cargado correctamente",
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
