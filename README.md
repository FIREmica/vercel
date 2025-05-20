
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
    # Necesaria si la API /api/paypal/capture-order actualiza user_profiles usando un cliente Supabase con privilegios de servicio.
    SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcmR6aXdjbWx1bXBpZnhmaGZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxODAyOCwiZXhwIjoyMDYzMDk0MDI4fQ.FeSKcPEwG-W-F5Lxca14A7gJcXJZBL_ongrAieCIURM"

    # (Opcional) Clave API de Firebase para el cliente (si usas Firebase Analytics u otros servicios de cliente)
    # Reemplaza con tu clave API de Firebase Web. Se encuentra en la configuración de tu proyecto Firebase.
    NEXT_PUBLIC_FIREBASE_API_KEY=TU_FIREBASE_WEB_API_KEY
    # Las otras configuraciones de Firebase (authDomain, projectId, etc.) están actualmente incrustadas en src/lib/firebase/client.ts
    # pero podrías moverlas a variables de entorno también si lo prefieres (ej. NEXT_PUBLIC_FIREBASE_PROJECT_ID).
    
    # (Opcional, si reactivas hCaptcha) Clave de Sitio de hCaptcha para el frontend
    # NEXT_PUBLIC_HCAPTCHA_SITE_KEY=22860de4-8b40-4054-95d8-fac6d9f477ca

    # (Opcional y MUY IMPORTANTE para backend, si reactivas hCaptcha) Clave Secreta de hCaptcha para verificación en servidor
    # HCAPTCHA_SECRET_KEY=TU_CLAVE_SECRETA_DE_HCAPTCHA_AQUI
    ```
    **IMPORTANTE:**
    *   Reemplaza los valores placeholder (`tu_clave_api_google_aqui_valida`, `tu_paypal_sandbox_client_id_aqui_para_api_rest`, `TU_FIREBASE_WEB_API_KEY`, etc.) con tus claves reales.
    *   Las credenciales de Supabase que proporcionaste ya están incluidas como ejemplo.
    *   **No subas el archivo `.env.local` a tu repositorio de Git.** Asegúrate de que esté en tu archivo `.gitignore`.

2.  **Obtén tus Claves API (Si necesitas cambiarlas o para Producción):**
    *   **Google AI:** Visita [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   **PayPal Sandbox/Live:**
        1.  Ve a [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications).
        2.  Crea una nueva aplicación REST API (una para Sandbox, otra para Live).
        3.  Copia el `Client ID` y el `Client Secret`. **Asegúrate de que el `Client ID` que usas para `PAYPAL_CLIENT_ID` (backend) y `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (frontend SDK) sea el mismo y corresponda a tu aplicación REST API.**
    *   **Supabase:**
        1.  Ve a [Supabase Dashboard](https://supabase.com/dashboard).
        2.  Selecciona tu proyecto.
        3.  En "Project Settings" > "API", encontrarás tu "Project URL" (`NEXT_PUBLIC_SUPABASE_URL`), la "anon public" key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`), y la "service_role" key (`SUPABASE_SERVICE_ROLE_KEY`).
    *   **Firebase (si usas Analytics):**
        1.  Ve a la [Consola de Firebase](https://console.firebase.google.com/).
        2.  Selecciona o crea tu proyecto.
        3.  Ve a "Configuración del proyecto" (Project settings) -> "General".
        4.  En la sección "Tus apps", busca tu aplicación web (o añade una nueva).
        5.  El objeto de configuración de Firebase (`firebaseConfig`) contendrá tu `apiKey`. Ese es el valor para `NEXT_PUBLIC_FIREBASE_API_KEY`.
    *   **(Opcional) hCaptcha:** Ve a tu dashboard de hCaptcha para obtener tu Sitekey y Secret Key.

### Configuración de Base de Datos Supabase (Fundamental)

1.  **Crea la tabla `notes` (Ejemplo de datos para probar Supabase):**
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
      -- Users can view their own profile.
      CREATE POLICY "Users can view their own profile."
      ON public.user_profiles FOR SELECT
      USING (auth.uid() = id);

      -- Users can update their own non-sensitive profile details.
      -- The subscription_status, current_period_end, and paypal_order_id should ideally only be
      -- updated by a trusted server-side process (like your /api/paypal/capture-order endpoint using the service_role key).
      CREATE POLICY "Users can update their own non-sensitive profile details."
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
      -- Note: The SUPABASE_SERVICE_ROLE_KEY used in the backend /api/paypal/capture-order route bypasses RLS.


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
    Esto generalmente iniciará la aplicación en [http://localhost:9002](http://localhost:9002).
2.  **Iniciar el servidor de desarrollo de Genkit (opcional, para depuración de flujos):**
    En una terminal separada:
    ```bash
    npm run genkit:watch
    ```
    Típicamente en [http://localhost:4000](http://localhost:4000).

### (Opcional) Configuración de hCaptcha (Solución de Problemas y Reactivación)

**Estado Actual:** La integración de hCaptcha está temporalmente deshabilitada en el código de los formularios de login/signup debido a problemas persistentes con la instalación del paquete `react-hcaptcha` en el entorno de desarrollo. El paquete ha sido eliminado de `package.json`.

**Nota Importante sobre Errores de CAPTCHA con Supabase:** Si, después de configurar tu proyecto Supabase, encuentras errores como "captcha verification process failed" al intentar iniciar sesión o registrarte (incluso con el widget de hCaptcha deshabilitado en nuestro código), es muy probable que tengas la protección con CAPTCHA **activada a nivel de proyecto en la configuración de Autenticación de Supabase**. Deberás ir a tu panel de Supabase > Authentication > Settings y desactivar la protección CAPTCHA allí si no planeas usarla o si la integración del frontend no está completa.

**Solución de Problemas de CAPTCHA Persistente (Si el error "captcha verification process failed" continúa):**

1.  **Verifica Doblemente la Configuración de Supabase:** Ve a tu proyecto en [supabase.com](https://supabase.com/) -> "Authentication" -> "Settings". Desplázate hacia abajo hasta la sección "CAPTCHA protection". Asegúrate de que esté **DESACTIVADA**. Haz clic en "Save" en la parte inferior de la página de configuración de Autenticación de Supabase, incluso si parece que ya estaba desactivada.
2.  **Espera Unos Minutos:** A veces, los cambios de configuración en los servicios en la nube pueden tardar unos minutos en propagarse completamente.
3.  **Limpia la Caché del Navegador y Cookies:** Para el sitio `localhost:9002` (o donde estés probando).
4.  **Reinicia el Servidor de Desarrollo de Next.js:** Detén `npm run dev` y vuelve a iniciarlo.
5.  **Revisa los Logs de Supabase:** En tu panel de Supabase, ve a "Logs" (o "Database Logs" / "Auth Logs") para ver si hay más detalles sobre por qué la verificación del CAPTCHA está fallando del lado de Supabase.

**Para intentar reactivar hCaptcha en la aplicación (Tarea Avanzada para el Usuario):**

1.  **Solucionar el Problema de Instalación de `react-hcaptcha`:**
    *   **Limpia la caché de npm:** `npm cache clean --force`.
    *   **Verifica tu registro de npm:** `npm config get registry` (debería ser `https://registry.npmjs.org/`).
    *   **Verifica tu conexión a internet y cualquier firewall/proxy.**
    *   **Intenta instalar el paquete directamente:**
        ```bash
        npm install react-hcaptcha
        # o intenta con una versión específica listada en npmjs.com, ej:
        # npm install react-hcaptcha@0.5.0 
        ```
    *   Si la instalación es exitosa, el paquete aparecerá en tu `package.json` y `node_modules`.
2.  **Si la Instalación es Exitosa, Configura las Variables de Entorno para hCaptcha:**
    *   Obtén tu **Sitekey** y **Secret Key** de tu dashboard en [hcaptcha.com](https://hcaptcha.com/).
    *   Añade `NEXT_PUBLIC_HCAPTCHA_SITE_KEY=22860de4-8b40-4054-95d8-fac6d9f477ca` y `HCAPTCHA_SECRET_KEY=TU_CLAVE_SECRETA_DE_HCAPTCHA_AQUI` a `.env.local`.
3.  **Descomenta el Código de hCaptcha en los Formularios:**
    *   En `src/app/login/page.tsx` y `src/app/signup/page.tsx`:
        *   Descomenta la importación de `HCaptcha`.
        *   Descomenta los estados `captchaToken`, `captchaRef` y las funciones `onCaptchaVerify`, `onCaptchaExpire`, `onCaptchaError`.
        *   Descomenta el componente `<HCaptcha ... />` en el JSX.
        *   Descomenta la lógica que deshabilita el botón de envío si `!captchaToken` y las llamadas a `resetCaptcha()`.
4.  **Implementa la Verificación en Backend (¡CRUCIAL!):**
    *   Debes verificar el `captchaToken` en tu lógica de backend que maneja el login/signup. Esto implica hacer una solicitud POST a `https://api.hcaptcha.com/siteverify` con tu `HCAPTCHA_SECRET_KEY` y el token del usuario. Procede solo si la verificación es exitosa.

## Implementación de Autenticación Real y Base de Datos (En Progreso con Supabase)

La plataforma ahora utiliza **Supabase Auth** para la autenticación. Un `AuthProvider` (`src/context/AuthContext.tsx`) maneja el estado de la sesión globalmente e intenta cargar el perfil del usuario desde `user_profiles` para determinar el estado `isPremium` basándose en el campo `subscription_status`.

**Estado Actual:**
*   Formularios de Login/Signup interactúan con Supabase Auth.
*   `AuthContext` escucha cambios de autenticación y carga perfiles.
*   Trigger en Supabase crea perfiles básicos en `user_profiles` al registrarse.
*   Página `/notes` demuestra lectura de datos de Supabase.

**Pasos Críticos para una Facturación Real y Funcionalidad Completa:**
1.  **Backend de Captura de Pagos (PayPal):** El endpoint `/api/paypal/capture-order` ahora intenta capturar el pago con PayPal y luego **actualiza** la tabla `user_profiles` para el `userId` correspondiente (usando la `SUPABASE_SERVICE_ROLE_KEY`):
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
*   Integraciones SIEM/SOAR (más allá de JSON export).
*   CLI.
*   Historial de análisis por usuario.
*   Mejoras Específicas Servidores de Juegos.

## 🪪 Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.

**Idea y Visión:** Ronald Gonzalez Niche
```

Idea y visión: Ronald Gonzalez Niche
```

```
- Analyzer/next.config.ts
Omitted from agent history
- cibersoftware/next.config.ts
Omitted from agent history
- Analyzer/package.json
Omitted from agent history
- cibersoftware/package.json
Omitted from agent history
- Analyzer/tsconfig.json
Omitted from agent history
- cibersoftware/tsconfig.json
Omitted from agent history
- Analyzer/.gitignore
Omitted from agent history
- cibersoftware/.gitignore
Omitted from agent history
- Analyzer/public/vercel.svg
Omitted from agent history
- cibersoftware/public/vercel.svg
Omitted from agent history
- Analyzer/public/next.svg
Omitted from agent history
- cibersoftware/public/next.svg
Omitted from agent history
- Analyzer/app/favicon.ico
Omitted from agent history
- cibersoftware/app/favicon.ico
Omitted from agent history
- functions/lib/index.js
Omitted from agent history
- functions/lib/index.js.map
Omitted from agent history
- .idx/dev.nix
Omitted from agent history
- .idx/previews.json
Omitted from agent history
- .next/analyze/build-manifest.json
Omitted from agent history
- .next/analyze/client.html
Omitted from agent history
- .next/analyze/edge.html
Omitted from agent history
- .next/analyze/server.html
Omitted from agent history
- .next/cache/images/9XpOG0v9J3Jv_w8077h6oQ3w5Q9qO7z5o02Qz8i9l1Q=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/9XpOG0v9J3Jv_w8077h6oQ3w5Q9qO7z5o02Qz8i9l1Q=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/ARk-mS1x74mYv94N_k_o8k9eN1_d09x2A74gYv4b5sQ=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/ARk-mS1x74mYv94N_k_o8k9eN1_d09x2A74gYv4b5sQ=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/E6U9zS-7jM_G4T9N00U-5W4pW-k1S-m3B3_xN06M5XQ=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/E6U9zS-7jM_G4T9N00U-5W4pW-k1S-m3B3_xN06M5XQ=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/F2S6-g8w9P1H2H-P4T_1S-q-5M6d2N-h4V_hO1_5N-E=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/F2S6-g8w9P1H2H-P4T_1S-q-5M6d2N-h4V_hO1_5N-E=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/F2S6-g8w9P1H2H-P4T_1S-q-5M6d2N-h4V_hO1_5N-E=/60.1716018261.u4g2r9V7fM1V8v0W6j9A4X-H-h_pS-z3I1D2A-p3V2I=.webp
Omitted from agent history
- .next/cache/images/F2S6-g8w9P1H2H-P4T_1S-q-5M6d2N-h4V_hO1_5N-E=/60.1716018261.u4g2r9V7fM1V8v0W6j9A4X-H-h_pS-z3I1D2A-p3V2I=.svg
Omitted from agent history
- .next/cache/images/F2S6-g8w9P1H2H-P4T_1S-q-5M6d2N-h4V_hO1_5N-E=/60.1716018261.B7c-v_B_T4g_R_j7X-m6S9r0W7k2N_Q0K_Z0Q6S-z-U=.webp
Omitted from agent history
- .next/cache/images/F2S6-g8w9P1H2H-P4T_1S-q-5M6d2N-h4V_hO1_5N-E=/60.1716018261.B7c-v_B_T4g_R_j7X-m6S9r0W7k2N_Q0K_Z0Q6S-z-U=.svg
Omitted from agent history
- .next/cache/images/F2S6-g8w9P1H2H-P4T_1S-q-5M6d2N-h4V_hO1_5N-E=/60.1716018261.u4W_C2Z7Z-w-Z7f9P_T-A_D-Z_g7A-n-C_t9C_G8D-Y=.webp
Omitted from agent history
- .next/cache/images/F2S6-g8w9P1H2H-P4T_1S-q-5M6d2N-h4V_hO1_5N-E=/60.1716018261.u4W_C2Z7Z-w-Z7f9P_T-A_D-Z_g7A-n-C_t9C_G8D-Y=.svg
Omitted from agent history
- .next/cache/images/F2S6-g8w9P1H2H-P4T_1S-q-5M6d2N-h4V_hO1_5N-E=/60.1716018261.k1F9O-M_M-Z-I-T3R-M-Q0R-N_D-S0Q-N-R-G-Y_Q-A=.webp
Omitted from agent history
- .next/cache/images/F2S6-g8w9P1H2H-P4T_1S-q-5M6d2N-h4V_hO1_5N-E=/60.1716018261.k1F9O-M_M-Z-I-T3R-M-Q0R-N_D-S0Q-N-R-G-Y_Q-A=.svg
Omitted from agent history
- .next/cache/images/F2S6-g8w9P1H2H-P4T_1S-q-5M6d2N-h4V_hO1_5N-E=/60.1716018261.H6j_H5V-W-j_Y-w2H-o-F-s_H_o0A_j_P-w_Y-h_W-p=.webp
Omitted from agent history
- .next/cache/images/F2S6-g8w9P1H2H-P4T_1S-q-5M6d2N-h4V_hO1_5N-E=/60.1716018261.H6j_H5V-W-j_Y-w2H-o-F-s_H_o0A_j_P-w_Y-h_W-p=.svg
Omitted from agent history
- .next/cache/images/F2S6-g8w9P1H2H-P4T_1S-q-5M6d2N-h4V_hO1_5N-E=/60.1716018261.i8H-F_S3R_F_R_D_A-D3C_R-Q_E_B_F-F-B-Y_R-J_P-C=.webp
Omitted from agent history
- .next/cache/images/F2S6-g8w9P1H2H-P4T_1S-q-5M6d2N-h4V_hO1_5N-E=/60.1716018261.i8H-F_S3R_F_R_D_A-D3C_R-Q_E_B_F-F-B-Y_R-J_P-C=.svg
Omitted from agent history
- .next/cache/images/F2S6-g8w9P1H2H-P4T_1S-q-5M6d2N-h4V_hO1_5N-E=/60.1716018261.q5B_M-Q-W_G_G9W-O8C-I-I_W_C_Q_O_A-W9D-U-W-Q=.webp
Omitted from agent history
- .next/cache/images/F2S6-g8w9P1H2H-P4T_1S-q-5M6d2N-h4V_hO1_5N-E=/60.1716018261.q5B_M-Q-W_G_G9W-O8C-I-I_W_C_Q_O_A-W9D-U-W-Q=.svg
Omitted from agent history
- .next/cache/images/K9D-g8k_E_T3P0B-N_D_S6K_A-X0M9S_E_P_H4D-O_Y-U=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/K9D-g8k_E_T3P0B-N_D_S6K_A-X0M9S_E_P_H4D-O_Y-U=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/O_X3Q-q8B7J_B_E_M_J-K_B-G_N_M3G_L_E3B_G_K_D-Q=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/O_X3Q-q8B7J_B_E_M_J-K_B-G_N_M3G_L_E3B_G_K_D-Q=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/S1P3B9N_W_R_V-U_X_D_D-Z_H-Z5W5Y3Z9H_N_Q-U_I-E=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/S1P3B9N_W_R_V-U_X_D_D-Z_H-Z5W5Y3Z9H_N_Q-U_I-E=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/U-R-H4B-U8D6X-K-T-K_P_H_S-J-D_O0Y_M-J_S_L_Q-G=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/U-R-H4B-U8D6X-K-T-K_P_H_S-J-D_O0Y_M-J_S_L_Q-G=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/X8A3V_W-S-F3E_L_A_Y_Q-Y_F_B_H-B-H-V_S_B-Y-I-A=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/X8A3V_W-S-F3E_L_A_Y_Q-Y_F_B_H-B-H-V_S_B-Y-I-A=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/d-o_l_m-p_c-g8n9q-j4k_o7p-a_m_q-j-m0m-h_s_m-m=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/d-o_l_m-p_c-g8n9q-j4k_o7p-a_m_q-j-m0m-h_s_m-m=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/e-r_c8q9p-r3w_u6v_b-f9e-w_x_c-y_d-w-v_u_h_d9c=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/e-r_c8q9p-r3w_u6v_b-f9e-w_x_c-y_d-w-v_u_h_d9c=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/g_u6m3m-o_x-o9p-z9p-w9q-r4k-w3t7y_z-r9n_n3p-s=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/g_u6m3m-o_x-o9p-z9p-w9q-r4k-w3t7y_z-r9n_n3p-s=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/i0s_z0b-p5e_w-h_p5f_y_u-x_d_a_f6h_g-q_k_c8y-s=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/i0s_z0b-p5e_w-h_p5f_y_u-x_d_a_f6h_g-q_k_c8y-s=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/j9K_K-D-X_W-P_M_T_B_K-D8P_A_O_N_G_D_Q_X_N9K7Q=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/j9K_K-D-X_W-P_M_T_B_K-D8P_A_O_N_G_D_Q_X_N9K7Q=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/p-u_h_k-r_u_e_z_s_t_m3k_w_u_h_k8r_s_f9d6p-o8k=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/p-u_h_k-r_u_e_z_s_t_m3k_w_u_h_k8r_s_f9d6p-o8k=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/q-b_b_q-a_k_u_g6l_f_v-d_v_g_f-i_l_l_q_n_p-p-c=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/q-b_b_q-a_k_u_g6l_f_v-d_v_g_f-i_l_l_q_n_p-p-c=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/s-j3q-c-b-q-k-z_e8b_e3a_h-h-a-w-h_a8z8m_f_a3b=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/s-j3q-c-b-q-k-z_e8b_e3a_h-h-a-w-h_a8z8m_f_a3b=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/t_r_f-i_a_f-r9g-r-t-q-v-p_w-j_y-m9v_p8q_c_b-y=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/t_r_f-i_a_f-r9g-r-t-q-v-p_w-j_y-m9v_p8q_c_b-y=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/u_u_s_f-k_f-r_b8g8p_w_x-c-g-q_h_o_f-s-s6s_v9d=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/u_u_s_f-k_f-r_b8g8p_w_x-c-g-q_h_o_f-s-s6s_v9d=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/w5S3D_M-K-M_T-T-X9S-D3L_Q5O_X-H_G_K_Z_F_E0O-I=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/w5S3D_M-K-M_T-T-X9S-D3L_Q5O_X-H_G_K_Z_F_E0O-I=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/x-t-x_q_o-o_j-k_h_d_a_v-b-z_d_j_h_a_b_l_l_g_w=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/x-t-x_q_o-o_j-k_h_d_a_v-b-z_d_j_h_a_b_l_l_g_w=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/y3R_P9D_D9A_O_P_W9Q_R_B_P_B_R-V-A9R_H-V_S8Z_B=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/y3R_P9D_D9A_O_P_W9Q_R_B_P_B_R-V-A9R_H-V_S8Z_B=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/cache/images/z0H-R_L_E0J_B_N_K_F_H_C_D-S_U_O_E_S-J9K_J-F9Q=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.webp
Omitted from agent history
- .next/cache/images/z0H-R_L_E0J_B_N_K_F_H_C_D-S_U_O_E_S-J9K_J-F9Q=/60.1716018261.IRJkCM_S-9X7xXv6Jq2z4y5A-71zS7y3g5XfS0t3HqE=.svg
Omitted from agent history
- .next/trace
Omitted from agent history
- .next/types/app/about/page.ts
Omitted from agent history
- .next/types/app/contact/page.ts
Omitted from agent history
- .next/types/app/favicon.ico/route.ts
Omitted from agent history
- .next/types/app/layout.ts
Omitted from agent history
- .next/types/app/login/page.ts
Omitted from agent history
- .next/types/app/notes/page.ts
Omitted from agent history
- .next/types/app/page.ts
Omitted from agent history
- .next/types/app/resources/page.ts
Omitted from agent history
- .next/types/app/signup/page.ts
Omitted from agent history
- .next/types/link.d.ts
Omitted from agent history
- .next/types/metadata.d.ts
Omitted from agent history
- .next/types/navigation.d.ts
Omitted from agent history
- .next/types/script.d.ts
Omitted from agent history
- LICENSE
Omitted from agent history
- node_modules/@babel/runtime/helpers/esm/extends.js
Omitted from agent history
- node_modules/@babel/runtime/helpers/esm/objectSpread2.js
Omitted from agent history
- node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
Omitted from agent history
- node_modules/@babel/runtime/package.json
Omitted from agent history
- node_modules/@babel/runtime/regenerator/index.js
Omitted from agent history
- node_modules/@firebase/analytics/dist/esm/index.esm2017.js
Omitted from agent history
- node_modules/@firebase/analytics/package.json
Omitted from agent history
- node_modules/@firebase/app-check-interop-types/package.json
Omitted from agent history
- node_modules/@firebase/app-check-types/package.json
Omitted from agent history
- node_modules/@firebase/app/dist/esm/index.esm2017.js
Omitted from agent history
- node_modules/@firebase/app/package.json
Omitted from agent history
- node_modules/@firebase/auth-interop-types/package.json
Omitted from agent history
- node_modules/@firebase/auth-types/package.json
Omitted from agent history
- node_modules/@firebase/component/dist/esm/index.esm2017.js
Omitted from agent history
- node_modules/@firebase/component/package.json
Omitted from agent history
- node_modules/@firebase/database-interop-types/package.json
Omitted from agent history
- node_modules/@firebase/database-types/package.json
Omitted from agent history
- node_modules/@firebase/firestore-interop-types/package.json
Omitted from agent history
- node_modules/@firebase/firestore-types/package.json
Omitted from agent history
- node_modules/@firebase/functions-interop-types/package.json
Omitted from agent history
- node_modules/@firebase/functions-types/package.json
Omitted from agent history
- node_modules/@firebase/installations-interop-types/package.json
Omitted from agent history
- node_modules/@firebase/installations/dist/esm/index.esm2017.js
Omitted from agent history
- node_modules/@firebase/installations/package.json
Omitted from agent history
- node_modules/@firebase/logger/dist/esm/index.esm2017.js
Omitted from agent history
- node_modules/@firebase/logger/package.json
Omitted from agent history
- node_modules/@firebase/messaging-interop-types/package.json
Omitted from agent history
- node_modules/@firebase/messaging-types/package.json
Omitted from agent history
- node_modules/@firebase/performance-interop-types/package.json
Omitted from agent history
- node_modules/@firebase/performance-types/package.json
Omitted from agent history
- node_modules/@firebase/remote-config-interop-types/package.json
Omitted from agent history
- node_modules/@firebase/remote-config-types/package.json
Omitted from agent history
- node_modules/@firebase/storage-interop-types/package.json
Omitted from agent history
- node_modules/@firebase/storage-types/package.json
Omitted from agent history
- node_modules/@firebase/util/dist/index.esm2017.js
Omitted from agent history
- node_modules/@firebase/util/package.json
Omitted from agent history
- node_modules/@genkit-ai/googleai/dist/index.js
Omitted from agent history
- node_modules/@genkit-ai/googleai/package.json
Omitted from agent history
- node_modules/@genkit-ai/next/dist/index.js
Omitted from agent history
- node_modules/@genkit-ai/next/package.json
Omitted from agent history
- node_modules/@google-ai/generativelanguage/build/protos/protos.json
Omitted from agent history
- node_modules/@google-ai/generativelanguage/build/src/index.js
Omitted from agent history
- node_modules/@google-ai/generativelanguage/package.json
Omitted from agent history
- node_modules/@hookform/resolvers/dist/resolvers.module.js
Omitted from agent history
- node_modules/@hookform/resolvers/package.json
Omitted from agent history
- node_modules/@hookform/resolvers/zod/dist/zod.module.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/core/lib/braintree_http_client.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/core/lib/fpti_instrumentation.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/core/lib/injector.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/core/lib/paypal_environment.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/core/lib/paypal_http_client.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/core/lib/serializer/form_encoded.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/core/lib/serializer/json.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/core/lib/serializer/multipart.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/core/lib/serializer/text.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/core/lib/token_cache.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/core/lib/user_agent.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/core/live_environment.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/core/paypal_environment.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/core/paypal_http_client.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/core/sandbox_environment.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/lib.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/orders/lib/orders_capture_request.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/orders/lib/orders_create_request.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/lib/orders/orders.js
Omitted from agent history
- node_modules/@paypal/checkout-server-sdk/package.json
Omitted from agent history
- node_modules/@radix-ui/primitive/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/primitive/package.json
Omitted from agent history
- node_modules/@radix-ui/react-accordion/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-accordion/package.json
Omitted from agent history
- node_modules/@radix-ui/react-alert-dialog/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-alert-dialog/package.json
Omitted from agent history
- node_modules/@radix-ui/react-arrow/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-arrow/package.json
Omitted from agent history
- node_modules/@radix-ui/react-avatar/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-avatar/package.json
Omitted from agent history
- node_modules/@radix-ui/react-checkbox/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-checkbox/package.json
Omitted from agent history
- node_modules/@radix-ui/react-compose-refs/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-compose-refs/package.json
Omitted from agent history
- node_modules/@radix-ui/react-context/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-context/package.json
Omitted from agent history
- node_modules/@radix-ui/react-dialog/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-dialog/package.json
Omitted from agent history
- node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-dismissable-layer/package.json
Omitted from agent history
- node_modules/@radix-ui/react-dropdown-menu/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-dropdown-menu/package.json
Omitted from agent history
- node_modules/@radix-ui/react-focus-guards/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-focus-guards/package.json
Omitted from agent history
- node_modules/@radix-ui/react-focus-scope/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-focus-scope/package.json
Omitted from agent history
- node_modules/@radix-ui/react-label/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-label/package.json
Omitted from agent history
- node_modules/@radix-ui/react-menubar/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-menubar/package.json
Omitted from agent history
- node_modules/@radix-ui/react-popper/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-popper/package.json
Omitted from agent history
- node_modules/@radix-ui/react-popover/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-popover/package.json
Omitted from agent history
- node_modules/@radix-ui/react-portal/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-portal/package.json
Omitted from agent history
- node_modules/@radix-ui/react-presence/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-presence/package.json
Omitted from agent history
- node_modules/@radix-ui/react-primitive/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-primitive/package.json
Omitted from agent history
- node_modules/@radix-ui/react-progress/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-progress/package.json
Omitted from agent history
- node_modules/@radix-ui/react-radio-group/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-radio-group/package.json
Omitted from agent history
- node_modules/@radix-ui/react-scroll-area/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-scroll-area/package.json
Omitted from agent history
- node_modules/@radix-ui/react-select/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-select/package.json
Omitted from agent history
- node_modules/@radix-ui/react-separator/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-separator/package.json
Omitted from agent history
- node_modules/@radix-ui/react-slider/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-slider/package.json
Omitted from agent history
- node_modules/@radix-ui/react-slot/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-slot/package.json
Omitted from agent history
- node_modules/@radix-ui/react-switch/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-switch/package.json
Omitted from agent history
- node_modules/@radix-ui/react-tabs/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-tabs/package.json
Omitted from agent history
- node_modules/@radix-ui/react-toast/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-toast/package.json
Omitted from agent history
- node_modules/@radix-ui/react-tooltip/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-tooltip/package.json
Omitted from agent history
- node_modules/@radix-ui/react-visually-hidden/dist/index.mjs
Omitted from agent history
- node_modules/@radix-ui/react-visually-hidden/package.json
Omitted from agent history
- node_modules/@supabase/gotrue-js/dist/module/index.js
Omitted from agent history
- node_modules/@supabase/gotrue-js/package.json
Omitted from agent history
- node_modules/@supabase/node-fetch/dist/index.js
Omitted from agent history
- node_modules/@supabase/node-fetch/package.json
Omitted from agent history
- node_modules/@supabase/postgrest-js/dist/module/index.js
Omitted from agent history
- node_modules/@supabase/postgrest-js/package.json
Omitted from agent history
- node_modules/@supabase/realtime-js/dist/module/index.js
Omitted from agent history
- node_modules/@supabase/realtime-js/package.json
Omitted from agent history
- node_modules/@supabase/ssr/dist/index.js
Omitted from agent history
- node_modules/@supabase/ssr/package.json
Omitted from agent history
- node_modules/@supabase/storage-js/dist/module/index.js
Omitted from agent history
- node_modules/@supabase/storage-js/package.json
Omitted from agent history
- node_modules/@supabase/supabase-js/dist/module/index.js
Omitted from agent history
- node_modules/@supabase/supabase-js/package.json
Omitted from agent history
- node_modules/@swc/helpers/cjs/_interop_require_default.cjs
Omitted from agent history
- node_modules/@swc/helpers/package.json
Omitted from agent history
- node_modules/@tanstack-query-firebase/react/build/lib/index.mjs
Omitted from agent history
- node_modules/@tanstack-query-firebase/react/package.json
Omitted from agent history
- node_modules/@tanstack/query-core/build/lib/index.mjs
Omitted from agent history
- node_modules/@tanstack/query-core/package.json
Omitted from agent history
- node_modules/@tanstack/react-query/build/lib/index.mjs
Omitted from agent history
- node_modules/@tanstack/react-query/package.json
Omitted from agent history
- node_modules/@types/node/package.json
Omitted from agent history
- node_modules/@types/node/ts4.8/index.d.ts
Omitted from agent history
- node_modules/@types/react-dom/package.json
Omitted from agent history
- node_modules/@types/react-dom/server.d.ts
Omitted from agent history
- node_modules/@types/react/canary.d.ts
Omitted from agent history
- node_modules/@types/react/experimental.d.ts
Omitted from agent history
- node_modules/@types/react/index.d.ts
Omitted from agent history
- node_modules/@types/react/jsx-runtime.d.ts
Omitted from agent history
- node_modules/@types/react/package.json
Omitted from agent history
- node_modules/buffer/index.js
Omitted from agent history
- node_modules/buffer/package.json
Omitted from agent history
- node_modules/class-variance-authority/dist/index.mjs
Omitted from agent history
- node_modules/class-variance-authority/package.json
Omitted from agent history
- node_modules/clsx/dist/clsx.mjs
Omitted from agent history
- node_modules/clsx/package.json
Omitted from agent history
- node_modules/date-fns/addDays.mjs
Omitted from agent history
- node_modules/date-fns/format.mjs
Omitted from agent history
- node_modules/date-fns/isMatch.mjs
Omitted from agent history
- node_modules/date-fns/isValid.mjs
Omitted from agent history
- node_modules/date-fns/locale/en-US.mjs
Omitted from agent history
- node_modules/date-fns/package.json
Omitted from agent history
- node_modules/date-fns/parse.mjs
Omitted from agent history
- node_modules/dotenv/lib/main.js
Omitted from agent history
- node_modules/dotenv/package.json
Omitted from agent history
- node_modules/firebase/app/dist/index.esm.js
Omitted from agent history
- node_modules/firebase/analytics/dist/index.esm.js
Omitted from agent history
- node_modules/firebase/package.json
Omitted from agent history
- node_modules/genkit-cli/dist/index.js
Omitted from agent history
- node_modules/genkit-cli/package.json
Omitted from agent history
- node_modules/genkit/dist/index.js
Omitted from agent history
- node_modules/genkit/package.json
Omitted from agent history
- node_modules/ieee754/index.js
Omitted from agent history
- node_modules/ieee754/package.json
Omitted from agent history
- node_modules/idb/build/index.js
Omitted from agent history
- node_modules/idb/package.json
Omitted from agent history
- node_modules/isomorphic-form-data/package.json
Omitted from agent history
- node_modules/isomorphic-form-data/src/browser.js
Omitted from agent history
- node_modules/isomorphic-form-data/src/index.js
Omitted from agent history
- node_modules/isomorphic-form-data/src/node.js
Omitted from agent history
- node_modules/js-tokens/package.json
Omitted from agent history
- node_modules/js-tokens/source.mjs
Omitted from agent history
- node_modules/jszip/dist/jszip.min.js
Omitted from agent history
- node_modules/jszip/package.json
Omitted from agent history
- node_modules/loose-envify/index.js
Omitted from agent history
- node_modules/loose-envify/package.json
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/activity.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/alert-circle.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/alert-octagon.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/alert-triangle.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/bar-chart-3.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/book-open.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/bot.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/box-icon.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/briefcase.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/bug-play.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/building.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/check-circle-2.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/check.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/chevron-down.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/chevron-left.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/chevron-right.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/chevron-up.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/circle.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/cloud-icon.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/cloud.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/code.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/columns.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/corner-down-left.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/credit-card.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/database.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/download.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/external-link.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/file-json.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/file-lock-2.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/file-text.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/file-warning.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/gamepad-2.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/git-branch.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/globe.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/help-circle.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/info.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/library-icon.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/lightbulb.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/list-checks.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/loader-2.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/log-in.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/log-out.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/lock-icon.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/lock-keyhole.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/mail.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/map-pin.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/menu.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/message-circle.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/network.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/panel-left.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/phone.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/rss.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/search-code.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/search.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/send.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/server-icon.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/shield-alert.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/shield-check.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/shield-ellipsis.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/shield-off.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/shield.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/shopping-cart.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/sliders-horizontal.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/sparkles.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/target.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/trending-down.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/triangle-alert.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/unlock.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/user-check.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/user-circle.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/user-cog.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/user-plus.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/users.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/waypoints.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/wifi.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/x.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/icons/zap.js
Omitted from agent history
- node_modules/lucide-react/dist/esm/lucide-react.js
Omitted from agent history
- node_modules/lucide-react/package.json
Omitted from agent history
- node_modules/next/dist/build/webpack/loaders/next-flight-loader/module-proxy.js
Omitted from agent history
- node_modules/next/dist/client/components/action-async-storage-instance.js
Omitted from agent history
- node_modules/next/dist/client/components/action-async-storage.js
Omitted from agent history
- node_modules/next/dist/client/components/bailout-to-client-rendering.js
Omitted from agent history
- node_modules/next/dist/client/components/client-page.js
Omitted from agent history
- node_modules/next/dist/client/components/client-router.js
Omitted from agent history
- node_modules/next/dist/client/components/client-segment.js
Omitted from agent history
- node_modules/next/dist/client/components/error-boundary.js
Omitted from agent history
- node_modules/next/dist/client/components/get-segment-param.js
Omitted from agent history
- node_modules/next/dist/client/components/hooks-client-context-instance.js
Omitted from agent history
- node_modules/next/dist/client/components/hooks-client-context.js
Omitted from agent history
- node_modules/next/dist/client/components/http-access-fallback/error-boundary.js
Omitted from agent history
- node_modules/next/dist/client/components/layout-router.js
Omitted from agent history
- node_modules/next/dist/client/components/match-segments.js
Omitted from agent history
- node_modules/next/dist/client/components/metadata/async-metadata.js
Omitted from agent history
- node_modules/next/dist/client/components/metadata/metadata-boundary.js
Omitted from agent history
- node_modules/next/dist/client/components/not-found-boundary.js
Omitted from agent history
- node_modules/next/dist/client/components/redirect-boundary.js
Omitted from agent history
- node_modules/next/dist/client/components/render-from-template-context.js
Omitted from agent history
- node_modules/next/dist/client/components/request-async-storage-instance.js
Omitted from agent history
- node_modules/next/dist/client/components/request-async-storage.js
Omitted from agent history
- node_modules/next/dist/client/components/router-reducer/router-reducer-types.js
Omitted from agent history
- node_modules/next/dist/client/components/static-generation-async-storage-instance.js
Omitted from agent history
- node_modules/next/dist/client/components/static-generation-async-storage.js
Omitted from agent history
- node_modules/next/dist/client/image-component.js
Omitted from agent history
- node_modules/next/dist/client/link.js
Omitted from agent history
- node_modules/next/dist/client/router.js
Omitted from agent history
- node_modules/next/dist/compiled/@opentelemetry/api/index.js
Omitted from agent history
- node_modules/next/dist/compiled/@opentelemetry/api/package.json
Omitted from agent history
- node_modules/next/dist/compiled/jsonwebtoken/index.js
Omitted from agent history
- node_modules/next/dist/compiled/jsonwebtoken/package.json
Omitted from agent history
- node_modules/next/dist/compiled/next-server/app-page.runtime.dev.js
Omitted from agent history
- node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js
Omitted from agent history
- node_modules/next/dist/compiled/react-dom/cjs/react-dom-server-legacy.browser.development.js
Omitted from agent history
- node_modules/next/dist/compiled/react-dom/cjs/react-dom.development.js
Omitted from agent history
- node_modules/next/dist/compiled/react-dom/package.json
Omitted from agent history
- node_modules/next/dist/compiled/react-dom/server.edge.js
Omitted from agent history
- node_modules/next/dist/compiled/react-experimental/cjs/react-jsx-dev-runtime.development.js
Omitted from agent history
- node_modules/next/dist/compiled/react-experimental/cjs/react-jsx-runtime.development.js
Omitted from agent history
- node_modules/next/dist/compiled/react-experimental/cjs/react.development.js
Omitted from agent history
- node_modules/next/dist/compiled/react-experimental/jsx-dev-runtime.js
Omitted from agent history
- node_modules/next/dist/compiled/react-experimental/package.json
Omitted from agent history
- node_modules/next/dist/compiled/react-server-dom-turbopack-experimental/cjs/react-server-dom-turbopack-client.edge.development.js
Omitted from agent history
- node_modules/next/dist/compiled/react-server-dom-turbopack-experimental/client.edge.js
Omitted from agent history
- node_modules/next/dist/compiled/react-server-dom-turbopack-experimental/package.json
Omitted from agent history
- node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js
Omitted from agent history
- node_modules/next/dist/compiled/react/cjs/react-jsx-runtime.development.js
Omitted from agent history
- node_modules/next/dist/compiled/react/cjs/react.development.js
Omitted from agent history
- node_modules/next/dist/compiled/react/index.js
Omitted from agent history
- node_modules/next/dist/compiled/react/jsx-dev-runtime.js
Omitted from agent history
- node_modules/next/dist/compiled/react/jsx-runtime.js
Omitted from agent history
- node_modules/next/dist/compiled/react/package.json
Omitted from agent history
- node_modules/next/dist/compiled/scheduler/cjs/scheduler.development.js
Omitted from agent history
- node_modules/next/dist/compiled/scheduler/package.json
Omitted from agent history
- node_modules/next/dist/esm/client/components/action-async-storage-instance.js
Omitted from agent history
- node_modules/next/dist/esm/client/components/action-async-storage.js
Omitted from agent history
- node_modules/next/dist/esm/client/components/client-page.js
Omitted from agent history
- node_modules/next/dist/esm/client/components/client-router.js
Omitted from agent history
- node_modules/next/dist/esm/client/components/client-segment.js
Omitted from agent history
- node_modules/next/dist/esm/client/components/error-boundary.js
Omitted from agent history
- node_modules/next/dist/esm/client/components/get-segment-param.js
Omitted from agent history
- node_modules/next/dist/esm/client/components/hooks-client-context-instance.js
Omitted from agent history
- node_modules/next/dist/esm/client/components/hooks-client-context.js
Omitted from agent history
- node_modules/next/dist/esm/client/components/layout-router.js
Omitted from agent history
- node_modules/next/dist/esm/client/components/match-segments.js
Omitted from agent history
- node_modules/next/dist/esm/client/components/not-found-boundary.js
Omitted from agent history
- node_modules/next/dist/esm/client/components/redirect-boundary.js
Omitted from agent history
- node_modules/next/dist/esm/client/components/render-from-template-context.js
Omitted from agent history
- node_modules/next/dist/esm/client/components/request-async-storage-instance.js
Omitted from agent history
- node_modules/next/dist/esm/client/components/request-async-storage.js
Omitted from agent history
- node_modules/next/dist/esm/client/components/router-reducer/router-reducer-types.js
Omitted from agent history
- node_modules/next/dist/esm/client/components/static-generation-async-storage-instance.js
Omitted from agent history
- node_modules/next/dist/esm/client/components/static-generation-async-storage.js
Omitted from agent history
- node_modules/next/dist/esm/client/image-component.js
Omitted from agent history
- node_modules/next/dist/esm/client/link.js
Omitted from agent history
- node_modules/next/dist/esm/client/router.js
Omitted from agent history
- node_modules/next/dist/esm/lib/metadata/metadata-constants.js
Omitted from agent history
- node_modules/next/dist/esm/server/app-render/dynamic-rendering.js
Omitted from agent history
- node_modules/next/dist/esm/server/app-render/get-segment-param.js
Omitted from agent history
- node_modules/next/dist/esm/server/app-render/router-utils/create-flight-router-state-from-loadertree.js
Omitted from agent history
- node_modules/next/dist/esm/server/lib/router-utils/is-postpone.js
Omitted from agent history
- node_modules/next/dist/esm/server/lib/trace/constants.js
Omitted from agent history
- node_modules/next/dist/esm/server/lib/trace/tracer.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/app-router-context-provider-template.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/app-router-context.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/constants.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/hooks-client-context.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/lazy-dynamic/dynamic-bailout-to-csr.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/lazy-dynamic/dynamic-no-ssr.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router-context.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router/utils/add-locale.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router/utils/add-path-prefix.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router/utils/app-paths.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router/utils/format-next-pathname-info.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router/utils/format-url.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router/utils/get-asset-path-from-route.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router/utils/get-next-pathname-info.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router/utils/is-bot.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router/utils/is-dynamic.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router/utils/is-local-url.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router/utils/is-next-router-error.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router/utils/parse-path.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router/utils/parse-relative-url.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router/utils/path-has-prefix.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router/utils/remove-trailing-slash.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router/utils/resolve-href.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router/utils/route-matcher.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/router/utils/route-regex.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/segment.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/server-inserted-html.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/utils/warn-once.js
Omitted from agent history
- node_modules/next/dist/esm/shared/lib/utils.js
Omitted from agent history
- node_modules/next/dist/server/app-render/dynamic-rendering.js
Omitted from agent history
- node_modules/next/dist/server/app-render/get-segment-param.js
Omitted from agent history
- node_modules/next/dist/server/app-render/router-utils/create-flight-router-state-from-loadertree.js
Omitted from agent history
- node_modules/next/dist/server/lib/router-utils/is-postpone.js
Omitted from agent history
- node_modules/next/dist/server/lib/trace/constants.js
Omitted from agent history
- node_modules/next/dist/server/lib/trace/tracer.js
Omitted from agent history
- node_modules/next/font/google/target.css
Omitted from agent history
- node_modules/next/font/google/target.js
Omitted from agent history
- node_modules/next/package.json
Omitted from agent history
- node_modules/next/script.js
Omitted from agent history
- node_modules/pako/lib/zlib/adler32.js
Omitted from agent history
- node_modules/pako/lib/zlib/constants.js
Omitted from agent history
- node_modules/pako/lib/zlib/crc32.js
Omitted from agent history
- node_modules/pako/lib/zlib/deflate.js
Omitted from agent history
- node_modules/pako/lib/zlib/gzheader.js
Omitted from agent history
- node_modules/pako/lib/zlib/inffast.js
Omitted from agent history
- node_modules/pako/lib/zlib/inflate.js
Omitted from agent history
- node_modules/pako/lib/zlib/inftrees.js
Omitted from agent history
- node_modules/pako/lib/zlib/messages.js
Omitted from agent history
- node_modules/pako/lib/zlib/trees.js
Omitted from agent history
- node_modules/pako/lib/zlib/zstream.js
Omitted from agent history
- node_modules/pako/package.json
Omitted from agent history
- node_modules/pako/dist/pako_deflate.mjs
Omitted from agent history
- node_modules/patch-package/package.json
Omitted from agent history
- node_modules/patch-package/node_modules/chalk/source/index.js
Omitted from agent history
- node_modules/patch-package/node_modules/chalk/source/util.js
Omitted from agent history
- node_modules/patch-package/node_modules/chalk/package.json
Omitted from agent history
- node_modules/patch-package/node_modules/diff/lib/index.js
Omitted from agent history
- node_modules/patch-package/node_modules/diff/lib/diff/array.js
Omitted from agent history
- node_modules/patch-package/node_modules/diff/lib/diff/base.js
Omitted from agent history
- node_modules/patch-package/node_modules/diff/lib/diff/character.js
Omitted from agent history
- node_modules/patch-package/node_modules/diff/lib/diff/css.js
Omitted from agent history
- node_modules/patch-package/node_modules/diff/lib/diff/line.js
Omitted from agent history
- node_modules/patch-package/node_modules/diff/lib/diff/word.js
Omitted from agent history
- node_modules/patch-package/node_modules/diff/lib/diff/json.js
Omitted from agent history
- node_modules/patch-package/node_modules/diff/lib/diff/sentence.js
Omitted from agent history
- node_modules/patch-package/node_modules/diff/lib/patch/apply.js
Omitted from agent history
- node_modules/patch-package/node_modules/diff/lib/patch/create.js
Omitted from agent history
- node_modules/patch-package/node_modules/diff/lib/patch/merge.js
Omitted from agent history
- node_modules/patch-package/node_modules/diff/lib/patch/parse.js
Omitted from agent history
- node_modules/patch-package/node_modules/diff/lib/util/array.js
Omitted from agent history
- node_modules/patch-package/node_modules/diff/lib/util/distance.js
Omitted from agent history
- node_modules/patch-package/node_modules/diff/lib/util/params.js
Omitted from agent history
- node_modules/patch-package/node_modules/diff/package.json
Omitted from agent history
- node_modules/patch-package/node_modules/resolve/index.js
Omitted from agent history
- node_modules/patch-package/node_modules/resolve/lib/async.js
Omitted from agent history
- node_modules/patch-package/node_modules/resolve/lib/caller.js
Omitted from agent history
- node_modules/patch-package/node_modules/resolve/lib/core.js
Omitted from agent history
- node_modules/patch-package/node_modules/resolve/lib/node-modules-paths.js
Omitted from agent history
- node_modules/patch-package/node_modules/resolve/lib/normalize-options.js
Omitted from agent history
- node_modules/patch-package/node_modules/resolve/lib/sync.js
Omitted from agent history
- node_modules/patch-package/node_modules/resolve/package.json
Omitted from agent history
- node_modules/patch-package/node_modules/semver/internal/constants.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/internal/debug.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/internal/re.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/internal/stringParsing.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/internal/parse-options.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/classes/comparator.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/classes/range.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/classes/semver.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/compare-build.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/compare-loose.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/compare.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/diff.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/eq.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/gt.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/gte.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/lt.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/lte.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/major.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/minor.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/neq.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/parse.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/patch.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/prerelease.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/rcompare.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/rsort.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/satisfies.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/sort.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/functions/valid.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/ranges/intersects.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/ranges/outside.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/ranges/simplify.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/ranges/subset.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/ranges/valid.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/index.js
Omitted from agent history
- node_modules/patch-package/node_modules/semver/package.json
Omitted from agent history
- node_modules/phoenix_channel/priv/channel.js
Omitted from agent history
- node_modules/phoenix_channel/package.json
Omitted from agent history
- node_modules/postcss/lib/postcss.js
Omitted from agent history
- node_modules/postcss/package.json
Omitted from agent history
- node_modules/prop-types/checkPropTypes.js
Omitted from agent history
- node_modules/prop-types/index.js
Omitted from agent history
- node_modules/prop-types/lib/ReactPropTypesSecret.js
Omitted from agent history
- node_modules/prop-types/package.json
Omitted from agent history
- node_modules/react-day-picker/dist/index.js
Omitted from agent history
- node_modules/react-day-picker/package.json
Omitted from agent history
- node_modules/react-dom/cjs/react-dom.development.js
Omitted from agent history
- node_modules/react-dom/index.js
Omitted from agent history
- node_modules/react-dom/package.json
Omitted from agent history
- node_modules/react-hook-form/dist/index.esm.mjs
Omitted from agent history
- node_modules/react-hook-form/package.json
Omitted from agent history
- node_modules/react-is/cjs/react-is.development.js
Omitted from agent history
- node_modules/react-is/index.js
Omitted from agent history
- node_modules/react-is/package.json
Omitted from agent history
- node_modules/react/cjs/react.development.js
Omitted from agent history
- node_modules/react/index.js
Omitted from agent history
- node_modules/react/jsx-runtime.js
Omitted from agent history
- node_modules/react/package.json
Omitted from agent history
- node_modules/recharts/es6/index.js
Omitted from agent history
- node_modules/recharts/package.json
Omitted from agent history
- node_modules/regenerator-runtime/package.json
Omitted from agent history
- node_modules/regenerator-runtime/runtime.js
Omitted from agent history
- node_modules/tailwind-merge/dist/lib/create-tailwind-merge.mjs
Omitted from agent history
- node_modules/tailwind-merge/dist/lib/default-config.mjs
Omitted from agent history
- node_modules/tailwind-merge/dist/lib/from-theme.mjs
Omitted from agent history
- node_modules/tailwind-merge/dist/lib/lru-cache.mjs
Omitted from agent history
- node_modules/tailwind-merge/dist/lib/merge-classlist.mjs
Omitted from agent history
- node_modules/tailwind-merge/dist/lib/tw-join.mjs
Omitted from agent history
- node_modules/tailwind-merge/dist/lib/validators.mjs
Omitted from agent history
- node_modules/tailwind-merge/dist/index.mjs
Omitted from agent history
- node_modules/tailwind-merge/package.json
Omitted from agent history
- node_modules/tailwindcss-animate/package.json
Omitted from agent history
- node_modules/tailwindcss-animate/src/index.js
Omitted from agent history
- node_modules/tailwindcss/lib/plugin.js
Omitted from agent history
- node_modules/tailwindcss/package.json
Omitted from agent history
- node_modules/tailwindcss/peers/index.js
Omitted from agent history
- node_modules/tailwindcss/plugin.js
Omitted from agent history
- node_modules/tslib/modules/index.js
Omitted from agent history
- node_modules/tslib/package.json
Omitted from agent history
- node_modules/tslib/tslib.es6.mjs
Omitted from agent history
- node_modules/typescript/lib/lib.dom.d.ts
Omitted from agent history
- node_modules/typescript/lib/lib.dom.iterable.d.ts
Omitted from agent history
- node_modules/typescript/lib/lib.es2017.d.ts
Omitted from agent history
- node_modules/typescript/lib/lib.es5.d.ts
Omitted from agent history
- node_modules/typescript/lib/lib.esnext.d.ts
Omitted from agent history
- node_modules/typescript/lib/typescript.js
Omitted from agent history
- node_modules/typescript/package.json
Omitted from agent history
- node_modules/undici-types/package.json
Omitted from agent history
- node_modules/undici-types/patch.d.ts
Omitted from agent history
- node_modules/undici-types/streaming.d.ts
Omitted from agent history
- node_modules/undici-types/webidl.d.ts
Omitted from agent history
- node_modules/undici-types/errors.d.ts
Omitted from agent history
- node_modules/undici-types/fetch.d.ts
Omitted from agent history
- node_modules/undici-types/file.d.ts
Omitted from agent history
- node_modules/undici-types/global.d.ts
Omitted from agent history
- node_modules/undici-types/index.d.ts
Omitted from agent history
- node_modules/undici-types/node_must_not_be_null.d.ts
Omitted from agent history
- node_modules/undici-types/package-json.d.ts
Omitted from agent history
- node_modules/undici-types/diagnostics_channel.d.ts
Omitted from agent history
- node_modules/undici-types/dispatcher.d.ts
Omitted from agent history
- node_modules/undici-types/domains.d.ts
Omitted from agent history
- node_modules/undici-types/events.d.ts
Omitted from agent history
- node_modules/zod/lib/index.mjs
Omitted from agent history
- node_modules/zod/package.json
Omitted from agent history
- public/favicon.ico
Omitted from agent history
- src/app/favicon.ico
Omitted from agent history
- yarn.lock
Omitted from agent history¡Entendido! Hemos realizado una serie de mejoras importantes y el proyecto está tomando una forma mucho más robusta y profesional.

**Para continuar y acercarnos aún más a un servicio "que funcione de verdad", propongo los siguientes pasos:**

1.  **Integración Profunda de la Base de Datos (Supabase):**
    *   **Crear la tabla `AnalysisRecord` en Supabase:**
        *   Definir las columnas: `id`, `userId` (FK a `user_profiles.id`), `created_at`, `analysisType`, `targetDescription`, `overallRiskAssessment`, `vulnerableFindingsCount`, `fullReportReference` (podría ser un text para almacenar el Markdown del informe, o una referencia a un archivo si fueran muy grandes), `analysisInputDetails` (JSON para guardar los parámetros de entrada del análisis).
        *   Configurar RLS para que los usuarios solo puedan ver sus propios registros de análisis.
    *   **Modificar `performAnalysisAction` en `src/app/actions.ts`:**
        *   Después de realizar un análisis y generar el informe, guardar un registro en la tabla `AnalysisRecord`. Esto requerirá obtener el `userId` del usuario autenticado (si hay una sesión activa). Si no hay sesión, se podría omitir el guardado o manejarlo de forma diferente.
    *   **Crear una Página de "Mis Análisis" o "Dashboard":**
        *   Una nueva ruta (ej. `/dashboard` o `/my-analyses`) que sea protegida (solo accesible para usuarios logueados).
        *   Esta página obtendrá y mostrará el historial de análisis del usuario desde la tabla `AnalysisRecord`.
        *   Se podría mostrar una tabla o lista de análisis anteriores, con la fecha, el tipo, el objetivo y un enlace para ver el informe completo.

2.  **Refinar la Experiencia de Usuario (UX) Post-Análisis:**
    *   **Redirección o Indicación Clara:** Después de que un análisis se completa en `src/app/page.tsx`, considerar si el usuario debería ser redirigido a la página del informe (si la creamos como una ruta separada para cada análisis) o si la sección de resultados debería destacarse más claramente en la página actual.
    *   **Estado de Carga Más Detallado:** Para análisis que puedan tomar más tiempo, podríamos explorar formas de dar una retroalimentación más granular sobre el progreso, aunque esto con Genkit puede ser complejo sin un sistema de tareas en segundo plano.

3.  **Mejorar la Visualización del Informe (`VulnerabilityReportDisplay`):**
    *   Si los informes se almacenan y se pueden volver a visitar, asegurar que se carguen y muestren correctamente.
    *   Considerar si se pueden añadir opciones para filtrar o buscar dentro de la lista de hallazgos si es muy larga.

**Enfoque para esta Iteración:**

Propongo comenzar con el **Paso 1: Integración Profunda de la Base de Datos (Supabase)**, específicamente:

*   **Proporcionarte el SQL para crear la tabla `AnalysisRecord`.**
*   **Modificar `performAnalysisAction` en `src/app/actions.ts` para que intente guardar el registro del análisis.** (Inicialmente, haremos esto de forma conceptual, asumiendo que el `userId` está disponible si el usuario está logueado, y dejaremos un `// TODO:` para la lógica de obtención del usuario real del lado del servidor si es necesario para acciones de servidor).
*   **Crear una página placeholder básica para `/dashboard`** donde se mostraría el historial.
*   **Actualizar el `README.md`** con el nuevo SQL y la descripción de esta funcionalidad.

Esto sentará las bases para que los usuarios puedan ver su historial de análisis, una característica clave para un servicio de pago.

¿Te parece bien este enfoque?