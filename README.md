# POC: Keycloak, Docker, HTTPS y Cookies de Terceros

Este proyecto es una Prueba de Concepto (POC) que demuestra cómo integrar una aplicación web con Keycloak para autenticación, asegurando que no se dependa de cookies de terceros para la gestión de la sesión en el navegador. Utiliza Docker Compose para simular un entorno de producción con múltiples dominios y HTTPS.

## Escenario Demostrado

- **`av.com`**: Simula una aplicación web cliente (frontend).
- **`sso.lm.com`**: Simula un servidor de autenticación Keycloak.

El objetivo es que `av.com` utilice el servicio de autenticación de `sso.lm.com` sin que se generen cookies de terceros en el dominio `av.com`. La información de la sesión se guarda y se recupera del `localStorage` del navegador.

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- **Docker Desktop**: Incluye Docker Engine y Docker Compose.
  [Descargar Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Configuración Inicial (¡Importante!)

Para que los dominios `av.com` y `sso.lm.com` apunten a tu máquina local, necesitas modificar tu archivo `hosts`.

1.  **Abre tu terminal.**
2.  **Edita el archivo `hosts` con permisos de administrador.**
    ```bash
    sudo nano /etc/hosts
    ```
    *(En Windows, el archivo suele estar en `C:\Windows\System32\drivers\etc\hosts` y necesitarás un editor de texto ejecutado como administrador).* 
3.  **Añade las siguientes líneas al final del archivo:**
    ```
    127.0.0.1   av.com
    127.0.0.1   sso.lm.com
    ```
4.  **Guarda los cambios y cierra el editor.**

## Certificados SSL (Autogenerados)

Este POC utiliza certificados SSL autofirmados para `av.com` y `sso.lm.com` para simular un entorno HTTPS. Estos certificados ya han sido generados y se encuentran en la carpeta `docker-poc/nginx/`.

Si tu navegador muestra advertencias de seguridad (lo cual es normal para certificados autofirmados), deberás aceptarlas para poder acceder a los sitios. Opcionalmente, puedes instalar estos certificados en el almacén de confianza de tu sistema operativo para evitar las advertencias.

## Cómo Ejecutar la Aplicación

1.  **Abre tu terminal.**
2.  **Navega a la carpeta `docker-poc`:**
    ```bash
    cd /Users/pcastellanos/Documents/flyr/keycloak-js/docker-poc
    ```
3.  **Asegúrate de que Docker Desktop esté ejecutándose.**
4.  **Levanta todos los servicios con Docker Compose:**
    ```bash
    docker compose up -d
    ```
    *(La primera vez, Docker descargará las imágenes y puede tardar unos minutos).* 

## Cómo Probar la Aplicación

Una vez que los contenedores estén en marcha:

1.  **Abre tu navegador web.**
2.  **Navega a la aplicación web:**
    ```
    https://av.com
    ```
    *Si no has instalado los certificados en tu sistema, deberás aceptar las advertencias de seguridad del navegador para `av.com` y `sso.lm.com`.*

3.  **Flujo de Autenticación:**
    *   Haz clic en el botón **"Login"**. Serás redirigido a `https://sso.lm.com`.
    *   Inicia sesión con las credenciales de prueba:
        *   **Usuario:** `testuser`
        *   **Contraseña:** `test`
    *   Serás redirigido de vuelta a `https://av.com`.

4.  **Verificación de la Sesión (sin cookies de terceros):**
    *   La aplicación debería mostrarte como **"Authenticated"**.
    *   Abre las herramientas de desarrollador de tu navegador (F12 o Ctrl+Shift+I / Cmd+Option+I).
    *   Ve a la pestaña **`Application`** (o `Almacenamiento`).
    *   En la sección **`Local Storage`**, deberías ver la información de la sesión almacenada para `https://av.com`.
    *   **Recarga la página `https://av.com`**. La sesión debería persistir, ya que se recupera del `localStorage` y no de cookies de terceros.

## Limpieza

Para detener y eliminar todos los contenedores y volúmenes creados por este POC:

1.  **Abre tu terminal.**
2.  **Navega a la carpeta `docker-poc`:**
    ```bash
    cd /Users/pcastellanos/Documents/flyr/keycloak-js/docker-poc
    ```
3.  **Ejecuta el comando de limpieza:**
    ```bash
    docker compose down -v
    ```

No olvides eliminar las líneas añadidas a tu archivo `hosts` si ya no necesitas estos dominios locales.
