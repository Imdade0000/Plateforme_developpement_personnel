// auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '../../lib/prisma';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        twoFactorCode: { label: '2FA Code', type: 'text' },
      },
      authorize: async (credentials): Promise<any> => {
        try {
          const { email, password, twoFactorCode } = credentials as {
            email: string;
            password: string;
            twoFactorCode?: string;
          };

          console.log('🔍 Tentative de connexion pour:', email);

          if (!email || !password) {
            console.log('❌ Email ou mot de passe manquant');
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          });

          if (!user) {
            console.log('❌ Utilisateur non trouvé');
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, user.password || '');

          if (!isPasswordValid) {
            console.log('❌ Mot de passe invalide');
            return null;
          }

          console.log('🔐 2FA activée:', user.twoFactorEnabled);

          if (user.twoFactorEnabled) {
            if (!twoFactorCode) {
              console.log('📧 Code 2FA requis - redirection');
              throw new Error('2FA_REQUIRED');
            }

            console.log('🔢 Vérification du code 2FA...');

            const validCode = await prisma.twoFactorCode.findFirst({
              where: {
                email: user.email,
                code: twoFactorCode,
                expiresAt: { gt: new Date() },
              },
            });

            if (!validCode) {
              console.log('❌ Code 2FA invalide ou expiré');
              return null;
            }

            await prisma.twoFactorCode.delete({
              where: { id: validCode.id },
            });

            console.log('✅ Code 2FA validé');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error: any) {
          console.error('❌ Erreur lors de l\'autorisation:', error);
          
          if (error.message === '2FA_REQUIRED') {
            throw error;
          }
          
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      if (trigger === 'update' && session) {
        token.name = session.user.name;
        token.email = session.user.email;
        token.picture = session.user.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/dashboard`;
      } else if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
    // SUPPRIMER signUp qui n'existe pas
    error: '/auth/error',
  },
  events: {
    async signIn({ user }) {
      console.log('✅ Connexion réussie pour:', user.email);
    },
    async signOut({ token }) {
      console.log('🚪 Déconnexion de:', token.email);
    },
  },
  debug: process.env.NODE_ENV === 'development',
});