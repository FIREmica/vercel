// Script Node.js para lanzar un escaneo con OWASP ZAP y guardar resultados en PostgreSQL
// Requiere: tener ZAP instalado y accesible por CLI o Docker, y variables de entorno para la DB

const { exec } = require('child_process');
const { Client } = require('pg');

const ZAP_PATH = process.env.ZAP_PATH || 'zap.sh'; // Ruta a zap.sh o zap.bat
const DB_URL = process.env.POSTGRES_URL;
const NIKTO_PATH = process.env.NIKTO_PATH || 'nikto';
const WAPITI_PATH = process.env.WAPITI_PATH || 'wapiti';
const NMAP_PATH = process.env.NMAP_PATH || 'nmap';
const WHATWEB_PATH = process.env.WHATWEB_PATH || 'whatweb';

async function scanAndSave(url) {
  return new Promise((resolve, reject) => {
    // Ejecutar ZAP en modo quick-scan y guardar el reporte en JSON
    const reportFile = `/tmp/zap_report_${Date.now()}.json`;
    const cmd = `${ZAP_PATH} -cmd -quickurl ${url} -quickout ${reportFile}`;
    exec(cmd, async (err, stdout, stderr) => {
      if (err) return reject(stderr || err);
      // Leer el reporte generado
      const fs = require('fs');
      let report;
      try {
        report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
      } catch (e) {
        return reject('No se pudo leer el reporte de ZAP');
      }
      // Guardar en PostgreSQL
      const client = new Client({ connectionString: DB_URL });
      await client.connect();
      await client.query(
        'CREATE TABLE IF NOT EXISTS web_scans (id SERIAL PRIMARY KEY, url TEXT, report JSONB, created_at TIMESTAMP DEFAULT NOW())'
      );
      await client.query(
        'INSERT INTO web_scans (url, report) VALUES ($1, $2)',
        [url, report]
      );
      await client.end();
      resolve(report);
    });
  });
}

async function runNikto(url) {
  return new Promise((resolve) => {
    exec(`${NIKTO_PATH} -h ${url} -o - -Format json`, (err, stdout) => {
      if (err) return resolve({ error: 'Nikto error', details: err.toString() });
      try { resolve(JSON.parse(stdout)); } catch { resolve({ raw: stdout }); }
    });
  });
}

async function runWapiti(url) {
  return new Promise((resolve) => {
    exec(`${WAPITI_PATH} -u ${url} -f json -o /tmp/wapiti_${Date.now()}.json`, (err, stdout) => {
      const fs = require('fs');
      const files = fs.readdirSync('/tmp').filter(f => f.startsWith('wapiti_') && f.endsWith('.json'));
      if (files.length === 0) return resolve({ error: 'No Wapiti report found' });
      try {
        const report = JSON.parse(fs.readFileSync(`/tmp/${files[0]}`, 'utf8'));
        resolve(report);
      } catch { resolve({ error: 'Wapiti parse error' }); }
      fs.unlinkSync(`/tmp/${files[0]}`);
    });
  });
}

async function runNmap(url) {
  return new Promise((resolve) => {
    exec(`${NMAP_PATH} -sV --script vuln ${url} -oX -`, (err, stdout) => {
      if (err) return resolve({ error: 'Nmap error', details: err.toString() });
      resolve({ xml: stdout });
    });
  });
}

async function runWhatWeb(url) {
  return new Promise((resolve) => {
    exec(`${WHATWEB_PATH} ${url} --log-json=-`, (err, stdout) => {
      if (err) return resolve({ error: 'WhatWeb error', details: err.toString() });
      try { resolve(JSON.parse(stdout)); } catch { resolve({ raw: stdout }); }
    });
  });
}

async function scanAndSaveAll(url) {
  const zap = await scanAndSave(url);
  const nikto = await runNikto(url);
  const wapiti = await runWapiti(url);
  const nmap = await runNmap(url);
  const whatweb = await runWhatWeb(url);
  // Guardar todos los resultados juntos
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  await client.query(
    'CREATE TABLE IF NOT EXISTS web_scans (id SERIAL PRIMARY KEY, url TEXT, report JSONB, created_at TIMESTAMP DEFAULT NOW())'
  );
  await client.query(
    'INSERT INTO web_scans (url, report) VALUES ($1, $2)',
    [url, { zap, nikto, wapiti, nmap, whatweb }]
  );
  await client.end();
  return { zap, nikto, wapiti, nmap, whatweb };
}

// Si se ejecuta como script
if (require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error('Uso: node zap_scan.js <url>');
    process.exit(1);
  }
  scanAndSaveAll(url)
    .then(r => {
      console.log('Escaneo combinado completado y guardado en la base de datos.');
      process.exit(0);
    })
    .catch(e => {
      console.error('Error:', e);
      process.exit(1);
    });
}

module.exports = { scanAndSaveAll };
