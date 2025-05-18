

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
    *   Detalles de hallazgos por cada tipo de análisis realizado (con CVSS y detalles técnicos si se ha iniciado sesión - simula Premium).
    *   Severidad, descripción, impacto potencial y remediación sugerida para cada hallazgo.
    *   Contexto específico para hallazgos SAST (ruta, línea, fragmento de código, sugerencia de arreglo) y DAST (parámetro, petición/respuesta).
    *   Consideraciones generales de cumplimiento normativo.
*   **Acceso a Funciones Avanzadas con Inicio de Sesión (Simula "Modo Premium"):** Al iniciar sesión (actualmente integrado con Supabase Auth), el usuario obtiene acceso a funciones avanzadas. Este estado de "sesión activa" simula tener una suscripción premium. Estas funciones incluyen:
    *   **Informe Técnico Detallado:** El informe de seguridad completo sin truncamiento.
    *   **Generación de Escenarios de Ataque Ilustrativos:** Ejemplos conceptuales de cómo podrían explotarse las vulnerabilidades.
    *   **Generación de Playbooks de Remediación Sugeridos:** Guías paso a paso en Markdown para corregir vulnerabilidades.
    *   **Descarga Completa de Resultados (ZIP):** Un archivo ZIP que contiene el informe Markdown, todos los hallazgos en JSON, los escenarios de ataque y los playbooks.
*   **Flujo de Pago Conceptual con PayPal:** La plataforma incluye una integración con la API REST de PayPal (Sandbox) para simular el proceso de "compra" de una suscripción. Si un usuario (que ya ha iniciado sesión) completa este flujo de pago simulado, se refuerza su estado "Premium". Esto demuestra cómo se podría manejar la monetización.
*   **Exportación de Hallazgos en JSON:** Permite descargar todos los hallazgos (vulnerables o no) en formato JSON para integración con otras herramientas (ej. SIEM), disponible para todos los usuarios.
*   **Asistente de Chat IA:** Un chatbot integrado para responder consultas sobre ciberseguridad y el uso de la plataforma.
*   **Interfaz de Usuario Moderna:** Desarrollada con Next.js, ShadCN UI y Tailwind CSS, con modo oscuro por defecto y en español.

## Tecnologías Usadas

*   **Frontend:** Next.js, React, TypeScript
*   **UI:** ShadCN UI Components, Tailwind CSS
*   **Inteligencia Artificial:** Genkit (Google AI)
*   **Empaquetado (Descargas ZIP):** JSZip
*   **Pasarela de Pagos (Integración Conceptual):** PayPal (con SDK `@paypal/checkout-server-sdk` para backend y SDK de JS para frontend)
*   **Autenticación y Base de Datos (En preparación):** Supabase (Cliente JS `@supabase/supabase-js` y `@supabase/ssr` para helpers del lado del servidor)
*   **Gestión de Estado de Autenticación:** React Context (`AuthProvider`) para manejar la sesión de Supabase globalmente.
*   **Validación de Esquemas:** Zod
*   **Fuentes:** Geist Sans, Geist Mono

## Instalación y Ejecución Local

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local.

### Prerrequisitos

