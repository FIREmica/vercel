
# Centro de Análisis de Seguridad Integral

Este es un proyecto Next.js que utiliza Genkit para proporcionar un Centro de Análisis de Seguridad Integral. La plataforma permite analizar URLs, descripciones de configuraciones de servidores (incluyendo servidores de juegos como Lineage 2, Roblox, Tibia), bases de datos, código (SAST simulado), aplicaciones en ejecución (DAST simulado), configuraciones de nube (AWS, Azure, GCP - conceptual), seguridad de contenedores (Docker, Kubernetes - conceptual), dependencias de software (conceptual) y descripciones de configuraciones de red (conceptual) para identificar vulnerabilidades de seguridad utilizando IA.

**Idea y Visión:** Ronald Gonzalez Niche

## ¿Qué Problema Resuelve?

En el panorama digital actual, las empresas y los desarrolladores enfrentan una creciente amenaza de ciberataques. Asegurar cada componente de una aplicación o infraestructura puede ser complejo y llevar mucho tiempo. Este proyecto tiene como objetivo simplificar y automatizar gran parte de este proceso, proporcionando una visión unificada de la postura de seguridad de diversos activos digitales y ayudando a priorizar los esfuerzos de remediación.

## Funcionalidades Principales

*   **Análisis Multi-Objetivo:** Capacidad para analizar simultáneamente:
    *   URLs de aplicaciones web (riesgos comunes como XSS, SQLi).
    *   Descripciones de Servidores (generales y de juegos como Lineage 2, Roblox, Tibia) en busca de vulnerabilidades de configuración.
    *   Descripciones de Bases de Datos para identificar riesgos de configuración y acceso.
    *   Fragmentos de Código para Análisis Estático (SAST simulado) con sugerencias contextuales, línea de código y lenguaje específico.
    *   URLs para Análisis Dinámico (DAST simulado) con ejemplos conceptuales de petición/respuesta.
    *   Descripciones de Configuración Cloud (AWS, Azure, GCP - conceptual) para malas configuraciones.
    *   Información de Contenedores (nombre de imagen, Dockerfile, manifiestos K8s - conceptual).
    *   Contenido de Archivos de Dependencias (npm, pip, maven, gem - conceptual).
    *   Descripciones de Configuración de Red, reglas de firewall y resultados de escaneos (ej. Nmap - conceptual).
*   **Generación de Informes Detallados:** Creación de informes de seguridad completos en Markdown, incluyendo:
    *   Resumen ejecutivo general.
    *   Detalles de hallazgos por cada tipo de análisis realizado (con CVSS y detalles técnicos si son Premium).
    *   Severidad, descripción, impacto potencial y remediación sugerida para cada hallazgo.
    *   Contexto específico para hallazgos SAST (ruta, línea, fragmento de código, sugerencia de arreglo) y DAST (parámetro, petición/respuesta).
    *   Consideraciones generales de cumplimiento normativo.
*   **Modo Premium Simulado (con opción de Botón PayPal):** Desbloquea funciones avanzadas mediante un interruptor en el header que simula un "inicio/cierre de sesión" con acceso premium, o mediante un flujo de pago conceptual con PayPal (utilizando la API REST de PayPal en modo Sandbox para la creación de órdenes y el SDK de JS para el renderizado de botones). Las funciones premium incluyen:
    *   **Informe Técnico Detallado:** El informe de seguridad completo sin truncamiento.
    *   **Generación de Escenarios de Ataque Ilustrativos:** Ejemplos conceptuales de cómo podrían explotarse las vulnerabilidades.
    *   **Generación de Playbooks de Remediación Sugeridos:** Guías paso a paso en Markdown para corregir vulnerabilidades.
    *   **Descarga Completa de Resultados (ZIP):** Un archivo ZIP que contiene el informe Markdown, todos los hallazgos en JSON, los escenarios de ataque y los playbooks.
