# 1. Usamos una imagen ligera de Node.js
FROM node:22-alpine

# 2. Creamos la carpeta de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Copiamos los archivos de dependencias primero (para aprovechar la caché)
COPY package*.json ./

# 4. Instalamos las dependencias
RUN npm install

# 5. Copiamos el resto del código fuente
COPY . .

# 6. Compilamos el código TypeScript a JavaScript
RUN npm run build

# 7. Exponemos el puerto 8080 (El estándar de Cloud Run)
EXPOSE 8080
ENV PORT=8080

# 8. Comando para iniciar la aplicación compilada
CMD ["node", "dist/main"]