from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uuid

app = FastAPI(title="Motor de Análisis de Seguridad", description="Microservicio modular para análisis de seguridad integral.", version="1.0.0")

class AnalysisRequest(BaseModel):
    url: str
    type: str
    data: Optional[Dict[str, Any]] = None

@app.post("/analyze")
async def analyze(request: AnalysisRequest):
    file_id = str(uuid.uuid4())
    # Simulación de resultados según el tipo de análisis
    attack_scenarios = []
    if request.type == "web":
        findings = [
            {"vulnerability": "XSS", "severity": "high", "description": "Cross-Site Scripting detectado en /login"},
            {"vulnerability": "SQLi", "severity": "medium", "description": "Posible inyección SQL en parámetro 'id'"}
        ]
        summary = "2 vulnerabilidades críticas encontradas en la aplicación web."
        attack_scenarios = [
            {"title": "Robo de sesión por XSS", "steps": ["El atacante inyecta un script en /login", "El usuario hace clic y su cookie es robada"]}
        ]
    elif request.type == "server":
        findings = [
            {"issue": "SSH abierto a internet", "severity": "high"},
            {"issue": "Versión de Apache desactualizada", "severity": "medium"}
        ]
        summary = "Configuraciones inseguras detectadas en el servidor."
        attack_scenarios = [
            {"title": "Acceso no autorizado por SSH", "steps": ["El atacante escanea puertos", "Se conecta por SSH usando credenciales por defecto"]}
        ]
    elif request.type == "database":
        findings = [
            {"issue": "Acceso root sin contraseña", "severity": "critical"}
        ]
        summary = "Riesgo crítico en la base de datos."
        attack_scenarios = [
            {"title": "Exfiltración de datos", "steps": ["El atacante accede con credenciales débiles", "Descarga la base de datos completa"]}
        ]
    elif request.type == "code":
        findings = [
            {"pattern": "Uso de eval()", "severity": "high"}
        ]
        summary = "Patrones de código inseguros detectados."
        attack_scenarios = [
            {"title": "Ejecución de código arbitrario", "steps": ["El atacante explota eval() con entrada controlada", "Ejecuta comandos en el servidor"]}
        ]
    elif request.type == "cloud":
        findings = [
            {"misconfiguration": "S3 bucket público", "severity": "high"}
        ]
        summary = "Configuraciones cloud expuestas."
        attack_scenarios = [
            {"title": "Robo de datos en S3", "steps": ["El bucket es público", "El atacante descarga archivos sensibles"]}
        ]
    elif request.type == "container":
        findings = [
            {"issue": "Contenedor corre como root", "severity": "medium"}
        ]
        summary = "Mejorar seguridad de contenedores."
        attack_scenarios = [
            {"title": "Escalada de privilegios en contenedor", "steps": ["El atacante compromete el contenedor", "Obtiene acceso root"]}
        ]
    elif request.type == "dependencies":
        findings = [
            {"library": "lodash", "version": "4.17.15", "cve": "CVE-2020-8203", "severity": "high"}
        ]
        summary = "Dependencias vulnerables encontradas."
        attack_scenarios = [
            {"title": "Ataque por dependencia comprometida", "steps": ["Librería vulnerable es explotada", "El atacante ejecuta código remoto"]}
        ]
    elif request.type == "network":
        findings = [
            {"issue": "Puerto 3306 abierto", "severity": "medium"}
        ]
        summary = "Puertos inseguros detectados en la red."
        attack_scenarios = [
            {"title": "Acceso a base de datos expuesta", "steps": ["El atacante detecta el puerto abierto", "Se conecta y extrae datos"]}
        ]
    else:
        findings = []
        summary = "Tipo de análisis no soportado."
        attack_scenarios = []
    return JSONResponse(content={
        "findings": findings,
        "summary": summary,
        "attack_scenarios": attack_scenarios,
        "download_url": f"/download/{file_id}.json",
        "download_zip_url": f"/download/{file_id}.zip"
    })

@app.get("/")
def root():
    return {"message": "Motor de análisis de seguridad activo. Usa POST /analyze."}
