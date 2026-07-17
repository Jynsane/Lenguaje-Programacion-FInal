// ============================================================
//  build.sbt — Configuración del proyecto Scala
//  Sistema Experto de Diagnóstico de Enfermedades
// ============================================================

ThisBuild / version      := "1.0.0"
ThisBuild / scalaVersion := "3.3.1"
ThisBuild / organization := "edu.proyecto"

lazy val root = (project in file("."))
  .enablePlugins(JavaAppPackaging)
  .settings(
    name := "diagnostico-enfermedades",

    // Opciones del compilador
    scalacOptions ++= Seq(
      "-deprecation",
      "-feature",
      "-unchecked"
    ),

    // Punto de entrada
    Compile / mainClass := Some("app.Main"),

    // Dependencias del sistema web e integraciones
    libraryDependencies ++= Seq(
      // ScalaTest para pruebas unitarias
      "org.scalatest" %% "scalatest" % "3.2.17" % Test,
      // JSON ligero para leer/escribir datos de pacientes
      "com.lihaoyi" %% "ujson" % "3.0.0",
      // Servidor web micro-framework en Scala
      "com.lihaoyi" %% "cask" % "0.9.1",
      // Cliente HTTP ligero para comunicarse con Python
      "com.lihaoyi" %% "requests" % "0.8.0"
    )
  )
