

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
    *   **Autenticación Real:** Los usuarios pueden registrarse e iniciar sesión utilizando Supabase Auth.
    *   **Gestión de Perfil de Usuario:** Se crea un perfil de usuario en la base de datos Supabase (tabla `user_profiles`) que almacena el estado de su suscripción.
    *   **Flujo de Pago Conceptual con PayPal:** La plataforma incluye una integración con la API REST de PayPal (Sandbox) para simular el proceso de "compra" de una suscripción.
        *   Un usuario autenticado puede iniciar un flujo de pago simulado.
        *   El frontend llama a `/api/paypal/create-order` para crear una orden en PayPal.
        *   Tras la aprobación del usuario en la UI de PayPal, el frontend llama a `/api/paypal/capture-order`.
        *   **TODO Crucial:** El endpoint `capture-order` necesita ser completado para actualizar el `subscription_status` del usuario en la tabla `user_profiles` de Supabase tras una captura de pago exitosa. Actualmente, la activación premium se basa en el `AuthContext` que lee este estado.
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
*   **Pasarela de Pagos (Integración Conceptual y Parcial API):** PayPal (con SDK `@paypal/checkout-server-sdk` para backend y SDK de JS para frontend)
*   **Autenticación y Base de Datos:** Supabase (Cliente JS `@supabase/supabase-js` y `@supabase/ssr` para helpers del lado del servidor)
*   **Gestión de Estado de Autenticación:** React Context (`AuthProvider`) para manejar la sesión de Supabase globalmente y el estado del perfil.
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
    # Reemplaza estos valores con tus propias credenciales de Sandbox de PayPal Developer para tu aplicación REST API.
    PAYPAL_CLIENT_ID=tu_paypal_sandbox_client_id_aqui_para_api_rest
    PAYPAL_CLIENT_SECRET=tu_paypal_sandbox_client_secret_aqui
    PAYPAL_API_BASE_URL=https://api-m.sandbox.paypal.com # Para desarrollo y pruebas con Sandbox
    # Para producción, usarías: PAYPAL_API_BASE_URL=https://api-m.paypal.com y credenciales Live

    # Client ID de PayPal para el SDK de JavaScript (Frontend)
    # IMPORTANTE: Este Client ID (NEXT_PUBLIC_PAYPAL_CLIENT_ID) debe ser el MISMO que el PAYPAL_CLIENT_ID
    # usado para la API REST arriba. Ambos deben corresponder al Client ID de tu aplicación REST API creada en el PayPal Developer Portal.
    NEXT_PUBLIC_PAYPAL_CLIENT_ID=tu_paypal_sandbox_client_id_aqui_para_sdk_js_ (el mismo que PAYPAL_CLIENT_ID)

    # Credenciales de Supabase (Requeridas para la autenticación y base de datos)
    # Reemplaza estos valores con tus propias credenciales de tu proyecto Supabase
    NEXT_PUBLIC_SUPABASE_URL="https://odrdziwcmlumpifxfhfc.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcmR6aXdjbWx1bXBpZnhmaGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTgwMjgsImV4cCI6MjA2MzA5NDAyOH0.P7Wr7e070TRPkQR8LGLofg8xoXKxKov9WwZFb5xGcow"

    # Credencial Service Role Key de Supabase (para operaciones del lado del servidor con Supabase, ej. en /api/paypal/capture-order para actualizar perfiles)
    # Esta clave tiene permisos para saltarse las políticas RLS. ¡MANÉJALA CON EXTREMO CUIDADO Y NUNCA LA EXPONGAS EN EL CLIENTE!
    # SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcmR6aXdjbWx1bXBpZnhmaGZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxODAyOCwiZXhwIjoyMDYzMDk0MDI4fQ.FeSKcPEwG-W-F5Lxca14A7gJcXJZBL_ongrAieCIURM"
    # Si usas Prisma con Supabase y conexión directa, también necesitarías las cadenas de conexión a la base de datos.
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
    *   Reemplaza `tu_clave_api_google_aqui_valida` con tu clave API real de Google AI.
    *   Reemplaza `tu_paypal_sandbox_client_id_aqui_para_api_rest` y `tu_paypal_sandbox_client_secret_aqui` con tus credenciales Sandbox de PayPal para tu aplicación REST API. Asegúrate de que `NEXT_PUBLIC_PAYPAL_CLIENT_ID` sea el mismo que `PAYPAL_CLIENT_ID`.
    *   Las credenciales de Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, y `SUPABASE_SERVICE_ROLE_KEY`) ya están pre-rellenadas con los valores que proporcionaste. La `SUPABASE_SERVICE_ROLE_KEY` es muy sensible.
    *   **No subas el archivo `.env.local` a tu repositorio de Git.** Asegúrate de que esté en tu archivo `.gitignore`.

