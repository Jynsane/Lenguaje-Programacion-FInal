# Introducción al Sistema Experto de Diagnóstico de Enfermedades

Este proyecto es un prototipo académico de un sistema experto de diagnóstico médico que implementa una arquitectura híbrida, combinando la precisión rigurosa de la inferencia lógica (motor de Prolog) con la flexibilidad predictiva del aprendizaje automático (Machine Learning en Python), todo coordinado y expuesto a través de una aplicación web y de consola desarrollada en Scala.

## Propósito del Proyecto

El principal objetivo de este sistema es demostrar la viabilidad y los beneficios de los enfoques **neuro-simbólicos**:
1. **Enfoque Simbólico (Prolog):** Permite modelar el conocimiento clínico explícito dictado por expertos (hechos y reglas). Si un paciente presenta un conjunto específico de síntomas patognomónicos, el motor lógico puede deducir la presencia de la enfermedad de manera determinista y con explicabilidad directa.
2. **Enfoque Conexión/Estadístico (Python - Machine Learning):** Permite lidiar con la incertidumbre, el ruido en los datos de entrada y errores de tipografía, calculando probabilidades estadísticas basadas en el patrón general de síntomas reportados.

## Objetivos Específicos
- Desarrollar un motor de inferencia en Prolog capaz de diagnosticar enfermedades basadas en sus síntomas característicos.
- Diseñar un clasificador de Machine Learning en Python (Random Forest) entrenado con datos sintéticos que estime la probabilidad de padecer dichas enfermedades.
- Implementar un Gateway/Controlador en Scala Cask que orqueste las llamadas a ambos subsistemas y exponga una interfaz amigable.
- Proveer una interfaz gráfica web responsiva e intuitiva para que los usuarios interactúen con el sistema experto.
