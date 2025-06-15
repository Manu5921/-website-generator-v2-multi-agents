import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Middleware qui s'exécute après l'authentification
    return;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Pages publiques - pas besoin d'authentification
        const publicPaths = [
          '/demande-publique',
          '/api/demandes',
          '/api/webhooks',
          '/api/stripe',
          '/api/health',
          '/api/system',
          '/showcase',
          '/demo',
          '/test-showcase',
          '/test-images',
          '/test-dashboard'
        ];
        
        // Vérifier si le path est public
        if (publicPaths.some(path => pathname.startsWith(path))) {
          return true; // Autoriser l'accès sans authentification
        }
        
        // Pour toutes les autres pages, vérifier l'authentification
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};