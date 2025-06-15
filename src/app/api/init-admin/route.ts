import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { utilisateursAdmin } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Vérifier qu'on est en mode développement
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Endpoint disponible uniquement en développement' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email = 'admin@website-generator.com', password = 'admin123', nom = 'Administrateur' } = body;

    console.log('🔧 Initialisation admin via API...');

    // Vérifier si l'admin existe déjà
    const [existingAdmin] = await db
      .select()
      .from(utilisateursAdmin)
      .where(eq(utilisateursAdmin.email, email))
      .limit(1);

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin déjà existant',
        admin: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          nom: existingAdmin.nom,
          dernierLogin: existingAdmin.dernierLogin
        }
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'admin
    const [nouvelAdmin] = await db
      .insert(utilisateursAdmin)
      .values({
        email,
        nom,
        motDePasse: hashedPassword,
        role: 'admin'
      })
      .returning();

    console.log('✅ Admin créé:', {
      id: nouvelAdmin.id,
      email: nouvelAdmin.email
    });

    return NextResponse.json({
      success: true,
      message: 'Utilisateur admin créé avec succès',
      admin: {
        id: nouvelAdmin.id,
        email: nouvelAdmin.email,
        nom: nouvelAdmin.nom
      },
      credentials: {
        email,
        password // En développement seulement !
      }
    });

  } catch (error) {
    console.error('❌ Erreur création admin:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur création admin',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}