# Guía de Despliegue en Servidor Ubuntu (20.04 / 22.04)

Esta guía detalla paso a paso cómo desplegar la aplicación **SGDRecep** (Sistema de Gestión Documental) en un servidor Linux Ubuntu.

El sistema ahora opera con una arquitectura **Full-Stack**:
- **Frontend**: React + Vite (Archivos estáticos servidos por Nginx o Express).
- **Backend**: Node.js + Express + SQLite (API REST y gestión de archivos).
- **Persistencia**: SQLite (Base de datos local en archivo).

---

## 1. Prerrequisitos

*   Acceso a un servidor Ubuntu (v20.04 o v22.04) vía SSH.
*   Permisos de superusuario (`sudo` root).
*   Dominio o IP pública del servidor.

---

## 2. Preparación del Servidor

Conéctate a tu servidor y asegúrate de que esté actualizado.

```bash
# Actualizar lista de paquetes y sistema
sudo apt update && sudo apt upgrade -y
```

### 2.1 Instalar Herramientas Necesarias (Git, Curl)

```bash
sudo apt install git curl build-essential -y
```

### 2.2 Instalar Node.js y NPM

Utilizaremos NodeSource para instalar una versión LTS reciente (v20).

```bash
# Descargar script de instalación para Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalación
node -v
npm -v
```

### 2.3 Instalar Nginx (Servidor Web)

```bash
sudo apt install nginx -y

# Verificar que el servicio esté corriendo
sudo systemctl status nginx
```

Si tienes un firewall activo (`ufw`), permite el tráfico HTTP/HTTPS:

```bash
sudo ufw allow 'Nginx Full'
```

### 2.4 Instalar PM2 (Gestor de Procesos para Node.js)

Para mantener el backend ejecutándose en segundo plano:

```bash
sudo npm install -g pm2
```

---

## 3. Despliegue de la Aplicación

### 3.1 Obtener el Código Fuente

Clona el repositorio en el directorio web (o sube los archivos vía SFTP).

```bash
cd /var/www/html
sudo git clone https://github.com/tu-usuario/sgdrecep.git
cd sgdrecep
```

### 3.2 Instalar Dependencias del Backend

```bash
# Entrar a la carpeta del servidor
cd server

# Instalar dependencias
sudo npm install

# Volver a la raíz
cd ..
```

### 3.3 Instalar Dependencias del Frontend y Construir

```bash
# Instalar dependencias raíz
sudo npm install

# Construir la aplicación para producción (Genera carpeta 'dist')
sudo npm run build
```

---

## 4. Iniciar el Backend con PM2

El servidor backend debe estar corriendo para manejar la API y la base de datos. Usaremos PM2 para gestionar el proceso.

```bash
cd server
# Iniciar el servidor (asegúrate de que esté en el puerto 3000 por defecto)
pm2 start index.js --name "sgdrecep-api"

# Configurar PM2 para que arranque al inicio del sistema
pm2 startup
pm2 save
```

El servidor ahora debería estar escuchando en `http://localhost:3000`.

---

## 5. Configurar Nginx (Reverse Proxy)

Configuraremos Nginx para:
1.  Servir los archivos estáticos del Frontend (`dist`) en la raíz `/`.
2.  Redirigir las peticiones `/api` y `/uploads` al Backend (`localhost:3000`).

### 5.1 Crear Archivo de Configuración

```bash
sudo nano /etc/nginx/sites-available/sgdrecep
```

### 5.2 Contenido de la Configuración

Copia y pega lo siguiente (Ajusta `server_name`):

```nginx
server {
    listen 80;
    server_name tu-dominio.com; # O tu IP pública

    # Directorio de los estáticos del frontend
    root /var/www/html/sgdrecep/dist;
    index index.html;

    # Configuración principal para SPA (Frontend)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para la API (Backend)
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy para archivos subidos (Uploads)
    location /uploads/ {
        proxy_pass http://localhost:3000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Seguridad básica
    location ~ /\. {
        deny all;
    }
}
```

### 5.3 Activar y Reiniciar

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/sgdrecep /etc/nginx/sites-enabled/

# Verificar sintaxis
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## 6. Verificación Final

1.  Accede a tu IP/Dominio. Deberías ver la aplicación.
2.  Intenta hacer Login o crear un registro. Esto verificará la conexión con la API y SQLite.
3.  Los datos se guardarán en `server/sgdrecep.db` (fichero creado automáticamente) y los archivos en `server/uploads/`.

### Permisos de Carpeta Uploads
Asegúrate de que la aplicación tenga permisos para escribir archivos:

```bash
sudo chmod -R 755 /var/www/html/sgdrecep/server/uploads
sudo chown -R www-data:www-data /var/www/html/sgdrecep/server/uploads
# O si ejecuta como tu usuario actual vía PM2, asegúrate de que ese usuario tenga permisos.
```
