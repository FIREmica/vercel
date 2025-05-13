
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ShieldEllipsis, TrendingDown } from "lucide-react";

export function HackingInfoSection() {
  return (
    <section className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-amber-600">
            <AlertTriangle className="h-6 w-6" />
            Posibles Modus Operandi (Bloqueo de Cuentas)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Ataques de Fuerza Bruta:</h3>
            <p>
              Consisten en intentar repetidamente contraseñas comunes o listas de credenciales robadas en una cuenta específica. Si existe una política de bloqueo (ej. bloquear tras 5 intentos fallidos), esto puede bloquear al usuario legítimo.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Credential Stuffing:</h3>
            <p>
              Utilización de grandes listas de combinaciones de nombre de usuario/contraseña robadas de otras brechas de datos para intentar iniciar sesión en cuentas del sistema objetivo. Similar a la fuerza bruta, puede activar bloqueos.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Enumeración de Usuarios + Password Spraying:</h3>
            <p>
              Primero, se identifican nombres de usuario válidos (ej. mediante mensajes de error en formularios o perfiles públicos). Luego, se intenta una única contraseña común (o una lista pequeña) contra todos los nombres de usuario enumerados. Esto puede causar bloqueos masivos si muchos usuarios comparten contraseñas débiles.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Denegación de Servicio (DoS) mediante Bloqueo:</h3>
            <p>
              Desencadenar intencionalmente intentos de inicio de sesión fallidos para un usuario o conjunto de usuarios específico para impedirles el acceso a sus cuentas. Puede ser acoso dirigido o un ataque más amplio.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Explotación de CAPTCHA Débil o Limitación de Tasa Insuficiente:</h3>
            <p>
              Si la página de registro o inicio de sesión no tiene protección adecuada contra scripts automatizados, los atacantes pueden realizar fácilmente los ataques anteriores a gran escala.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-destructive">
            <TrendingDown className="h-6 w-6" />
            Repercusiones del Hackeo (Enfoque en Bloqueo de Cuentas)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Frustración y Insatisfacción del Usuario:</h3>
            <p>
              Que los usuarios legítimos no puedan acceder a sus cuentas es un gran inconveniente y puede llevar a una mala experiencia de usuario.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Aumento de la Carga de Soporte:</h3>
            <p>
              Los usuarios bloqueados contactarán al soporte al cliente, aumentando los costos operativos y la carga de trabajo.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Daño Reputacional:</h3>
            <p>
              Incidentes frecuentes de bloqueo de cuentas pueden dañar la reputación de la empresa, haciéndola parecer poco fiable o insegura.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Pérdida de Productividad:</h3>
            <p>
              Para aplicaciones críticas de negocio, los bloqueos de cuenta pueden impedir que empleados o clientes realicen tareas necesarias.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Erosión de la Confianza:</h3>
            <p>
              Los usuarios pueden perder la confianza en la capacidad de la plataforma para proteger sus cuentas y datos.
            </p>
          </div>
           <div>
            <h3 className="font-semibold text-foreground mb-1">Posibles Ataques Dirigidos:</h3>
            <p>
              Los atacantes podrían usar los bloqueos como una cortina de humo o un paso preparatorio para ataques más sofisticados.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
