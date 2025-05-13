
"use client";

import type { AnalyzeVulnerabilitiesOutput } from "@/types"; // Updated import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, AlertTriangle, FileWarning, ShieldCheck, Info, Activity, CircleAlert } from "lucide-react"; // Replaced ShieldQuestion with CircleAlert for consistency
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AnalysisSummaryCardProps = {
  analysisResults: AnalyzeVulnerabilitiesOutput | null; // Changed prop name and type
};

interface PostureInfo {
  title: string;
  message: string;
  Icon: React.ElementType;
  colorClass: string;
  badgeVariant: "destructive" | "outline" | "default";
  badgeClass?: string;
  borderColorClass: string; // Added for border color consistency
  bgColorClass: string; // Added for background color consistency
}


export function AnalysisSummaryCard({ analysisResults }: AnalysisSummaryCardProps) {
  if (!analysisResults) {
    return (
      <Card className="shadow-lg border-l-4 border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Info className="h-6 w-6 text-blue-500" />
            Resumen del Análisis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No hay datos de análisis disponibles para mostrar un resumen. El escaneo puede estar en curso o no haber producido resultados.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Use the counts and assessments directly from analysisResults
  const totalVulnerable = analysisResults.vulnerableFindingsCount ?? 0;
  const highCount = analysisResults.highSeverityCount ?? 0;
  const mediumCount = analysisResults.mediumSeverityCount ?? 0;
  const lowCount = analysisResults.lowSeverityCount ?? 0;
  // Informational findings are those not marked 'isVulnerable' but have 'Informational' severity
  const informationalCount = analysisResults.findings?.filter(f => !f.isVulnerable && f.severity === 'Informational').length ?? 0;

  let posture: PostureInfo;

  switch (analysisResults.overallRiskAssessment) {
    case "Critical":
      posture = {
        title: "¡Riesgo Crítico!",
        message: analysisResults.executiveSummary || `Se han detectado ${highCount} vulnerabilidad(es) de ALTA severidad, resultando en un riesgo crítico.`,
        Icon: ShieldAlert,
        colorClass: "text-destructive",
        badgeVariant: "destructive",
        borderColorClass: "border-destructive",
        bgColorClass: "bg-destructive/10",
      };
      break;
    case "High":
      posture = {
        title: "¡Atención Urgente!",
        message: analysisResults.executiveSummary || `Se han detectado ${highCount} vulnerabilidad(es) de ALTA severidad.`,
        Icon: ShieldAlert,
        colorClass: "text-destructive", // Keep destructive for high too for emphasis
        badgeVariant: "destructive",
        borderColorClass: "border-destructive",
        bgColorClass: "bg-destructive/10",
      };
      break;
    case "Medium":
      posture = {
        title: "Revisión Necesaria",
        message: analysisResults.executiveSummary || `Se han detectado ${mediumCount} vulnerabilidad(es) de MEDIA severidad.`,
        Icon: AlertTriangle,
        colorClass: "text-orange-500",
        badgeVariant: "outline",
        badgeClass: "border-orange-500 text-orange-500",
        borderColorClass: "border-orange-500",
        bgColorClass: "bg-orange-500/10",
      };
      break;
    case "Low":
      posture = {
        title: "Mejoras Recomendadas",
        message: analysisResults.executiveSummary || `Se han detectado ${lowCount} vulnerabilidad(es) de BAJA severidad.`,
        Icon: FileWarning,
        colorClass: "text-yellow-600",
        badgeVariant: "outline",
        badgeClass: "border-yellow-600 text-yellow-600",
        borderColorClass: "border-yellow-600",
        bgColorClass: "bg-yellow-600/10",
      };
      break;
    case "Informational":
    default:
      posture = {
        title: "Postura Sólida / Informativa",
        message: analysisResults.executiveSummary || "No se detectaron vulnerabilidades activas. Se pueden haber encontrado hallazgos informativos.",
        Icon: ShieldCheck,
        colorClass: "text-green-600",
        badgeVariant: "default",
        badgeClass: "bg-green-600 hover:bg-green-700 text-white",
        borderColorClass: "border-green-600",
        bgColorClass: "bg-green-600/10",
      };
      break;
  }
  // Override if no active vulns but some informational
   if (totalVulnerable === 0 && (analysisResults.findings?.length ?? 0) > 0 && analysisResults.overallRiskAssessment === "Informational") {
     posture = {
        title: "Hallazgos Informativos",
        message: analysisResults.executiveSummary || "El análisis no identificó vulnerabilidades activas específicas, pero se encontraron hallazgos informativos.",
        Icon: Info,
        colorClass: "text-blue-500",
        badgeVariant: "default",
        badgeClass: "bg-blue-500 hover:bg-blue-600 text-white",
        borderColorClass: "border-blue-500",
        bgColorClass: "bg-blue-500/10"
      };
  }


  const summaryItems = [
    { label: "Alta Severidad", count: highCount, Icon: ShieldAlert, color: "text-destructive", badgeVariant: "destructive" as const },
    { label: "Media Severidad", count: mediumCount, Icon: AlertTriangle, color: "text-orange-500", badgeVariant: "outline" as const, badgeClass: "border-orange-500 text-orange-500" },
    { label: "Baja Severidad", count: lowCount, Icon: FileWarning, color: "text-yellow-600", badgeVariant: "outline" as const, badgeClass: "border-yellow-600 text-yellow-600"},
  ];

  return (
    <Card className={cn("shadow-xl border-l-4", posture.borderColorClass)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <Activity className="h-7 w-7 text-primary" />
          Resumen del Análisis de Seguridad
        </CardTitle>
        <CardDescription>Una visión general de los hallazgos del escaneo para la URL analizada.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={cn("flex items-start gap-3 p-4 rounded-lg", posture.bgColorClass)}>
          <posture.Icon className={cn("h-10 w-10 flex-shrink-0 mt-1", posture.colorClass)} />
          <div>
            <h3 className={cn("text-lg font-semibold", posture.colorClass)}>{posture.title}</h3>
            <p className="text-sm text-muted-foreground">{posture.message}</p>
          </div>
        </div>
        
        <div>
            <h4 className="text-md font-semibold mb-3 text-foreground">Distribución de Hallazgos Activos:</h4>
            {totalVulnerable > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {summaryItems.map(item => (
                    item.count > 0 && (
                        <div key={item.label} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm">
                        <div className="flex items-center gap-2">
                            <item.Icon className={cn("h-5 w-5", item.color)} />
                            <span className="text-sm font-medium text-foreground">{item.label}:</span>
                        </div>
                        <Badge variant={item.badgeVariant} className={cn(item.badgeClass)}>
                            {item.count}
                        </Badge>
                        </div>
                    )
                    ))}
                </div>
            ) : (
                 <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg shadow-sm text-sm text-muted-foreground">
                    <ShieldCheck className="h-5 w-5 text-green-600"/>
                    No se encontraron hallazgos activos con las comprobaciones actuales.
                </div>
            )}
        </div>

         {informationalCount > 0 && (
             <div className="mt-4">
                <h4 className="text-md font-semibold mb-2 text-foreground">Hallazgos Informativos (No Vulnerables Directamente):</h4>
                 <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm max-w-xs">
                        <div className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-medium text-foreground">Informativos:</span>
                        </div>
                        <Badge variant="outline" className="border-blue-500 text-blue-500">
                            {informationalCount}
                        </Badge>
                 </div>
            </div>
        )}


        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          Recuerda que este es un análisis automatizado. Se recomienda una revisión manual por expertos para confirmar todos los hallazgos. La IA puede proporcionar información útil, pero no reemplaza el juicio experto.
        </p>
      </CardContent>
    </Card>
  );
}
