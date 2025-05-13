import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Code, DatabaseZap, ShieldEllipsis, TrendingDown, UserCog } from "lucide-react";

export function HackingInfoSection() {
  return (
    <section className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-amber-600">
            <AlertTriangle className="h-6 w-6" />
            Posibles Modus Operandi (Vulnerabilidades Comunes)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <div>
            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-1"><UserCog className="inline-block h-4 w-4"/> Ataques de Bloqueo de Cuentas:</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Fuerza Bruta / Credential Stuffing:</strong> Intentos repetidos de contraseñas o uso de credenciales filtradas para activar políticas de bloqueo.
                </li>
                 <li>
                  <strong>Enumeración + Password Spraying:</strong> Identificar usuarios válidos y probar contraseñas comunes contra ellos.
                </li>
                 <li>
                  <strong>DoS mediante Bloqueo:</strong> Provocar bloqueos intencionales para denegar el servicio a usuarios legítimos.
                </li>
                 <li>
                  <strong>Explotación de CAPTCHA/Rate Limit Débil:</strong> Automatizar los ataques anteriores si no hay protección adecuada.
                </li>
            </ul>
          </div>
           <hr className="border-border my-4"/>
           <div>
            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-1"><Code className="inline-block h-4 w-4"/> Cross-Site Scripting (XSS):</h3>
            <p>
              Inyección de scripts maliciosos (generalmente JavaScript) en páginas web vistas por otros usuarios. En un formulario de registro, podría ocurrir si los datos ingresados (ej. nombre de usuario, nombre real) no se sanitizan correctamente antes de mostrarse en otro lugar (ej. página de perfil, lista de usuarios, mensajes de error).
            </p>
             <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>
                  <strong>Reflejado:</strong> El script se ejecuta cuando el usuario hace clic en un enlace manipulado.
                </li>
                 <li>
                  <strong>Almacenado:</strong> El script se guarda en la base de datos y se ejecuta cada vez que se muestra la página afectada.
                </li>
                 <li>
                  <strong>Basado en DOM:</strong> La vulnerabilidad reside en el código JavaScript del lado del cliente que manipula el DOM de forma insegura.
                </li>
            </ul>
          </div>
           <hr className="border-border my-4"/>
          <div>
            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-1"><DatabaseZap className="inline-block h-4 w-4"/> SQL Injection (SQLi):</h3>
            <p>
              Inserción de código SQL malicioso en las entradas de un formulario para manipular consultas a la base de datos. En un registro, podría usarse para intentar extraer datos, modificar registros o incluso obtener control del servidor de base de datos si las consultas SQL no están parametrizadas correctamente.
            </p>
          </div>
           <hr className="border-border my-4"/>
          <div>
            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-1"><ShieldEllipsis className="inline-block h-4 w-4"/> Otras Vulnerabilidades Relevantes:</h3>
             <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Políticas de Contraseña Débiles:</strong> Permitir contraseñas fáciles de adivinar aumenta el riesgo de fuerza bruta exitosa.
                </li>
                 <li>
                  <strong>Falta de Validación de Entrada:</strong> No validar o sanitizar adecuadamente todas las entradas puede llevar a diversas vulnerabilidades (XSS, SQLi, Path Traversal, etc.).
                </li>
                 <li>
                  <strong>Configuraciones Inseguras:</strong> Directorios listables, mensajes de error detallados, software desactualizado.
                </li>
                 <li>
                  <strong>Control de Acceso Roto:</strong> Posibilidad de acceder a funciones o datos para los que el usuario no tiene permiso.
                </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-destructive">
            <TrendingDown className="h-6 w-6" />
            Repercusiones Generales del Hackeo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Pérdida o Robo de Datos:</h3>
            <p>
              Exposición de información sensible de usuarios (credenciales, datos personales, etc.) a través de SQLi u otras vulnerabilidades de acceso a datos.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Toma de Control de Cuentas (Account Takeover - ATO):</h3>
            <p>
              Los atacantes obtienen acceso no autorizado a cuentas de usuarios legítimos, a menudo mediante credenciales robadas, XSS (robo de sesión) o contraseñas débiles.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Interrupción del Servicio / Denegación de Servicio (DoS):</h3>
            <p>
              Usuarios legítimos no pueden acceder al servicio debido a bloqueos de cuenta masivos, agotamiento de recursos por ataques de fuerza bruta o explotación de otras vulnerabilidades.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Daño Reputacional y Pérdida de Confianza:</h3>
            <p>
              Incidentes de seguridad erosionan la confianza de los usuarios y clientes, dañando la imagen de la marca.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Impacto Financiero:</h3>
            <p>
              Costos asociados a la respuesta a incidentes, recuperación de datos, multas regulatorias (por ejemplo, por violación de GDPR/CCPA), pérdida de negocio y aumento de costos de soporte.
            </p>
          </div>
           <div>
            <h3 className="font-semibold text-foreground mb-1">Distribución de Malware / Phishing:</h3>
            <p>
              Un sitio comprometido (ej. vía XSS) puede ser utilizado para redirigir a usuarios a sitios maliciosos o para alojar malware.
            </p>
          </div>
           <div>
            <h3 className="font-semibold text-foreground mb-1">Uso como Plataforma de Ataque:</h3>
            <p>
              Un servidor comprometido puede ser utilizado para lanzar ataques contra otros sistemas.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
