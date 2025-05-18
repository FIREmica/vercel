

# Centro de Análisis de Seguridad Integral

Este es un proyecto Next.js que utiliza Genkit para proporcionar un Centro de Análisis de Seguridad Integral. La plataforma permite analizar URLs, descripciones de configuraciones de servidores (incluyendo servidores de juegos como Lineage 2, Roblox, Tibia), bases de datos, código (SAST simulado), aplicaciones en ejecución (DAST simulado), descripciones de configuraciones de nube (AWS, Azure, GCP - conceptual), información de contenedores (Docker, K8s - conceptual), contenido de archivos de dependencias (npm, pip, maven, gem - conceptual) y descripciones de configuraciones de red/resultados de escaneos (conceptual) para identificar vulnerabilidades de seguridad utilizando IA.

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
    NEXT_PUBLIC_SUPABASE_URL="https://odrdziwcmlumpifxfhfc.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcmR6aXdjbWx1bXBpZnhmaGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTgwMjgsImV4cCI6MjA2MzA5NDAyOH0.P7Wr7e070TRPkQR8LGLofg8xoXKxKov9WwZFb5xGcow"

    # Para operaciones del lado del servidor con Supabase (si se implementan, ej. para proteger rutas API o Server Actions), necesitarías:
    # SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcmR6aXdjbWx1bXBpZnhmaGZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxODAyOCwiZXhwIjoyMDYzMDk0MDI4fQ.FeSKcPEwG-W-F5Lxca14A7gJcXJZBL_ongrAieCIURM"
    # Y posiblemente las cadenas de conexión a la base de datos si usas Prisma con Supabase:
    # POSTGRES_URL="postgres://postgres.odrdziwcmlumpifxfhfc:kSixCdR8h6FvBDTv@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
    # POSTGRES_PRISMA_URL="postgres://postgres.odrdziwcmlumpifxfhfc:kSixCdR8h6FvBDTv@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
    # POSTGRES_URL_NON_POOLING="postgres://postgres.odrdziwcmlumpifxfhfc:kSixCdR8h6FvBDTv@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
    # POSTGRES_USER="postgres"
    # POSTGRES_PASSWORD="kSixCdR8h6FvBDTv"
    # POSTGRES_HOST="db.odrdziwcmlumpifxfhfc.supabase.co"
    # POSTGRES_DATABASE="postgres"
    # SUPABASE_JWT_SECRET="+eq0okA2T41Xz1F+wLhX9/uyvsEHzYebherOsq/SdzGu6Alp3Nz6YFF+y01qgutTUNperwPaowEHJwsMlw3YtA=="
    ```
    **IMPORTANTE:**
    *   Reemplaza `tu_clave_api_google_aqui_valida` con tu clave API real de Google AI. **Asegúrate de que esta variable esté correctamente configurada y no sea el valor predeterminado/placeholder.** La aplicación verificará esta clave y mostrará errores si no está configurada o es inválida.
    *   Las credenciales de PayPal (`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`) y Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) ya están pre-rellenadas con los valores que proporcionaste para el entorno de Sandbox. **Asegúrate de que el Client ID de PayPal (`PAYPAL_CLIENT_ID`) que usas para la API REST de backend sea el mismo que el `NEXT_PUBLIC_PAYPAL_CLIENT_ID` que usas para el SDK de JS en el frontend.**
    *   **No subas el archivo `.env.local` a tu repositorio de Git.** Asegúrate de que esté en tu archivo `.gitignore`.

2.  **Obtén tus Claves API (Si necesitas cambiarlas o para Producción):**
    *   **Google AI:** Visita [Google AI Studio](https://aistudio.google.com/app/apikey) para generar una clave API si aún no tienes una.
    *   **PayPal Sandbox/Live:**
        1.  Ve a [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications).
        2.  Crea una nueva aplicación REST API si no tienes una (una para Sandbox, otra para Live).
        3.  Copia el `Client ID` y el `Client Secret` de tu aplicación.
    *   **Supabase:**
        1.  Ve a [Supabase Dashboard](https://supabase.com/dashboard).
        2.  Selecciona tu proyecto.
        3.  En "Project Settings" (Configuración del Proyecto) > "API", encontrarás tu "Project URL" (`NEXT_PUBLIC_SUPABASE_URL`) y la "anon public" key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`). La "service_role" key (`SUPABASE_SERVICE_ROLE_KEY`) también está ahí y es para operaciones de backend.

