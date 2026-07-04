# Comunicación Scala ↔ Python

La integración entre el API Gateway de Scala (Cask) y el microservicio de Python (FastAPI) se realiza mediante **peticiones HTTP REST** con formato de carga útil en **JSON**.

## Arquitectura de la Comunicación

```
┌────────────────────────────────┐                 ┌────────────────────────────────┐
│          SCALA (Cask)          │                 │        PYTHON (FastAPI)        │
│                                │                 │                                │
│   ServicioPythonClient         │                 │   src/main.py                  │
│     ├── analizarTexto(texto) ──┼─── HTTP POST ──▶┼─── /analizar-texto             │
│     └── predecirML(sintomas)  ──┼─── HTTP POST ──▶┼─── /predecir-ml              │
│                                │                 │                                │
│   Main.scala                   │                 │                                │
│     └── postGenerarPdf(req)    ──┼─── HTTP POST ──▶┼─── /generar-pdf              │
└────────────────────────────────┘                 └────────────────────────────────┘
```

## Endpoints Consumidos

### 1. Extracción de Síntomas (NLP)
- **Ruta:** `/analizar-texto`
- **Método:** `POST`
- **Request Body:**
  ```json
  { "texto": "Paciente refiere que tiene fiebre muy alta y tos con flema" }
  ```
- **Response Body:**
  ```json
  { "sintomas": ["fiebre", "tos_con_esputo"] }
  ```

### 2. Predicción de Machine Learning
- **Ruta:** `/predecir-ml`
- **Método:** `POST`
- **Request Body:**
  ```json
  { "sintomas": ["fiebre", "tos_con_esputo"] }
  ```
- **Response Body (Top 3 predicciones):**
  ```json
  {
    "predicciones": [
      { "enfermedad": "otitis", "probabilidad": 75.3 },
      { "enfermedad": "neumonia", "probabilidad": 12.5 }
    ]
  }
  ```

### 3. Generación de Reporte PDF
- **Ruta:** `/generar-pdf`
- **Método:** `POST`
- **Request Body:**
  ```json
  {
    "nombre": "Ana García",
    "edad": 28,
    "sintomas": ["fiebre", "fatiga"],
    "diagnosticos_prolog": ["gripe"],
    "diagnosticos_ml": [{"enfermedad": "gripe", "probabilidad": 92.4}],
    "es_urgente": false
  }
  ```
- **Response:** Streaming de archivo PDF binario (`application/pdf`). Scala actúa como un proxy inverso y reenvía los bytes directamente al frontend.
