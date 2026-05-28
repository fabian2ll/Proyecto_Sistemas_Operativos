# SimuladorOS — UPTC Sistemas Operativos

Simulador académico completo de sistema operativo para el curso de **Sistemas Operativos** en la **UPTC**. Implementa los cuatro módulos fundamentales de un OS: gestión de procesos, planificación de CPU, gestión de memoria y acceso concurrente a archivos.

---

## 🏗️ Arquitectura

```
sistemas operativos/
├── simulator/                  # Backend Flask (Python 3.11+)
│   ├── main.py                 # Entry point — puerto 5000
│   ├── api/
│   │   └── routes.py           # Endpoints REST
│   ├── core/
│   │   ├── process_manager.py  # Creación y gestión de procesos (PCB)
│   │   ├── scheduler.py        # Round Robin, SJF, Priority + Aging
│   │   ├── memory_manager.py   # Paginación por demanda + LRU
│   │   └── file_manager.py     # Acceso concurrente con threading.Lock
│   └── models/
│       ├── process.py          # Clase PCB (Bloque de Control de Proceso)
│       ├── page.py             # Clases Page y Frame
│       └── file_resource.py    # Clase FileResource con Lock
├── frontend/                   # Frontend Next.js 14 (puerto 3000)
│   ├── app/
│   │   ├── page.tsx            # Dashboard principal
│   │   ├── scheduler/page.tsx  # Vista de planificación
│   │   ├── memory/page.tsx     # Vista de memoria
│   │   └── files/page.tsx      # Vista de archivos
│   └── components/
│       ├── Sidebar.tsx         # Navegación lateral
│       ├── ProcessTable.tsx    # Tabla de procesos
│       ├── GanttChart.tsx      # Diagrama de Gantt interactivo
│       ├── MemoryGrid.tsx      # Grid de marcos de memoria
│       └── FileLog.tsx         # Log de acceso a archivos
├── requirements.txt
└── README.md
```

---

## ⚡ Instalación y Ejecución

### Prerrequisitos

- **Python 3.11+** (`python --version`)
- **Node.js 18+** y **npm** (`node --version`)

### 1. Backend (Flask)

```bash
# Desde la raíz del proyecto
pip install -r requirements.txt

# Ejecutar el servidor
python -m simulator.main
```

El backend estará disponible en: `http://localhost:5000`

### 2. Frontend (Next.js)

```bash
# En una nueva terminal, entrar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:3000`

---

## 🔌 API REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/simulation/setup` | Configura la simulación y genera procesos |
| `POST` | `/api/simulation/run` | Ejecuta la simulación con el algoritmo seleccionado |
| `GET`  | `/api/simulation/state` | Obtiene el estado actual completo |
| `POST` | `/api/simulation/reset` | Reinicia la simulación |
| `GET`  | `/api/simulation/examples` | Retorna los 3 conjuntos de ejemplo |
| `POST` | `/api/simulation/load-example/<id>` | Carga el ejemplo 1, 2 o 3 |

### Ejemplo de uso con curl

```bash
# Configurar simulación con 8 procesos
curl -X POST http://localhost:5000/api/simulation/setup \
  -H "Content-Type: application/json" \
  -d '{"num_processes": 8, "quantum": 3, "total_frames": 8}'

# Ejecutar con Round Robin
curl -X POST http://localhost:5000/api/simulation/run \
  -H "Content-Type: application/json" \
  -d '{"algorithm": "RR"}'
```

---

## 📦 Módulos del Simulador

### Módulo 1: Gestión de Procesos
- Crea N procesos con atributos aleatorios (PCB completo)
- Atributos: PID, nombre, prioridad (1–10), burst time, arrival time, páginas, archivos
- 3 conjuntos de datos de prueba predefinidos

### Módulo 2: Planificación de CPU
- **Round Robin**: Cola circular con quantum configurable, expropiativo
- **SJF**: Shortest Job First no expropiativo, desempate por arrival time  
- **Priority Scheduling**: Expropiativo + **aging** (cada 5 u.t. sin CPU, prioridad mejora en 1)
- Salida: diagrama de Gantt, métricas por proceso, promedios

### Módulo 3: Gestión de Memoria
- Paginación por demanda (las páginas se cargan solo cuando el proceso ejecuta)
- Reemplazo **LRU** cuando no hay marcos libres
- Estadísticas: page faults, historial de reemplazos, uso de frames

### Módulo 4: Acceso Concurrente a Archivos
- 5 archivos simulados: `archivo_A.txt` ... `archivo_E.txt`
- Accesos simultáneos con `threading.Thread` reales
- Control de exclusión mutua con `threading.Lock`
- Log detallado: timestamp, PID, acción, estado, tiempo de espera en ms

---

## 🎨 Interfaz de Usuario

- **Dashboard** (`/`): Configuración, generación de procesos, selección de algoritmo
- **Planificación** (`/scheduler`): Diagrama de Gantt interactivo + métricas detalladas
- **Memoria** (`/memory`): Grid visual de marcos + historial de reemplazos LRU
- **Archivos** (`/files`): Log de accesos con filas WAITING resaltadas

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | Python 3.11, Flask 3.0, flask-cors |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Concurrencia | threading (Python stdlib) |
| Estado | En memoria (sin base de datos) |

---

## 📋 Datos de Prueba

El endpoint `GET /api/simulation/examples` retorna 3 conjuntos:

1. **Ejemplo 1** — 5 procesos, ideal para **Round Robin** (quantum=3)
2. **Ejemplo 2** — 7 procesos, ideal para **SJF** (llegadas dispersas)
3. **Ejemplo 3** — 6 procesos, ideal para **Priority Scheduling** (prioridades polares)

---

*Proyecto académico — Sistemas Operativos — UPTC 2024*