### Configuración de Supabase (Mínimo para el ejemplo `/notes` y perfiles de usuario)

1.  **Crea la tabla `notes` y políticas RLS (si aún no lo has hecho):**
    *   En el panel de tu proyecto Supabase, ve al **SQL Editor**.
    *   Ejecuta el siguiente script para crear la tabla `notes`, insertar datos de ejemplo y habilitar la seguridad a nivel de fila (RLS) permitiendo lectura pública anónima:
      ```sql
      -- Create the table 'notes'
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

      -- Enable Row Level Security (RLS) for 'notes'
      alter table notes enable row level security;

      -- Create a policy to allow public read access (for anonymous users) to 'notes'
      create policy "public can read notes"
      on notes -- Corrected from 'public.notes'
      for select to anon
      using (true);
      ```

2.  **Crea la tabla `user_profiles` y el trigger (Fundamental para la autenticación y gestión de suscripciones):**
    *   En el **SQL Editor** de tu proyecto Supabase, ejecuta el siguiente script:
      ```sql
      -- 1. Create the UserProfile table
      CREATE TABLE public.user_profiles (
        id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email VARCHAR(255) UNIQUE,
        full_name TEXT,
        avatar_url TEXT,
        subscription_status TEXT DEFAULT 'free' NOT NULL, -- e.g., 'free', 'active_premium', 'cancelled', 'past_due'
        subscription_plan_id TEXT, -- Can reference another table of plans if you have multiple
        current_period_end TIMESTAMP WITH TIME ZONE,
        paypal_customer_id TEXT, -- Or stripe_customer_id if using Stripe
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Optional: Add comments to columns for clarity
      COMMENT ON COLUMN public.user_profiles.subscription_status IS 'Current status of the user''s subscription';
      COMMENT ON COLUMN public.user_profiles.subscription_plan_id IS 'Identifier for the specific subscription plan';
      COMMENT ON COLUMN public.user_profiles.current_period_end IS 'Date when the current subscription period ends or ended';
      COMMENT ON COLUMN public.user_profiles.paypal_customer_id IS 'Customer ID from PayPal, if applicable';


      -- 2. Enable Row Level Security (RLS) on the table
      ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

      -- 3. Create RLS Policies
      -- Policy: Users can view their own profile.
      CREATE POLICY "Users can view their own profile."
      ON public.user_profiles
      FOR SELECT
      USING (auth.uid() = id);

      -- Policy: Users can update their own profile (specific columns).
      -- For production, be very specific about what users can update.
      -- Subscription status should ideally only be updated by server-side logic.
      CREATE POLICY "Users can update limited fields on their own profile."
      ON public.user_profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id); -- Add 'USING (auth.uid() = id)' if not already there for the update check


      -- 4. Create a trigger function to automatically create a user profile
      --    when a new user signs up in auth.users.
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      SECURITY DEFINER -- Important for accessing auth.users
      AS $$
      BEGIN
        INSERT INTO public.user_profiles (id, email, full_name, avatar_url, subscription_status)
        VALUES (
          NEW.id,
          NEW.email,
          NEW.raw_user_meta_data->>'full_name', -- Assumes 'full_name' might be in raw_user_meta_data during signup
          NEW.raw_user_meta_data->>'avatar_url',  -- Assumes 'avatar_url' might be in raw_user_meta_data during signup
          'free' -- Default subscription status
        );
        RETURN NEW;
      END;
      $$;

      -- 5. Create the trigger on the auth.users table
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
      ```
    *   Este script crea la tabla `user_profiles` para almacenar información del usuario y su estado de suscripción, y un trigger que crea automáticamente un perfil cuando un nuevo usuario se registra.

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

**Al desplegar, asegúrate de configurar las variables de entorno (`NEXT_PUBLIC_GOOGLE_API_KEY`, `PAYPAL_CLIENT_ID` (Live), `PAYPAL_CLIENT_SECRET` (Live), `PAYPAL_API_BASE_URL` (Live), `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (Live), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` si es necesario) en la configuración de tu proveedor de hosting.**

