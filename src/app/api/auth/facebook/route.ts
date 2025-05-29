import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Falta accessToken de Facebook" },
        { status: 400 }
      );
    }

    // 1. Obtener perfil de Facebook
    const fbProfileUrl = `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`;
    console.log("Facebook Auth: Verificando token:", fbProfileUrl.replace(accessToken, "[REDACTED]"));

    const fbRes = await fetch(fbProfileUrl);
    const fbData = await fbRes.json();

    if (!fbRes.ok || !fbData || fbData.error || !fbData.email) {
      console.error("Facebook Auth: Error al validar token de Facebook:", fbData?.error);
      return NextResponse.json(
        { error: `Token inválido o sin email: ${fbData?.error?.message || "Desconocido"}` },
        { status: 401 }
      );
    }

    const { id: facebookId, name: fullName, email } = fbData;
    console.log(`Facebook Auth: ID=${facebookId}, Email=${email}, Name=${fullName}`);

    let userId: string | undefined;
    let existingUser = null;

    // 2. Buscar usuario manualmente por email (ya que listUsers no filtra por email)
    const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("Error al listar usuarios:", listError);
    }

    if (usersList) {
      existingUser = usersList.users.find((u) => u.email === email);
      if (existingUser) {
        userId = existingUser.id;
        console.log(`Usuario existente encontrado: ${userId}`);
      }
    }

    // 3. Crear usuario si no existe
    if (!userId) {
      console.log(`Creando usuario nuevo para: ${email}`);
      const { data: newUserResponse, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          name: fullName,
          avatar_url: `https://graph.facebook.com/${facebookId}/picture?type=large`,
          provider_id: facebookId,
          provider: 'facebook',
        },
      });

      if (createError || !newUserResponse?.user?.id) {
        console.error("Error al crear usuario:", createError);
        return NextResponse.json(
          { error: `No se pudo crear el usuario: ${createError?.message}` },
          { status: 500 }
        );
      }

      userId = newUserResponse.user.id;
      console.log(`Nuevo usuario creado: ${userId}`);
    }

    // 4. Retornar respuesta satisfactoria
    return NextResponse.json({
      message: "Autenticación con Facebook procesada correctamente.",
      userId: userId,
    });

  } catch (err: any) {
    console.error("Error crítico:", err);
    return NextResponse.json(
      {
        error: "Error interno del servidor al procesar autenticación con Facebook.",
        details: err.message || String(err),
      },
      { status: 500 }
    );
  }
}