2.  **Obtén tus Claves API (Si necesitas cambiarlas o para Producción):**
    *   **Google AI:** Visita [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   **PayPal Sandbox/Live:**
        1.  Ve a [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications).
        2.  Crea una nueva aplicación REST API (una para Sandbox, otra para Live).
        3.  Copia el `Client ID` y el `Client Secret`.
    *   **Supabase:**
        1.  Ve a [Supabase Dashboard](https://supabase.com/dashboard).
        2.  Selecciona tu proyecto.
        3.  En "Project Settings" > "API", encontrarás tu "Project URL" (`NEXT_PUBLIC_SUPABASE_URL`), la "anon public" key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`), y la "service_role" key (`SUPABASE_SERVICE_ROLE_KEY`).

### Configuración de Base de Datos Supabase (Fundamental)

1.  **Crea la tabla `notes` (Ejemplo de datos):**
    *   En el panel de tu proyecto Supabase, ve al **SQL Editor**. Ejecuta:
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
      -- Create a policy to allow public read access (for anonymous users)
      create policy "public can read notes"
      on notes
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
        paypal_order_id TEXT, -- Store the last successful PayPal order ID
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      COMMENT ON COLUMN public.user_profiles.subscription_status IS 'Current status of the user''s subscription';
      COMMENT ON COLUMN public.user_profiles.subscription_plan_id IS 'Identifier for the specific subscription plan';
      COMMENT ON COLUMN public.user_profiles.current_period_end IS 'Date when the current subscription period ends or ended';
      COMMENT ON COLUMN public.user_profiles.paypal_customer_id IS 'Customer ID from PayPal, if applicable';
      COMMENT ON COLUMN public.user_profiles.paypal_order_id IS 'Last successful PayPal Order ID for reference';

      -- 2. Enable Row Level Security (RLS) on the table
      ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

      -- 3. Create RLS Policies
      CREATE POLICY "Users can view their own profile."
      ON public.user_profiles FOR SELECT
      USING (auth.uid() = id);

      CREATE POLICY "Users can update limited fields on their own profile."
      ON public.user_profiles FOR UPDATE
      USING (auth.uid() = id)
      -- For production, restrict which columns user can update.
      -- subscription_status should ONLY be updated by server-side logic after payment.
      WITH CHECK (auth.uid() = id AND NOT (NEW.subscription_status IS DISTINCT FROM OLD.subscription_status AND NEW.subscription_status = 'active_premium'));


      -- 4. Create a trigger function to automatically create a user profile
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      SECURITY DEFINER
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
    Esto generalmente iniciará la aplicación en [http://localhost:9002](http://localhost:9002).
2.  **Iniciar el servidor de desarrollo de Genkit (opcional, para depuración de flujos):**
    En una terminal separada:
    ```bash
    npm run genkit:watch
    ```
    Típicamente en [http://localhost:4000](http://localhost:4000).

## Implementación de Autenticación Real y Base de Datos (En Progreso con Supabase)

La plataforma ahora utiliza **Supabase Auth** para la autenticación. Un `AuthProvider` (`src/context/AuthContext.tsx`) maneja el estado de la sesión globalmente e intenta cargar el perfil del usuario desde `user_profiles` para determinar el estado `isPremium` basándose en el campo `subscription_status`.

**Estado Actual:**
*   Formularios de Login/Signup interactúan con Supabase Auth.
*   `AuthContext` escucha cambios de autenticación y carga perfiles.
*   Trigger en Supabase crea perfiles básicos en `user_profiles` al registrarse.
*   Página `/notes` demuestra lectura de datos de Supabase.

**Pasos Críticos para una Facturación Real y Funcionalidad Completa:**
1.  **Backend de Captura de Pagos (PayPal):** El endpoint `/api/paypal/capture-order` **DEBE** ser completado.
    *   Obtener el usuario autenticado (usando Supabase server client con cookies).
    *   Después de una captura de pago exitosa con la API de PayPal, **actualizar** la tabla `user_profiles` para el `userId` correspondiente:
        *   Cambiar `subscription_status` a `'active_premium'` (o el plan aplicable).
        *   Establecer `current_period_end`.
        *   Guardar `paypal_order_id`.
2.  **Webhooks de PayPal:** Implementar un endpoint para procesar notificaciones asíncronas de PayPal (renovaciones, cancelaciones, etc.) y actualizar `user_profiles`. Es crucial para la robustez.
3.  **Lógica de Suscripción Completa:**
    *   Asegurar que `AuthContext` y toda la lógica de la aplicación que dependa de `isPremium` refleje correctamente el estado leído de `user_profiles.subscription_status`.
    *   Proteger las funciones premium de forma robusta.
4.  **Gestión de Suscripciones en UI:** Una página donde los usuarios puedan ver/gestionar su suscripción.
5.  **Proteger Rutas API y Server Actions:** Utilizar `src/lib/supabase/server.ts` para verificar autenticación y autorización en el backend.
6.  **Tablas Adicionales:** Considerar `AnalysisRecord` para guardar resultados de análisis vinculados a `userId`.

## Pasos Críticos para Puesta en Marcha Online (Producción)

(Se mantiene similar a la versión anterior, enfatizando la necesidad de completar los puntos anteriores)

1.  **Autenticación y Gestión de Perfiles Completa (Supabase).**
2.  **Integración Completa de Pasarela de Pagos (PayPal o Stripe):** Facturación real, webhooks, actualización de DB.
3.  **Despliegue y Alojamiento Profesional:** Vercel, AWS, GCP, etc. Configuración segura de variables de entorno LIVE.
4.  **Seguridad de la Plataforma:** Protección de claves, validación de entradas, rate limiting.
5.  **Aspectos Legales:** Términos de Servicio y Política de Privacidad profesionalmente redactados.
6.  **Operaciones y Mantenimiento:** Logging, monitorización, copias de seguridad, soporte.

## Roadmap (Posibles Mejoras Futuras)

(Se mantiene similar, se pueden re-priorizar según el enfoque comercial)

*   Documentación Técnica Detallada.
*   Automatizaciones (Prettier, ESLint), Testing, CI/CD.
*   Análisis de APIs REST y GraphQL (Profundización).
*   Informes en PDF.
*   Mapeo detallado con OWASP Top 10, MITRE ATT&CK.
*   Panel administrativo.
*   Integraciones SIEM/SOAR (más allá de JSON).
*   CLI.
*   Historial de análisis por usuario.
*   Mejoras Específicas Servidores de Juegos.

## 🪪 Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.

**Idea y Visión:** Ronald Gonzalez Niche
