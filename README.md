# Centro de Análisis de Seguridad Integral

Este es un proyecto Next.js que utiliza Genkit para proporcionar un Centro de Análisis de Seguridad Integral. La plataforma permite analizar URLs, descripciones de configuraciones de servidores (incluyendo servidores de juegos), bases de datos, código (SAST), aplicaciones en ejecución (DAST), configuraciones de nube (AWS, Azure, GCP), seguridad de contenedores (Docker, Kubernetes) y dependencias de software para identificar vulnerabilidades de seguridad utilizando IA.

**Idea y Visión:** Ronald Gonzalez Niche

## ¿Qué Problema Resuelve?

En el panorama digital actual, las empresas y los desarrolladores enfrentan una creciente amenaza de ciberataques. Asegurar cada componente de una aplicación o infraestructura puede ser complejo y llevar mucho tiempo. Este proyecto tiene como objetivo simplificar y automatizar gran parte de este proceso, proporcionando una visión unificada de la postura de seguridad de diversos activos digitales y ayudando a priorizar los esfuerzos de remediación.

## Funcionalidades Principales

*   **Análisis de URL:** Evalúa la seguridad de URLs de aplicaciones web.
*   **Análisis de Servidores:** Analiza descripciones de configuraciones de servidores (generales y de juegos) en busca de vulnerabilidades.
*   **Análisis de Bases de Datos:** Examina descripciones de configuraciones de bases de datos para identificar riesgos.
*   **Análisis de Código Estático (SAST):** Evalúa fragmentos de código en busca de patrones inseguros.
*   **Análisis de Aplicaciones Dinámicas (DAST):** Simula pruebas dinámicas en URLs de aplicaciones para encontrar vulnerabilidades.
*   **Análisis de Configuración Cloud:** Analiza descripciones de configuraciones para AWS, Azure y GCP.
*   **Análisis de Seguridad de Contenedores:** Evalúa la seguridad de imágenes Docker, Dockerfiles y manifiestos de Kubernetes.
*   **Análisis de Dependencias:** Identifica vulnerabilidades conocidas en dependencias de software (npm, pip, maven, gem).
*   **Generación de Informes:** Crea informes de seguridad completos basados en los análisis.
*   **Generación de Vectores de Ataque:** Ilustra posibles escenarios de ataque para las vulnerabilidades encontradas (función premium).
*   **Generación de Playbooks de Remediación:** Proporciona guías paso a paso para corregir vulnerabilidades (función premium).
*   **Asistente de Chat IA:** Proporciona respuestas a consultas de seguridad y sobre la plataforma.
*   **Modo Premium Simulado:** Desbloquea funciones avanzadas como informes técnicos detallados y descarga de resultados.

## Tecnologías Usadas

*   **Frontend:** Next.js, React, TypeScript
*   **UI:** ShadCN UI Components, Tailwind CSS
*   **Inteligencia Artificial:** Genkit (Google AI)
*   **Empaquetado (Descargas):** JSZip
*   **Otros:** Zod (para validación de esquemas)

## Instalación y Ejecución Local

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local.

### Prerrequisitos

*   Node.js (versión 18 o superior recomendada)
*   npm o yarn

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DEL_DIRECTORIO_DEL_PROYECTO>
    ```
2.  **Instala las dependencias:**
    ```bash
    npm install
    # o
    yarn install
    ```

### Configuración de Variables de Entorno

Este proyecto requiere una clave API de Google AI para que funcionen las capacidades de Genkit.

1.  **Crea un archivo `.env`:**
    Si no existe, crea un archivo llamado `.env` en la raíz del proyecto. Puedes copiar `.env.example` si existe uno.
    ```
    GOOGLE_API_KEY=tu_clave_api_aqui
    ```
2.  **Obtén tu Clave API de Google AI:**
    Visita [Google AI Studio](https://aistudio.google.com/app/apikey) para generar una clave API si aún no tienes una.
3.  **Configura la Clave API en `.env`:**
    Abre el archivo `.env` y reemplaza `tu_clave_api_aqui` con tu clave API real. Guarda el archivo.

### Ejecutando la Aplicación

1.  **Iniciar el servidor de desarrollo de Next.js:**
    ```bash
    npm run dev
    ```
    Esto generalmente iniciará la aplicación en [http://localhost:9002](http://localhost:9002).

2.  **Iniciar el servidor de desarrollo de Genkit (opcional, para depuración de flujos):**
    En una terminal separada, ejecuta:
    ```bash
    npm run genkit:watch
    # o para iniciar sin recarga en caliente
    npm run genkit:dev
    ```
    Esto iniciará la UI de desarrollador de Genkit, típicamente en [http://localhost:4000](http://localhost:4000).

### Comandos de Build y Start

*   **Construir para producción:**
    ```bash
    npm run build
    ```
*   **Iniciar el servidor de producción:**
    ```bash
    npm run start
    ```

## Despliegue

La aplicación puede ser desplegada en varias plataformas que soporten Next.js:

*   **Vercel:** Ideal para aplicaciones Next.js, con despliegues automáticos desde Git.
*   **Netlify:** Similar a Vercel, ofrece una buena experiencia de despliegue para Next.js.
*   **Firebase Hosting:** Si ya usas Firebase para otros servicios, puede ser una opción conveniente.
*   **Docker:** Puedes crear una imagen Docker de la aplicación para desplegarla en cualquier proveedor de nube (AWS, GCP, Azure) o en tu propia infraestructura. (Un `Dockerfile` necesitaría ser creado).
*   **Servidores Node.js Tradicionales:** Desplegando la build de Next.js en un servidor Node.js.

## Roadmap (Posibles Mejoras Futuras)

*   **Documentación Técnica Detallada:** Crear una carpeta `/docs` o una Wiki del proyecto.
*   **Automatizaciones y Testing:**
    *   Agregar Prettier, ESLint y Husky para mantener la calidad del código.
    *   Implementar tests unitarios (Jest, Vitest).
    *   Configurar CI/CD con GitHub Actions.
*   **Análisis de APIs REST y GraphQL.**
*   **Historial de análisis por usuario (requiere autenticación de usuarios).**
*   **Exportación de informes en formato PDF.**
*   **Integración y mapeo con OWASP Top 10.**
*   **Panel administrativo para gestión de la plataforma.**
*   **Integraciones con SIEM/SOAR.**
*   **Gestión de usuarios y RBAC (Control de Acceso Basado en Roles).**
*   **Interfaz de Línea de Comandos (CLI).**
*   **Implementación de sistema de pagos (ej. PayPal, Stripe) para servicios premium.**

## Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.

**Idea y Visión:** Ronald Gonzalez Niche
