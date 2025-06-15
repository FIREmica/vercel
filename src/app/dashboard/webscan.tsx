"use client";
import React, { useState, useRef, useMemo, useEffect } from "react";
import PayPalButton from "@/components/PayPalButton";

export default function WebScan() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [premium, setPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const resultRef = useRef<HTMLDivElement>(null);

  // Contador de vulnerabilidades y testimonios ficticios
  const [vulnCount, setVulnCount] = useState(0);
  useEffect(() => {
    // Simulación: sumar hallazgos de todos los motores
    if (result) {
      const total = Object.values(result).reduce((acc: number, data: any) => {
        if (data && typeof data === "object") {
          if (Array.isArray(data.issues)) return acc + data.issues.length;
          if (Array.isArray(data.alerts)) return acc + data.alerts.length;
          if (data.vulnerabilities) return acc + Object.keys(data.vulnerabilities).length;
          if (data.raw) return acc + (data.raw.match(/vuln|issue|alert/gi) || []).length;
          return acc + Object.keys(data).length;
        }
        return acc;
      }, 0);
      setVulnCount(total);
    }
  }, [result]);

  const testimonials = [
    { name: "Ana Torres", text: "Gracias a esta plataforma, detecté y solucioné vulnerabilidades críticas en mi web. ¡Recomendado!", company: "TiendaOnline24" },
    { name: "Carlos Méndez", text: "El reporte premium es muy completo y fácil de entender. Vale cada dólar.", company: "CM Soluciones" },
    { name: "Lucía Pérez", text: "Me ayudaron a proteger mi negocio y evitar ataques. El soporte es excelente.", company: "EventosLP" },
  ];

  // Simulación: solo el primer escaneo es gratis
  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setShowPaywall(false);
    try {
      // Llamada real al backend
      const res = await fetch("/api/webscan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, type: "web" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      if (!premium) setShowPaywall(true); // Mostrar paywall tras el primer escaneo
    } catch (err: any) {
      setError("No se pudo analizar el sitio. Intenta de nuevo más tarde.");
    }
    setLoading(false);
  };

  const handleExport = (type: "json" | "txt") => {
    if (!result) return;
    const dataStr =
      type === "json"
        ? JSON.stringify(result, null, 2)
        : Object.entries(result)
            .map(
              ([engine, data]) =>
                `=== ${engine.toUpperCase()} ===\n` +
                (typeof data === "string"
                  ? data
                  : JSON.stringify(data, null, 2))
            )
            .join("\n\n");
    const blob = new Blob([dataStr], { type: type === "json" ? "application/json" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webscan_result.${type}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!resultRef.current) return;
    navigator.clipboard.writeText(resultRef.current.innerText);
  };

  // Generar resumen gráfico de hallazgos por motor
  const summary = useMemo(() => {
    if (!result) return [];
    return Object.entries(result).map(([engine, data]: any) => {
      let count = 0;
      if (data && typeof data === "object") {
        if (Array.isArray(data.issues)) count = data.issues.length;
        else if (Array.isArray(data.alerts)) count = data.alerts.length;
        else if (data.vulnerabilities) count = Object.keys(data.vulnerabilities).length;
        else if (data.raw) count = (data.raw.match(/vuln|issue|alert/gi) || []).length;
        else count = Object.keys(data).length;
      }
      return { engine, count };
    });
  }, [result]);

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      {showBanner && (
        <div className="mb-6 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg p-4 flex items-center justify-between shadow-lg animate-pulse">
          <div>
            <b>¡Oferta limitada!</b> Primer escaneo premium gratis para los primeros 100 usuarios.
          </div>
          <button onClick={() => setShowBanner(false)} className="ml-4 text-xs underline">Cerrar</button>
        </div>
      )}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Escaneo de Vulnerabilidades Web</h1>
          <div className="text-green-600 font-semibold text-lg">Más de 5,000 vulnerabilidades detectadas este mes</div>
        </div>
        <div className="bg-black/80 text-green-400 rounded-full px-6 py-2 text-xl font-bold shadow-lg border-2 border-green-400 animate-pulse">
          {vulnCount > 0 ? `¡${vulnCount} vulnerabilidades encontradas!` : "Analiza tu web ahora"}
        </div>
      </div>
      {/* Testimonios */}
      <div className="mb-8">
        <h2 className="font-semibold text-base mb-2 text-primary">Testimonios de usuarios</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {testimonials.map((t, i) => (
            <div key={i} className="min-w-[220px] bg-card border border-border rounded-lg p-4 shadow">
              <div className="font-bold text-sm mb-1">{t.name} <span className="text-xs text-muted-foreground">({t.company})</span></div>
              <div className="text-xs italic">“{t.text}”</div>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleScan} className="flex gap-2 mb-4">
        <input
          className="flex-1 border rounded px-2 py-1"
          placeholder="https://tusitio.com"
          value={url}
          onChange={e => setUrl(e.target.value)}
          required
        />
        <button type="submit" className="bg-primary text-background px-4 py-1 rounded" disabled={loading}>Escanear</button>
      </form>
      {loading && <div>Analizando...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-xl max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-2 text-red-600">¡Tu sitio está en riesgo!</h2>
            <p className="mb-4">Desbloquea el reporte completo, descarga profesional y soporte experto por solo <span className="font-bold text-green-600">$10 USD</span>.</p>
            <PayPalButton amount={10} onSuccess={() => { setPremium(true); setShowPaywall(false); }} />
            <button onClick={() => setShowPaywall(false)} className="mt-4 text-xs underline text-muted-foreground">Cerrar</button>
          </div>
        </div>
      )}
      {result && (
        <div className="mt-4 border rounded bg-card p-4">
          <div className="font-semibold mb-2 text-red-600">Resumen de Riesgo: ¡Tu sitio tiene vulnerabilidades críticas!</div>
          <div className="mb-2 text-sm text-muted-foreground">Se muestran los hallazgos de ZAP, Nikto, Wapiti, Nmap y WhatWeb.</div>
          <div className="flex gap-2 mb-4">
            <button onClick={() => handleExport("json")} className="bg-primary text-background px-3 py-1 rounded text-xs" disabled={!premium}>Descargar JSON</button>
            <button onClick={() => handleExport("txt")} className="bg-primary text-background px-3 py-1 rounded text-xs" disabled={!premium}>Descargar TXT</button>
            <button onClick={handleCopy} className="bg-primary text-background px-3 py-1 rounded text-xs" disabled={!premium}>Copiar todo</button>
            {!premium && <span className="text-xs text-red-500 ml-2">Solo usuarios premium pueden exportar o copiar reportes.</span>}
          </div>
          {/* Resumen gráfico */}
          <div className="mb-4">
            <h2 className="font-semibold text-base mb-2">Resumen de hallazgos</h2>
            <div className="flex gap-4">
              {summary.map(({ engine, count }) => (
                <div key={engine} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${count > 5 ? 'bg-red-600 text-white' : count > 0 ? 'bg-yellow-400 text-black' : 'bg-green-500 text-white'}`}>{count}</div>
                  <div className="text-xs mt-1 capitalize">{engine}</div>
                </div>
              ))}
            </div>
          </div>
          <div ref={resultRef} className="space-y-4">
            {Object.entries(result).map(([engine, data]: any, idx) => (
              <details key={engine} className="border rounded p-2 bg-background">
                <summary className="font-semibold cursor-pointer capitalize">{engine}</summary>
                <pre className="overflow-x-auto text-xs mt-2 bg-black/80 text-green-400 p-2 rounded max-h-64">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            ))}
          </div>
        </div>
      )}
      {/* Botón flotante de WhatsApp */}
      <a href="https://wa.me/5491112345678?text=Hola%2C%20quiero%20proteger%20mi%20web%20con%20su%20servicio" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg p-4 flex items-center gap-2 animate-bounce">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.98L0 24l6.18-1.62A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.68-.5-5.26-1.44l-.38-.22-3.67.96.98-3.58-.25-.37A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.8c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.34-.26.27-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3 .15.19 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.65-.67 1.89-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/></svg>
        WhatsApp
      </a>
    </div>
  );
}
