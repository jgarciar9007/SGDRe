# Guía de Despliegue en Servidor Ubuntu (20.04 / 22.04)

Esta guía detalla paso a paso cómo desplegar la aplicación **SGDRecep** (Sistema de Gestión Documental) en un servidor Linux Ubuntu.

Esta aplicación es una **Single Page Application (SPA)** construida con React y Vite. Utiliza `localStorage` para persistencia de datos, por lo que no requiere una base de datos externa ni backend complejo; funcionará simplemente sirviendo los archivos estáticos.

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

Utilizaremos NodeSource para instalar una versión LTS reciente (v18 o v20).

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

---

## 3. Despliegue de la Aplicación

### 3.1 Obtener el Código Fuente

Tienes dos opciones: clonar desde un repositorio Git (recomendado) o subir los archivos manualmente.

**Opción A: Clonar Repositorio**
```bash
# Ir al directorio home o web
cd /var/www/

# Clonar repositorio (reemplaza la URL por la tuya)
sudo git clone https://github.com/tu-usuario/sgdrecep.git html/sgdrecep

# Entrar al directorio
cd html/sgdrecep
```

**Opción B: Subir Archivos Manualmente**
Puedes usar SFTP (FileZilla) o `scp` para subir tu carpeta local del proyecto a `/var/www/html/sgdrecep`.

### 3.2 Instalar Dependencias y Construir

Una vez dentro de la carpeta del proyecto en el servidor:

```bash
# Si clonaste como root/sudo, ajusta permisos temporalmente o usa sudo
# Instalar dependencias del proyecto
sudo npm install

# Construir la aplicación para producción
sudo npm run build
```

Este comando creará una carpeta llamada **`dist`**. Esta carpeta contiene todos los archivos estáticos optimizados listos para servirse.

---

## 4. Configurar Nginx

Configuraremos Nginx para servir los archivos de la carpeta `dist`.

### 4.1 Crear Archivo de Configuración

Crea un nuevo archivo de configuración en `sites-available`.

```bash
sudo nano /etc/nginx/sites-available/sgdrecep
```

### 4.2 Contenido de la Configuración

Pega el siguiente contenido. Asegúrate de modificar `server_name` con tu dominio o IP y ajustar la ruta `root` si es distinta.

```nginx
server {
    listen 80;
    server_name tu-dominio.com o-tu-ip-publica;

    # Ruta a la carpeta 'dist' generada tras el build
    root /var/www/html/sgdrecep/dist;
    index index.html;

    # Configuración principal para SPA (Single Page App)
    location / {
        # Intenta servir el archivo solicitado, si no existe, sirve index.html
        try_files $uri $uri/ /index.html;
    }

    # Caché opcional para archivos estáticos (JS, CSS, Imágenes)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Bloques de seguridad básicos (opcional pero recomendado)
    location ~ /\. {
        deny all;
    }
}
```

Guarda y sal (`Ctrl+O`, `Enter`, `Ctrl+X`).

### 4.3 Activar el Sitio

Crea un enlace simbólico a `sites-enabled`:

```bash
sudo ln -s /etc/nginx/sites-available/sgdrecep /etc/nginx/sites-enabled/
```

### 4.4 Verificar y Reiniciar Nginx

```bash
# Verificar que no haya errores de sintaxis
sudo nginx -t

# Si todo dice "syntax is okay", reinicia Nginx
sudo systemctl restart nginx
```

---

## 5. ¡Listo!

Ahora puedes acceder a tu servidor mediante el navegador usando tu IP o dominio:
`http://tu-dominio-o-ip/`

La aplicación debería cargar correctamente.

---

## Anexo: Actualizaciones Futuras

Cuando realices cambios en el código y quieras actualizar el servidor:

1.  Entra al directorio: `cd /var/www/html/sgdrecep`
2.  Baja cambios: `sudo git pull`
3.  Instala nuevas dependencias (si hay): `sudo npm install`
4.  Reconstruye el proyecto: `sudo npm run build`
5.  No es necesario reiniciar Nginx para cambios en archivos estáticos, solo con el build basta.

---

## Anexo: Persistencia de Datos (Nota Importante)

Actualmente, el sistema guarda los datos en el **Navegador del Usuario** (`LocalStorage`).
*   **Ventaja:** No requiere configuración de Base de Datos en el servidor.
*   **Advertencia:** Si cambias de navegador o borras caché, los datos se pierden localmente en esa máquina. Los datos **NO** se comparten entre diferentes usuarios/ordenadores porque no hay un Backend centralizado.

Si necesitas que varios usuarios vean los mismos datos desde distintas PC, se requeriría implementar un Backend (API) y una Base de Datos real.
