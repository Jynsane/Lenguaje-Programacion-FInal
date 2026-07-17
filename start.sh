#!/bin/bash

# 1. Iniciar el servidor web de Scala (Cask) en segundo plano
echo "Iniciando servidor principal de Scala (Cask)..."
/app/scala/target/universal/stage/bin/diagnostico-enfermedades &
SCALA_PID=$!

# Esperar a que Scala se vincule al puerto 8080 primero (evitando que Render detecte el puerto 8000 de Python)
sleep 4

# 2. Iniciar el microservicio de Python (FastAPI) en segundo plano
echo "Iniciando microservicio de Python (FastAPI)..."
cd /app/python
python3 -m uvicorn src.main:app --host 127.0.0.1 --port 8081 &
PYTHON_PID=$!

# Esperar a que el proceso de Scala finalice
wait $SCALA_PID

# Limpiar procesos al salir
kill $PYTHON_PID
