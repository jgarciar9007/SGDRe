# Guía de Actualización del Servidor (Backend + DB)

Esta guía describe los pasos necesarios para actualizar el servidor de producción con las últimas mejoras: Persistencia en Base de Datos (SQLite), Nomencladores Dinámicos (Departamentos y Ministerios) y los nuevos Modales Premium.

---

## 1. Descargar los últimos cambios

Accede a la carpeta del proyecto en el servidor y descarga el código actualizado:

```bash
cd /var/www/html/sgdrecep
sudo git pull origin main
```

## 2. Instalar nuevas dependencias

Dado que ahora el sistema utiliza un Backend con Node.js y SQLite, es necesario instalar las librerías del servidor:

```bash
# Instalar dependencias del servidor
cd server
sudo npm install

# Regresar a la raíz e instalar dependencias del frontend (si las hay)
cd ..
sudo npm install
```

## 3. Reconstruir el Frontend

Es necesario compilar la interfaz de React para que incluya las nuevas llamadas a la API y los estilos actualizados:

```bash
sudo npm run build
```

Este comando actualizará la carpeta `dist/`.

## 4. Configurar el Proceso del Servidor (PM2)

Para que el backend esté siempre activo, recomendamos usar **PM2**. Si no lo tienes instalado:
`sudo npm install -g pm2`

Ahora, iniciamos el servidor:

```bash
# Desde la carpeta raíz del proyecto
cd server
pm2 start index.js --name "sgdrecep-api"

# Para asegurarte de que arranque al reiniciar el servidor Linux:
pm2 save
pm2 startup
```

## 5. Configurar Nginx (Reverse Proxy)

Ahora que tenemos un servidor en el puerto **3000**, debemos configurar Nginx para que redirija las peticiones de la API.

Edita tu archivo de configuración:
`sudo nano /etc/nginx/sites-available/sgdrecep`

Asegúrate de que incluya la sección de la API:

```nginx
server {
    listen 80;
    server_name tu-dominio.com; # Reemplaza por tu IP o dominio

    root /var/www/html/sgdrecep/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # NUEVO: Proxy para la API y archivos subidos
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        proxy_pass http://localhost:3000/uploads/;
    }
}
```

Verifica y reinicia Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 6. Verificación Final

1.  **Tablas**: Al arrancar por primera vez con `pm2`, el servidor creará automáticamente las tablas y cargará los departamentos y ministerios iniciales.
2.  **Archivos**: Asegúrate de que la carpeta `server/uploads` tenga permisos de escritura:
    `sudo chmod -R 777 /var/www/html/sgdrecep/server/uploads`
3.  **Acceso**: Entra en la web y verifica que en "Nuevo Registro" aparezcan las listas desplegables.

---
**Nota sobre el Cambio de Puerto:** El servidor se ha movido del puerto 3001 al **3000**. Si tenías reglas de firewall específicas, asegúrate de permitir el tráfico interno en el puerto 3000 si es necesario (aunque Nginx suele manejarlo internamente).
