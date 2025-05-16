
# Centro de Análisis de Seguridad Integral

Este es un proyecto Next.js que utiliza Genkit para proporcionar un Centro de Análisis de Seguridad Integral. La plataforma permite analizar URLs, descripciones de configuraciones de servidores (incluyendo servidores de juegos), bases de datos, código (SAST), aplicaciones en ejecución (DAST simulado), configuraciones de nube (AWS, Azure, GCP), seguridad de contenedores (Docker, Kubernetes), dependencias de software y descripciones de configuraciones de red para identificar vulnerabilidades de seguridad utilizando IA.

**Idea y Visión:** Ronald Gonzalez Niche

## ¿Qué Problema Resuelve?

En el panorama digital actual, las empresas y los desarrolladores enfrentan una creciente amenaza de ciberataques. Asegurar cada componente de una aplicación o infraestructura puede ser complejo y llevar mucho tiempo. Este proyecto tiene como objetivo simplificar y automatizar gran parte de este proceso, proporcionando una visión unificada de la postura de seguridad de diversos activos digitales y ayudando a priorizar los esfuerzos de remediación.

## Funcionalidades Principales

*   **Análisis de URL:** Evalúa la seguridad de URLs de aplicaciones web.
*   **Análisis de Servidores:** Analiza descripciones de configuraciones de servidores (generales y de juegos) en busca de vulnerabilidades.
*   **Análisis de Bases de Datos:** Examina descripciones de configuraciones de bases de datos para identificar riesgos.
*   **Análisis de Código Estático (SAST):** Evalúa fragmentos de código en busca de patrones inseguros, con sugerencias de corrección (incluyendo contexto de código y línea afectada).
*   **Análisis de Aplicaciones Dinámicas (DAST Simulado):** Simula pruebas dinámicas en URLs de aplicaciones para encontrar vulnerabilidades (incluyendo parámetro afectado, ejemplos de petición/respuesta).
*   **Análisis de Configuración Cloud (Conceptual):** Analiza descripciones de configuraciones para AWS, Azure y GCP.
*   **Análisis de Seguridad de Contenedores (Conceptual):** Evalúa la seguridad de imágenes Docker, Dockerfiles y manifiestos de Kubernetes.
*   **Análisis de Dependencias de Software (Conceptual):** Identifica vulnerabilidades conocidas en dependencias de software (npm, pip, maven, gem, etc.) basado en el contenido del archivo de dependencias.
*   **Análisis de Seguridad de Red (Conceptual):** Evalúa descripciones de configuraciones de red, reglas de firewall y resultados de escaneos (ej. Nmap) para identificar debilidades.
*   **Generación de Informes:** Crea informes de seguridad completos en Markdown, incluyendo un resumen ejecutivo, detalles de hallazgos, CVSS (si aplica), consideraciones generales de cumplimiento y detalles específicos por tipo de análisis.
*   **Generación de Vectores de Ataque (Premium Simulado):** Ilustra posibles escenarios de ataque para las vulnerabilidades encontradas.
*   **Generación de Playbooks de Remediación (Premium Simulado):** Proporciona guías paso a paso para corregir vulnerabilidades.
*   **Asistente de Chat IA:** Proporciona respuestas a consultas de seguridad y sobre la plataforma.
*   **Modo Premium Simulado:** Desbloquea funciones avanzadas como informes técnicos detallados, escenarios de ataque, playbooks y descarga de resultados en ZIP. (El acceso se simula mediante un interruptor en el header que representa un "inicio/cierre de sesión" con acceso premium).
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
    git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
    cd YOUR_REPOSITORY_NAME
    ```
    *(Reemplaza `YOUR_USERNAME/YOUR_REPOSITORY_NAME` con la URL real cuando subas el proyecto a GitHub).*
2.  **Instala las dependencias:**
    ```bash
    npm install
    # o
    yarn install
    ```

### Configuración de Variables de Entorno

Este proyecto requiere una clave API de Google AI para que funcionen las capacidades de Genkit.

1.  **Crea un archivo `.env.local`:**
    En la raíz del proyecto, crea un archivo llamado `.env.local`.
    ```
    NEXT_PUBLIC_GOOGLE_API_KEY=tu_clave_api_aqui
    ```
    **IMPORTANTE:** Reemplaza `tu_clave_api_aqui` con tu clave API real de Google AI. Asegúrate de que esta variable esté correctamente configurada y no esté vacía. El prefijo `NEXT_PUBLIC_` es la práctica recomendada por Next.js para variables que podrían necesitar ser accedidas por el cliente, aunque en nuestro caso Genkit se ejecuta principalmente en el servidor, esto asegura compatibilidad. **Si se omite o es incorrecta, la aplicación mostrará un error de configuración.**

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
*   **Firebase Hosting:** Si ya usas Firebase para otros servicios, puede ser una opción conveniente (requiere configuración para SSR de Next.js con Cloud Functions o Cloud Run).
*   **Docker:** Puedes crear una imagen Docker de la aplicación para desplegarla en cualquier proveedor de nube (AWS, GCP, Azure) o en tu propia infraestructura. (Un `Dockerfile` necesitaría ser creado).
*   **Servidores Node.js Tradicionales:** Desplegando la build de Next.js en un servidor Node.js.

## Modo Premium y Monetización (Simulado)

La plataforma incluye un "Modo Premium" simulado. Actualmente, se activa/desactiva a través de un botón en el encabezado que simula un "inicio/cierre de sesión" con acceso premium. Este modo representa conceptualmente un **usuario autenticado con una suscripción activa**. Cuando está activado, los usuarios obtienen acceso a:

*   **Informe Técnico Detallado:** El informe de seguridad completo generado por la IA, sin truncamiento.
*   **Detalles Completos de Hallazgos:** Incluye CVSS, impacto técnico y de negocio, evidencia y recomendaciones detalladas para todas las vulnerabilidades.
*   **Generación de Escenarios de Ataque Ilustrativos:** Ejemplos conceptuales de cómo podrían explotarse las vulnerabilidades.
*   **Generación de Playbooks de Remediación:** Guías paso a paso para corregir los problemas identificados.
*   **Descarga Completa de Resultados (ZIP):** Un archivo ZIP que contiene el informe, todos los hallazgos en JSON, los escenarios de ataque y los playbooks.

La descarga de todos los hallazgos en formato JSON está disponible para todos los usuarios como una forma de facilitar la integración con herramientas externas.

## Pasos Críticos para Puesta en Marcha Online (Producción)

Para transformar este proyecto de un prototipo local a un servicio online funcional y comercializable, se requieren los siguientes pasos fundamentales:

1.  **Autenticación y Autorización de Usuarios Real:**
    *   Implementar un sistema robusto como NextAuth.js o Firebase Authentication.
    *   Permitir registro, inicio/cierre de sesión, y gestión de perfiles.
    *   Considerar RBAC (Control de Acceso Basado en Roles) para futuras funcionalidades empresariales.
2.  **Persistencia de Datos (Base de Datos):**
    *   Configurar y conectar una base de datos (ej. PostgreSQL, MongoDB, Firebase Firestore).
    *   Almacenar perfiles de usuario, estado de suscripciones, historial de análisis, y resultados.
3.  **Integración de Pasarela de Pagos:**
    *   Integrar Stripe, PayPal u otra pasarela para gestionar suscripciones y pagos por servicios premium.
    *   Implementar webhooks para confirmaciones de pago y actualización de estado de suscripción.
4.  **Despliegue y Alojamiento Profesional:**
    *   Seleccionar una plataforma de hosting (Vercel, AWS, GCP, Azure).
    *   Configurar variables de entorno de producción de forma segura.
    *   Configurar dominio personalizado y SSL/TLS.
5.  **Seguridad de la Plataforma:**
    *   Proteger todas las claves API y credenciales sensibles.
    *   Implementar validaciones de entrada exhaustivas en el backend.
    *   Considerar rate limiting y protección DDoS para los endpoints.
6.  **Aspectos Legales:**
    *   Redactar y publicar Términos de Servicio y Política de Privacidad detallados.
    *   Asegurar el cumplimiento con regulaciones de protección de datos (GDPR, CCPA, etc.).
7.  **Operaciones y Mantenimiento:**
    *   Implementar logging y monitorización para la aplicación.
    *   Establecer estrategias de copia de seguridad y recuperación de datos.
    *   Definir canales de soporte al cliente.

## Roadmap (Posibles Mejoras Futuras)

Además de los pasos críticos para producción, se podrían considerar:

*   **Documentación Técnica Detallada:** Crear una carpeta `/docs` o una Wiki del proyecto.
*   **Automatizaciones y Testing:**
    *   Agregar Prettier, ESLint y Husky para mantener la calidad del código.
    *   Implementar tests unitarios (Jest, Vitest) para componentes y lógica de negocio.
    *   Configurar CI/CD con GitHub Actions para automatizar builds y tests.
*   **Análisis de APIs REST y GraphQL (Profundización).**
*   **Escaneo de Red Directo (Avanzado):** Integración con herramientas como Nmap para realizar escaneos de red activos (requiere consideraciones de seguridad y permisos).
*   **Informes en PDF:** Generación de informes formales en formato PDF.
*   **Mapeo Detallado con OWASP Top 10 y otros frameworks (ej. MITRE ATT&CK).**
*   **Panel administrativo para gestión de la plataforma.**
*   **Integraciones SIEM/SOAR (Avanzado):** Más allá de la exportación JSON, webhooks directos o APIs para sistemas específicos.
*   **Interfaz de Línea de Comandos (CLI).**
*   **Historial de análisis por usuario (requiere autenticación de usuarios).**
*   **Mejoras Específicas Servidores de Juegos:** Análisis de protocolos, detección de trampas, análisis de mods/scripts.

## Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.

**Idea y Visión:** Ronald Gonzalez Niche
