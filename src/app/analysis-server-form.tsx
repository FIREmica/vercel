import { performAnalysisAction } from "./actions";
import { AnalysisSummaryCard } from "@/components/analysis-summary-card";
import { VulnerabilityReportDisplay } from "@/components/vulnerability-report-display";
import { AttackVectorsDisplay } from "@/components/attack-vectors-display";
import { RemediationPlaybooksDisplay } from "@/components/remediation-playbooks-display";
import { FileJson, Download, LockIcon, ShieldEllipsis, Zap, FileLock2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";

export default async function AnalysisServerForm({ searchParams }: { searchParams: any }) {
  let result = null;
  if (searchParams && searchParams.analysis) {
    try {
      const params = JSON.parse(searchParams.analysis);
      result = await performAnalysisAction(params, !!searchParams.isPremium);
    } catch (e) {
      result = { error: e?.toString() || "Error desconocido", reportText: null, allFindings: [] };
    }
  }
  return (
    <div className="space-y-8 mt-8">
      {result && <AnalysisSummaryCard result={result} />}
      {result && <VulnerabilityReportDisplay result={result} isPremiumUser={!!searchParams.isPremium} />}
      {/* Aquí puedes agregar AttackVectorsDisplay, RemediationPlaybooksDisplay, etc. */}
    </div>
  );
}
