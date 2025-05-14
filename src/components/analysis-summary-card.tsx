"use client";

import type { AnalysisResult, VulnerabilityFinding } from "@/types"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, AlertTriangle, FileWarning, ShieldCheck, Info, Activity, ServerIcon, Database, Globe, AlertCircle, CloudIcon, BoxIcon, LibraryIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AnalysisSummaryCardProps = {
  analysisInput: AnalysisResult['urlAnalysis'] | AnalysisResult['serverAnalysis'] | AnalysisResult['databaseAnalysis'] | AnalysisResult['sastAnalysis'] | AnalysisResult['dastAnalysis'] | AnalysisResult['cloudAnalysis'] | AnalysisResult['containerAnalysis'] | AnalysisResult['dependencyAnalysis'] | null;
  allFindings?: VulnerabilityFinding[] | null;
  result?: AnalysisResult | null; // Pass the full result to access all analysis types
};

interface PostureInfo {
  title: string;
  message: string;
  Icon: React.ElementType;
  colorClass: string;
  badgeVariant: "destructive" | "outline" | "default" | "secondary";
  badgeClass?: string;
  borderColorClass: string;
  bgColorClass: string;
}

export function AnalysisSummaryCard({ analysisInput, allFindings, result }: AnalysisSummaryCardProps) {
  if (!result && !analysisInput && (!allFindings || allFindings.length === 0)) {
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
            No hay datos de análisis disponibles.
          </p>
        </CardContent>
      </Card>
    );
  }

  const findingsToSummarize = allFindings || result?.allFindings || analysisInput?.findings || [];
  
  const totalVulnerable = findingsToSummarize.filter(f => f.isVulnerable).length;
  const highCount = findingsToSummarize.filter(f => f.isVulnerable && (f.severity === 'High' || f.severity === 'Critical')).length;
  const mediumCount = findingsToSummarize.filter(f => f.isVulnerable && f.severity === 'Medium').length;
  const lowCount = findingsToSummarize.filter(f => f.isVulnerable && f.severity === 'Low').length;
  const informationalCount = findingsToSummarize.filter(f => f.severity === 'Informational').length;

  let overallRiskAssessment = analysisInput?.overallRiskAssessment;
  if (result) { // Derive global risk if full result is available
      if (result.urlAnalysis?.overallRiskAssessment === "Critical" || result.serverAnalysis?.overallRiskAssessment === "Critical" || result.databaseAnalysis?.overallRiskAssessment === "Critical" || result.sastAnalysis?.overallRiskAssessment === "Critical" || result.dastAnalysis?.overallRiskAssessment === "Critical" || result.cloudAnalysis?.overallRiskAssessment === "Critical" || result.containerAnalysis?.overallRiskAssessment === "Critical" || result.dependencyAnalysis?.overallRiskAssessment === "Critical" || highCount > 1) overallRiskAssessment = "Critical";
      else if (result.urlAnalysis?.overallRiskAssessment === "High" || result.serverAnalysis?.overallRiskAssessment === "High" || result.databaseAnalysis?.overallRiskAssessment === "High" || result.sastAnalysis?.overallRiskAssessment === "High" || result.dastAnalysis?.overallRiskAssessment === "High" || result.cloudAnalysis?.overallRiskAssessment === "High" || result.containerAnalysis?.overallRiskAssessment === "High" || result.dependencyAnalysis?.overallRiskAssessment === "High" || highCount > 0) overallRiskAssessment = "High";
      else if (result.urlAnalysis?.overallRiskAssessment === "Medium" || result.serverAnalysis?.overallRiskAssessment === "Medium" || result.databaseAnalysis?.overallRiskAssessment === "Medium" || result.sastAnalysis?.overallRiskAssessment === "Medium" || result.dastAnalysis?.overallRiskAssessment === "Medium" || result.cloudAnalysis?.overallRiskAssessment === "Medium" || result.containerAnalysis?.overallRiskAssessment === "Medium" || result.dependencyAnalysis?.overallRiskAssessment === "Medium" || mediumCount > 0) overallRiskAssessment = "Medium";
      else if (lowCount > 0) overallRiskAssessment = "Low";
      else overallRiskAssessment = "Informational";
  } else if (allFindings && !overallRiskAssessment) {
      if (highCount > 0) overallRiskAssessment = "Critical";
      else if (mediumCount > 0) overallRiskAssessment = "Medium";
      else if (lowCount > 0) overallRiskAssessment = "Low";
      else overallRiskAssessment = "Informational";
  }


  let posture: PostureInfo;
  const summaryMessage = analysisInput?.executiveSummary || result?.reportText?.split('\n')[0].replace('# Overall Executive Summary (Report):','').trim() ||
                         (totalVulnerable > 0 ? 
                          `Se detectaron ${totalVulnerable} vulnerabilidad(es) activa(s) en total. Revise el informe detallado.` :
                          "No se detectaron vulnerabilidades activas en los componentes analizados. Se pueden haber encontrado hallazgos informativos.");


  switch (overallRiskAssessment) {
    case "Critical":
      posture = {
        title: "¡Riesgo Crítico Identificado!", message: summaryMessage, Icon: ShieldAlert, colorClass: "text-destructive", badgeVariant: "destructive",
        borderColorClass: "border-destructive", bgColorClass: "bg-destructive/10",
      }; break;
    case "High":
      posture = {
        title: "¡Atención Urgente Requerida!", message: summaryMessage, Icon: ShieldAlert, colorClass: "text-destructive", badgeVariant: "destructive",
        borderColorClass: "border-destructive", bgColorClass: "bg-destructive/10",
      }; break;
    case "Medium":
      posture = {
        title: "Revisión de Seguridad Necesaria", message: summaryMessage, Icon: AlertTriangle, colorClass: "text-orange-500", badgeVariant: "outline",
        badgeClass: "border-orange-500 text-orange-500", borderColorClass: "border-orange-500", bgColorClass: "bg-orange-500/10",
      }; break;
    case "Low":
      posture = {
        title: "Mejoras de Seguridad Recomendadas", message: summaryMessage, Icon: FileWarning, colorClass: "text-yellow-600", badgeVariant: "outline",
        badgeClass: "border-yellow-600 text-yellow-600", borderColorClass: "border-yellow-600", bgColorClass: "bg-yellow-600/10",
      }; break;
    case "Informational": default:
      posture = {
        title: totalVulnerable === 0 && informationalCount > 0 ? "Hallazgos Informativos Detectados" : "Postura de Seguridad Sólida", message: summaryMessage,
        Icon: totalVulnerable === 0 && informationalCount > 0 ? Info : ShieldCheck,
        colorClass: totalVulnerable === 0 && informationalCount > 0 ? "text-blue-500" : "text-green-600",
        badgeVariant: totalVulnerable === 0 && informationalCount > 0 ? "outline" : "default",
        badgeClass: totalVulnerable === 0 && informationalCount > 0 ? "border-blue-500 text-blue-500" : "bg-green-600 hover:bg-green-700 text-white",
        borderColorClass: totalVulnerable === 0 && informationalCount > 0 ? "border-blue-500" : "border-green-600",
        bgColorClass: totalVulnerable === 0 && informationalCount > 0 ? "bg-blue-500/10" : "bg-green-600/10",
      }; break;
  }

  const getIconForSource = (source?: VulnerabilityFinding['source']) => {
    switch(source) {
        case "URL": return <Globe className="h-4 w-4 mr-1 text-blue-500" />;
        case "Server": return <ServerIcon className="h-4 w-4 mr-1 text-green-500" />;
        case "Database": return <Database className="h-4 w-4 mr-1 text-purple-500" />;
        case "SAST": return <FileWarning className="h-4 w-4 mr-1 text-indigo-500" />; // Using FileWarning as a placeholder for code-related icon
        case "DAST": return <Activity className="h-4 w-4 mr-1 text-pink-500" />; // Using Activity as a placeholder for dynamic scan
        case "Cloud": return <CloudIcon className="h-4 w-4 mr-1 text-sky-500" />;
        case "Container": return <BoxIcon className="h-4 w-4 mr-1 text-teal-500" />;
        case "Dependency": return <LibraryIcon className="h-4 w-4 mr-1 text-rose-500" />;
        default: return <Info className="h-4 w-4 mr-1 text-gray-500" />;
    }
  };

  const summaryItems = [
    { label: "Crítica/Alta Severidad", count: highCount, IconComp: ShieldAlert, color: "text-destructive", badgeVariant: "destructive" as const },
    { label: "Media Severidad", count: mediumCount, IconComp: AlertCircle, color: "text-orange-500", badgeVariant: "outline" as const, badgeClass: "border-orange-500 text-orange-500" },
    { label: "Baja Severidad", count: lowCount, IconComp: FileWarning, color: "text-yellow-600", badgeVariant: "outline" as const, badgeClass: "border-yellow-600 text-yellow-600"},
  ];

  const analysisTypesPerformed = result ? [
    result.urlAnalysis && { name: "URL", count: result.urlAnalysis.findings.length },
    result.serverAnalysis && { name: "Servidor", count: result.serverAnalysis.findings.length },
    result.databaseAnalysis && { name: "Base de Datos", count: result.databaseAnalysis.findings.length },
    result.sastAnalysis && { name: "SAST (Código)", count: result.sastAnalysis.findings.length },
    result.dastAnalysis && { name: "DAST (App)", count: result.dastAnalysis.findings.length },
    result.cloudAnalysis && { name: "Cloud", count: result.cloudAnalysis.findings.length },
    result.containerAnalysis && { name: "Contenedor", count: result.containerAnalysis.findings.length },
    result.dependencyAnalysis && { name: "Dependencias", count: result.dependencyAnalysis.findings.length },
  ].filter(Boolean) as { name: VulnerabilityFinding['source'], count: number }[] : [];


  return (
    <Card className={cn("shadow-xl border-l-4", posture.borderColorClass)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <Activity className="h-7 w-7 text-primary" />
          Resumen General del Análisis de Seguridad
        </CardTitle>
        <CardDescription>Visión global de los hallazgos en los componentes analizados.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={cn("flex items-start gap-4 p-4 rounded-lg", posture.bgColorClass)}>
          <posture.Icon className={cn("h-12 w-12 flex-shrink-0 mt-1", posture.colorClass)} />
          <div>
            <h3 className={cn("text-xl font-bold mb-1", posture.colorClass)}>{posture.title}</h3>
            <p className="text-sm text-foreground font-medium">{posture.message}</p>
          </div>
        </div>
        
        <div>
            <h4 className="text-md font-semibold mb-3 text-foreground">Distribución de Hallazgos Activos (isVulnerable = true):</h4>
            {totalVulnerable > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {summaryItems.map(item => (
                    item.count > 0 && (
                        <div key={item.label} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm">
                        <div className="flex items-center gap-2">
                            <item.IconComp className={cn("h-5 w-5", item.color)} />
                            <span className="text-sm font-medium text-foreground">{item.label}:</span>
                        </div>
                        <Badge variant={item.badgeVariant} className={cn("font-bold", item.badgeClass)}>
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
                <h4 className="text-md font-semibold mb-2 text-foreground">Hallazgos Informativos:</h4>
                 <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm max-w-xs">
                    <div className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium text-foreground">Informativos:</span>
                    </div>
                    <Badge variant="outline" className="border-blue-500 text-blue-500 font-bold">
                        {informationalCount}
                    </Badge>
                 </div>
            </div>
        )}

        {analysisTypesPerformed.length > 0 && (
            <div className="mt-4 pt-4 border-t">
                <h4 className="text-md font-semibold mb-2 text-foreground">Distribución de Hallazgos Totales por Origen del Análisis:</h4>
                <div className="flex flex-wrap gap-3">
                    {analysisTypesPerformed.map(sourceType => {
                        if (sourceType.count === 0 && !findingsToSummarize.some(f => f.source === sourceType.name)) return null; // Show if findings exist, even if 0 for that specific input type
                        const totalCountForSource = findingsToSummarize.filter(f => f.source === sourceType.name).length;
                        if (totalCountForSource === 0) return null; // Only show if there are actual findings from this source
                        return (
                            <Badge key={sourceType.name} variant="secondary" className="text-sm py-1 px-3">
                                {getIconForSource(sourceType.name)} {sourceType.name}: {totalCountForSource}
                            </Badge>
                        );
                    })}
                </div>
            </div>
        )}

        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          Recuerda que este es un análisis automatizado basado en la información proporcionada. Se recomienda una revisión manual por expertos para confirmar todos los hallazgos.
        </p>
      </CardContent>
    </Card>
  );
}