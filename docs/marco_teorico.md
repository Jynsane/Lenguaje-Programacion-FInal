# Marco Teórico

El sistema de diagnóstico médico de este proyecto utiliza un enfoque híbrido de Inteligencia Artificial conocido como **IA Neuro-Simbólica**. Este paradigma busca unir la robustez del razonamiento deductivo estructurado con la flexibilidad del aprendizaje inductivo estadístico.

## 1. Motor de Inferencia Lógica (Prolog - Enfoque Simbólico)

El motor lógico está programado en **Prolog** (Programming in Logic), un lenguaje declarativo basado en la lógica de primer orden (cláusulas de Horn).

- **Hechos:** Representan el conocimiento fundamental o aserciones sobre el mundo clínico. Por ejemplo, `sintoma_de(fiebre, gripe)` establece que la fiebre es un síntoma asociado a la gripe.
- **Reglas:** Permiten inferir nueva información a partir de los hechos y la entrada del usuario. Mediante la unificación y el backtracking (búsqueda con retroceso), Prolog evalúa si se cumple el criterio lógico completo.
- **Ventaja Clínica:** Explicabilidad absoluta. Si Prolog diagnostica una enfermedad, se puede rastrear la regla exacta y los hechos que se cumplieron para generar el diagnóstico.

## 2. Clasificador de Machine Learning (Python - Enfoque Estadístico)

El componente estadístico está desarrollado en **Python** utilizando **Random Forest (Bosques Aleatorios)** de la librería `scikit-learn`.

- **Random Forest:** Es un algoritmo de aprendizaje supervisado basado en ensamblados de Árboles de Decisión. Combina múltiples árboles individuales entrenados en diferentes subdivisiones de datos (bootstrapping y feature bagging).
- **Flexibilidad:** A diferencia de Prolog, que requiere que todas las condiciones lógicas se cumplan rígidamente (evaluaciones booleanas de verdadero/falso), el clasificador de ML calcula una estimación probabilística. Si faltan síntomas clave o hay ruido (por ejemplo, errores en la transcripción de síntomas o síntomas no directamente cubiertos por las reglas estrictas), Random Forest puede aproximar la probabilidad del diagnóstico basándose en patrones históricos.
- **NLP (Procesamiento de Lenguaje Natural):** Permite procesar texto libre redactado por el usuario usando sinónimos y aproximación difusa (distancia de Levenshtein / SequenceMatcher) para deducir qué síntomas padece y traducirlos al vector binario que espera el modelo.

## 3. Integración Neuro-Simbólica (Scala - Consolidación)

Scala actúa como el integrador y coordinador del flujo.
- Invoca a Prolog de forma nativa/proceso de sistema para obtener la lista de diagnósticos deductivos válidos.
- Invoca el microservicio de Python vía REST API para obtener las probabilidades estimadas por ML.
- Realiza una **fusión por consenso**: una enfermedad se incluye en el diagnóstico final si la lógica determinista la valida o si el modelo probabilístico tiene un alto grado de certeza (por ejemplo, $\ge 50\%$).
