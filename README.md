
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
    *   Fragmentos de Código para Análisis Estático (SAST simulado) con sugerencias contextuales.
    *   URLs para Análisis Dinámico (DAST simulado) con ejemplos conceptuales de petición/respuesta.
    *   Descripciones de Configuración Cloud (AWS, Azure, GCP - conceptual) para malas configuraciones.
    *   Información de Contenedores (nombre de imagen, Dockerfile, manifiestos K8s - conceptual).
    *   Contenido de Archivos de Dependencias (npm, pip, maven, gem - conceptual).
    *   Descripciones de Configuración de Red, reglas de firewall y resultados de escaneos (ej. Nmap - conceptual).
*   **Generación de Informes Detallados:** Creación de informes de seguridad completos en Markdown, incluyendo:
    *   Resumen ejecutivo general.
    *   Detalles de hallazgos por cada tipo de análisis realizado.
    *   Severidad, CVSS (si es proporcionado por la IA), descripción, impacto potencial y remediación sugerida para cada hallazgo.
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
    NEXT_PUBLIC_GOOGLE_API_KEY=tu_clave_api_google_aqui

    # Credenciales de PayPal API REST para el entorno Sandbox (Requeridas para la simulación de pagos)
    # Reemplaza estos valores con tus propias credenciales de Sandbox de PayPal Developer
    PAYPAL_CLIENT_ID=tu_paypal_sandbox_client_id_aqui
    PAYPAL_CLIENT_SECRET=tu_paypal_sandbox_client_secret_aqui
    PAYPAL_API_BASE_URL=https://api-m.sandbox.paypal.com # Para desarrollo y pruebas con Sandbox
    # Para producción, usarías: PAYPAL_API_BASE_URL=https://api-m.paypal.com y credenciales Live
    ```
    **IMPORTANTE:**
    *   Reemplaza `tu_clave_api_google_aqui` con tu clave API real de Google AI. **Asegúrate de que esta variable esté correctamente configurada y no sea el valor predeterminado/placeholder.** La aplicación verificará esta clave y mostrará errores si no está configurada o es inválida.
    *   Reemplaza `tu_paypal_sandbox_client_id_aqui` y `tu_paypal_sandbox_client_secret_aqui` con tus credenciales reales de una aplicación Sandbox que crees en el [Portal de Desarrolladores de PayPal](https://developer.paypal.com/).
    *   **No subas el archivo `.env.local` a tu repositorio de Git.** Asegúrate de que esté en tu archivo `.gitignore`.

2.  **Obtén tus Claves API:**
    *   **Google AI:** Visita [Google AI Studio](https://aistudio.google.com/app/apikey) para generar una clave API si aún no tienes una.
    *   **PayPal Sandbox:**
        1.  Ve a [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox).
        2.  Crea una nueva aplicación REST API si no tienes una.
        3.  Copia el `Client ID` y el `Client Secret` de tu aplicación Sandbox.

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

**Al desplegar, asegúrate de configurar las variables de entorno (`NEXT_PUBLIC_GOOGLE_API_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_API_BASE_URL`) en la configuración de tu proveedor de hosting.**

## Modo Premium y Monetización (Simulado)

La plataforma incluye un "Modo Premium" simulado. Actualmente, se activa/desactiva a través de un botón en el encabezado que simula un "inicio/cierre de sesión" con acceso premium. Este modo representa conceptualmente un **usuario autenticado con una suscripción activa**.

También se ha integrado una simulación del proceso de suscripción utilizando la **API REST de PayPal (con credenciales Sandbox)**:
*   El frontend llama a un endpoint de API del backend (`/api/paypal/create-order`) para crear una orden de pago en PayPal.
*   El SDK de JavaScript de PayPal en el frontend renderiza los botones de pago.
*   El usuario puede completar el flujo de pago en el entorno Sandbox de PayPal.
*   Tras una "aprobación" simulada del pago en el frontend, se activa el modo premium.

Es importante destacar que esta integración con PayPal **no está conectada a una lógica de backend que active automáticamente las funciones premium tras una confirmación de pago real y persistente por parte de PayPal (Webhooks/IPN)**. Para ello, se requeriría implementar:
1.  Endpoints de Webhook en el backend para recibir notificaciones de pago de PayPal.
2.  Una base de datos para almacenar el estado de la suscripción de los usuarios.
3.  Lógica para actualizar el estado de la suscripción en la base de datos basada en las notificaciones de PayPal.

Cuando el "Modo Premium" está activado (`isLoggedInAndPremium` es `true` en el estado de `src/app/page.tsx`), los usuarios obtienen acceso a:

*   **Informe Técnico Detallado:** El informe de seguridad completo generado por la IA, sin truncamiento.
*   **Detalles Completos de Hallazgos:** Incluye CVSS, impacto técnico y de negocio, evidencia y recomendaciones detalladas para todas las vulnerabilidades.
*   **Generación de Escenarios de Ataque Ilustrativos:** Ejemplos conceptuales de cómo podrían explotarse las vulnerabilidades.
*   **Generación de Playbooks de Remediación Sugeridos:** Guías paso a paso para corregir los problemas identificados.
*   **Descarga Completa de Resultados (ZIP):** Un archivo ZIP que contiene el informe Markdown, todos los hallazgos en JSON, los escenarios de ataque y los playbooks.

La descarga de todos los hallazgos en formato JSON está disponible para todos los usuarios (premium o no) como una forma de facilitar la integración con herramientas externas.

## Implementación de Autenticación Real (Próximos Pasos)

La simulación actual del "Modo Premium" es solo un placeholder. Para una aplicación comercial real, se necesita un sistema de autenticación robusto. La solución recomendada para Next.js es **NextAuth.js**.

Los pasos conceptuales para integrar NextAuth.js serían:

1.  **Instalación:** `npm install next-auth`
2.  **Configuración del Proveedor (Provider):**
    *   Elegir proveedores de autenticación (ej. Google, GitHub, Credentials para email/contraseña).
    *   Configurar las credenciales del proveedor (Client ID, Client Secret) como variables de entorno.
3.  **Crear la Ruta de API de NextAuth:**
    *   Crear un archivo como `src/app/api/auth/[...nextauth]/route.ts`.
    *   Definir las opciones de NextAuth, incluyendo los proveedores, callbacks de sesión, y posiblemente un adaptador de base de datos.
4.  **Adaptador de Base de Datos (Opcional pero Recomendado):**
    *   Para persistir usuarios, sesiones y cuentas, se necesitaría un adaptador (ej. Prisma, TypeORM) y una base de datos (PostgreSQL, MongoDB).
5.  **Envolver la Aplicación con `SessionProvider`:**
    *   En `src/app/layout.tsx` (o un componente cliente de nivel superior), envolver la aplicación con `<SessionProvider>` de `next-auth/react`.
6.  **Actualizar Componentes UI:**
    *   Modificar `src/components/layout/header.tsx` para usar `useSession()`, `signIn()`, y `signOut()` de `next-auth/react`.
    *   Reemplazar el toggle simulado con la lógica real de inicio/cierre de sesión.
7.  **Proteger Rutas/API Endpoints:**
    *   Usar `getServerSession` en Server Components o API Routes para verificar la autenticación.
    *   Usar `useSession` en Client Components para proteger contenido o redirigir.
8.  **Páginas de Login/Signup:**
    *   Las páginas actuales en `src/app/login/page.tsx` y `src/app/signup/page.tsx` se adaptarían para usar las funciones de `signIn()` de NextAuth o para manejar el flujo de registro con el proveedor de credenciales.

## Pasos Críticos para Puesta en Marcha Online (Producción)

Para transformar este proyecto de un prototipo local a un servicio online funcional y comercializable, se requieren los siguientes pasos fundamentales (además de la autenticación):

1.  **Persistencia de Datos (Base de Datos):**
    *   Configurar y conectar una base de datos (ej. PostgreSQL, MongoDB, Firebase Firestore).
    *   Almacenar perfiles de usuario, estado de suscripciones, historial de análisis, y resultados.
    *   *Nota: Ya se han definido esquemas Zod (`UserProfileSchema`, `AnalysisRecordSchema`) en `src/types/ai-schemas.ts` como preparación para esta fase.*
2.  **Integración Completa de Pasarela de Pagos:**
    *   Seleccionar e integrar completamente una pasarela (Stripe, PayPal con API REST y Webhooks).
    *   **Facturación Real:** Esto implica configurar productos/planes en la pasarela, vincularlos a los perfiles de usuario en la base de datos, implementar webhooks para confirmaciones de pago y actualizar el estado de la suscripción en la base de datos para otorgar/revocar el acceso premium automáticamente. La integración actual con PayPal es una demostración del flujo de pago inicial y no maneja la confirmación/activación automática.
3.  **Despliegue y Alojamiento Profesional:**
    *   Seleccionar una plataforma de hosting (Vercel, AWS, GCP, Azure).
    *   Configurar variables de entorno de producción de forma segura (clave Google AI, credenciales DB, claves de pasarela de pago Live).
    *   Configurar dominio personalizado y SSL/TLS.
4.  **Seguridad de la Plataforma:**
    *   Proteger todas las claves API y credenciales sensibles.
    *   Implementar validaciones de entrada exhaustivas en el backend.
    *   Considerar rate limiting y protección DDoS para los endpoints.
5.  **Aspectos Legales:**
    *   Redactar y publicar Términos de Servicio y Política de Privacidad detallados y legalmente válidos (el `terms.md` actual es un placeholder). Consultar con un profesional legal.
    *   Asegurar el cumplimiento con regulaciones de protección de datos (GDPR, CCPA, etc.).
6.  **Operaciones y Mantenimiento:**
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
*   **Historial de análisis por usuario (requiere autenticación y base de datos).**
*   **Mejoras Específicas Servidores de Juegos:** Análisis de protocolos, detección de trampas, análisis de mods/scripts.

## 🪪 Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.

**Idea y Visión:** Ronald Gonzalez Niche
