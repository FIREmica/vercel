
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Code, DatabaseZap, ShieldEllipsis, TrendingDown, UserCog, ServerCog, Network, Database, Gamepad2 } from "lucide-react";

export function HackingInfoSection() {
  return (
    <section className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-amber-600">
            <AlertTriangle className="h-6 w-6" />
            Posibles Modus Operandi (Vulnerabilidades Comunes)
          </CardTitle>
          <CardDescription>
            Esta sección describe conceptos generales de vulnerabilidades y ataques. Los análisis específicos de esta herramienta se basan en la información que usted proporciona.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          {/* Web Application Vulnerabilities */}
          <div>
            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-1"><UserCog className="inline-block h-4 w-4"/> Ataques a la Lógica de Autenticación y Cuentas (Web):</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Fuerza Bruta / Credential Stuffing:</strong> Intentos repetidos de contraseñas o uso de credenciales filtradas.</li>
                <li><strong>Enumeración + Password Spraying:</strong> Identificar usuarios válidos y probar contraseñas comunes.</li>
                <li><strong>Explotación de CAPTCHA/Rate Limit Débil:</strong> Automatizar ataques si la protección es inadecuada.</li>
            </ul>
          </div>
          <hr className="border-border my-4"/>
          <div>
            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-1"><Code className="inline-block h-4 w-4"/> Cross-Site Scripting (XSS) (Web):</h3>
            <p>Inyección de scripts maliciosos en páginas web. En un formulario de registro, podría ocurrir si los datos no se sanitizan antes de mostrarse.</p>
          </div>
          <hr className="border-border my-4"/>
          <div>
            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-1"><DatabaseZap className="inline-block h-4 w-4"/> SQL Injection (SQLi) (Web/DB):</h3>
            <p>Inserción de código SQL malicioso en entradas para manipular consultas a la base de datos.</p>
          </div>
           <hr className="border-border my-4"/>

          {/* Server Vulnerabilities */}
          <div>
            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-1"><ServerCog className="inline-block h-4 w-4"/> Vulnerabilidades de Servidor (General):</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Software Desactualizado:</strong> Explotación de vulnerabilidades conocidas en el SO, servidor web, o aplicaciones.</li>
                <li><strong>Servicios Inseguros Expuestos:</strong> Puertos abiertos innecesarios (ej. Telnet, FTP sin cifrar, RDP a internet).</li>
                <li><strong>Configuraciones por Defecto o Débiles:</strong> Credenciales por defecto no cambiadas, listado de directorios habilitado.</li>
                <li><strong>Escalada de Privilegios:</strong> Un atacante con acceso limitado explota una falla para obtener mayores permisos.</li>
                 <li><strong>Missing Security Patches:</strong> Falta de aplicación regular de parches de seguridad.</li>
            </ul>
          </div>
          <hr className="border-border my-4"/>

          {/* Game Server Vulnerabilities */}
          <div>
            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-1"><Gamepad2 className="inline-block h-4 w-4"/> Vulnerabilidades Específicas de Servidores de Juegos:</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Explotación de Vulnerabilidades del Motor del Juego:</strong> Fallos en el software del servidor del juego (ej. Unreal Engine, Unity, motores propietarios).</li>
                <li><strong>Manipulación de Paquetes de Red:</strong> Interceptar y modificar datos enviados entre el cliente y el servidor para hacer trampas (ej. speed hacks, teleport).</li>
                <li><strong>Ataques de Denegación de Servicio (DDoS):</strong> Inundar el servidor con tráfico para hacerlo inaccesible a jugadores legítimos.</li>
                <li><strong>Explotación de Lógica del Juego:</strong> Encontrar fallos en la lógica del juego para obtener ventajas injustas (ej. duplicación de ítems, atravesar paredes).</li>
                <li><strong>Vulnerabilidades de Anti-Cheat:</strong> Bypassear o deshabilitar sistemas anti-trampas.</li>
                <li><strong>Comandos de Consola/Administración Expuestos:</strong> Acceso no autorizado a comandos de administración del servidor.</li>
            </ul>
          </div>
           <hr className="border-border my-4"/>

          {/* Database Vulnerabilities */}
          <div>
            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-1"><Database className="inline-block h-4 w-4"/> Vulnerabilidades de Base de Datos (Incluyendo Juegos):</h3>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>Autenticación Débil:</strong> Contraseñas fáciles de adivinar, sin MFA, cuentas compartidas.</li>
                <li><strong>Privilegios Excesivos:</strong> Cuentas de aplicación con permisos de administrador de BD.</li>
                <li><strong>Inyección de Comandos (No solo SQLi):</strong> Para NoSQL, OS command injection si la BD interactúa con el sistema. Específico para juegos: manipulación de datos de jugador, inventarios, monedas.</li>
                <li><strong>Falta de Cifrado:</strong> Datos sensibles (credenciales de jugador, detalles de pago, inventarios) no cifrados en reposo o en tránsito.</li>
                <li><strong>Backups Inseguros:</strong> Backups no cifrados, almacenados incorrectamente o accesibles.</li>
                 <li><strong>Auditoría y Logging Insuficientes:</strong> Dificultad para detectar o investigar trampas, robo de cuentas o manipulación de economía del juego.</li>
            </ul>
          </div>
           <hr className="border-border my-4"/>

          <div>
            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-1"><ShieldEllipsis className="inline-block h-4 w-4"/> Otras Vulnerabilidades Relevantes (General):</h3>
             <ul className="list-disc pl-5 space-y-1">
                <li><strong>Políticas de Contraseña Débiles.</strong></li>
                <li><strong>Falta de Validación de Entrada exhaustiva.</strong></li>
                <li><strong>Configuraciones Inseguras en cualquier capa.</strong></li>
                <li><strong>Control de Acceso Roto:</strong> Acceso a funciones o datos sin permiso.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-destructive">
            <TrendingDown className="h-6 w-6" />
            Repercusiones Generales del Hackeo (Incluyendo Servidores de Juegos)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <div><h3 className="font-semibold text-foreground mb-1">Pérdida o Robo de Datos:</h3><p>Exposición de información sensible (credenciales, PII, datos financieros, propiedad intelectual, datos de jugadores, cuentas de juego).</p></div>
          <div><h3 className="font-semibold text-foreground mb-1">Toma de Control de Cuentas (ATO):</h3><p>Acceso no autorizado a cuentas de usuarios, administradores o cuentas de jugadores con ítems/progreso valioso.</p></div>
          <div><h3 className="font-semibold text-foreground mb-1">Interrupción del Servicio / Denegación de Servicio (DoS/DDoS):</h3><p>Sistemas o servicios (incluyendo servidores de juego) dejan de estar disponibles.</p></div>
          <div><h3 className="font-semibold text-foreground mb-1">Ransomware:</h3><p>Cifrado de datos y sistemas, exigiendo un rescate para su recuperación.</p></div>
          <div><h3 className="font-semibold text-foreground mb-1">Daño Reputacional y Pérdida de Confianza:</h3><p>Erosión de la confianza de clientes y jugadores, llevando a la pérdida de base de usuarios.</p></div>
          <div><h3 className="font-semibold text-foreground mb-1">Impacto Financiero:</h3><p>Costos de respuesta, recuperación, multas, pérdida de negocio, litigios, pérdida de ingresos por ventas de ítems virtuales o suscripciones.</p></div>
          <div><h3 className="font-semibold text-foreground mb-1">Trampas y Desbalance del Juego:</h3><p>En servidores de juegos, el hackeo puede llevar a trampas masivas, arruinando la experiencia para jugadores legítimos y dañando la economía del juego.</p></div>
          <div><h3 className="font-semibold text-foreground mb-1">Distribución de Malware / Phishing:</h3><p>Uso de sistemas comprometidos para atacar a otros, o engañar a jugadores para que descarguen malware.</p></div>
          <div><h3 className="font-semibold text-foreground mb-1">Uso como Plataforma de Ataque (Pivoting):</h3><p>Un servidor comprometido se usa para lanzar ataques a otros sistemas internos o externos.</p></div>
           <div><h3 className="font-semibold text-foreground mb-1">Espionaje Corporativo o Gubernamental:</h3><p>Robo de secretos comerciales, información clasificada o inteligencia.</p></div>
        </CardContent>
      </Card>
    </section>
  );
}

