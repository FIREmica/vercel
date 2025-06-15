import { performAnalysisAction } from "./actions";
import { Suspense } from "react";

export default async function AnalysisServerActionWrapper({
  params,
  isPremium,
  children,
}: {
  params: any;
  isPremium: boolean;
  children: (result: any) => React.ReactNode;
}) {
  let result = null;
  try {
    result = await performAnalysisAction(params, isPremium);
  } catch (e) {
    result = { error: e?.toString() || "Error desconocido" };
  }
  // Asegura que result nunca sea null
  if (!result) {
    result = { error: "Sin resultado del análisis", reportText: null, allFindings: [] };
  }
  // Asegura que reportText y allFindings existan
  if (typeof result !== 'object' || result === null) {
    result = { error: "Formato inesperado de resultado", reportText: null, allFindings: [] };
  } else {
    if (!('reportText' in result)) result.reportText = null;
    if (!('allFindings' in result)) result.allFindings = [];
  }
  return <>{children(result)}</>;
}
