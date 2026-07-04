package app.modelos

/**
 * Representa un paciente con sus síntomas reportados.
 *
 * @param nombre   Nombre del paciente
 * @param edad     Edad del paciente
 * @param sintomas Lista de síntomas reportados
 */
case class Paciente(
  nombre: String,
  edad: Int,
  sintomas: List[String]
)

/**
 * Resultado del diagnóstico para un paciente.
 *
 * @param paciente      Paciente evaluado
 * @param enfermedades  Lista de posibles enfermedades detectadas
 * @param esUrgente     Indica si el caso requiere atención inmediata
 */
case class ResultadoDiagnostico(
  paciente: Paciente,
  enfermedades: List[String], // Consolidadas
  esUrgente: Boolean,
  diagnosticosProlog: List[String] = List.empty,
  prediccionesML: List[app.servicios.PrediccionML] = List.empty
) {
  override def toString: String = {
    val urgenciaStr = if (esUrgente) "⚠️  URGENTE — Acuda a emergencias" else "✅ No urgente"
    
    val prologStr = if (diagnosticosProlog.isEmpty) "Ninguno" else diagnosticosProlog.mkString(", ")
    
    val mlStr = if (prediccionesML.isEmpty) {
      "Ninguna"
    } else {
      prediccionesML.map(p => s"${p.enfermedad} (${p.probabilidad}%)").mkString(", ")
    }
    
    val consolidadasStr = if (enfermedades.isEmpty) "Ninguna" else enfermedades.mkString(", ")
    
    s"""
    |━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    |  Paciente   : ${paciente.nombre} (${paciente.edad} años)
    |  Síntomas   : ${paciente.sintomas.mkString(", ")}
    |  Prolog (L) : $prologStr
    |  Python (ML): $mlStr
    |  Consenso   : $consolidadasStr
    |  Estado     : $urgenciaStr
    |━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    """.stripMargin
  }
}
