/**
 * 🔐 CONFIGURATION NEXTAUTH
 * Configuration de l'authentification admin
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { utilisateursAdmin } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Rechercher l'utilisateur admin
          const [admin] = await db
            .select()
            .from(utilisateursAdmin)
            .where(eq(utilisateursAdmin.email, credentials.email))
            .limit(1);

          if (!admin) {
            console.log('❌ Admin non trouvé:', credentials.email);
            return null;
          }

          // Vérifier le mot de passe
          const isValidPassword = await bcrypt.compare(credentials.password, admin.motDePasse);
          
          if (!isValidPassword) {
            console.log('❌ Mot de passe invalide pour:', credentials.email);
            return null;
          }

          // Mettre à jour la date de dernière connexion
          await db
            .update(utilisateursAdmin)
            .set({ dernierLogin: new Date() })
            .where(eq(utilisateursAdmin.id, admin.id));

          console.log('✅ Connexion admin réussie:', credentials.email);

          return {
            id: admin.id,
            email: admin.email,
            name: admin.nom,
            role: admin.role
          };
        } catch (error) {
          console.error('❌ Erreur authentification:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 heures
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};