*   **Exportación de Hallazgos en JSON:** Permite descargar todos los hallazgos (vulnerables o no) en formato JSON para integración con otras herramientas (ej. SIEM), disponible para todos los usuarios.
*   **Asistente de Chat IA:** Un chatbot integrado para responder consultas sobre ciberseguridad y el uso de la plataforma.
*   **Interfaz de Usuario Moderna:** Desarrollada con Next.js, ShadCN UI y Tailwind CSS, con modo oscuro por defecto y en español.

## Tecnologías Usadas

*   **Frontend:** Next.js, React, TypeScript
*   **UI:** ShadCN UI Components, Tailwind CSS
*   **Inteligencia Artificial:** Genkit (Google AI)
*   **Empaquetado (Descargas ZIP):** JSZip
*   **Pasarela de Pagos (Integración Conceptual):** PayPal (con SDK `@paypal/checkout-server-sdk` para backend y SDK de JS para frontend)
*   **Autenticación y Base de Datos (En preparación):** Supabase (Cliente JS)
*   **Validación de Esquemas:** Zod
*   **Fuentes:** Geist Sans, Geist Mono

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

Este proyecto requiere claves API para funcionar correctamente.

1.  **Crea un archivo `.env.local` en la raíz del proyecto:**
    ```env
    # Clave API de Google AI (Requerida para los análisis de IA)
    # Consigue tu clave en https://aistudio.google.com/app/apikey
    NEXT_PUBLIC_GOOGLE_API_KEY=tu_clave_api_google_aqui

    # Credenciales de PayPal API REST para el entorno Sandbox (Requeridas para la simulación de pagos)
    # Reemplaza estos valores con tus propias credenciales de Sandbox de PayPal Developer
    # Estas son usadas por el endpoint /api/paypal/create-order
    PAYPAL_CLIENT_ID=tu_paypal_sandbox_client_id_aqui_para_api_rest 
    PAYPAL_CLIENT_SECRET=tu_paypal_sandbox_client_secret_aqui
    PAYPAL_API_BASE_URL=https://api-m.sandbox.paypal.com # Para desarrollo y pruebas con Sandbox
    # Para producción, usarías: PAYPAL_API_BASE_URL=https://api-m.paypal.com y credenciales Live

    # Client ID de PayPal para el SDK de JavaScript (Frontend)
    # Asegúrate que este Client ID corresponda a la misma aplicación API REST configurada arriba, o a una específica para el SDK si así lo prefieres.
    # Esta es usada en src/app/layout.tsx para cargar el SDK de PayPal.
    NEXT_PUBLIC_PAYPAL_CLIENT_ID=tu_paypal_sandbox_client_id_aqui_para_sdk_js

    # Credenciales de Supabase (Requeridas para la futura autenticación y base de datos)
    # Reemplaza estos valores con tus propias credenciales de tu proyecto Supabase
    NEXT_PUBLIC_SUPABASE_URL=https://tu_id_proyecto_supabase.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui

    # Para operaciones del lado del servidor con Supabase (si se implementan), necesitarías:
    # SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key_aqui
    # Y posiblemente las cadenas de conexión a la base de datos si usas Prisma con Supabase:
    # POSTGRES_URL="postgres://postgres.[tu_proyecto_ref]:[tu_password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require"
    # POSTGRES_PRISMA_URL="postgres://postgres.[tu_proyecto_ref]:[tu_password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
    # POSTGRES_URL_NON_POOLING="postgres://postgres.[tu_proyecto_ref]:[tu_password]@aws-0-[region].pooler.supabase.com:5432/postgres?sslmode=require"
    # POSTGRES_USER="postgres"
    # POSTGRES_PASSWORD="[tu_password]"
    # POSTGRES_HOST="aws-0-[region].pooler.supabase.com"
    # POSTGRES_DATABASE="postgres"
    # SUPABASE_JWT_SECRET="tu_jwt_secret_aqui"
    ```
    **IMPORTANTE:**
    *   Reemplaza `tu_clave_api_google_aqui` con tu clave API real de Google AI. **Asegúrate de que esta variable esté correctamente configurada y no sea el valor predeterminado/placeholder.** La aplicación verificará esta clave y mostrará errores si no está configurada o es inválida.
    *   Reemplaza `tu_paypal_sandbox_client_id_aqui_para_api_rest`, `tu_paypal_sandbox_client_secret_aqui` y `tu_paypal_sandbox_client_id_aqui_para_sdk_js` con tus credenciales reales de una aplicación Sandbox que crees en el [Portal de Desarrolladores de PayPal](https://developer.paypal.com/). Es crucial que el `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (usado por el SDK de JS en el frontend) y el `PAYPAL_CLIENT_ID` (usado por la API de backend) estén correctamente configurados, idealmente correspondiendo a la misma aplicación REST API de PayPal para evitar confusiones.
    *   Reemplaza `https://tu_id_proyecto_supabase.supabase.co` y `tu_supabase_anon_key_aqui` con las credenciales de tu proyecto Supabase. Puedes encontrarlas en la configuración de tu proyecto Supabase en "Project Settings > API".
    *   **No subas el archivo `.env.local` a tu repositorio de Git.** Asegúrate de que esté en tu archivo `.gitignore`.

2.  **Obtén tus Claves API:**
    *   **Google AI:** Visita [Google AI Studio](https://aistudio.google.com/app/apikey) para generar una clave API si aún no tienes una.
    *   **PayPal Sandbox:**
        1.  Ve a [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox).
        2.  Crea una nueva aplicación REST API si no tienes una.
        3.  Copia el `Client ID` y el `Client Secret` de tu aplicación Sandbox. Usarás el `Client ID` tanto para `PAYPAL_CLIENT_ID` (backend) como para `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (frontend SDK).
    *   **Supabase:**
        1.  Ve a [Supabase Dashboard](https://supabase.com/dashboard).
        2.  Crea un nuevo proyecto o selecciona uno existente.
        3.  En "Project Settings" (Configuración del Proyecto) > "API", encontrarás tu "Project URL" (NEXT_PUBLIC_SUPABASE_URL) y la "anon public" key (NEXT_PUBLIC_SUPABASE_ANON_KEY). La "service_role" key (SUPABASE_SERVICE_ROLE_KEY) también está ahí y es para operaciones de backend.

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
*   **Firebase Hosting:** Si ya usas Firebase para otros servicios, puede ser una opción (requiere configuración para SSR de Next.js con Cloud Functions o Cloud Run).
*   **Docker:** Puedes crear una imagen Docker de la aplicación para desplegarla en cualquier proveedor de nube (AWS, GCP, Azure) o en tu propia infraestructura. (Un `Dockerfile` necesitaría ser creado).
*   **Servidores Node.js Tradicionales:** Desplegando la build de Next.js en un servidor Node.js.

**Al desplegar, asegúrate de configurar las variables de entorno (`NEXT_PUBLIC_GOOGLE_API_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_API_BASE_URL`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` si es necesario) en la configuración de tu proveedor de hosting.**

## Modo Premium y Monetización (Simulado)

La plataforma incluye un "Modo Premium" simulado. Actualmente, se activa/desactiva a través de un botón en el encabezado que simula un "inicio/cierre de sesión" con acceso premium. Este modo representa conceptualmente un **usuario autenticado con una suscripción activa**.

También se ha integrado una simulación del proceso de suscripción utilizando la **API REST de PayPal (con credenciales Sandbox)**:
*   El frontend llama a un endpoint de API del backend (`/api/paypal/create-order`) para crear una orden de pago en PayPal.
*   El SDK de JavaScript de PayPal en el frontend renderiza los botones de pago.
*   El usuario puede completar el flujo de pago en el entorno Sandbox de PayPal.
*   Tras una "aprobación" simulada del pago en el frontend (`onApprove` del SDK de JS), se activa el modo premium.

Es importante destacar que esta integración con PayPal **no está conectada a una lógica de backend que active automáticamente las funciones premium tras una confirmación de pago real y persistente por parte de PayPal (Webhooks/IPN)**. Para ello, se requeriría implementar:
1.  **Captura Segura de Pagos en Backend:** Un endpoint que reciba el `orderID` aprobado y lo capture con la API de PayPal para asegurar los fondos.
2.  **Endpoints de Webhook en el backend:** Para recibir notificaciones de pago de PayPal (ej. `PAYMENT.CAPTURE.COMPLETED`).
3.  **Una base de datos (como la que se podría configurar con Supabase):** Para almacenar el estado de la suscripción de los usuarios.
4.  **Lógica para actualizar el estado de la suscripción en la base de datos:** Basada en las notificaciones de PayPal y la captura exitosa de pagos.

Cuando el "Modo Premium" está activado (`isLoggedInAndPremium` es `true` en el estado de `src/app/page.tsx`), los usuarios obtienen acceso a:

*   **Informe Técnico Detallado:** El informe de seguridad completo generado por la IA, sin truncamiento.
*   **Detalles Completos de Hallazgos:** Incluye CVSS, impacto técnico y de negocio, evidencia y recomendaciones detalladas para todas las vulnerabilidades.
*   **Generación de Escenarios de Ataque Ilustrativos:** Ejemplos conceptuales de cómo podrían explotarse las vulnerabilidades.
*   **Generación de Playbooks de Remediación Sugeridos:** Guías paso a paso para corregir los problemas identificados.
*   **Descarga Completa de Resultados (ZIP):** Un archivo ZIP que contiene el informe Markdown, todos los hallazgos en JSON, los escenarios de ataque y los playbooks.

La descarga de todos los hallazgos en formato JSON está disponible para todos los usuarios (premium o no) como una forma de facilitar la integración con herramientas externas.

## Implementación de Autenticación Real (Próximos Pasos con Supabase)

La simulación actual del "Modo Premium" es solo un placeholder. Para una aplicación comercial real, se necesita un sistema de autenticación robusto. Una excelente opción para Next.js es **Supabase**, que proporciona autenticación y una base de datos PostgreSQL. Ya hemos añadido las librerías cliente de Supabase y los formularios de login/signup ahora *intentan* interactuar con Supabase.

Los pasos conceptuales para integrar Supabase Auth completamente serían:

1.  **Configurar Supabase en el Proyecto:**
    *   Asegurarse de que las variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén configuradas en `.env.local`. (Hecho)
    *   Utilizar el cliente Supabase inicializado en `src/lib/supabase/client.ts`. (Hecho)
2.  **Crear y Conectar la UI de Autenticación:**
    *   Modificar las páginas `src/app/login/page.tsx` y `src/app/signup/page.tsx` para usar las funciones de autenticación de Supabase (`supabase.auth.signInWithPassword()`, `supabase.auth.signUp()`) y manejar las respuestas y errores correctamente. (Progreso inicial realizado)
    *   Considerar usar `@supabase/auth-ui-react` para una UI preconstruida si se desea una implementación más rápida de la UI.
3.  **Manejo de Sesiones Global:**
    *   Utilizar el cliente de Supabase para gestionar el estado de la sesión del usuario en toda la aplicación. Esto típicamente involucra:
        *   Escuchar `supabase.auth.onAuthStateChange()` en un componente de nivel superior (ej. `src/app/layout.tsx` o `src/app/page.tsx`) para detectar cambios en el estado de autenticación.
        *   Actualizar un estado global o un contexto de React con la información del usuario y la sesión.
        *   El estado `isLoggedInAndPremium` en `src/app/page.tsx` debería derivarse de este estado de sesión real.
4.  **Proteger Rutas y API Endpoints:**
    *   En Server Components o API Routes, obtener la sesión del usuario desde Supabase para verificar la autenticación antes de permitir el acceso a datos o funcionalidades protegidas.
    *   En Client Components, usar el estado de la sesión para redirigir o mostrar contenido condicionalmente.
5.  **Conectar con Base de Datos Supabase para Perfiles y Suscripciones:**
    *   Definir tablas en tu base de datos Supabase para `UserProfile` y `AnalysisRecord` (los esquemas Zod que tenemos en `src/types/ai-schemas.ts` son un buen punto de partida para esto).
    *   Al registrar un nuevo usuario con `supabase.auth.signUp()`, crear un perfil correspondiente en la tabla `UserProfile`.
    *   Modificar `src/app/actions.ts` y otras partes del backend para leer y escribir en estas tablas (ej. guardar historial de análisis vinculado a `userId`, actualizar estado de suscripción premium en `UserProfile` después de un pago confirmado).
6.  **Actualizar `AppHeader`:**
    *   Modificar `src/components/layout/header.tsx` para mostrar el estado de autenticación real (ej. email del usuario) y ofrecer opciones de login/logout/perfil basadas en la sesión de Supabase.

## Pasos Críticos para Puesta en Marcha Online (Producción)

Para transformar este proyecto de un prototipo local a un servicio online funcional y comercializable, se requieren los siguientes pasos fundamentales (además de la autenticación real con Supabase):

1.  **Persistencia de Datos (Base de Datos Supabase):**
    *   Utilizar la base de datos PostgreSQL de Supabase para almacenar perfiles de usuario, estado de suscripciones, historial de análisis y resultados.
    *   *Nota: Ya se han definido esquemas Zod (`UserProfileSchema`, `AnalysisRecordSchema`) en `src/types/ai-schemas.ts` como preparación para esta fase.*
2.  **Integración Completa de Pasarela de Pagos (PayPal o Stripe):**
    *   **Facturación Real:** Esto implica configurar productos/planes en la pasarela elegida, vincularlos a los perfiles de usuario en la base de datos de Supabase, implementar webhooks de la pasarela para confirmaciones de pago y actualizar el estado de la suscripción en la base de datos Supabase para otorgar/revocar el acceso premium automáticamente. La integración actual con PayPal es una demostración del flujo de pago inicial y no maneja la confirmación/activación automática.
3.  **Despliegue y Alojamiento Profesional:**
    *   Seleccionar una plataforma de hosting (Vercel, AWS, GCP, Azure).
    *   Configurar variables de entorno de producción de forma segura (clave Google AI, credenciales DB Supabase, claves de pasarela de pago Live).
    *   Configurar dominio personalizado y SSL/TLS.
4.  **Seguridad de la Plataforma:**
    *   Proteger todas las claves API y credenciales sensibles (especialmente `SUPABASE_SERVICE_ROLE_KEY` y secretos de pasarela de pago).
    *   Implementar validaciones de entrada exhaustivas en el backend.
    *   Considerar rate limiting y protección DDoS para los endpoints.
5.  **Aspectos Legales:**
    *   Redactar y publicar Términos de Servicio y Política de Privacidad detallados y legalmente válidos (el `terms.md` actual es un placeholder). Consultar con un profesional legal.
    *   Asegurar el cumplimiento con regulaciones de protección de datos (GDPR, CCPA, etc.).
6.  **Operaciones y Mantenimiento:**
    *   Implementar logging y monitorización para la aplicación (Supabase ofrece herramientas para esto).
    *   Establecer estrategias de copia de seguridad y recuperación de datos (Supabase gestiona backups).
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
*   **Historial de análisis por usuario (requiere autenticación y base de datos).**
*   **Mejoras Específicas Servidores de Juegos:** Análisis de protocolos, detección de trampas, análisis de mods/scripts.

## 🪪 Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.

**Idea y Visión:** Ronald Gonzalez Niche
