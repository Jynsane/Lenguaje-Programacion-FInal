package app.servicios

import app.modelos.{Paciente, ResultadoDiagnostico}

/**
 * Servicio principal de diagnóstico.
 * Coordina la validación de síntomas, la consulta a Prolog
 * y la evaluación de urgencia.
 */
object ServicioDiagnostico {

  // Síntomas que indican urgencia médica
  private val sintomasUrgentes = Set(
    "dificultad_para_respirar",
    "dolor_de_pecho"
  )

  // Lista de síntomas válidos (debe coincidir con hechos.pl)
  private val sintomasValidos = Set(
    "fiebre", "tos", "dolor_de_garganta", "congestion_nasal",
    "dolor_de_cabeza", "fatiga", "dolor_muscular", "escalofrios",
    "nauseas", "vomitos", "diarrea", "dolor_abdominal",
    "perdida_de_olfato", "perdida_de_gusto", "dificultad_para_respirar",
    "erupcion_cutanea", "dolor_de_pecho", "mareos",
    "sudoracion_nocturna", "perdida_de_peso",
    // nuevos
    "dolor_de_oido", "disuria", "dolor_facial", "tos_con_esputo", "perdida_de_apetito"
  )

  /**
   * Valida los síntomas ingresados contra la lista oficial.
   * @return Left con síntomas inválidos, Right con síntomas válidos
   */
  def validarSintomas(sintomas: List[String]): Either[List[String], List[String]] = {
    val invalidos = sintomas.filterNot(sintomasValidos.contains)
    if (invalidos.nonEmpty) Left(invalidos)
    else Right(sintomas)
  }

  /**
   * Evalúa si el caso del paciente requiere atención urgente.
   */
  def esUrgente(sintomas: List[String]): Boolean =
    sintomas.exists(sintomasUrgentes.contains)

  /**
   * Realiza el diagnóstico completo de un paciente.
   * Integra el motor de inferencia lógica de Prolog con el modelo predictivo de Python.
   */
  def diagnosticar(paciente: Paciente): Either[String, ResultadoDiagnostico] = {
    validarSintomas(paciente.sintomas) match {
      case Left(invalidos) =>
        Left(s"Síntomas no reconocidos: ${invalidos.mkString(", ")}")

      case Right(sintomasOk) =>
        // 1. Consultar Prolog (Determinista)
        val resultadoProlog = ServicioPrologBridge.consultarProlog(sintomasOk) match {
          case Right(salida) =>
            ServicioPrologBridge.parsearDiagnosticos(salida)
          case Left(error) =>
            println(s"[ADVERTENCIA] Error en motor Prolog: $error")
            List.empty[String]
        }

        // 2. Consultar Python (Estadístico / Machine Learning)
        val resultadoML = ServicioPythonClient.predecirML(sintomasOk) match {
          case Right(predicciones) =>
            predicciones
          case Left(error) =>
            println(s"[ADVERTENCIA] Error en servicio Python ML: $error")
            List.empty[app.servicios.PrediccionML]
        }

        // 3. Consolidación Neuro-Simbólica (Consenso)
        // Consolidamos las enfermedades que:
        // - Son confirmadas por la lógica rígida de Prolog OR
        // - Son sugeridas por Python ML con alta probabilidad (>= 50%) debido a flexibilidad
        val enfermedadesMLAltas = resultadoML.filter(_.probabilidad >= 50.0).map(_.enfermedad)
        val enfermedadesConsolidadas = (resultadoProlog ++ enfermedadesMLAltas).distinct

        val resultado = ResultadoDiagnostico(
          paciente           = paciente,
          enfermedades       = enfermedadesConsolidadas,
          esUrgente          = esUrgente(sintomasOk),
          diagnosticosProlog = resultadoProlog,
          prediccionesML     = resultadoML
        )
        
        Right(resultado)
    }
  }

  /**
   * Retorna la lista de síntomas válidos para mostrar al usuario.
   */
  def sintomasDisponibles: List[String] = sintomasValidos.toList.sorted
}
