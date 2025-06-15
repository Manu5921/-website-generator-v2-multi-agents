import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { utilisateursAdmin } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const authConfig: NextAuthConfig = {
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
          // Chercher l'utilisateur admin dans la DB
          const [admin] = await db
            .select()
            .from(utilisateursAdmin)
            .where(eq(utilisateursAdmin.email, credentials.email as string))
            .limit(1);

          if (!admin) {
            return null;
          }

          // Vérifier le mot de passe
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            admin.motDePasse || ''
          );

          if (!isPasswordValid) {
            return null;
          }

          // Mettre à jour la date de dernier login
          await db
            .update(utilisateursAdmin)
            .set({ dernierLogin: new Date() })
            .where(eq(utilisateursAdmin.id, admin.id));

          return {
            id: admin.id,
            email: admin.email,
            name: admin.nom,
            role: admin.role,
          };
        } catch (error) {
          console.error('Erreur authentification:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};