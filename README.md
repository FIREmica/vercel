# Centro de Análisis de Seguridad Integral

Este es un proyecto Next.js que utiliza Genkit para proporcionar un Centro de Análisis de Seguridad Integral. La plataforma permite analizar URLs, descripciones de configuraciones de servidores (incluyendo servidores de juegos) y bases de datos para identificar vulnerabilidades de seguridad utilizando IA.

## Primeros Pasos

Para comenzar a trabajar con este proyecto, sigue los pasos a continuación.

### Prerrequisitos

*   Node.js (versión 18 o superior recomendada)
*   npm o yarn

### Instalación

1.  Clona el repositorio (si aplica) o asegúrate de tener todos los archivos del proyecto.
2.  Navega al directorio raíz del proyecto.
3.  Instala las dependencias:
    ```bash
    npm install
    # o
    yarn install
    ```

### Configuración de Variables de Entorno

Este proyecto requiere una clave API de Google AI para que funcionen las capacidades de Genkit.

1.  **Crea un archivo `.env`:**
    Copia el archivo `.env.example` a un nuevo archivo llamado `.env` en la raíz del proyecto:
    ```bash
    cp .env.example .env
    ```

2.  **Obtén tu Clave API de Google AI:**
    Visita [Google AI Studio](https://aistudio.google.com/app/apikey) para generar una clave API si aún no tienes una.

3.  **Configura la Clave API en `.env`:**
    Abre el archivo `.env` y reemplaza `YOUR_GOOGLE_AI_API_KEY_HERE` con tu clave API real:
    ```
    GOOGLE_API_KEY=tu_clave_api_aqui
    ```
    Guarda el archivo. Next.js cargará automáticamente este archivo.

### Ejecutando la Aplicación Next.js

Para iniciar el servidor de desarrollo de Next.js (generalmente en el puerto 9002 según la configuración actual):

```bash
npm run dev
```

Abre [http://localhost:9002](http://localhost:9002) en tu navegador para ver la aplicación.

### Ejecutando Genkit

Genkit se utiliza para los flujos de IA. Puedes ejecutar el servidor de desarrollo de Genkit para probar y depurar flujos.

1.  **Iniciar el servidor de desarrollo de Genkit (con recarga en caliente):**
    En una terminal separada, ejecuta:
    ```bash
    npm run genkit:watch
    ```
    Esto iniciará la UI de desarrollador de Genkit, típicamente en [http://localhost:4000](http://localhost:4000).

2.  **Iniciar el servidor de desarrollo de Genkit (sin recarga en caliente):**
    ```bash
    npm run genkit:dev
    ```

### Comandos de Build y Start

*   **Construir para producción:**
    ```bash
    npm run build
    ```
*   **Iniciar el servidor de producción:**
    ```bash
    npm run start
    ```

## Funcionalidades Principales

*   **Análisis de URL:** Evalúa la seguridad de URLs de aplicaciones web.
*   **Análisis de Servidores:** Analiza descripciones de configuraciones de servidores (generales y de juegos) en busca de vulnerabilidades.
*   **Análisis de Bases de Datos:** Examina descripciones de configuraciones de bases de datos para identificar riesgos.
*   **Generación de Informes:** Crea informes de seguridad completos basados en los análisis.
*   **Generación de Vectores de Ataque:** Ilustra posibles escenarios de ataque para las vulnerabilidades encontradas (función premium).
*   **Asistente de Chat IA:** Proporciona respuestas a consultas de seguridad y sobre la plataforma.
*   **Modo Premium Simulado:** Desbloquea funciones avanzadas como informes técnicos detallados y descarga de resultados.

## Estructura del Proyecto (Resumen)

*   `src/app/`: Contiene las páginas y layouts de la aplicación Next.js (App Router).
*   `src/components/`: Componentes de React reutilizables.
*   `src/ai/flows/`: Define los flujos de Genkit para las diferentes capacidades de análisis de IA.
*   `src/ai/genkit.ts`: Configuración e inicialización de Genkit.
*   `src/types/`: Definiciones de TypeScript, incluyendo esquemas Zod para los flujos de IA.

Para más detalles sobre componentes específicos o flujos de IA, consulta los archivos correspondientes dentro de estas carpetas.
