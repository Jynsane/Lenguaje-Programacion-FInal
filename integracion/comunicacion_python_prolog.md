# Relación e Integración Python ↔ Prolog

Aunque en la ejecución en caliente del sistema **Python (FastAPI)** y **Prolog (SWI-Prolog)** no se comunican de forma directa mediante red o llamadas de proceso, están estrechamente vinculados en términos de **alineación del modelo de datos** e **intercambio del conocimiento clínico**.

## 1. Alineación Semántica
Ambos subsistemas comparten la misma definición estandarizada de términos médicos:
- **Síntomas:** Ambos identifican los síntomas usando exactamente los mismos identificadores snake_case (ej. `dificultad_para_respirar`, `perdida_de_olfato`, `tos_con_esputo`).
- **Enfermedades:** Comparten el mapeo de nombres de enfermedades comunes (ej. `covid19`, `resfriado_comun`, `gastroenteritis`).

## 2. Generación del Dataset (Destilación de Conocimiento Lógico a Estadístico)
El clasificador de Machine Learning en Python requiere datos para entrenar el modelo. Dado que no se dispone de un dataset clínico real de acceso público alineado a estos síntomas, se utiliza el conocimiento de Prolog para generar datos sintéticos:

- El script `python/src/utils/generate_dataset.py` lee implícitamente las reglas clínicas definidas en Prolog (`reglas.pl` y `hechos.pl`).
- Codifica las reglas lógicas en una matriz de probabilidades de ocurrencia:
  - Si un síntoma es clave para la enfermedad (según la regla Prolog), se le asigna un $90\%$ de probabilidad de aparecer en los registros sintéticos de esa enfermedad.
  - Para los síntomas no relacionados, se inyecta un $5\%$-$15\%$ de probabilidad a modo de ruido/incertidumbre.
- Esto permite que el modelo de Machine Learning (Random Forest) aprenda a generalizar la lógica booleana y rígida de Prolog en un modelo continuo y probabilístico.

## 3. Consenso Neuro-Simbólico en Scala
El puente final se realiza en el API Gateway en Scala (`ServicioDiagnostico`):
1. **Prolog** aporta el diagnóstico deductivo con base en reglas estrictas (100% de coincidencia de condiciones).
2. **Python (ML)** aporta el diagnóstico inductivo y probabilístico, capaz de tolerar omisiones de síntomas secundarios o ruidos.
3. Scala unifica ambos vectores en la clase `ResultadoDiagnostico` para generar el veredicto final.
