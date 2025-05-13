'use client';

import type { AttackVector } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertTriangle, BugPlay, ShieldQuestion, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type AttackVectorsDisplayProps = {
  attackVectors: AttackVector[] | null;
};

export function AttackVectorsDisplay({ attackVectors }: AttackVectorsDisplayProps) {
  if (!attackVectors || attackVectors.length === 0) {
    return (
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldQuestion className="h-6 w-6 text-primary" />
            Posibles Escenarios de Ataque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No se generaron escenarios de ataque específicos basados en el análisis actual, o no se encontraron vulnerabilidades relevantes para este tipo de demostración.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl md:text-3xl text-amber-500">
          <BugPlay className="h-8 w-8" />
          Posibles Escenarios de Ataque (Ejemplos Ilustrativos)
        </CardTitle>
        <CardDescription className="text-base">
          A continuación, se presentan ejemplos de cómo las vulnerabilidades identificadas podrían ser explotadas.
          <strong className="block mt-1">Esta información es estrictamente para fines educativos y de concienciación. No intente replicar estas acciones en sistemas para los que no tenga autorización explícita.</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {attackVectors.map((vector, index) => (
            <AccordionItem value={`item-${index}`} key={index} className="border-border">
              <AccordionTrigger className="text-lg hover:no-underline">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold">{vector.vulnerabilityName}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4 px-2 space-y-4 bg-secondary/30 rounded-md">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Escenario de Ataque:</h4>
                  <p className="text-muted-foreground text-sm">{vector.attackScenarioDescription}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Ejemplo de Payload/Técnica:</h4>
                  <pre className="bg-muted p-3 rounded-md text-xs text-foreground overflow-x-auto">
                    <code>{vector.examplePayloadOrTechnique}</code>
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Resultado Esperado (Si Exitoso):</h4>
                  <p className="text-muted-foreground text-sm flex items-center gap-2">
                     <AlertTriangle className="h-4 w-4 text-destructive" /> 
                     {vector.expectedOutcomeIfSuccessful}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
