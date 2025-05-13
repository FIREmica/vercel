
"use client";

import type { Vulnerability } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, AlertTriangle, FileWarning, ShieldCheck, Info, Activity, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AnalysisSummaryCardProps = {
  vulnerabilities: Vulnerability[] | null;
};

interface PostureInfo {
  title: string;
  message: string;
  Icon: React.ElementType;
  colorClass: string;
  badgeVariant: "destructive" | "outline" | "default";
  badgeClass?: string;
}


export function AnalysisSummaryCard({ vulnerabilities }: AnalysisSummaryCardProps) {
  if (!vulnerabilities) {
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
            No hay datos de vulnerabilidades disponibles para mostrar un resumen.
          </p>
        </CardContent>
      </Card>
    );
  }

  const vulnerableFindings = vulnerabilities.filter(v => v.isVulnerable);
  const totalVulnerable = vulnerableFindings.length;
  const highCount = vulnerableFindings.filter(v => v.severity === 'High').length;
  const mediumCount = vulnerableFindings.filter(v => v.severity === 'Medium').length;
  const lowCount = vulnerableFindings.filter(v => v.severity === 'Low').length;
  const informationalCount = vulnerabilities.filter(v => v.severity === 'Informational' && !v.isVulnerable).length;


  let posture: PostureInfo;

  if (highCount > 0) {
    posture = {
      title: "¡Atención Urgente!",
      message: `Se han detectado ${highCount} vulnerabilidad(es) de ALTA severidad.`,
      Icon: ShieldAlert,
      colorClass: "text-destructive",
      badgeVariant: "destructive",
    };
  } else if (mediumCount > 0) {
    posture = {
      title: "Revisión Necesaria",
      message: `Se han detectado ${mediumCount} vulnerabilidad(es) de MEDIA severidad.`,
      Icon: AlertTriangle,
      colorClass: "text-orange-500",
      badgeVariant: "outline",
      badgeClass: "border-orange-500 text-orange-500"
    };
  } else if (lowCount > 0) {
    posture = {
      title: "Mejoras Recomendadas",
      message: `Se han detectado ${lowCount} vulnerabilidad(es) de BAJA severidad.`,
      Icon: FileWarning,
      colorClass: "text-yellow-600",
      badgeVariant: "outline",
      badgeClass: "border-yellow-600 text-yellow-600"
    };
  } else if (totalVulnerable === 0 && vulnerabilities.length > 0) {
     posture = {
      title: "Postura Sólida",
      message: "No se detectaron vulnerabilidades activas. Se encontraron hallazgos informativos.",
      Icon: ShieldCheck,
      colorClass: "text-green-600",
      badgeVariant: "default",
      badgeClass: "bg-green-600 hover:bg-green-700 text-white"
    };
  } else {
     posture = {
      title: "Análisis Completo",
      message: "El análisis no identificó vulnerabilidades activas específicas con las comprobaciones actuales.",
      Icon: Info,
      colorClass: "text-blue-500",
      badgeVariant: "default",
      badgeClass: "bg-blue-500 hover:bg-blue-600 text-white"
    };
  }

  const summaryItems = [
    { label: "Alta Severidad", count: highCount, Icon: ShieldAlert, color: "text-destructive" },
    { label: "Media Severidad", count: mediumCount, Icon: AlertTriangle, color: "text-orange-500" },
    { label: "Baja Severidad", count: lowCount, Icon: FileWarning, color: "text-yellow-600" },
    { label: "Informativas (No Vulnerables)", count: informationalCount, Icon: Info, color: "text-blue-500" },
  ];

  return (
    <Card className={cn("shadow-xl border-l-4", 
        posture.badgeVariant === 'destructive' ? 'border-destructive' : 
        posture.badgeClass?.includes('orange') ? 'border-orange-500' :
        posture.badgeClass?.includes('yellow') ? 'border-yellow-600' :
        posture.badgeClass?.includes('green') ? 'border-green-600' : 'border-blue-500'
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <Activity className="h-7 w-7 text-primary" />
          Resumen del Análisis de Seguridad
        </CardTitle>
        <CardDescription>Una visión general de los hallazgos del escaneo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={cn("flex items-center gap-3 p-4 rounded-lg", 
            posture.badgeVariant === 'destructive' ? 'bg-destructive/10' : 
            posture.badgeClass?.includes('orange') ? 'bg-orange-500/10' :
            posture.badgeClass?.includes('yellow') ? 'bg-yellow-600/10' :
            posture.badgeClass?.includes('green') ? 'bg-green-600/10' : 'bg-blue-500/10'
        )}>
          <posture.Icon className={cn("h-10 w-10 flex-shrink-0", posture.colorClass)} />
          <div>
            <h3 className={cn("text-lg font-semibold", posture.colorClass)}>{posture.title}</h3>
            <p className="text-sm text-muted-foreground">{posture.message}</p>
          </div>
        </div>
        
        <div>
            <h4 className="text-md font-semibold mb-3 text-foreground">Distribución de Hallazgos Activos:</h4>
            {totalVulnerable > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {summaryItems.filter(item => item.label !== "Informativas (No Vulnerables)").map(item => (
                    item.count > 0 && (
                        <div key={item.label} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm">
                        <div className="flex items-center gap-2">
                            <item.Icon className={cn("h-5 w-5", item.color)} />
                            <span className="text-sm font-medium text-foreground">{item.label}:</span>
                        </div>
                        <Badge variant={
                            item.color === "text-destructive" ? "destructive" : 
                            item.color === "text-orange-500" ? "outline" :
                            item.color === "text-yellow-600" ? "outline" : "secondary"
                        } 
                        className={cn(
                            item.color === "text-orange-500" && "border-orange-500 text-orange-500",
                            item.color === "text-yellow-600" && "border-yellow-600 text-yellow-600"
                        )}>
                            {item.count}
                        </Badge>
                        </div>
                    )
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">No se encontraron hallazgos activos con las comprobaciones actuales.</p>
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
          Recuerda que este es un análisis automatizado. Se recomienda una revisión manual por expertos para confirmar todos los hallazgos.
        </p>
      </CardContent>
    </Card>
  );
}

    