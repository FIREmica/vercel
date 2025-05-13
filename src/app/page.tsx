"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/header";
import { UrlInputForm } from "@/components/url-input-form";
import { VulnerabilityReportDisplay } from "@/components/vulnerability-report-display";
import { performAnalysisAction } from "./actions";
import type { AnalysisResult } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function HomePage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const exampleUrl = "http://www.scorpionms.com.ec/index.php/component/users/?view=registration&username=admin%27--+";

  const handleFormSubmit = async (url: string) => {
    setIsLoading(true);
    setAnalysisResult(null); // Clear previous results
    
    try {
      const result = await performAnalysisAction(url);
      setAnalysisResult(result);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: result.error,
        });
      } else if (result.vulnerabilities && result.vulnerabilities.length > 0) {
        toast({
          title: "Analysis Complete",
          description: "Vulnerabilities found. Please review the report.",
          variant: "default",
        });
      } else {
         toast({
          title: "Analysis Complete",
          description: "Scan finished. No critical vulnerabilities detected by this scan, review the generated report for details.",
          variant: "default",
        });
      }
    } catch (e) {
      const error = e as Error;
      console.error("Form submission error:", error);
      const errorMessage = error.message || "An unexpected error occurred.";
      setAnalysisResult({ vulnerabilities: null, reportText: null, error: errorMessage });
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/50">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <section className="max-w-3xl mx-auto bg-card p-6 md:p-8 rounded-xl shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
            Scan for Account Lockout Risks
          </h2>
          <p className="text-muted-foreground mb-6">
            Enter the URL of a user registration page to analyze it for potential vulnerabilities
            that could lead to user account lockouts.
          </p>
          <UrlInputForm 
            onSubmit={handleFormSubmit} 
            isLoading={isLoading}
            defaultUrl={exampleUrl}
          />
        </section>

        <Separator className="my-8 md:my-12" />
        
        {isLoading && (
          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
             <Card className="shadow-lg">
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 border-b py-3 last:border-b-0">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-6 w-1/4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {!isLoading && analysisResult && (
          <VulnerabilityReportDisplay result={analysisResult} />
        )}
        
        {!isLoading && !analysisResult && (
           <Card className="mt-8 shadow-lg max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Info className="h-6 w-6 text-primary" />
                    Ready to Scan
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Your analysis results will appear here once you submit a URL.
                </p>
            </CardContent>
           </Card>
        )}

      </main>
      <footer className="text-center py-6 text-sm text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} Account Lockout Analyzer. Powered by GenAI.
      </footer>
    </div>
  );
}
