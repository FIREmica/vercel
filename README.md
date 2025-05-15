
# Centro de Análisis de Seguridad Integral

Este es un proyecto Next.js que utiliza Genkit para proporcionar un Centro de Análisis de Seguridad Integral. La plataforma permite analizar URLs, descripciones de configuraciones de servidores (incluyendo servidores de juegos), bases de datos, código (SAST), aplicaciones en ejecución (DAST simulado), configuraciones de nube (AWS, Azure, GCP), seguridad de contenedores (Docker, Kubernetes), dependencias de software y descripciones de configuraciones de red para identificar vulnerabilidades de seguridad utilizando IA.

**Idea y Visión:** Ronald Gonzalez Niche

## ¿Qué Problema Resuelve?

En el panorama digital actual, las empresas y los desarrolladores enfrentan una creciente amenaza de ciberataques. Asegurar cada componente de una aplicación o infraestructura puede ser complejo y llevar mucho tiempo. Este proyecto tiene como objetivo simplificar y automatizar gran parte de este proceso, proporcionando una visión unificada de la postura de seguridad de diversos activos digitales y ayudando a priorizar los esfuerzos de remediación.

## Funcionalidades Principales

*   **Análisis de URL:** Evalúa la seguridad de URLs de aplicaciones web.
*   **Análisis de Servidores:** Analiza descripciones de configuraciones de servidores (generales y de juegos) en busca de vulnerabilidades.
*   **Análisis de Bases de Datos:** Examina descripciones de configuraciones de bases de datos para identificar riesgos.
*   **Análisis de Código Estático (SAST):** Evalúa fragmentos de código en busca de patrones inseguros, con sugerencias de corrección.
*   **Análisis de Aplicaciones Dinámicas (DAST Simulado):** Simula pruebas dinámicas en URLs de aplicaciones para encontrar vulnerabilidades.
*   **Análisis de Configuración Cloud:** Analiza descripciones de configuraciones para AWS, Azure y GCP.
*   **Análisis de Seguridad de Contenedores:** Evalúa la seguridad de imágenes Docker, Dockerfiles y manifiestos de Kubernetes.
*   **Análisis de Dependencias:** Identifica vulnerabilidades conocidas en dependencias de software (npm, pip, maven, gem, etc.).
*   **Análisis de Seguridad de Red (Conceptual):** Evalúa descripciones de configuraciones de red, reglas de firewall y resultados de escaneos (ej. Nmap) para identificar debilidades.
*   **Generación de Informes:** Crea informes de seguridad completos en Markdown, incluyendo un resumen ejecutivo, detalles de hallazgos, CVSS (si aplica) y consideraciones generales de cumplimiento.
*   **Generación de Vectores de Ataque:** Ilustra posibles escenarios de ataque para las vulnerabilidades encontradas (función premium).
*   **Generación de Playbooks de Remediación:** Proporciona guías paso a paso para corregir vulnerabilidades (función premium).
*   **Asistente de Chat IA:** Proporciona respuestas a consultas de seguridad y sobre la plataforma.
*   **Modo Premium Simulado:** Desbloquea funciones avanzadas como informes técnicos detallados, escenarios de ataque, playbooks y descarga de resultados en ZIP.
*   **Exportación de Hallazgos en JSON:** Permite descargar todos los hallazgos en formato JSON para integración con otras herramientas (ej. SIEM).

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
    En la raíz del proyecto, crea un archivo llamado `.env`. Puedes copiar y renombrar `.env.example` si existe.
    ```
    GOOGLE_API_KEY=tu_clave_api_aqui
    ```
    **IMPORTANTE:** Reemplaza `tu_clave_api_aqui` con tu clave API real de Google AI. Asegúrate de que esta variable esté correctamente configurada y no esté vacía. Si la clave no es válida o está ausente, la aplicación mostrará errores relacionados con la IA.

2.  **Obtén tu Clave API de Google AI:**
    Visita [Google AI Studio](https://aistudio.google.com/app/apikey) para generar una clave API si aún no tienes una.

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

*   **Documentación Técnica Detallada:** Crear una carpeta `/docs` o una Wiki del proyecto con explicaciones sobre la arquitectura, los flujos de IA, y cómo extender la plataforma.
*   **Automatizaciones y Testing:**
    *   Agregar Prettier, ESLint y Husky para mantener la calidad del código.
    *   Implementar tests unitarios (Jest, Vitest) para componentes y lógica de negocio.
    *   Configurar CI/CD con GitHub Actions para automatizar builds y tests.
*   **Análisis de APIs REST y GraphQL (Profundización).**
*   **Escaneo de Red Directo (Avanzado):** Integración con herramientas como Nmap para realizar escaneos de red activos (requiere consideraciones de seguridad y permisos).
*   **Integración Directa con Firewalls/Infraestructura (Avanzado):** Para análisis y sugerencias de configuración automáticas.
*   **Informes en PDF:** Generación de informes formales en formato PDF (actualmente se generan en Markdown, que puede ser convertido externamente).
*   **Mapeo Detallado con OWASP Top 10 y otros frameworks (ej. MITRE ATT&CK).**
*   **Panel administrativo para gestión de la plataforma.**
*   **Integraciones SIEM/SOAR (Avanzado):** Más allá de la exportación JSON, webhooks directos o APIs para sistemas específicos.
*   **Gestión de usuarios y RBAC (Control de Acceso Basado en Roles).**
*   **Interfaz de Línea de Comandos (CLI).**
*   **Historial de análisis por usuario (requiere autenticación de usuarios).**
*   **Implementación de sistema de pagos real (ej. PayPal, Stripe) para servicios premium.**

## Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.

**Idea y Visión:** Ronald Gonzalez Niche
