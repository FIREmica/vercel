# Motor de Análisis de Seguridad (FastAPI)

Microservicio ultra moderno y modular para análisis de seguridad integral. Recibe peticiones POST con `{ url, type, ...otrosDatos }` y responde con resultados simulados o reales según el tipo de análisis.

## Instalación y Ejecución

1. Instala dependencias:
   ```bash
   pip install -r requirements.txt
   ```
2. Ejecuta el servidor:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Endpoints

- `POST /analyze` — Recibe JSON con:
  - `url`: URL o recurso a analizar
  - `type`: Tipo de análisis (`web`, `server`, `database`, `code`, `cloud`, `container`, `dependencies`, `network`)
  - `data`: (opcional) Otros datos relevantes

- `GET /` — Mensaje de estado

## Ejemplo de petición
```json
{
  "url": "https://ejemplo.com",
  "type": "web"
}
```

## Ejemplo de respuesta para `type: web`
```json
{
  "findings": [
    {"vulnerability": "XSS", "severity": "high", "description": "Cross-Site Scripting detectado en /login"},
    {"vulnerability": "SQLi", "severity": "medium", "description": "Posible inyección SQL en parámetro 'id'"}
  ],
  "summary": "2 vulnerabilidades críticas encontradas en la aplicación web."
}
```

## Modularidad
- El código está preparado para integrar motores reales de análisis en el futuro.
- Puedes extender la lógica de cada tipo de análisis fácilmente.

## Licencia
MIT
