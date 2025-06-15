import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL requerida" }, { status: 400 });
    }
    // Ejecutar el script zap_scan.js para todos los motores
    const result = await new Promise((resolve, reject) => {
      exec(`node zap_scan.js ${url}`, { cwd: process.cwd() }, (err, stdout, stderr) => {
        if (err) return reject(stderr || err);
        resolve(stdout);
      });
    });
    // Consultar el último resultado combinado guardado en la base de datos
    const { Client } = require('pg');
    const client = new Client({ connectionString: process.env.POSTGRES_URL });
    await client.connect();
    const { rows } = await client.query('SELECT * FROM web_scans WHERE url = $1 ORDER BY created_at DESC LIMIT 1', [url]);
    await client.end();
    if (!rows.length) return NextResponse.json({ error: "No se encontró el resultado del escaneo." }, { status: 500 });
    return NextResponse.json(rows[0].report);
  } catch (err) {
    return NextResponse.json({ error: "Error procesando el escaneo: " + err }, { status: 500 });
  }
}

// ---
// Documentación rápida:
// El frontend debe enviar: { url: string, type: string, ...otrosDatos }
// type puede ser: 'web', 'server', 'database', 'code', 'cloud', 'container', 'dependencies', 'network', etc.
// El backend debe responder con un JSON con los hallazgos o resultados del análisis.
// ---
