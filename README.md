# Sistema Experto de Diagnóstico de Enfermedades

> Sistema neuro-simbólico multilenguaje (Scala + Prolog + Python) para diagnóstico médico basado en síntomas.

##Descripción

Este sistema experto recibe síntomas de un paciente y utiliza un motor de inferencia lógica en **Prolog** para determinar posibles enfermedades con base en reglas clínicas. Adicionalmente, cuenta con un microservicio en **Python (FastAPI)** que utiliza **Machine Learning** (Random Forest) para calcular probabilidades y procesar texto libre (NLP). La lógica principal, la consolidación neuro-simbólica y el servidor web (Cask) están implementados en **Scala**.

##Estructura del Proyecto

```
diagnostico-enfermedades/
│
├── docs/
│   ├── introduccion.md          ← Introducción del proyecto
│   ├── marco_teorico.md         ← Conceptos de Prolog, ML e IA Híbrida
│   ├── arquitectura.md          ← Diseño de componentes y flujos
│   └── conclusiones.md          ← Conclusiones del prototipo
│
├── scala/
│   ├── build.sbt                ← Configuración del proyecto Scala
│   └── src/main/scala/app/
│       ├── Main.scala           ← Punto de entrada (Cask Web server)
│       ├── modelos/
│       │   └── Modelos.scala    ← Clases Paciente y ResultadoDiagnostico
│       └── servicios/
│           ├── ServicioDiagnostico.scala     ← Coordinador de diagnóstico
│           ├── ServicioPrologBridge.scala    ← Comunicación con SWI-Prolog
│           └── ServicioPythonClient.scala    ← Cliente HTTP REST para Python
│
├── prolog/
│   ├── hechos.pl                ← Síntomas y enfermedades
│   ├── reglas.pl                ← Reglas de diagnóstico
│   └── consultas.pl             ← Punto de entrada Prolog + consultas
│
├── python/
│   ├── requirements.txt         ← Librerías de Python
│   ├── dataset.csv              ← Dataset sintético de entrenamiento
│   ├── modelo_diagnostico.joblib  ← Modelo RandomForest guardado
│   ├── columnas_sintomas.joblib   ← Columnas de síntomas guardadas
│   └── src/
│       ├── main.py              ← API FastAPI (NLP, ML, PDF)
│       └── utils/
│           ├── generate_dataset.py ← Generación de dataset sintético
│           └── train_model.py      ← Entrenamiento del modelo ML
│
├── integracion/
│   ├── comunicacion_scala_python.md  ← Protocolo HTTP REST
│   └── comunicacion_python_prolog.md  ← Relación semántica e integración
│
├── data/
│   ├── entrada/                 ← Datos de pacientes de prueba JSON
│   └── salida/                  ← Resultados generados
│
├── web/                         ← Interfaz web frontend (HTML/CSS/JS)
├── README.md                    ← Guía del proyecto
└── LICENSE                      ← Licencia del proyecto
```

## ⚙️ Requisitos

| Herramienta | Versión mínima |
|-------------|---------------|
| JDK         | 11+           |
| Scala       | 3.3.x         |
| sbt         | 1.9+          |
| SWI-Prolog  | 8.x           |
| Python      | 3.8+          |

##Cómo ejecutar

### 1. Entorno de Python (Microservicio de IA)
Desde la carpeta raíz del proyecto, ingresa a `python/`, instala los requerimientos y ejecuta el servidor FastAPI:
```bash
cd python
pip install -r requirements.txt
uvicorn src.main:app --host localhost --port 8000 --reload
```
*El microservicio estará disponible en `http://localhost:8000/health`.*

### 2. Entorno de Scala & Frontend (Servidor Web)
Desde la carpeta raíz del proyecto, ingresa a `scala/` y compila/ejecuta la aplicación:
```bash
cd scala
sbt run
```
*El frontend interactivo estará disponible en `http://localhost:8080`.*

### 3. Ejecutar solo Prolog (Consola interactiva)
```bash
cd prolog
swipl -s consultas.pl
```

## Enfermedades diagnosticables

El sistema evalúa 15 enfermedades (como Gripe, COVID-19, Dengue, Gastroenteritis, Neumonía, Amigdalitis, Tuberculosis, Sinusitis, Otitis, Migraña, Asma, Bronquitis, Infección Urinaria y Varicela) en base a su espectro de síntomas y reglas deterministas de Prolog complementadas por la probabilidad de Machine Learning.

## Aviso

Este sistema es de carácter **académico** y **no reemplaza** el consejo o diagnóstico médico profesional.
