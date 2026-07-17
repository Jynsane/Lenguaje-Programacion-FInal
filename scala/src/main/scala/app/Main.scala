package app

import app.modelos.Paciente
import app.servicios.{ServicioDiagnostico, ServicioPythonClient, ServicioPrologBridge}
import scala.util.{Try, Success, Failure}

/**
 * ============================================================
 *  SISTEMA EXPERTO DE DIAGNÓSTICO DE ENFERMEDADES
 *  Punto de entrada principal (Servidor Web Cask)
 *
 *  Arquitectura:
 *    Web UI → Servidor Scala (Cask HTTP Gateway) → Python (IA) & Prolog (Reglas)
 * ============================================================
 */
object Main extends cask.MainRoutes {

  override def port: Int = 8080
  override def host: String = "0.0.0.0"

  val webDirAbsPath = {
    val candidatos = Seq("/app/web", "../web", "web", "../../web", "../../../web")
    candidatos.map(new java.io.File(_))
      .find(f => f.exists() && f.isDirectory)
      .map(_.getCanonicalPath)
      .getOrElse {
        println("ALERTA: No se pudo determinar dinámicamente la carpeta 'web'. Usando valor predeterminado.")
        new java.io.File("../web").getCanonicalPath
      }
  }
  println(s"======================================================")
  println(s"--> Ruta de archivos estáticos detectada: $webDirAbsPath")
  println(s"======================================================")

  // 1. Servir archivos estáticos del frontend de forma robusta y personalizada (evita bugs de rutas en Linux)
  @cask.get("/web", subpath = true)
  def serveWebFiles(request: cask.Request) = {
    val pathStr = request.exchange.getRelativePath.stripPrefix("/web").stripPrefix("/")
    // Si la ruta está vacía (ej: /web/), redirigir o servir index.html
    val targetPath = if (pathStr.trim.isEmpty) "index.html" else pathStr
    val file = new java.io.File(webDirAbsPath, targetPath)

    if (file.exists() && file.isFile) {
      val bytes = java.nio.file.Files.readAllBytes(file.toPath)
      val contentType = if (targetPath.endsWith(".html")) "text/html"
                        else if (targetPath.endsWith(".css")) "text/css"
                        else if (targetPath.endsWith(".js")) "application/javascript"
                        else "application/octet-stream"
      cask.Response(
        data = bytes,
        headers = Seq("Content-Type" -> contentType)
      )
    } else {
      cask.Response(
        data = s"Archivo no encontrado: $targetPath".getBytes("UTF-8"),
        statusCode = 404,
        headers = Seq("Content-Type" -> "text/plain; charset=utf-8")
      )
    }
  }

  // Redirigir la raíz al index de la web
  @cask.get("/")
  def index() = {
    cask.Redirect("/web/index.html")
  }

  // 1.5. API: Verificar el estado de salud de todos los servicios (Scala, Prolog, Python)
  @cask.get("/api/health")
  def health() = {
    val prologOk = try {
      val res = ServicioPrologBridge.consultarProlog(List("fiebre"))
      res.isRight
    } catch {
      case _: Exception => false
    }

    val pythonOk = try {
      val res = requests.get("http://localhost:8081/health", readTimeout = 1000, connectTimeout = 1000)
      res.statusCode == 200
    } catch {
      case _: Exception => false
    }

    cask.Response(
      data = ujson.Obj(
        "scala" -> true,
        "prolog" -> prologOk,
        "python" -> pythonOk
      ).toString(),
      headers = Seq("Content-Type" -> "application/json")
    )
  }

  // Endpoint de diagnóstico para verificar rutas y archivos en Render
  @cask.get("/api/test-files")
  def testFiles() = {
    val folder = new java.io.File(webDirAbsPath)
    val exists = folder.exists()
    val isDir = folder.isDirectory
    val files = if (exists && isDir) folder.listFiles().map(_.getName).toList else Nil
    cask.Response(
      data = ujson.Obj(
        "webDirAbsPath" -> webDirAbsPath,
        "exists" -> exists,
        "isDirectory" -> isDir,
        "files" -> ujson.Arr(files.map(ujson.Str(_)): _*),
        "user_dir" -> System.getProperty("user.dir")
      ).toString(),
      headers = Seq("Content-Type" -> "application/json")
    )
  }

  // 2. API: Obtener lista de síntomas válidos del sistema
  @cask.get("/api/sintomas")
  def obtenerSintomas() = {
    val sintomas = ServicioDiagnostico.sintomasDisponibles
    cask.Response(
      data = ujson.Arr(sintomas.map(ujson.Str(_)): _*).toString(),
      headers = Seq("Content-Type" -> "application/json")
    )
  }

