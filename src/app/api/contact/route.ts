// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define un esquema para validar los datos del formulario
const ContactFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, ingrese un correo electrónico válido." }),
  company: z.string().optional(),
  message: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres." }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = ContactFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Datos de entrada inválidos.", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, company, message } = validation.data;

    // --- INICIO: LÓGICA DE ENVÍO DE CORREO (NECESITA IMPLEMENTACIÓN) ---
    // Aquí es donde integrarías tu servicio de envío de correos.
    // Por ejemplo, usando Nodemailer, SendGrid, Resend, etc.

    console.log("API /api/contact: Datos del formulario recibidos (simulación de envío):");
    console.log("Nombre:", name);
    console.log("Email:", email);
    console.log("Empresa:", company || "No especificada");
    console.log("Mensaje:", message);

    // EJEMPLO CONCEPTUAL CON NODEMAILER (NO FUNCIONAL SIN CONFIGURACIÓN)
    /*
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail', // o tu proveedor SMTP
      auth: {
        user: process.env.EMAIL_USER, // Configura estas variables de entorno
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: email, // O una dirección "no-reply" de tu dominio
      to: 'akuma_g1@hotmail.com', // Tu dirección de destino
      subject: `Nuevo mensaje de contacto de: ${name} ${company ? `(${company})` : ''}`,
      text: `Has recibido un nuevo mensaje de contacto:\n\nNombre: ${name}\nEmail: ${email}\nEmpresa: ${company || 'N/A'}\n\nMensaje:\n${message}`,
      replyTo: email
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("API /api/contact: Correo (simulado) enviado exitosamente.");
      return NextResponse.json({ message: "Mensaje enviado exitosamente." });
    } catch (emailError) {
      console.error("API /api/contact: Error al enviar correo (simulado):", emailError);
      return NextResponse.json({ error: "Error interno del servidor al intentar enviar el mensaje." }, { status: 500 });
    }
    */
    // --- FIN: LÓGICA DE ENVÍO DE CORREO ---

    // Por ahora, devolvemos un éxito simulado ya que la lógica de envío real no está implementada.
    return NextResponse.json({ message: "Mensaje recibido por el servidor (simulación). Necesita configurar el envío de correo." });

  } catch (error) {
    console.error("API /api/contact: Error procesando la solicitud:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
