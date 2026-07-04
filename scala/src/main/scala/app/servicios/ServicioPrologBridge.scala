package app.servicios

import app.modelos.{Paciente, ResultadoDiagnostico}
import scala.sys.process._
import scala.util.{Try, Success, Failure}

/**
 * Servicio que invoca al motor de inferencia Prolog
 * y parsea los resultados del diagnóstico.
 */
object ServicioPrologBridge {

  // Ruta relativa al archivo de consultas Prolog (desde la carpeta `scala` al ejecutar con `sbt run`)
  private val PROLOG_CONSULTAS = "../prolog/consultas.pl"

  /**
   * Construye la consulta Prolog para obtener diagnósticos.
   * Llama a obtener_diagnosticos/2 con la lista de síntomas.
   */
  private def construirConsulta(sintomas: List[String]): String = {
    val listaProlog = sintomas.mkString("[", ",", "]")
    s"obtener_diagnosticos($listaProlog, D), write(D), nl, halt"
  }

  /**
   * Invoca SWI-Prolog como proceso externo y captura la salida.
   *
   * @param sintomas Lista de síntomas del paciente
   * @return String con la respuesta de Prolog o error
   */
  def consultarProlog(sintomas: List[String]): Either[String, String] = {
    val consulta = construirConsulta(sintomas)
    val comando  = Seq("swipl", "-s", PROLOG_CONSULTAS, "-g", consulta)

    Try {
      val salida = comando.lazyLines_!.mkString("\n")
      salida.trim
    } match {
      case Success(resultado) if resultado.nonEmpty => Right(resultado)
      case Success(_)                               => Left("Prolog no devolvió resultados.")
      case Failure(ex)                              => Left(s"Error al invocar Prolog: ${ex.getMessage}")
    }
  }

  /**
   * Parsea la lista de Prolog "[gripe,dengue]" a List[String].
   */
  def parsearDiagnosticos(prologOutput: String): List[String] = {
    prologOutput
      .trim
      .stripPrefix("[")
      .stripSuffix("]")
      .split(",")
      .map(_.trim)
      .filter(_.nonEmpty)
      .toList
  }
}