  // 3. API: Realizar diagnóstico neuro-simbólico completo
  @cask.post("/api/diagnosticar")
  def postDiagnosticar(request: cask.Request) = {
    Try {
      val body = ujson.read(request.text())
      val nombre = body("nombre").str
      val edad = body("edad").num.toInt
      val sintomas = body("sintomas").arr.map(_.str).toList
      Paciente(nombre, edad, sintomas)
    } match {
      case Failure(ex) =>
        cask.Response(
          data = ujson.Obj("error" -> s"JSON inválido: ${ex.getMessage}").toString(),
          statusCode = 400,
          headers = Seq("Content-Type" -> "application/json")
        )
      case Success(paciente) =>
        if (paciente.nombre.trim.isEmpty) {
          cask.Response(
            data = ujson.Obj("error" -> "El nombre del paciente no puede estar vacío.").toString(),
            statusCode = 400,
            headers = Seq("Content-Type" -> "application/json")
          )
        } else if (paciente.edad <= 0 || paciente.edad > 120) {
          cask.Response(
            data = ujson.Obj("error" -> "Por favor ingrese una edad válida (entre 1 y 120 años).").toString(),
            statusCode = 400,
            headers = Seq("Content-Type" -> "application/json")
          )
        } else if (paciente.sintomas.isEmpty) {
          cask.Response(
            data = ujson.Obj("error" -> "Debe seleccionar al menos un síntoma para realizar el diagnóstico.").toString(),
            statusCode = 400,
            headers = Seq("Content-Type" -> "application/json")
          )
        } else {
          ServicioDiagnostico.diagnosticar(paciente) match {
            case Left(error) =>
              cask.Response(
                data = ujson.Obj("error" -> error).toString(),
                statusCode = 400,
                headers = Seq("Content-Type" -> "application/json")
              )
            case Right(resultado) =>
              val predJson = resultado.prediccionesML.map { p =>
                ujson.Obj("enfermedad" -> p.enfermedad, "probabilidad" -> p.probabilidad)
              }
              val resJson = ujson.Obj(
                "nombre" -> resultado.paciente.nombre,
                "edad" -> resultado.paciente.edad,
                "sintomas" -> ujson.Arr(resultado.paciente.sintomas.map(ujson.Str(_)): _*),
                "enfermedades" -> ujson.Arr(resultado.enfermedades.map(ujson.Str(_)): _*),
                "esUrgente" -> resultado.esUrgente,
                "diagnosticosProlog" -> ujson.Arr(resultado.diagnosticosProlog.map(ujson.Str(_)): _*),
                "prediccionesML" -> ujson.Arr(predJson: _*)
              )
              cask.Response(
                data = resJson.toString(),
                headers = Seq("Content-Type" -> "application/json")
              )
          }
        }
    }
  }

  // 4. API: Analizar texto libre (NLP en Python) para extraer síntomas conocidos
  @cask.post("/api/analizar-texto")
  def postAnalizarTexto(request: cask.Request) = {
    Try {
      val body = ujson.read(request.text())
      body("texto").str
    } match {
      case Failure(ex) =>
        cask.Response(
          data = ujson.Obj("error" -> s"JSON inválido: ${ex.getMessage}").toString(),
          statusCode = 400,
          headers = Seq("Content-Type" -> "application/json")
        )
      case Success(texto) =>
        ServicioPythonClient.analizarTexto(texto) match {
          case Left(error) =>
            cask.Response(
              data = ujson.Obj("error" -> error).toString(),
              statusCode = 500,
              headers = Seq("Content-Type" -> "application/json")
            )
          case Right(sintomas) =>
            cask.Response(
              data = ujson.Obj("sintomas" -> ujson.Arr(sintomas.map(ujson.Str(_)): _*)).toString(),
              headers = Seq("Content-Type" -> "application/json")
            )
        }
    }
  }

  // 5. API: Generar reporte PDF (Proxy hacia microservicio de Python)
  @cask.post("/api/generar-pdf")
  def postGenerarPdf(request: cask.Request): cask.Response[Array[Byte]] = {
    Try {
      requests.post(
        url = "http://localhost:8081/generar-pdf",
        data = request.text(),
        headers = Map("Content-Type" -> "application/json")
      )
    } match {
      case Success(resp) if resp.statusCode == 200 =>
        cask.Response(
          data = resp.bytes,
          headers = Seq(
            "Content-Type" -> "application/pdf",
            "Content-Disposition" -> "attachment; filename=reporte_diagnostico.pdf"
          )
        )
      case Success(resp) =>
        cask.Response(
          data = ujson.Obj("error" -> s"Python falló con código ${resp.statusCode}: ${resp.text()}").toString().getBytes("UTF-8"),
          statusCode = 500,
          headers = Seq("Content-Type" -> "application/json")
        )
      case Failure(ex) =>
        cask.Response(
          data = ujson.Obj("error" -> s"Fallo al conectar con servicio Python: ${ex.getMessage}").toString().getBytes("UTF-8"),
          statusCode = 500,
          headers = Seq("Content-Type" -> "application/json")
        )
    }
  }

  // Impresión de bienvenida al iniciar el servidor
  println(
    """
      |╔══════════════════════════════════════════════════════╗
      |║   SISTEMA EXPERTO DE DIAGNÓSTICO DE ENFERMEDADES     ║
      |║                                                      ║
      |║   Servidor Web iniciado en http://localhost:8080      ║
      |║   API Gateway (Scala Cask)                           ║
      |║   Motor Lógico (SWI-Prolog)                          ║
      |║   Microservicio NLP/ML (Python FastAPI)              ║
      |╚══════════════════════════════════════════════════════╝
    """.stripMargin
  )

  initialize()

  override def main(args: Array[String]): Unit = {
    // Iniciar el servidor Undertow llamando al main de Cask
    super.main(args)
    
    // Mantener el hilo principal vivo ya que los hilos de Undertow pueden ser daemon
    println("--> Servidor web activo. Presiona Ctrl+C para detenerlo.")
    try {
      while (true) {
        Thread.sleep(5000)
      }
    } catch {
      case _: InterruptedException => println("Servidor detenido.")
    }
  }
}
