#!/bin/bash

# 1. Iniciar el microservicio de Python en segundo plano en el puerto 8000
echo "Iniciando microservicio de Python (FastAPI)..."
cd /app/python
python3 -m uvicorn src.main:app --host 127.0.0.1 --port 8000 &

# Guardar el PID de Python para poder cerrarlo si el contenedor se apaga
PYTHON_PID=$!

# Esperar unos segundos a que la API de Python esté lista
sleep 5

# 2. Iniciar el servidor web de Scala (Cask)
echo "Iniciando servidor principal de Scala (Cask)..."
cd /app/scala
sbt run

# Al finalizar (si Scala se detiene), matar el proceso de Python
kill $PYTHON_PID
