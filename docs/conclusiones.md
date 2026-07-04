# Conclusiones

La implementación de este sistema experto neuro-simbólico de diagnóstico médico permite extraer las siguientes conclusiones:

1. **Sinergia Neuro-Simbólica:** La combinación de la rigidez basada en reglas (Prolog) y la flexibilidad del Machine Learning (Python) compensa las debilidades individuales de cada enfoque. Mientras Prolog ofrece un diagnóstico determinista con explicabilidad directa y sin falsos positivos por azar, Python rescata casos con entradas ruidosas, datos incompletos o variaciones lingüísticas complejas.

2. **Desacoplamiento y Multilenguaje:** El diseño modular (Scala para control y UI, Python para IA/NLP, y Prolog para inferencia lógica) demuestra que es posible integrar de manera limpia diferentes paradigmas de programación (funcional/orientado a objetos, imperativo y lógico) utilizando protocolos de comunicación ligeros (REST HTTP y subprocesos del sistema).

3. **Explicabilidad y Seguridad:** En entornos médicos, la explicabilidad es crítica. Este sistema permite contrastar las sugerencias estadísticas del modelo probabilístico contra las verdades clínicas codificadas en el motor lógico. La existencia de un estado de consenso ("Alta Sospecha (Validado)") proporciona a los profesionales médicos y usuarios una base de confianza al comprobar que el diagnóstico estadístico cumple con las directrices de las reglas de negocio establecidas.

4. **Escalabilidad Futura:** La arquitectura permite agregar nuevas enfermedades de manera independiente:
   - En Prolog, agregando nuevos hechos en `hechos.pl` y reglas de inferencia en `reglas.pl`.
   - En Python, modificando las reglas de generación en `generate_dataset.py`, regenerando el dataset y reentrenando el modelo de manera transparente sin alterar el API Gateway de Scala.