*   Node.js (versión 18 o superior recomendada)
*   npm o yarn
*   Una cuenta de Supabase ([supabase.com](https://supabase.com/))
*   Una cuenta de PayPal Developer ([developer.paypal.com](https://developer.paypal.com/)) para credenciales Sandbox.

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

1.  **Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:**
    ```env
    # Clave API de Google AI (Requerida para los análisis de IA)
    # Consigue tu clave en https://aistudio.google.com/app/apikey
    NEXT_PUBLIC_GOOGLE_API_KEY=tu_clave_api_google_aqui_valida

    # Credenciales de PayPal API REST para el entorno Sandbox (Requeridas para la simulación de pagos)
    # Reemplaza estos valores con tus propias credenciales de Sandbox de PayPal Developer
    # Estas son usadas por el endpoint /api/paypal/create-order
    PAYPAL_CLIENT_ID=tu_paypal_sandbox_client_id_aqui_para_api_rest
    PAYPAL_CLIENT_SECRET=tu_paypal_sandbox_client_secret_aqui
    PAYPAL_API_BASE_URL=https://api-m.sandbox.paypal.com # Para desarrollo y pruebas con Sandbox
    # Para producción, usarías: PAYPAL_API_BASE_URL=https://api-m.paypal.com y credenciales Live

    # Client ID de PayPal para el SDK de JavaScript (Frontend)
    # IMPORTANTE: Este Client ID (NEXT_PUBLIC_PAYPAL_CLIENT_ID) debe ser el MISMO que el PAYPAL_CLIENT_ID
    # usado para la API REST arriba. Ambos deben corresponder al Client ID de tu aplicación REST API creada en el PayPal Developer Portal.
    # Esta es usada en src/app/layout.tsx para cargar el SDK de PayPal.
    NEXT_PUBLIC_PAYPAL_CLIENT_ID=tu_paypal_sandbox_client_id_aqui_para_sdk_js_ (el mismo que PAYPAL_CLIENT_ID)

    # Credenciales de Supabase (Requeridas para la autenticación y futura base de datos)
    # Reemplaza estos valores con tus propias credenciales de tu proyecto Supabase
    NEXT_PUBLIC_SUPABASE_URL="https://tu_id_proyecto_supabase.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="tu_supabase_anon_key_aqui"

    # Para operaciones del lado del servidor con Supabase (si se implementan, ej. para proteger rutas API o Server Actions), necesitarías:
    # SUPABASE_SERVICE_ROLE_KEY="tu_supabase_service_role_key_aqui"
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
    *   Reemplaza `tu_clave_api_google_aqui_valida` con tu clave API real de Google AI. **Asegúrate de que esta variable esté correctamente configurada y no sea el valor predeterminado/placeholder.** La aplicación verificará esta clave y mostrará errores si no está configurada o es inválida.
    *   Reemplaza `tu_paypal_sandbox_client_id_aqui_para_api_rest` y `tu_paypal_sandbox_client_secret_aqui` con tus credenciales reales de una aplicación Sandbox que crees en el [Portal de Desarrolladores de PayPal](https://developer.paypal.com/).
    *   **Crucial para PayPal:** El valor de `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (usado por el SDK de JS en el frontend) **debe ser el mismo** que el valor de `PAYPAL_CLIENT_ID` (usado por la API de backend). Ambos deben ser el Client ID de tu aplicación REST API de PayPal.
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
        3.  En "Project Settings" (Configuración del Proyecto) > "API", encontrarás tu "Project URL" (`NEXT_PUBLIC_SUPABASE_URL`) y la "anon public" key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`). La "service_role" key (`SUPABASE_SERVICE_ROLE_KEY`) también está ahí y es para operaciones de backend.

### Configuración de Supabase (Mínimo para el ejemplo `/notes`)

1.  **Crea la tabla `notes` y políticas RLS:**
    *   En el panel de tu proyecto Supabase, ve al **SQL Editor**.
    *   Ejecuta el siguiente script para crear la tabla `notes`, insertar datos de ejemplo y habilitar la seguridad a nivel de fila (RLS) permitiendo lectura pública anónima:
      ```sql
      -- Create the table
      create table notes (
        id bigint primary key generated always as identity,
        title text not null
      );

      -- Insert some sample data into the table
      insert into notes (title)
      values
        ('Today I created a Supabase project.'),
        ('I added some data and queried it from Next.js.'),
        ('It was awesome!');

      -- Enable Row Level Security (RLS)
      alter table notes enable row level security;

      -- Create a policy to allow public read access (for anonymous users)
      create policy "public can read notes"
      on notes -- Corregido 'public.notes' a solo 'notes'
      for select to anon
      using (true);
      ```

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

## Modo Premium y Monetización (Simulado con Supabase Auth y PayPal)

La plataforma simula un "Modo Premium" que se activa cuando un usuario **inicia sesión** utilizando el sistema de autenticación de **Supabase**. Una vez que el usuario tiene una sesión activa, se considera que tiene acceso a las funciones premium.

Adicionalmente, se ha integrado una **simulación del proceso de suscripción utilizando la API REST de PayPal (con credenciales Sandbox)**:
*   Si un usuario ya ha iniciado sesión (con Supabase), puede optar por realizar un "pago" simulado a través de PayPal.
*   El frontend llama a un endpoint de API del backend (`/api/paypal/create-order`) para crear una orden de pago en PayPal.
*   El SDK de JavaScript de PayPal en el frontend renderiza los botones de pago.
*   El usuario puede completar el flujo de pago en el entorno Sandbox de PayPal.
*   Tras una "aprobación" simulada del pago en el frontend (`onApprove` del SDK de JS), se muestra una notificación de éxito. En un sistema real, este evento (confirmado por el backend) actualizaría el estado de la suscripción del usuario en la base de datos.

Es importante destacar que la integración con PayPal **no está conectada a una lógica de backend que active automáticamente las funciones premium tras una confirmación de pago real y persistente por parte de PayPal (Webhooks/IPN)**. Para ello, se requeriría implementar:
1.  **Captura Segura de Pagos en Backend:** Un endpoint que reciba el `orderID` aprobado y lo capture con la API de PayPal para asegurar los fondos.
2.  **Endpoints de Webhook en el backend:** Para recibir notificaciones de pago de PayPal (ej. `PAYMENT.CAPTURE.COMPLETED`).
3.  **Una base de datos (como la que se configuraría con Supabase):** Para almacenar el estado de la suscripción de los usuarios (además de su perfil básico).
4.  **Lógica para actualizar el estado de la suscripción en la base de datos:** Basada en las notificaciones de PayPal y la captura exitosa de pagos.

Cuando el "Modo Premium" está activo (usuario con sesión activa en Supabase), los usuarios obtienen acceso a:

*   **Informe Técnico Detallado:** El informe de seguridad completo generado por la IA, sin truncamiento.
*   **Detalles Completos de Hallazgos:** Incluye CVSS, impacto técnico y de negocio, evidencia y recomendaciones detalladas para todas las vulnerabilidades.
*   **Generación de Escenarios de Ataque Ilustrativos:** Ejemplos conceptuales de cómo podrían explotarse las vulnerabilidades.
*   **Generación de Playbooks de Remediación Sugeridos:** Guías paso a paso para corregir los problemas identificados.
*   **Descarga Completa de Resultados (ZIP):** Un archivo ZIP que contiene el informe Markdown, todos los hallazgos en JSON, los escenarios de ataque y los playbooks.

La descarga de todos los hallazgos en formato JSON está disponible para todos los usuarios (con o sin sesión activa) como una forma de facilitar la integración con herramientas externas.

## Implementación de Autenticación Real y Base de Datos (En Progreso con Supabase)

La plataforma ahora utiliza **Supabase Auth** para la autenticación de usuarios. El estado de sesión se maneja globalmente mediante un `AuthProvider` de React Context.

**Estado Actual de la Integración con Supabase:**

*   **Autenticación de Usuarios:** Los formularios de Login y Signup (`/login`, `/signup`) interactúan con `supabase.auth.signInWithPassword()` y `supabase.auth.signUp()`.
*   **Gestión de Sesión Global:** Un `AuthProvider` (`src/context/AuthContext.tsx`) maneja el estado de la sesión de Supabase en toda la aplicación. El encabezado y la página principal reflejan si hay un usuario autenticado.
*   **Simulación de "Premium":** Por ahora, si un usuario ha iniciado sesión, se considera que tiene acceso "Premium" a todas las funciones.
*   **Ejemplo de Base de Datos:** La página `/notes` demuestra cómo obtener datos de una tabla de Supabase.

**Próximos Pasos Críticos para una Integración Completa de Supabase:**

1.  **Crear Tablas en Supabase para la Aplicación:**
    *   Usar el Editor SQL de Supabase (o migraciones) para crear las tablas `UserProfile` y `AnalysisRecord` basadas en los esquemas Zod definidos en `src/types/ai-schemas.ts`. Esto es esencial para almacenar datos de usuarios y sus análisis.
    *   Configurar políticas RLS apropiadas para estas tablas (ej. los usuarios solo pueden acceder y modificar sus propios datos).
2.  **Conectar Funcionalidades Premium con la Base de Datos:**
    *   Al registrar un nuevo usuario, crear un perfil correspondiente en la tabla `UserProfile`.
    *   Modificar la lógica del "Modo Premium": en lugar de solo verificar si hay una sesión, se debería consultar la tabla `UserProfile` para verificar el estado de la suscripción del usuario (ej. un campo `subscription_status` o `has_premium_access`). Esto separaría el "estar logueado" de "tener premium".
    *   Guardar los resultados de los análisis (`AnalysisResult`) en la tabla `AnalysisRecord`, vinculados al `userId` del usuario autenticado.
    *   Permitir a los usuarios ver un historial de sus análisis anteriores consultando la tabla `AnalysisRecord`.
3.  **Implementar la Lógica de Backend para Pagos Reales:**
    *   Crear un endpoint en el backend para "capturar" los pagos de PayPal después de la aprobación del usuario.
    *   Este endpoint actualizaría el estado de la suscripción en la tabla `UserProfile` de Supabase.
    *   Implementar Webhooks de PayPal para manejar actualizaciones de estado de pagos de forma robusta.
4.  **Proteger Rutas y API Endpoints del Lado del Servidor:**
    *   Utilizar el cliente de servidor de Supabase (`src/lib/supabase/server.ts`) en API Routes y Server Actions para verificar la autenticación y autorización antes de realizar operaciones sensibles o acceder a datos protegidos.

## Pasos Críticos para Puesta en Marcha Online (Producción)

Para transformar este proyecto de un prototipo local a un servicio online funcional y comercializable, se requieren los siguientes pasos fundamentales (además de la integración completa de autenticación y base de datos con Supabase y la pasarela de pagos):

1.  **Persistencia de Datos (Base de Datos Supabase):**
    *   Completar la creación de tablas y la lógica para almacenar perfiles de usuario, estado de suscripciones, historial de análisis y resultados.
2.  **Integración Completa de Pasarela de Pagos (PayPal o Stripe):**
    *   **Facturación Real:** Esto implica configurar productos/planes en la pasarela elegida (ej. PayPal), vincularlos a los perfiles de usuario en la base de datos de Supabase, implementar webhooks de la pasarela para confirmaciones de pago y actualizar el estado de la suscripción en la base de datos Supabase para otorgar/revocar el acceso premium automáticamente.
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
*   **Historial de análisis por usuario (requiere base de datos y autenticación completa).**
*   **Mejoras Específicas Servidores de Juegos:** Análisis de protocolos, detección de trampas, análisis de mods/scripts.

## 🪪 Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.

**Idea y Visión:** Ronald Gonzalez Niche