## Modo Premium y Monetización (Simulado con Supabase Auth y PayPal)

La plataforma ahora utiliza **Supabase Auth** para la autenticación de usuarios y un `AuthProvider` para gestionar el estado de la sesión globalmente. El "Modo Premium" se activa si un usuario ha iniciado sesión y su perfil en la base de datos (tabla `user_profiles`) indica una suscripción activa (ej. `subscription_status = 'active_premium'`).

La integración con PayPal (API REST Sandbox) permite a los usuarios simular el proceso de suscripción:
*   Si un usuario ha iniciado sesión (con Supabase), puede optar por realizar un "pago" simulado a través de PayPal.
*   El frontend llama a un endpoint de API del backend (`/api/paypal/create-order`) para crear una orden de pago en PayPal.
*   El SDK de JavaScript de PayPal en el frontend renderiza los botones de pago.
*   Tras una "aprobación" simulada del pago, se muestra una notificación de éxito.

**Para una Facturación Real, Faltaría:**
1.  **Backend para Captura de Pagos:** Un endpoint que reciba el `orderID` de PayPal aprobado y "capture" el pago con la API de PayPal.
2.  **Actualización de la Base de Datos:** Tras la captura exitosa, este endpoint debe actualizar el `subscription_status` y `current_period_end` en la tabla `user_profiles` del usuario en Supabase.
3.  **Webhooks de PayPal:** Para manejar notificaciones asíncronas de PayPal (ej. `PAYMENT.CAPTURE.COMPLETED`, renovaciones, cancelaciones) y actualizar la base de datos de forma robusta.

Cuando el "Modo Premium" está activo (usuario con sesión y suscripción activa en Supabase), los usuarios obtienen acceso a:

*   **Informe Técnico Detallado:** El informe de seguridad completo generado por la IA, sin truncamiento.
*   **Detalles Completos de Hallazgos:** Incluye CVSS, impacto técnico y de negocio, evidencia y recomendaciones detalladas para todas las vulnerabilidades.
*   **Generación de Escenarios de Ataque Ilustrativos:** Ejemplos conceptuales de cómo podrían explotarse las vulnerabilidades.
*   **Generación de Playbooks de Remediación Sugeridos:** Guías paso a paso para corregir los problemas identificados.
*   **Descarga Completa de Resultados (ZIP):** Un archivo ZIP que contiene el informe Markdown, todos los hallazgos en JSON, los escenarios de ataque y los playbooks.

La descarga de todos los hallazgos en formato JSON está disponible para todos los usuarios (con o sin sesión activa).

## Implementación de Autenticación Real y Base de Datos (En Progreso con Supabase)

La plataforma ahora utiliza **Supabase Auth** para la autenticación de usuarios. El estado de sesión se maneja globalmente mediante un `AuthProvider` de React Context (`src/context/AuthContext.tsx`).

**Estado Actual de la Integración con Supabase:**

*   **Autenticación de Usuarios:** Los formularios de Login y Signup (`/login`, `/signup`) interactúan con `supabase.auth.signInWithPassword()` y `supabase.auth.signUp()`.
*   **Gestión de Sesión Global:** Un `AuthProvider` (`src/context/AuthContext.tsx`) maneja el estado de la sesión de Supabase y ahora intenta cargar el perfil del usuario desde la tabla `user_profiles`.
*   **Estado "Premium" Basado en Perfil (Conceptual):** La lógica en `AuthContext` intenta determinar el estado `isPremium` basándose en el campo `subscription_status` del `user_profiles` (ej. si es `'active_premium'`). Para que esto funcione completamente, el estado de suscripción debe ser actualizado después de un pago real.
*   **Creación Automática de Perfil de Usuario:** Se ha configurado un trigger en la base de datos Supabase (`handle_new_user`) para crear automáticamente una entrada en `user_profiles` cuando un nuevo usuario se registra en `auth.users`.
*   **Ejemplo de Base de Datos:** La página `/notes` demuestra cómo obtener datos de una tabla de Supabase (`notes`).

**Próximos Pasos Críticos para una Integración Completa de Supabase y Facturación Real:**

