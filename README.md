
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
        *   El endpoint `/api/paypal/capture-order` ahora captura el pago con PayPal y luego actualiza el `subscription_status` del usuario en la tabla `user_profiles` de Supabase (utilizando la `SUPABASE_SERVICE_ROLE_KEY` para permisos).
    *   **Funciones Premium Desbloqueadas:** Si `AuthContext` determina (leyendo de `user_profiles` después de una actualización) que el usuario tiene una suscripción activa (`subscription_status = 'active_premium'` o similar), se desbloquean:
        *   **Informe Técnico Detallado:** El informe de seguridad completo sin truncamiento.
        *   **Generación de Escenarios de Ataque Ilustrativos:** Ejemplos conceptuales de cómo podrían explotarse las vulnerabilidades.
        *   **Generación de Playbooks de Remediación Sugeridos:** Guías paso a paso en Markdown para corregir vulnerabilidades.
        *   **Descarga Completa de Resultados (ZIP):** Un archivo ZIP que contiene el informe Markdown, todos los hallazgos en JSON, los escenarios de ataque y los playbooks.
*   **Exportación de Hallazgos en JSON:** Permite descargar todos los hallazgos (vulnerables o no) en formato JSON para integración con otras herramientas (ej. SIEM), disponible para todos los usuarios.
*   **Asistente de Chat IA:** Un chatbot integrado para responder consultas sobre ciberseguridad y el uso de la plataforma.
*   **Interfaz de Usuario Moderna:** Desarrollada con Next.js, ShadCN UI y Tailwind CSS, con modo oscuro por defecto y en español.
*   **Historial de Análisis (En progreso):** Los análisis realizados por usuarios autenticados se guardan en la base de datos Supabase y se pueden visualizar en una página de Dashboard.

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
*   **CAPTCHA (Deshabilitado temporalmente):** hCaptcha (Integración pendiente de resolución de problemas de instalación del paquete `react-hcaptcha`)

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
    NEXT_PUBLIC_GOOGLE_API_KEY=TU_CLAVE_API_GOOGLE_AI_VALIDA

    # --- Credenciales de PayPal API REST (Sandbox) ---
    # Estas son las credenciales que usarás para pruebas y desarrollo.
    # Asegúrate de que estas coincidan con las de tu aplicación REST API en el Dashboard de PayPal Developer para el entorno Sandbox.
    # IMPORTANTE: El PAYPAL_CLIENT_SECRET debe corresponder a este PAYPAL_CLIENT_ID.
    PAYPAL_CLIENT_ID=AdLdNIavBkmAj9AyalbF_sDT0pF5l7PH0W6JHfHKl9gl5bIqrHa9cNAunX52IIoMFPtPPgum28S0ZnYr
    PAYPAL_CLIENT_SECRET=EKbftPC4jnqx1dgZq-2w6DnjL3Bfu7hmHIJzgl8kxQPzLMj8 # ASEGÚRATE QUE ESTE SECRET CORRESPONDE AL CLIENT_ID DE ARRIBA
    PAYPAL_API_BASE_URL=https://api-m.sandbox.paypal.com # Para desarrollo y pruebas con Sandbox
    # Para PRODUCCIÓN, necesitarás tus credenciales LIVE de PayPal:
    # PAYPAL_LIVE_CLIENT_ID=TU_PAYPAL_LIVE_CLIENT_ID_AQUI
    # PAYPAL_LIVE_CLIENT_SECRET=TU_PAYPAL_LIVE_CLIENT_SECRET_AQUI
    # PAYPAL_LIVE_API_BASE_URL=https://api-m.paypal.com

    # Client ID de PayPal para el SDK de JavaScript (Frontend)
    # IMPORTANTE: Este Client ID (NEXT_PUBLIC_PAYPAL_CLIENT_ID) debe ser el MISMO que el PAYPAL_CLIENT_ID
    # usado para la API REST (Sandbox o Live según el entorno). Ambos deben corresponder al Client ID de tu aplicación REST API.
    NEXT_PUBLIC_PAYPAL_CLIENT_ID=AdLdNIavBkmAj9AyalbF_sDT0pF5l7PH0W6JHfHKl9gl5bIqrHa9cNAunX52IIoMFPtPPgum28S0ZnYr
    # Para PRODUCCIÓN:
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

    # (Opcional) Clave API de Firebase para el cliente (si usas Firebase Analytics)
    # NEXT_PUBLIC_FIREBASE_API_KEY=TU_FIREBASE_WEB_API_KEY
    
    # (Opcional, si reactivas hCaptcha) Clave de Sitio de hCaptcha para el frontend
    # NEXT_PUBLIC_HCAPTCHA_SITE_KEY=22860de4-8b40-4054-95d8-fac6d9f477ca

    # (Opcional y MUY IMPORTANTE para backend, si reactivas hCaptcha) Clave Secreta de hCaptcha
    # HCAPTCHA_SECRET_KEY=TU_CLAVE_SECRETA_DE_HCAPTCHA_AQUI
    ```
    **IMPORTANTE:**
    *   Reemplaza `TU_CLAVE_API_GOOGLE_AI_VALIDA` con tu propia clave real. Las credenciales de PayPal Sandbox y Supabase ya están pre-llenadas con los valores que proporcionaste.
    *   **Asegúrate de que el `PAYPAL_CLIENT_SECRET` (`EKbft...`) realmente corresponda al `PAYPAL_CLIENT_ID` (`AdLdNl...`). Si el nuevo Client ID es de una aplicación PayPal REST diferente, necesitarás el Client Secret de *esa* aplicación.**
    *   **No subas el archivo `.env.local` a tu repositorio de Git.** Asegúrate de que `.env.local` esté en tu archivo `.gitignore`.

2.  **Obtén tus Claves API (Si necesitas cambiarlas o para Producción):**
    *   **Google AI:** [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   **PayPal Sandbox/Live:**
        1.  Ve a [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications).
        2.  Crea o selecciona tu aplicación REST API. Necesitarás una para Sandbox y otra para Live.
        3.  Obtén el `Client ID` y `Client Secret` para cada entorno.
        4.  En la configuración de tu aplicación en PayPal Developer, configura una URL para Webhooks (ej. `https://TU_DOMINIO_DE_PRODUCCION/api/paypal/webhook`) y obtén el `Webhook ID`.
    *   **Supabase:** "Project Settings" > "API" en tu [Supabase Dashboard](https://supabase.com/dashboard). Necesitarás `URL del Proyecto`, `Clave anónima pública (anon key)` y la `Clave de servicio (service_role key)`.
    *   **Firebase (si usas Analytics):** Configuración de tu proyecto en la [Consola de Firebase](https://console.firebase.google.com/).
    *   **hCaptcha (si lo reactivas):** Obtén tu "Site Key" y "Secret Key" desde tu [hCaptcha Dashboard](https://dashboard.hcaptcha.com/).

### Configuración de Base de Datos Supabase (Fundamental)

Ejecuta el siguiente script SQL completo en el **SQL Editor** de tu proyecto Supabase. Este script crea las tablas `user_profiles` y `analysis_records` (si no existen) y configura los triggers y políticas RLS necesarios.

```sql
-- 1. Create the UserProfile table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'free' NOT NULL, -- e.g., 'free', 'active_premium', 'cancelled', 'past_due'
  subscription_plan_id TEXT, -- Can reference another table of plans if you have multiple
  current_period_end TIMESTAMP WITH TIME ZONE,
  paypal_customer_id TEXT, -- Optional: Store PayPal Payer ID if needed from payment details
  paypal_order_id TEXT, -- Store the last successful PayPal order ID for reference
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.user_profiles IS 'Stores user profile information, including subscription status.';
COMMENT ON COLUMN public.user_profiles.id IS 'References the id in auth.users. Profiles are deleted when users are deleted.';
COMMENT ON COLUMN public.user_profiles.subscription_status IS 'Current status of the user''s subscription (e.g., free, active_premium)';
COMMENT ON COLUMN public.user_profiles.subscription_plan_id IS 'Identifier for the specific subscription plan, if applicable.';
COMMENT ON COLUMN public.user_profiles.current_period_end IS 'Date when the current subscription period ends or ended.';
COMMENT ON COLUMN public.user_profiles.paypal_customer_id IS 'Customer ID from PayPal (Payer ID), if applicable.';
COMMENT ON COLUMN public.user_profiles.paypal_order_id IS 'Last successful PayPal Order ID for reference. Updated by backend after payment capture.';

-- 2. Enable Row Level Security (RLS) on the user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for user_profiles
-- Users can view their own profile.
DROP POLICY IF EXISTS "Users can view their own profile." ON public.user_profiles;
CREATE POLICY "Users can view their own profile."
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own non-sensitive profile details.
-- Sensitive fields like subscription_status, current_period_end, paypal_order_id
-- should ONLY be updated by a trusted server-side process (like your /api/paypal/capture-order
-- or /api/paypal/webhook endpoints using the SUPABASE_SERVICE_ROLE_KEY).
DROP POLICY IF EXISTS "Users can update their own non-sensitive details." ON public.user_profiles;
CREATE POLICY "Users can update their own non-sensitive details."
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    NOT (
      NEW.subscription_status IS DISTINCT FROM OLD.subscription_status OR
      NEW.subscription_plan_id IS DISTINCT FROM OLD.subscription_plan_id OR
      NEW.current_period_end IS DISTINCT FROM OLD.current_period_end OR
      NEW.paypal_customer_id IS DISTINCT FROM OLD.paypal_customer_id OR
      NEW.paypal_order_id IS DISTINCT FROM OLD.paypal_order_id
      -- Add other sensitive fields here if needed to prevent user modification
    )
  );
-- Note: The SUPABASE_SERVICE_ROLE_KEY used in backend routes bypasses RLS.


-- 4. Create a trigger function to automatically create a user profile
--    when a new user signs up in auth.users.
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

-- 5. Create the trigger on the auth.users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_auth_user_created' AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;

-- 6. Create the AnalysisRecord table
CREATE TABLE IF NOT EXISTS public.analysis_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    analysis_type TEXT NOT NULL, -- e.g., "URL", "Server", "Database", "SAST", "DAST", "Cloud", "Container", "Dependency", "Network"
    target_description TEXT NOT NULL,
    overall_risk_assessment TEXT, -- e.g., "Low", "Medium", "High", "Critical", "Informational"
    vulnerable_findings_count INTEGER DEFAULT 0,
    report_summary TEXT, -- Could store a short summary or key points
    full_report_data JSONB, -- Store the detailed JSON of all findings and report text
    CONSTRAINT check_analysis_type CHECK (analysis_type IN ('URL', 'Server', 'Database', 'SAST', 'DAST', 'Cloud', 'Container', 'Dependency', 'Network'))
);

COMMENT ON TABLE public.analysis_records IS 'Stores records of security analyses performed by users.';
COMMENT ON COLUMN public.analysis_records.analysis_type IS 'Type of security analysis performed.';
COMMENT ON COLUMN public.analysis_records.target_description IS 'User-provided description or identifier of the target analyzed.';
COMMENT ON COLUMN public.analysis_records.full_report_data IS 'Stores the complete analysis result object, including all findings and the generated report text.';

-- 7. Enable Row Level Security (RLS) for analysis_records
ALTER TABLE public.analysis_records ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies for analysis_records
-- Users can view their own analysis records.
DROP POLICY IF EXISTS "Users can view their own analysis records." ON public.analysis_records;
CREATE POLICY "Users can view their own analysis records."
  ON public.analysis_records FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert new analysis records for themselves.
DROP POLICY IF EXISTS "Users can insert their own analysis records." ON public.analysis_records;
CREATE POLICY "Users can insert their own analysis records."
  ON public.analysis_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Optional: Users can delete their own analysis records.
-- DROP POLICY IF EXISTS "Users can delete their own analysis records." ON public.analysis_records;
-- CREATE POLICY "Users can delete their own analysis records."
--   ON public.analysis_records FOR DELETE
--   USING (auth.uid() = user_id);

-- Optional: Users cannot update analysis records (treat them as immutable once created).
-- If updates are needed, a more specific policy would be required.
DROP POLICY IF EXISTS "Analysis records are read-only after creation for users." ON public.analysis_records;
CREATE POLICY "Analysis records are read-only after creation for users."
  ON public.analysis_records FOR UPDATE
  USING (false); -- Effectively disallows updates by users via RLS
  
-- Note: The SUPABASE_SERVICE_ROLE_KEY used in backend routes bypasses RLS if needed for admin tasks.

-- 9. Create the 'notes' table (if you still want this example table for testing)
CREATE TABLE IF NOT EXISTS public.notes (
  id bigint primary key generated always as identity,
  title text not null
);

-- Insert some sample data into the 'notes' table (only if it's empty)
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM public.notes) = 0 THEN
    INSERT INTO public.notes (title)
    VALUES
      ('Today I created a Supabase project.'),
      ('I added some data and queried it from Next.js.'),
      ('It was awesome!');
  END IF;
END $$;

-- Enable Row Level Security (RLS) for 'notes' table
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access for 'notes' table
DROP POLICY IF EXISTS "public can read notes" ON public.notes;
CREATE POLICY "public can read notes"
  ON public.notes
  FOR SELECT TO anon
  USING (true);
```

### Ejecutando la Aplicación

1.  **Reinicia el Servidor de Desarrollo:** Si estaba corriendo, detenlo (Ctrl+C) y vuelve a iniciarlo:
    ```bash
    npm run dev
    ```
    La aplicación debería estar disponible en [http://localhost:9002](http://localhost:9002) (o el puerto que hayas configurado).
2.  **Iniciar el servidor de desarrollo de Genkit (opcional, si estás desarrollando flujos de IA):**
    ```bash
    npm run genkit:watch
    ```
    Genkit UI estará disponible en [http://localhost:4000](http://localhost:4000) por defecto.

### Solución de Problemas Comunes

*   **Error de Clave API de Google AI:** Si los análisis fallan con errores sobre la clave API, verifica `NEXT_PUBLIC_GOOGLE_API_KEY` en tu `.env.local`. Asegúrate de que sea una clave válida de Google AI Studio y que el servidor de desarrollo se haya reiniciado después de añadirla.
*   **Error de Pagos de PayPal:** Si los botones de PayPal no aparecen o los pagos fallan:
    *   Verifica que `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, y `NEXT_PUBLIC_PAYPAL_CLIENT_ID` estén correctamente configurados en `.env.local` con tus credenciales de **Sandbox** de PayPal Developer para tu aplicación REST API. (Idealmente `PAYPAL_CLIENT_ID` y `NEXT_PUBLIC_PAYPAL_CLIENT_ID` son el mismo valor).
    *   **Asegúrate de que `PAYPAL_CLIENT_SECRET` corresponda a la aplicación REST API asociada con el `PAYPAL_CLIENT_ID` que estás usando.**
    *   Asegúrate de que `PAYPAL_API_BASE_URL` esté configurado a `https://api-m.sandbox.paypal.com`.
    *   Revisa la consola del navegador y la consola del servidor Next.js para mensajes de error específicos. Si ves "Error creando orden en backend: {}", usualmente significa que `PAYPAL_CLIENT_ID` o `PAYPAL_CLIENT_SECRET` no están accesibles o son incorrectos en el backend.
*   **Errores de Autenticación o Base de Datos con Supabase:**
    *   **Error "Invalid API key" o "Failed to fetch" al Iniciar Sesión/Registrarse:** Este error casi siempre significa que `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_ANON_KEY` en tu archivo `.env.local` son incorrectas, están vacías, o el servidor de desarrollo no se reinició después de modificarlas.
        1.  Verifica dos veces que los valores en `.env.local` coincidan exactamente con los de tu proyecto Supabase (Project Settings > API).
        2.  Asegúrate de que el archivo se llame `.env.local` y esté en la raíz de tu proyecto.
        3.  **Detén y reinicia tu servidor de desarrollo Next.js** (`npm run dev`).
    *   Para operaciones de backend (como actualizar el estado de suscripción en `/api/paypal/capture-order`), asegúrate de que `SUPABASE_SERVICE_ROLE_KEY` esté configurada en `.env.local` y sea correcta.
    *   **Error en la Creación de Perfiles de Usuario:** Si los usuarios se pueden registrar en Supabase Auth (tabla `auth.users`) pero no se crea una entrada correspondiente en `public.user_profiles`, el trigger `handle_new_user` podría haber fallado o no estar configurado.
        1.  **Verifica la Ejecución del SQL:** Asegúrate de haber ejecutado **todo** el script SQL para `user_profiles` y `handle_new_user` (incluyendo `CREATE FUNCTION` y `CREATE TRIGGER`) en el Editor SQL de Supabase.
        2.  **Revisa los Logs de Base de Datos de Supabase:** En tu panel de Supabase, ve a "Database" -> "Logs" (o similar, la UI puede cambiar) y busca errores que puedan haber ocurrido alrededor del momento del registro de un nuevo usuario. Estos logs pueden dar pistas sobre por qué falló el trigger.
        3.  **Verifica la Definición de la Función y el Trigger:** En Supabase, ve a "Database" -> "Functions" y asegúrate de que `handle_new_user` exista y su definición sea correcta (especialmente `SECURITY DEFINER`). Luego ve a "Database" -> "Triggers" y verifica que `on_auth_user_created` esté asociado a la tabla `auth.users` y llame a `handle_new_user`.
        4.  **Permisos:** La función `handle_new_user` debe tener `SECURITY DEFINER` para poder insertar en `public.user_profiles`. La `service_role` de Supabase tiene permisos para esto.
*   **Problemas con hCaptcha (Actualmente Deshabilitado):**
    *   El componente `react-hcaptcha` ha sido eliminado de las dependencias y su uso comentado en los formularios de login/signup debido a problemas persistentes con `npm install`.
    *   **Si deseas reactivarlo:** Sigue las instrucciones detalladas en la sección "Reactivación de hCaptcha" más abajo en este README.
    *   **Error "captcha verification process failed" de Supabase:** Si ves este error en los `toast` de login/signup incluso con el frontend de hCaptcha deshabilitado, significa que **tienes la protección CAPTCHA activada a nivel de proyecto en Supabase**. Ve a tu proyecto Supabase -> Authentication -> Settings y desactiva la protección CAPTCHA. Guarda los cambios.

## Implementación de Autenticación Real y Base de Datos (En Progreso con Supabase)

La plataforma utiliza **Supabase Auth**. Un `AuthProvider` (`src/context/AuthContext.tsx`) gestiona la sesión globalmente y carga el perfil del usuario desde la tabla `user_profiles` para determinar el estado `isPremium` basado en el campo `subscription_status`.

**Estado Actual:**
*   Los formularios de Login/Signup (`src/app/login/page.tsx`, `src/app/signup/page.tsx`) interactúan con las funciones de autenticación de Supabase (`signInWithPassword`, `signUp`).
*   El `AuthContext` (`src/context/AuthContext.tsx`) escucha los cambios de estado de autenticación de Supabase y obtiene el perfil del usuario de la tabla `user_profiles`. El estado `isPremium` se deriva de `userProfile.subscription_status`.
*   Se ha proporcionado el SQL para crear la tabla `user_profiles` y un trigger de base de datos (`handle_new_user`) que automáticamente crea un perfil básico (con `subscription_status = 'free'`) cuando un nuevo usuario se registra en `auth.users`.
*   Se ha definido el SQL para crear la tabla `analysis_records` para almacenar el historial de análisis. La lógica para guardar los análisis en esta tabla (dentro de `src/app/actions.ts`) y para mostrar el historial en `/dashboard` ya está implementada.

## Implementación de Pagos con PayPal (API REST - Sandbox)

*   **Creación de Órdenes:** El frontend (`src/app/page.tsx`) llama a `/api/paypal/create-order` (backend). El backend usa las credenciales API de PayPal (desde `.env.local`) para crear una orden en PayPal y devuelve el `orderID`.
*   **Procesamiento de Pago Frontend:** El SDK de JS de PayPal (cargado en `src/app/layout.tsx`) usa el `orderID` para mostrar los botones de pago de PayPal.
*   **Captura de Órdenes:** Tras la aprobación del usuario en la UI de PayPal, el frontend llama a `/api/paypal/capture-order` (backend) con el `orderID`.
*   **Actualización de Base de Datos:** El endpoint `/api/paypal/capture-order` (backend):
    1.  Verifica al usuario autenticado (Supabase).
    2.  Captura el pago con PayPal usando las credenciales API.
    3.  Si la captura es exitosa, usa un cliente Supabase con la `SUPABASE_SERVICE_ROLE_KEY` para actualizar la tabla `user_profiles` del usuario:
        *   `subscription_status` a `'active_premium'`.
        *   `current_period_end` (ej. 30 días desde ahora).
        *   `paypal_order_id`.
*   **Refresco de Estado en Frontend:** `AuthContext` llama a `refreshUserProfile()` después de una captura de pago exitosa para cargar el nuevo estado de suscripción desde la base de datos, lo que actualiza el acceso a las funciones premium en la UI.

## Implementación de Webhooks de PayPal (CRÍTICO para Producción)

*   **Necesidad:** Para manejar confirmaciones de pago asíncronas y eventos del ciclo de vida de la suscripción (renovaciones, cancelaciones, etc.) de forma fiable. Esto asegura que tu base de datos se mantenga sincronizada incluso si el flujo del cliente se interrumpe.
*   **Endpoint:** Se ha creado un placeholder en `/src/app/api/paypal/webhook/route.ts`. Debes configurar esta URL en tu aplicación de PayPal Developer y registrarla para los eventos relevantes.
*   **Verificación de Firma:** Tu endpoint de webhook DEBE verificar la firma de las solicitudes de PayPal para asegurar su autenticidad. La lógica para esto es compleja y debe implementarse cuidadosamente (actualmente es un placeholder con comentarios extensos).
*   **Procesamiento de Eventos:** El endpoint debe procesar los eventos relevantes (ej. `PAYMENT.CAPTURE.COMPLETED`, `BILLING.SUBSCRIPTION.CANCELLED`, etc.) y actualizar la tabla `user_profiles` en Supabase.

## Pasos Críticos para Puesta en Marcha Online (Producción)

1.  **Autenticación y Gestión de Perfiles Completa (Supabase):**
    *   Asegurar que la creación de perfiles (`user_profiles`) funcione sin fallos con el trigger `handle_new_user`.
    *   Implementar una UI para que los usuarios gestionen su perfil (cambiar nombre, avatar, etc. - *Roadmap*).
2.  **Integración Completa de Pasarela de Pagos (PayPal):**
    *   Pasar a credenciales LIVE de PayPal en variables de entorno de producción.
    *   **Implementar y probar exhaustivamente los Webhooks de PayPal**, incluyendo la verificación de firma.
    *   Asegurar que la actualización de `user_profiles` en la base de datos sea 100% fiable.
3.  **Persistencia del Historial de Análisis:**
    *   La lógica en `src/app/actions.ts` (dentro de `performAnalysisAction`) para guardar los resultados de cada análisis en la tabla `analysis_records` de Supabase, vinculados al `userId`, ya está implementada.
    *   La página `/dashboard` ahora muestra estos registros al usuario autenticado.
4.  **Despliegue y Alojamiento Profesional:** Vercel, AWS, GCP, etc. Configuración segura de variables de entorno LIVE.
5.  **Seguridad de la Plataforma:** Protección de claves, validación de entradas, rate limiting, firewalls.
6.  **Aspectos Legales:** Términos de Servicio (`terms.md`) y Política de Privacidad (`privacy.md`) profesionalmente redactados y adaptados a tu servicio. (Actualmente son placeholders).
7.  **Operaciones y Mantenimiento:** Logging, monitorización, copias de seguridad, soporte al cliente.

## Roadmap (Posibles Mejoras Futuras)
*   **Integración Profunda con Herramientas de Seguridad:** Permitir importación/exportación con Nessus, Burp Suite.
*   **Motor de Reglas Personalizadas:** Permitir a las empresas definir sus propias reglas de detección.
*   **Políticas de Seguridad Corporativas:** Validar contra políticas definidas por la empresa.
*   **Integración con SIEM/SOAR:** Enviar alertas y hallazgos a Splunk, QRadar, Sentinel.
*   **Integración con CI/CD:** Automatizar análisis en pipelines de desarrollo.
*   **Análisis de Seguridad de APIs Dedicado.**
*   **Paneles de Control (Dashboards) Avanzados:** Con métricas, tendencias y visualizaciones interactivas para el historial de análisis.
*   **Informes en PDF Personalizables.**
*   **Interfaz de Línea de Comandos (CLI).**
*   **Mejoras en Análisis de Servidores de Juegos:** Detección de trampas, análisis de protocolos de juego, análisis de scripts/mods.
*   **Soporte Multilingüe Adicional.**
*   **Gestión de Equipos/Organizaciones:** Cuentas maestras con múltiples usuarios y roles.
*   **Pruebas Unitarias y de Integración (Jest, Vitest).**
*   **Linters y Formateadores (ESLint, Prettier) con Hooks (Husky).**
*   **Documentación Técnica Detallada para Desarrolladores (`/docs` o Wiki).**

## Reactivación de hCaptcha (Opcional)
La integración de hCaptcha está actualmente deshabilitada en los formularios de login/signup debido a problemas persistentes con la instalación del paquete `react-hcaptcha` en el entorno de desarrollo. Si deseas reactivarla:

1.  **Intenta Instalar `react-hcaptcha`:**
    ```bash
    npm install react-hcaptcha@latest --save
    # o
    yarn add react-hcaptcha@latest
    ```
    Si esto falla, investiga el error específico. Podría ser un problema con tu caché de npm (`npm cache clean --force`), tu registro de npm, o un problema de red. Consulta `npmjs.com` para la última versión estable y prueba con esa versión específica si `@latest` no funciona.
2.  **Descomenta el Código:**
    *   En `src/app/login/page.tsx` y `src/app/signup/page.tsx`:
        *   Descomenta el `import HCaptcha from "react-hcaptcha";`.
        *   Descomenta el estado `captchaToken` y la referencia `captchaRef`.
        *   Descomenta las funciones `onCaptchaVerify`, `onCaptchaExpire`, y `onCaptchaError`.
        *   Descomenta el componente `<HCaptcha ... />` dentro de los formularios.
        *   Descomenta la lógica que deshabilita el botón de envío si `!captchaToken`.
3.  **Variables de Entorno (Frontend):**
    *   Asegúrate de que `NEXT_PUBLIC_HCAPTCHA_SITE_KEY=22860de4-8b40-4054-95d8-fac6d9f477ca` (o tu clave de sitio real) esté en tu `.env.local`.
4.  **Implementar Verificación del Backend (¡CRUCIAL!):**
    *   Esto es esencial para que hCaptcha sea efectivo. Necesitarás modificar la lógica de backend que maneja el login/signup (si es una API route o una Server Action) para:
        *   Recibir el `captchaToken` que el frontend envía.
        *   Hacer una solicitud `POST` al endpoint de verificación de hCaptcha: `https://api.hcaptcha.com/siteverify`.
        *   Enviar los siguientes parámetros en el cuerpo de la solicitud (como `application/x-www-form-urlencoded`):
            *   `secret`: Tu **clave secreta de hCaptcha** (debe estar en una variable de entorno del servidor, ej. `HCAPTCHA_SECRET_KEY`).
            *   `response`: El `captchaToken` recibido del frontend.
            *   `remoteip`: (Opcional pero recomendado) La dirección IP del usuario.
        *   El proceso de login/signup solo debe continuar si la respuesta de `siteverify` es exitosa (`"success": true`).

## 🪪 Licencia
Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.

**Idea y Visión:** Ronald Gonzalez Niche
