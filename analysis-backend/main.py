from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
import uuid
import zipfile

app = FastAPI(title="Analysis Backend", description="Microservicio de análisis de seguridad")

# Permitir CORS para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RESULTS_DIR = "results"
os.makedirs(RESULTS_DIR, exist_ok=True)

class AnalyzeRequest(BaseModel):
    url: str
    type: str
    extra: Optional[dict] = None

class Finding(BaseModel):
    id: int
    title: str
    severity: str
    description: str

class AttackScenario(BaseModel):
    title: str
    steps: List[str]

class AnalyzeResponse(BaseModel):
    status: str
    findings: List[Finding]
    attack_scenarios: List[AttackScenario]
    download_url: str
    download_zip_url: str

# Simulación de hallazgos y escenarios
FINDINGS_EXAMPLES = {
    "web": [
        Finding(id=1, title="XSS detectado", severity="alta", description="Se detectó un posible Cross-Site Scripting en /search"),
        Finding(id=2, title="SQLi posible", severity="media", description="Parámetro vulnerable a inyección SQL en /login")
    ],
    "server": [
        Finding(id=1, title="Puerto SSH abierto", severity="media", description="El puerto 22 está expuesto a internet"),
    ],
    "database": [
        Finding(id=1, title="Contraseña débil", severity="alta", description="Usuario 'admin' con contraseña '123456'")
    ],
    "code": [
        Finding(id=1, title="Hardcoded secret", severity="alta", description="Se encontró una clave secreta en el código fuente")
    ],
    "cloud": [
        Finding(id=1, title="S3 bucket público", severity="alta", description="Bucket AWS S3 accesible públicamente")
    ],
    "container": [
        Finding(id=1, title="Imagen sin escanear", severity="media", description="No se detectó escaneo de vulnerabilidades en la imagen Docker")
    ],
    "dependencies": [
        Finding(id=1, title="Dependencia vulnerable", severity="alta", description="Librería 'lodash' versión vulnerable detectada")
    ],
    "network": [
        Finding(id=1, title="Puerto inseguro expuesto", severity="media", description="Puerto 8080 accesible desde internet")
    ]
}

ATTACK_SCENARIOS_EXAMPLES = {
    "web": [
        AttackScenario(title="Robo de sesión por XSS", steps=["El atacante inyecta un script en /search", "El usuario hace clic y su cookie es robada"])
    ],
    "server": [
        AttackScenario(title="Acceso no autorizado por SSH", steps=["El atacante escanea puertos", "Se conecta por SSH usando credenciales por defecto"])
    ],
    "database": [
        AttackScenario(title="Exfiltración de datos", steps=["El atacante accede con credenciales débiles", "Descarga la base de datos completa"])
    ],
    "code": [
        AttackScenario(title="Compromiso por clave filtrada", steps=["El atacante encuentra la clave en el repo", "La usa para acceder a servicios internos"])
    ],
    "cloud": [
        AttackScenario(title="Robo de datos en S3", steps=["El bucket es público", "El atacante descarga archivos sensibles"])
    ],
    "container": [
        AttackScenario(title="Ejecución de malware en contenedor", steps=["Imagen sin escanear es desplegada", "Contiene malware que se ejecuta al iniciar"])
    ],
    "dependencies": [
        AttackScenario(title="Ataque por dependencia comprometida", steps=["Librería vulnerable es explotada", "El atacante ejecuta código remoto"])
    ],
    "network": [
        AttackScenario(title="Acceso a servicio interno", steps=["Puerto expuesto es descubierto", "El atacante accede a la administración interna"])
    ]
}

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    findings = FINDINGS_EXAMPLES.get(request.type, [])
    attack_scenarios = ATTACK_SCENARIOS_EXAMPLES.get(request.type, [])
    file_id = str(uuid.uuid4())
    result = {
        "status": "ok",
        "findings": [f.dict() for f in findings],
        "attack_scenarios": [a.dict() for a in attack_scenarios],
        "download_url": f"/download/{file_id}.json",
        "download_zip_url": f"/download/{file_id}.zip"
    }
    # Guardar resultado para descarga
    with open(os.path.join(RESULTS_DIR, f"{file_id}.json"), "w") as f:
        json.dump(result, f, indent=2)
    # Crear ZIP
    zip_path = os.path.join(RESULTS_DIR, f"{file_id}.zip")
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        zipf.write(os.path.join(RESULTS_DIR, f"{file_id}.json"), arcname=f"result.json")
    return result

@app.get("/download/{file_id}")
async def download(file_id: str):
    if file_id.endswith(".json"):
        file_path = os.path.join(RESULTS_DIR, file_id)
        if os.path.exists(file_path):
            return FileResponse(file_path, media_type="application/json", filename=file_id)
    elif file_id.endswith(".zip"):
        file_path = os.path.join(RESULTS_DIR, file_id)
        if os.path.exists(file_path):
            return FileResponse(file_path, media_type="application/zip", filename=file_id)
    return JSONResponse({"error": "Archivo no encontrado"}, status_code=404)

@app.get("/")
def root():
    return {"message": "Analysis Backend running. POST /analyze para analizar."}