1.  **Endpoint de Captura de Pagos (PayPal):** Implementar el endpoint de backend que capture los pagos de PayPal y actualice la tabla `user_profiles` en Supabase con el nuevo estado de suscripción.
2.  **Webhooks de PayPal:** Implementar un endpoint de webhook para procesar notificaciones de PayPal y mantener actualizado el estado de las suscripciones.
3.  **Lógica de Suscripción Completa:**
    *   Asegurar que `AuthContext` lea correctamente el `subscription_status` de `user_profiles`.
    *   Proteger las funciones premium de forma robusta basándose en este estado.
4.  **Gestión de Suscripciones en UI:** Una página donde los usuarios puedan ver y gestionar su suscripción.
5.  **Proteger Rutas y API Endpoints del Lado del Servidor:** Utilizar el cliente de servidor de Supabase (`src/lib/supabase/server.ts`) en API Routes y Server Actions para verificar la autenticación y autorización.
6.  **Crear Tablas Adicionales en Supabase (si es necesario):** Como `AnalysisRecord` para guardar los resultados de los análisis vinculados al `userId`.

## Pasos Críticos para Puesta en Marcha Online (Producción)

Para transformar este proyecto de un prototipo local a un servicio online funcional y comercializable, se requieren los siguientes pasos fundamentales (además de la integración completa de autenticación, base de datos con Supabase y la pasarela de pagos):

1.  **Persistencia de Datos Completa (Base de Datos Supabase):**
    *   Completar la creación de tablas (`UserProfile`, `AnalysisRecord`, etc.) y la lógica para almacenar perfiles de usuario, estado de suscripciones, historial de análisis y resultados.
2.  **Integración Completa de Pasarela de Pagos (PayPal o Stripe):**
    *   **Facturación Real:** Configurar productos/planes en la pasarela, vincularlos a los perfiles de usuario en Supabase, implementar webhooks y la lógica de captura de pagos para actualizar automáticamente el estado de la suscripción.
3.  **Despliegue y Alojamiento Profesional:**
    *   Seleccionar una plataforma de hosting (Vercel, AWS, GCP, Azure).
    *   Configurar variables de entorno de producción de forma segura (clave Google AI, credenciales DB Supabase, claves de pasarela de pago Live).
    *   Configurar dominio personalizado y SSL/TLS.
4.  **Seguridad de la Plataforma:**
    *   Proteger todas las claves API y credenciales sensibles.
    *   Implementar validaciones de entrada exhaustivas.
    *   Considerar rate limiting y protección DDoS.
5.  **Aspectos Legales:**
    *   Redactar y publicar Términos de Servicio y Política de Privacidad válidos (el `terms.md` actual es un placeholder). Consultar con un profesional legal.
    *   Asegurar el cumplimiento con regulaciones de protección de datos.
6.  **Operaciones y Mantenimiento:**
    *   Implementar logging y monitorización.
    *   Establecer estrategias de copia de seguridad y recuperación.
    *   Definir canales de soporte al cliente.

## Roadmap (Posibles Mejoras Futuras)

Además de los pasos críticos para producción, se podrían considerar:

*   **Documentación Técnica Detallada:** Crear una carpeta `/docs` o una Wiki del proyecto.
*   **Automatizaciones y Testing:**
    *   Agregar Prettier, ESLint y Husky.
    *   Implementar tests unitarios (Jest, Vitest).
    *   Configurar CI/CD con GitHub Actions.
*   **Análisis de APIs REST y GraphQL (Profundización).**
*   **Informes en PDF:** Generación de informes formales.
*   **Mapeo Detallado con OWASP Top 10 y otros frameworks (ej. MITRE ATT&CK).**
*   **Panel administrativo para gestión de la plataforma.**
*   **Integraciones SIEM/SOAR (Avanzado).**
*   **Interfaz de Línea de Comandos (CLI).**
*   **Historial de análisis por usuario (requiere base de datos y autenticación completa).**
*   **Mejoras Específicas Servidores de Juegos:** Análisis de protocolos, detección de trampas, análisis de mods/scripts.

## 🪪 Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.

**Idea y Visión:** Ronald Gonzalez Niche
