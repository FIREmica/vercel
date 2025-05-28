import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin'; // Using the admin client
// import type { Database } from '@/types/supabase'; // If you have specific DB types

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ error: "Falta accessToken de Facebook" }, { status: 400 });
    }

    // 1. Obtener datos del perfil desde Facebook usando el accessToken
    const fbProfileUrl = `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`;
    console.log("Facebook Auth: Verificando token con URL:", fbProfileUrl.replace(accessToken, "[ACCESS_TOKEN_REDACTED]"));
    
    const fbRes = await fetch(fbProfileUrl);
    const fbData = await fbRes.json();

    if (!fbRes.ok || !fbData || fbData.error || !fbData.email) {
      console.error("Facebook Auth: Error al validar el token de Facebook o obtener email:", fbData?.error);
      return NextResponse.json({ error: `Error al validar el token de Facebook: ${fbData?.error?.message || "Email no devuelto por Facebook o token inválido."}` }, { status: 401 });
    }

    const { id: facebookId, name: fullName, email } = fbData;
    console.log(`Facebook Auth: Datos de Facebook obtenidos: ID=${facebookId}, Email=${email}, Name=${fullName}`);

    // 2. Buscar usuario en Supabase por email
    // Supabase admin client's listUsers can be used, then filter.
    // Or, you might have a direct table query on user_profiles if you store facebook_id there.
    
    let userId: string | undefined;
    let existingUser = null;

    const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers({ email: email, page: 1, perPage: 1});
    
    if (listError) {
        console.error("Facebook Auth: Error al buscar usuario por email en Supabase (listUsers):", listError);
        // Decide if this is a critical error or if you should proceed to create
    }

    if (usersList && usersList.users.length > 0) {
        existingUser = usersList.users.find(u => u.email === email); // Double check email match
        if (existingUser) {
            userId = existingUser.id;
            console.log(`Facebook Auth: Usuario existente encontrado en Supabase por email: ${email}, ID: ${userId}`);
            // TODO: Consider updating user_metadata if facebook_id or avatar_url changed.
            // Example:
            // if (existingUser.user_metadata?.facebook_id !== facebookId || existingUser.user_metadata?.avatar_url !== `https://graph.facebook.com/${facebookId}/picture?type=large`) {
            //   const { error: updateMetaError } = await supabaseAdmin.auth.admin.updateUserById(
            //     userId,
            //     { user_metadata: { ...existingUser.user_metadata, facebook_id: facebookId, avatar_url: `https://graph.facebook.com/${facebookId}/picture?type=large`, name: fullName } }
            //   );
            //   if (updateMetaError) console.error("Facebook Auth: Error al actualizar metadatos del usuario existente:", updateMetaError);
            // }
        }
    }


    if (!userId) {
      console.log(`Facebook Auth: Usuario no encontrado por email ${email}. Creando nuevo usuario en Supabase...`);
      // 3. Crear usuario si no existe
      const { data: newUserResponse, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true, // O false si no quieres confirmación, pero true es más seguro.
                             // Si es true, el usuario necesitará confirmar su email antes de que la sesión completa funcione,
                             // a menos que lo marques como email_confirmed = true también.
        user_metadata: {
          full_name: fullName, // Asegúrate que tu trigger handle_new_user use 'full_name'
          name: fullName, // 'name' es a veces usado por Supabase UI
          avatar_url: `https://graph.facebook.com/${facebookId}/picture?type=large`,
          provider_id: facebookId, // Store Facebook ID
          provider: 'facebook',
        },
        // app_metadata: { provider: 'facebook', providers: ['facebook'] } // Opcional
      });

      if (createError || !newUserResponse?.user?.id) {
        console.error("Facebook Auth: No se pudo crear el usuario en Supabase:", createError);
        return NextResponse.json({ error: `No se pudo crear el usuario: ${createError?.message}` }, { status: 500 });
      }
      userId = newUserResponse.user.id;
      console.log(`Facebook Auth: Nuevo usuario creado en Supabase: ID=${userId}, Email=${email}. El trigger 'handle_new_user' DEBERÍA crear la entrada en 'user_profiles'.`);
    }

    // 4. Generar una sesión para el usuario (o indicar al cliente que la refresque)
    // Con Supabase, si el usuario está correctamente creado/identificado en auth.users,
    // el cliente Supabase en el frontend, al llamar a supabase.auth.getSession() o
    // supabase.auth.refreshSession() después de esta respuesta exitosa, debería
    // poder establecer la sesión.
    // Devolver el userId es una señal para el cliente.

    return NextResponse.json({ 
      message: "Autenticación con Facebook procesada por el backend.", 
      userId: userId,
      // Podrías considerar devolver un token de sesión personalizado si fuera necesario,
      // pero usualmente se prefiere que el cliente Supabase maneje la sesión.
    });

  } catch (err: any) {
    console.error("Error crítico en /api/auth/facebook:", err);
    return NextResponse.json({ error: "Error interno del servidor al procesar autenticación con Facebook.", details: err