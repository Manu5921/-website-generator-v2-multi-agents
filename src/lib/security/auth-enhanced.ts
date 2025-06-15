import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { rbacManager, User } from './rbac';

// Rate limiting store (in production, use Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

// Session management
const activeSessions = new Map<string, { userId: string; ip: string; userAgent: string; createdAt: Date }>();

export interface AuthenticatedUser extends User {
  sessionId: string;
}

export class AuthManager {
  private static instance: AuthManager;
  
  // Security configuration
  private readonly maxLoginAttempts = 5;
  private readonly lockoutDuration = 15 * 60 * 1000; // 15 minutes
  private readonly sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
  private readonly maxActiveSessions = 3;

  private constructor() {}

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  /**
   * Check if IP is rate limited
   */
  public isRateLimited(ip: string): boolean {
    const attempts = loginAttempts.get(ip);
    if (!attempts) return false;

    const timeDiff = Date.now() - attempts.lastAttempt.getTime();
    
    // Reset attempts after lockout duration
    if (timeDiff > this.lockoutDuration) {
      loginAttempts.delete(ip);
      return false;
    }

    return attempts.count >= this.maxLoginAttempts;
  }

  /**
   * Record login attempt
   */
  public recordLoginAttempt(ip: string, success: boolean): void {
    const current = loginAttempts.get(ip) || { count: 0, lastAttempt: new Date() };
    
    if (success) {
      // Reset on successful login
      loginAttempts.delete(ip);
    } else {
      // Increment failed attempts
      current.count += 1;
      current.lastAttempt = new Date();
      loginAttempts.set(ip, current);
    }
  }

  /**
   * Validate password strength
   */
  public validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Hash password with salt
   */
  public async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password
   */
  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Create secure session
   */
  public createSession(userId: string, ip: string, userAgent: string): string {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    
    // Check max sessions per user
    const userSessions = Array.from(activeSessions.entries())
      .filter(([_, session]) => session.userId === userId);
    
    if (userSessions.length >= this.maxActiveSessions) {
      // Remove oldest session
      const oldestSession = userSessions
        .sort((a, b) => a[1].createdAt.getTime() - b[1].createdAt.getTime())[0];
      activeSessions.delete(oldestSession[0]);
    }

    activeSessions.set(sessionId, {
      userId,
      ip,
      userAgent,
      createdAt: new Date()
    });

    return sessionId;
  }

  /**
   * Validate session
   */
  public validateSession(sessionId: string): boolean {
    const session = activeSessions.get(sessionId);
    if (!session) return false;

    // Check session timeout
    const age = Date.now() - session.createdAt.getTime();
    if (age > this.sessionTimeout) {
      activeSessions.delete(sessionId);
      return false;
    }

    return true;
  }

  /**
   * Revoke session
   */
  public revokeSession(sessionId: string): void {
    activeSessions.delete(sessionId);
  }

  /**
   * Get active sessions for user
   */
  public getUserSessions(userId: string): Array<{ sessionId: string; ip: string; userAgent: string; createdAt: Date }> {
    return Array.from(activeSessions.entries())
      .filter(([_, session]) => session.userId === userId)
      .map(([sessionId, session]) => ({ sessionId, ...session }));
  }

  /**
   * Clean expired sessions
   */
  public cleanExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of activeSessions.entries()) {
      const age = now - session.createdAt.getTime();
      if (age > this.sessionTimeout) {
        activeSessions.delete(sessionId);
      }
    }
  }

  /**
   * Authenticate user credentials
   */
  public async authenticateUser(email: string, password: string, ip: string): Promise<AuthenticatedUser | null> {
    try {
      // Check rate limiting
      if (this.isRateLimited(ip)) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      // Mock user lookup (replace with actual database query)
      const mockUsers: User[] = [
        {
          id: 'admin_001',
          email: 'admin@webgen.com',
          name: 'Admin User',
          roles: ['admin'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'manager_001',
          email: 'manager@webgen.com',
          name: 'Manager User',
          roles: ['manager'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const user = mockUsers.find(u => u.email === email && u.isActive);
      if (!user) {
        this.recordLoginAttempt(ip, false);
        return null;
      }

      // Mock password verification (replace with actual hash comparison)
      const mockPasswordHash = await this.hashPassword('SecurePass123!');
      const isValidPassword = await this.verifyPassword(password, mockPasswordHash);
      
      if (!isValidPassword) {
        this.recordLoginAttempt(ip, false);
        await rbacManager.createAuditLog(
          user.id,
          'login_failed',
          'auth',
          false,
          ip,
          '',
          undefined,
          'Invalid password'
        );
        return null;
      }

      // Create session
      const sessionId = this.createSession(user.id, ip, '');
      
      // Record successful login
      this.recordLoginAttempt(ip, true);
      await rbacManager.createAuditLog(
        user.id,
        'login_success',
        'auth',
        true,
        ip,
        ''
      );

      return {
        ...user,
        sessionId,
        lastLogin: new Date()
      };

    } catch (error) {
      console.error('Authentication error:', error);
      this.recordLoginAttempt(ip, false);
      return null;
    }
  }

  /**
   * Generate secure token
   */
  public generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Enhanced NextAuth configuration
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const authManager = AuthManager.getInstance();
        const ip = req.headers?.['x-forwarded-for'] as string || 
                  req.headers?.['x-real-ip'] as string || 
                  'unknown';

        const user = await authManager.authenticateUser(
          credentials.email,
          credentials.password,
          ip
        );

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles,
            sessionId: user.sessionId
          };
        }

        return null;
      }
    })
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.sessionId = user.sessionId;
      }
      return token;
    },

    async session({ session, token }: { session: any; token: JWT }) {
      if (token) {
        session.user.id = token.id;
        session.user.roles = token.roles;
        session.user.sessionId = token.sessionId;
      }
      return session;
    }
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },

  events: {
    async signOut({ token }) {
      const authManager = AuthManager.getInstance();
      if (token.sessionId) {
        authManager.revokeSession(token.sessionId as string);
      }
    }
  }
};

// Export singleton instance
export const authManager = AuthManager.getInstance();

// Schedule session cleanup
if (typeof window === 'undefined') {
  setInterval(() => {
    authManager.cleanExpiredSessions();
  }, 60 * 60 * 1000); // Every hour
}