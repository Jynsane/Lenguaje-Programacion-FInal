# Usamos una imagen base con JDK y Python instalados
FROM hseeberger/scala-sbt:17.0.2_1.6.2_3.1.1 AS build

# Instalar Python, pip y SWI-Prolog
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    swi-prolog \
    && rm -rf /var/lib/apt/lists/*

# Definir directorio de trabajo
WORKDIR /app

# Copiar requerimientos de Python e instalarlos
COPY python/requirements.txt ./python/requirements.txt
RUN pip3 install --no-cache-dir -r python/requirements.txt

# Copiar el resto del proyecto al contenedor
COPY . .

# Compilar el proyecto de Scala para acelerar el primer arranque
RUN cd scala && sbt compile

# Dar permisos de ejecución al script de inicio
RUN chmod +x start.sh

# Exponer el puerto del servidor Scala (Render enrutará el tráfico aquí)
EXPOSE 8080

# Comando para iniciar los servicios
CMD ["./start.sh"]
