
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
    *   Detalles de hallazgos por cada tipo de análisis realizado (con CVSS y detalles técnicos si se ha iniciado sesión y se tiene suscripción activa - simula Premium).
    *   Severidad, descripción, impacto potencial y remediación sugerida para cada hallazgo.
    *   Contexto específico para hallazgos SAST (ruta, línea, fragmento de código, sugerencia de arreglo) y DAST (parámetro, petición/respuesta).
    *   Consideraciones generales de cumplimiento normativo.
*   **Acceso a Funciones Avanzadas con Suscripción Premium (Gestionado con Supabase Auth y Simulación de Pago PayPal):**
    *   **Autenticación Real (en progreso):** Los usuarios pueden registrarse e iniciar sesión utilizando Supabase Auth. Un `AuthContext` gestiona la sesión globalmente.
    *   **Gestión de Perfil de Usuario:** Se ha definido un esquema para `user_profiles` en la base de datos Supabase (tabla `user_profiles`) que almacenará el estado de su suscripción. Se ha proporcionado el SQL para crear esta tabla y un trigger para crear perfiles básicos al registrarse.
    *   **Flujo de Pago con PayPal API REST (Simulación Avanzada):** La plataforma integra la API REST de PayPal (Sandbox) para simular el proceso de "compra" de una suscripción:
        *   Un usuario autenticado puede iniciar un flujo de pago.
        *   El frontend llama a `/api/paypal/create-order` para crear una orden en PayPal.
        *   Tras la aprobación del usuario en la UI de PayPal, el frontend llama a `/api/paypal/capture-order`.
        *   El endpoint `/api/paypal/capture-order` ahora intenta capturar el pago con PayPal y luego actualiza el `subscription_status` del usuario en la tabla `user_profiles` de Supabase (utilizando la `SUPABASE_SERVICE_ROLE_KEY` para permisos).
    *   **Funciones Premium Desbloqueadas:** Si `AuthContext` determina (leyendo de `user_profiles` después de una actualización) que el usuario tiene una suscripción activa (`subscription_status = 'active_premium'` o similar), se desbloquean:
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
*   **Pasarela de Pagos (Integración API REST):** PayPal (con SDK `@paypal/checkout-server-sdk` para backend y SDK de JS para frontend)
*   **Autenticación y Base de Datos:** Supabase (Cliente JS `@supabase/supabase-js` y `@supabase/ssr` para helpers del lado del servidor)
*   **Gestión de Estado de Autenticación:** React Context (`AuthProvider`) para manejar la sesión de Supabase globalmente y el estado del perfil.
*   **Validación de Esquemas:** Zod
*   **Fuentes:** Geist Sans, Geist Mono
*   **Analíticas (Opcional):** Firebase Analytics

## Instalación y Ejecución Local

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local.

### Prerrequisitos

