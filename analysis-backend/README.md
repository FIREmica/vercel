# Analysis Backend (Microservicio)

Este backend simula análisis de seguridad para distintos tipos de activos (web, server, database, code, cloud, container, dependencies, network) y responde con hallazgos, escenarios de ataque y permite descarga de resultados.

## Características
- API REST moderna (FastAPI, Python)
- Endpoint único `/analyze` para todos los tipos
- Respuestas simuladas con hallazgos y escenarios de hackeo
- Preparado para integración futura con motores reales
- Permite descarga de resultados en JSON y ZIP

## Ejecución local
```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Ejemplo de petición
```json
{
  "url": "https://ejemplo.com",
  "type": "web"
}
```

## Ejemplo de respuesta
```json
{
  "status": "ok",
  "findings": [
    {"id": 1, "title": "XSS detectado", "severity": "alta", "description": "Se detectó un posible Cross-Site Scripting en /search"}
  ],
  "attack_scenarios": [
    {"title": "Robo de sesión por XSS", "steps": ["El atacante inyecta un script...", "El usuario hace clic..."]}
  ],
  "download_url": "/download/resultado-123.json"
}
```

## Descarga de resultados
- `/download/{file_id}.json` o `.zip`

---
Este backend es solo un punto de partida. Integra motores reales según tus necesidades.
