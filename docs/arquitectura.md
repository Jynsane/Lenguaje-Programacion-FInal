# Arquitectura del Sistema

## Descripción General

Sistema experto de diagnóstico de enfermedades basado en síntomas, implementado con arquitectura multilenguaje:

| Lenguaje | Rol |
|----------|-----|
| **Scala** | Lógica principal, validación, UI de consola |
| **Prolog** | Motor de inferencia lógica (reglas médicas) |
| **Python** | Integración y procesamiento de datos *(pendiente)* |

## Diagrama de Componentes

```
┌─────────────────────────────────────────────┐
│                  SCALA                       │
│                                             │
│  Main.scala                                 │
│    └── menuPrincipal()                      │
│    └── flujoNuevoDiagnostico()              │
│    └── ejecutarCasosPrueba()                │
│                                             │
│  ServicioDiagnostico                        │
│    └── validarSintomas()                    │
│    └── diagnosticar()                       │
│    └── esUrgente()                          │
│                                             │
│  ServicioPrologBridge                       │
│    └── consultarProlog()  ──────────────────┼──▶ SWI-Prolog
│    └── parsearDiagnosticos()                │
│                                             │
│  Modelos: Paciente, ResultadoDiagnostico    │
└─────────────────────────────────────────────┘
                    │
                    ▼ proceso externo
┌─────────────────────────────────────────────┐
│                  PROLOG                      │
│                                             │
│  hechos.pl  — síntomas y enfermedades       │
│  reglas.pl  — reglas de diagnóstico         │
│  consultas.pl — punto de entrada            │
└─────────────────────────────────────────────┘
```

## Enfermedades diagnosticables

1. Gripe
2. Resfriado común
3. COVID-19
4. Dengue
5. Gastroenteritis
6. Neumonía
7. Amigdalitis
8. Tuberculosis

## Evaluación de urgencia

El sistema marca como **URGENTE** si el paciente presenta:
- Dificultad para respirar
- Dolor de pecho

## Cómo ejecutar la demo (Scala + Prolog)

Requisitos:
- `sbt` instalado (para compilar/ejecutar Scala)
- `SWI-Prolog` instalado y `swipl` en el `PATH`

Desde la carpeta `scala` ejecutar:

```bash
cd scala
sbt run
```

En el menú interactivo:
- `3`: Ejecuta 20 casos de prueba incluidos en la app (consola)
- `4`: Procesa `data/entrada/pacientes_ampliados.json` y escribe resultados en `data/salida/resultados_ampliados.json`

El puente Scala↔Prolog invoca `swipl -s ../prolog/consultas.pl -g "obtener_diagnosticos(...), write(D), nl, halt"` desde la carpeta `scala`.

## Ejemplo de salida (parcial)

Archivo generado: `data/salida/resultados_ampliados.json`

Ejemplo (objetos JSON por paciente):

```json
{
    "nombre": "Ana García",
    "edad": 28,
    "sintomas": ["fiebre", "dolor_muscular", "fatiga", "escalofrios"],
    "enfermedades": ["gripe"],
    "esUrgente": false
}
```

Nota: Las inferencias son simplificadas y con fines académicos; no sustituyen consejo médico.