*   Node.js (versión 18 o superior recomendada)
*   npm o yarn
*   Una cuenta de Supabase ([supabase.com](https://supabase.com/))
*   Una cuenta de PayPal Developer ([developer.paypal.com](https://developer.paypal.com/)) para credenciales Sandbox.
*   Una cuenta de Firebase (opcional, si deseas usar Firebase Analytics u otros servicios de Firebase).

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

    # --- Credenciales de PayPal API REST (Sandbox) ---
    # Reemplaza estos valores con tus propias credenciales de Sandbox de PayPal Developer para tu aplicación REST API.
    # Estas son usadas por el backend (ej. /api/paypal/create-order, /api/paypal/capture-order).
    PAYPAL_CLIENT_ID=tu_paypal_sandbox_client_id_aqui_para_api_rest
    PAYPAL_CLIENT_SECRET=tu_paypal_sandbox_client_secret_aqui
    PAYPAL_API_BASE_URL=https://api-m.sandbox.paypal.com # Para desarrollo y pruebas con Sandbox
    # PAYPAL_LIVE_CLIENT_ID=TU_PAYPAL_LIVE_CLIENT_ID_AQUI # Para producción
    # PAYPAL_LIVE_CLIENT_SECRET=TU_PAYPAL_LIVE_CLIENT_SECRET_AQUI # Para producción
    # PAYPAL_LIVE_API_BASE_URL=https://api-m.paypal.com # Para producción

    # Client ID de PayPal para el SDK de JavaScript (Frontend)
    # IMPORTANTE: Este Client ID (NEXT_PUBLIC_PAYPAL_CLIENT_ID) debe ser el MISMO que el PAYPAL_CLIENT_ID
    # usado para la API REST (Sandbox o Live según el entorno). Ambos deben corresponder al Client ID de tu aplicación REST API.
    NEXT_PUBLIC_PAYPAL_CLIENT_ID=tu_paypal_sandbox_client_id_aqui_para_sdk_js_ (el mismo que PAYPAL_CLIENT_ID)
    # NEXT_PUBLIC_PAYPAL_LIVE_CLIENT_ID=TU_PAYPAL_LIVE_CLIENT_ID_AQUI_PARA_SDK_JS_ (el mismo que PAYPAL_LIVE_CLIENT_ID)

    # (Opcional pero Recomendado para Producción) ID del Webhook de PayPal para verificar notificaciones
    # PAYPAL_WEBHOOK_ID=TU_PAYPAL_WEBHOOK_ID_DE_TU_APP_CONFIGURADA_EN_PAYPAL_DEVELOPER

    # --- Credenciales de Supabase ---
    NEXT_PUBLIC_SUPABASE_URL="https://odrdziwcmlumpifxfhfc.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcmR6aXdjbWx1bXBpZnhmaGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTgwMjgsImV4cCI6MjA2MzA5NDAyOH0.P7Wr7e070TRPkQR8LGLofg8xoXKxKov9WwZFb5xGcow"

    # Credencial Service Role Key de Supabase (¡ESENCIAL para el backend!)
    # Permite operaciones privilegiadas como actualizar el estado de suscripción de un usuario.
    # ¡MANÉJALA CON EXTREMO CUIDADO Y NUNCA LA EXPONGAS EN EL CLIENTE!
    SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcmR6aXdjbWx1bXBpZnhmaGZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxODAyOCwiZXhwIjoyMDYzMDk0MDI4fQ.FeSKcPEwG-W-F5Lxca14A7gJcXJZBL_ongrAieCIURM"

    # (Opcional) Clave API de Firebase para el cliente
    NEXT_PUBLIC_FIREBASE_API_KEY=TU_FIREBASE_WEB_API_KEY
    
    # (Opcional, si reactivas hCaptcha) Clave de Sitio de hCaptcha para el frontend
    # NEXT_PUBLIC_HCAPTCHA_SITE_KEY=22860de4-8b40-4054-95d8-fac6d9f477ca

    # (Opcional y MUY IMPORTANTE para backend, si reactivas hCaptcha) Clave Secreta de hCaptcha
    # HCAPTCHA_SECRET_KEY=TU_CLAVE_SECRETA_DE_HCAPTCHA_AQUI
    ```
    **IMPORTANTE:**
    *   Reemplaza los valores placeholder.
    *   **No subas el archivo `.env.local` a tu repositorio de Git.**

2.  **Obtén tus Claves API (Si necesitas cambiarlas o para Producción):**
    *   **Google AI:** [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   **PayPal Sandbox/Live:**
        1.  Ve a [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications).
        2.  Crea o selecciona tu aplicación REST API. Necesitarás una para Sandbox y otra para Live.
        3.  Obtén el `Client ID` y `Client Secret` para cada entorno.
        4.  En la configuración de tu aplicación en PayPal Developer, configura una URL para Webhooks (ej. `https://TU_DOMINIO_DE_PRODUCCION/api/paypal/webhook`) y obtén el `Webhook ID`.
    *   **Supabase:** "Project Settings" > "API" en tu [Supabase Dashboard](https://supabase.com/dashboard).
    *   **Firebase (si usas Analytics):** Configuración de tu proyecto en la [Consola de Firebase](https://console.firebase.google.com/).

### Configuración de Base de Datos Supabase (Fundamental)

1.  **Crea la tabla `notes` (Ejemplo para probar Supabase - Opcional si no la usas):**
    *   En el **SQL Editor** de Supabase:
      ```sql
      -- Create the table 'notes'
      create table notes (
        id bigint primary key generated always as identity,
        title text not null
      );
      -- Insert some sample data
      insert into notes (title)
      values
        ('Today I created a Supabase project.'),
        ('I added some data and queried it from Next.js.'),
        ('It was awesome!');
      -- Enable Row Level Security (RLS)
      alter table notes enable row level security;
      -- Create a policy to allow public read access
      create policy "public can read notes" on notes for select to anon using (true);
      ```

2.  **Crea la tabla `user_profiles` y el trigger (Fundamental para autenticación y suscripciones):**
    *   En el **SQL Editor** de Supabase:
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
        paypal_customer_id TEXT, -- Optional: Store PayPal Payer ID
        paypal_order_id TEXT, -- Store the last successful PayPal order ID for reference
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      COMMENT ON COLUMN public.user_profiles.subscription_status IS 'Current status of the user''s subscription';
      COMMENT ON COLUMN public.user_profiles.subscription_plan_id IS 'Identifier for the specific subscription plan';
      COMMENT ON COLUMN public.user_profiles.current_period_end IS 'Date when the current subscription period ends or ended';
      COMMENT ON COLUMN public.user_profiles.paypal_customer_id IS 'Customer ID from PayPal, if applicable (Payer ID)';
      COMMENT ON COLUMN public.user_profiles.paypal_order_id IS 'Last successful PayPal Order ID for reference';

      -- 2. Enable Row Level Security (RLS) on the table
      ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

      -- 3. Create RLS Policies
      -- Users can view their own profile.
      CREATE POLICY "Users can view their own profile."
      ON public.user_profiles FOR SELECT
      USING (auth.uid() = id);

      -- Users can update their own non-sensitive profile details (e.g., full_name, avatar_url).
      -- Subscription-related fields (subscription_status, current_period_end, paypal_order_id)
      -- should ONLY be updated by a trusted server-side process (like your /api/paypal/capture-order
      -- or /api/paypal/webhook endpoints using the SUPABASE_SERVICE_ROLE_KEY).
      CREATE POLICY "Users can update their own non-sensitive details."
      ON public.user_profiles FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (
        auth.uid() = id AND
        NOT (
          NEW.subscription_status IS DISTINCT FROM OLD.subscription_status OR
          NEW.current_period_end IS DISTINCT FROM OLD.current_period_end OR
          NEW.paypal_order_id IS DISTINCT FROM OLD.paypal_order_id OR
          NEW.paypal_customer_id IS DISTINCT FROM OLD.paypal_customer_id OR
          NEW.subscription_plan_id IS DISTINCT FROM OLD.subscription_plan_id
        )
      );
      -- Note: The SUPABASE_SERVICE_ROLE_KEY used in backend routes bypasses RLS.

      -- 4. Create a trigger function to automatically create a user profile
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      SECURITY DEFINER -- SECURITY DEFINER is important here to access auth.users table
      AS $$
      BEGIN
        INSERT INTO public.user_profiles (id, email, full_name, avatar_url, subscription_status)
        VALUES (
          NEW.id,
          NEW.email,
          NEW.raw_user_meta_data->>'full_name', 
          NEW.raw_user_meta_data->>'avatar_url',
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

### Ejecutando la Aplicación

1.  **Iniciar el servidor de desarrollo de Next.js:**
    ```bash
    npm run dev
    ```
    La aplicación debería estar disponible en [http://localhost:9002](http://localhost:9002).
2.  **Iniciar el servidor de desarrollo de Genkit (opcional):**
    ```bash
    npm run genkit:watch
    ```

### (Opcional) Configuración de hCaptcha

(Se mantiene la sección de hCaptcha como estaba, indicando que está deshabilitada temporalmente).

## Implementación de Autenticación Real y Base de Datos (En Progreso con Supabase)

La plataforma utiliza **Supabase Auth**. Un `AuthProvider` (`src/context/AuthContext.tsx`) gestiona la sesión y carga el perfil del usuario desde `user_profiles` para determinar el estado `isPremium` basado en `subscription_status`.

**Estado Actual:**
*   Formularios de Login/Signup interactúan con Supabase Auth.
*   `AuthContext` maneja sesión y perfil.
*   Trigger en Supabase crea perfiles básicos.

## Implementación de Pagos con PayPal (API REST - Sandbox)

*   **Creación de Órdenes:** El frontend llama a `/api/paypal/create-order` (backend). El backend usa las credenciales API de PayPal (desde `.env.local`) para crear una orden y devuelve el `orderID`.
*   **Procesamiento de Pago Frontend:** El SDK de JS de PayPal usa el `orderID` para mostrar los botones de pago.
*   **Captura de Órdenes:** Tras la aprobación del usuario, el frontend llama a `/api/paypal/capture-order` (backend) con el `orderID`.
*   **Actualización de Base de Datos:** El endpoint `/api/paypal/capture-order` (backend):
    1.  Verifica al usuario autenticado (Supabase).
    2.  Captura el pago con PayPal usando las credenciales API.
    3.  Si la captura es exitosa, usa un cliente Supabase con la `SUPABASE_SERVICE_ROLE_KEY` para actualizar la tabla `user_profiles` del usuario:
        *   `subscription_status` a `'active_premium'`.
        *   `current_period_end` (ej. 30 días desde ahora).
        *   `paypal_order_id`.
*   **Refresco de Estado en Frontend:** `AuthContext` llama a `refreshUserProfile()` para cargar el nuevo estado de suscripción.

## Pasos Críticos para una Facturación Real y Funcionalidad Completa

1.  **Backend de Captura de Pagos (PayPal):** ¡Hecho en su mayor parte! Asegúrate de que la lógica en `/api/paypal/capture-order` sea robusta y maneje todos los casos de error.
2.  **Credenciales LIVE de PayPal:** Para procesar pagos reales, cambia las variables de entorno `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` y `PAYPAL_API_BASE_URL` a tus credenciales y URL de producción de PayPal. Lo mismo para `NEXT_PUBLIC_PAYPAL_CLIENT_ID`.
3.  **Implementación de Webhooks de PayPal (¡CRÍTICO PARA PRODUCCIÓN!):**
    *   **Necesidad:** Para manejar confirmaciones de pago asíncronas y eventos del ciclo de vida de la suscripción (renovaciones, cancelaciones, etc.) de forma fiable. Esto asegura que tu base de datos se mantenga sincronizada incluso si el flujo del cliente se interrumpe.
    *   **Endpoint:** Crea y configura un endpoint de webhook en tu aplicación (ej. `/api/paypal/webhook`) y regístralo en tu aplicación de PayPal Developer.
    *   **Verificación:** Tu endpoint de webhook DEBE verificar la firma de las solicitudes de PayPal para asegurar su autenticidad.
    *   **Procesamiento:** Procesa los eventos relevantes (ej. `PAYMENT.CAPTURE.COMPLETED`) y actualiza la tabla `user_profiles` en Supabase.
    *   El archivo `/src/app/api/paypal/webhook/route.ts` contiene un placeholder detallado.
4.  **Lógica de Suscripción Completa:**
    *   Asegurar que `AuthContext` y toda la lógica que dependa de `isPremium` refleje correctamente el estado de `user_profiles.subscription_status`.
    *   Proteger robustamente las funciones premium.
5.  **Gestión de Suscripciones en UI:** Una página donde los usuarios puedan ver/gestionar su suscripción.
6.  **Tablas Adicionales:** Considerar `AnalysisRecord` para guardar resultados de análisis vinculados a `userId`.

## Pasos Críticos para Puesta en Marcha Online (Producción)

1.  **Autenticación y Gestión de Perfiles Completa (Supabase).**
2.  **Integración Completa de Pasarela de Pagos (PayPal):** Facturación real, **webhooks implementados y probados**, actualización de DB.
3.  **Despliegue y Alojamiento Profesional:** Vercel, AWS, GCP, etc. Configuración segura de variables de entorno LIVE.
4.  **Seguridad de la Plataforma:** Protección de claves, validación de entradas, rate limiting.
5.  **Aspectos Legales:** Términos de Servicio y Política de Privacidad profesionalmente redactados.
6.  **Operaciones y Mantenimiento:** Logging, monitorización, copias de seguridad, soporte.

## Roadmap (Posibles Mejoras Futuras)
(Se mantiene similar)

## 🪪 Licencia
Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.

**Idea y Visión:** Ronald Gonzalez Niche
