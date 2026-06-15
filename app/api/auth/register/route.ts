import { NextRequest } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { registerStudentSchema, registerStaffSchema } from '@/lib/schemas';
import { successResponse, errorResponse, handleError, parseRequestBody, ErrorCodes } from '@/lib/utils/api.utils';

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/register - Inscription utilisateur
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody(request);
    
    // Déterminer le type d'inscription (étudiant ou personnel)
    const isStudent = body.niveau && body.filiere;
    const schema = isStudent ? registerStudentSchema : registerStaffSchema;
    
    // Valider les données
    const validatedData = schema.parse(body);

    // Vérifier si l'email ou le matricule existe déjà
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('email, matricule')
      .or(`email.eq.${validatedData.email},matricule.eq.${validatedData.matricule}`)
      .single();

    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        return errorResponse(
          'Cet email est déjà utilisé',
          ErrorCodes.ALREADY_EXISTS,
          409
        );
      }
      if (existingUser.matricule === validatedData.matricule) {
        return errorResponse(
          'Ce matricule est déjà utilisé',
          ErrorCodes.ALREADY_EXISTS,
          409
        );
      }
    }

    // Créer le compte Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true, // Auto-confirmer l'email en dev
    });

    if (authError || !authData.user) {
      return errorResponse(
        'Erreur lors de la création du compte',
        ErrorCodes.CREATE_FAILED,
        500,
        authError?.message
      );
    }

    // Récupérer le rôle étudiant par défaut si c'est un étudiant
    let roleId = validatedData.role_id;
    
    if (isStudent) {
      const { data: studentRole } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('name', 'etudiant')
        .single();
      
      roleId = studentRole?.id;
    }

    // Créer l'utilisateur dans la table users
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        role_id: roleId,
        service_id: validatedData.service_id || null,
        matricule: validatedData.matricule,
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        
        // Données spécifiques étudiant
        ...(isStudent && {
          niveau: validatedData.niveau,
          filiere: validatedData.filiere,
          annee_academique: validatedData.annee_academique || new Date().getFullYear().toString(),
        }),
        
        // Données spécifiques personnel
        ...(!isStudent && {
          fonction: validatedData.fonction,
          specialite: validatedData.specialite || null,
          date_embauche: validatedData.date_embauche || new Date().toISOString().split('T')[0],
        }),
      })
      .select(`
        *,
        role:roles(*),
        service:services(*)
      `)
      .single();

    if (userError || !newUser) {
      // Supprimer le compte Auth si la création de l'utilisateur échoue
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      return errorResponse(
        'Erreur lors de la création du profil utilisateur',
        ErrorCodes.CREATE_FAILED,
        500,
        userError?.message
      );
    }

    // Créer un log d'activité
    await supabaseAdmin
      .from('activity_logs')
      .insert({
        user_id: newUser.id,
        action: 'user_registered',
        entity_type: 'user',
        entity_id: newUser.id,
        description: `Inscription réussie - ${isStudent ? 'Étudiant' : 'Personnel'}`,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
      });

    // Créer une notification de bienvenue
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: newUser.id,
        type: 'welcome',
        title: 'Bienvenue sur IUC Requêtes !',
        message: `Votre compte a été créé avec succès. Vous pouvez maintenant soumettre vos requêtes.`,
      });

    return successResponse(
      {
        user: newUser,
        message: 'Inscription réussie',
      },
      undefined
    );

  } catch (error) {
    return handleError(error);
  }
}
