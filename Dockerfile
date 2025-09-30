# Dockerfile para la presentación GYMETRA
FROM nginx:alpine

# Copiar los archivos de la presentación
COPY ["doc/manual/Presentacion GYMETRA/", "/usr/share/nginx/html/"]

# Exponer el puerto 80
EXPOSE 80

# Nginx se ejecuta automáticamente
CMD ["nginx", "-g", "daemon off;"]
