package app.servicios

import ujson.Obj
import scala.util.{Try, Success, Failure}

case class PrediccionML(enfermedad: String, probabilidad: Double)

/**
 * Cliente HTTP para comunicarse con el microservicio de Python (FastAPI).
 */
object ServicioPythonClient {

  private val PYTHON_API_URL = "http://localhost:8000"

  /**
   * Envía texto en lenguaje natural a Python para extraer síntomas.
   *
   * @param texto Frase libre ingresada por el usuario (ej: "tengo fiebre y tos")
   * @return Lista de síntomas estandarizados identificados
   */
  def analizarTexto(texto: String): Either[String, List[String]] = {
    Try {
      val url = s"$PYTHON_API_URL/analizar-texto"
      val payload = ujson.Obj("texto" -> texto).toString()
      val respuesta = requests.post(
        url = url,
        data = payload,
        headers = Map("Content-Type" -> "application/json")
      )
      
      val json = ujson.read(respuesta.text())
      json("sintomas").arr.map(_.str).toList
    } match {
      case Success(sintomas) => Right(sintomas)
      case Failure(ex) => Left(s"Error de conexión con servicio Python (NLP): ${ex.getMessage}")
    }
  }

  /**
   * Envía la lista de síntomas a Python para calcular probabilidades con Machine Learning.
   *
   * @param sintomas Lista de síntomas del paciente
   * @return Lista de enfermedades candidatas con sus porcentajes de probabilidad
   */
  def predecirML(sintomas: List[String]): Either[String, List[PrediccionML]] = {
    Try {
      val url = s"$PYTHON_API_URL/predecir-ml"
      val payload = ujson.Obj("sintomas" -> ujson.Arr(sintomas.map(ujson.Str(_)): _*)).toString()
      val respuesta = requests.post(
        url = url,
        data = payload,
        headers = Map("Content-Type" -> "application/json")
      )
      
      val json = ujson.read(respuesta.text())
      json("predicciones").arr.map { item =>
        PrediccionML(
          enfermedad   = item("enfermedad").str,
          probabilidad = item("probabilidad").num
        )
      }.toList
    } match {
      case Success(predicciones) => Right(predicciones)
      case Failure(ex) => Left(s"Error de conexión con servicio Python (ML): ${ex.getMessage}")
    }
  }
}
