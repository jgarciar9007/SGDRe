# SGDRecep - Sistema de Gestión Documental

Sistema de gestión documental desarrollado para el Consejo Nacional para el Desarrollo Económico y Social (CNDES).
Permite el registro de entrada y salida de documentos, gestión de adjuntos (PDF), y visualización de estadísticas.

## 🚀 Tecnologías

*   **Frontend**: React (v19), Vite, Framer Motion, Lucide Icons.
*   **Backend**: Node.js, Express.
*   **Base de Datos**: SQLite (almacenamiento local persistente).
*   **Seguridad**: Helmet, CORS.

## 🛠️ Instalación y Ejecución Local

1.  **Instalar dependencias**:
    ```bash
    npm install
    cd server
    npm install
    cd ..
    ```

2.  **Modo Desarrollo**:
    Ejecuta frontend y backend simultáneamente.
    ```bash
    npm run dev:full
    ```

3.  **Modo Producción (Local)**:
    Construye el frontend y sirve todo desde el backend.
    ```bash
    npm start
    ```
    La aplicación estará disponible en `http://localhost:3000`.

## 📂 Estructura del Proyecto

*   `/src`: Código fuente del Frontend (React).
*   `/server`: Código del Backend (Node/Express) y Base de datos.
*   `/dist`: Archivos estáticos generados para producción.
*   `/server/uploads`: Almacén de archivos adjuntos.

## 📝 Despliegue

Consulta el archivo `DEPLOY_GUIDE.md` para instrucciones detalladas sobre cómo desplegar en un servidor Ubuntu con Nginx y PM2.
