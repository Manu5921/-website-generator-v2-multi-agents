// Role-Based Access Control (RBAC) System

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  ip: string;
  userAgent: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// Predefined permissions
export const PERMISSIONS: Permission[] = [
  // Dashboard permissions
  {
    id: 'dashboard:read',
    name: 'View Dashboard',
    resource: 'dashboard',
    action: 'read',
    description: 'View dashboard statistics and metrics'
  },
  {
    id: 'dashboard:write',
    name: 'Manage Dashboard',
    resource: 'dashboard',
    action: 'write',
    description: 'Modify dashboard settings and configurations'
  },
  
  // Demandes permissions
  {
    id: 'demandes:read',
    name: 'View Demandes',
    resource: 'demandes',
    action: 'read',
    description: 'View website generation requests'
  },
  {
    id: 'demandes:write',
    name: 'Manage Demandes',
    resource: 'demandes',
    action: 'write',
    description: 'Create, update, and delete website requests'
  },
  {
    id: 'demandes:generate',
    name: 'Generate Websites',
    resource: 'demandes',
    action: 'generate',
    description: 'Trigger website generation process'
  },
  
  // Sites permissions
  {
    id: 'sites:read',
    name: 'View Sites',
    resource: 'sites',
    action: 'read',
    description: 'View generated websites'
  },
  {
    id: 'sites:write',
    name: 'Manage Sites',
    resource: 'sites',
    action: 'write',
    description: 'Create, update, and delete websites'
  },
  {
    id: 'sites:deploy',
    name: 'Deploy Sites',
    resource: 'sites',
    action: 'deploy',
    description: 'Deploy websites to production'
  },
  
  // Analytics permissions
  {
    id: 'analytics:read',
    name: 'View Analytics',
    resource: 'analytics',
    action: 'read',
    description: 'View analytics and performance metrics'
  },
  
  // Users permissions
  {
    id: 'users:read',
    name: 'View Users',
    resource: 'users',
    action: 'read',
    description: 'View user accounts and profiles'
  },
  {
    id: 'users:write',
    name: 'Manage Users',
    resource: 'users',
    action: 'write',
    description: 'Create, update, and delete user accounts'
  },
  
  // System permissions
  {
    id: 'system:admin',
    name: 'System Administration',
    resource: 'system',
    action: 'admin',
    description: 'Full system administration access'
  },
  {
    id: 'system:audit',
    name: 'View Audit Logs',
    resource: 'system',
    action: 'audit',
    description: 'View system audit logs and security events'
  }
];

// Predefined roles
export const ROLES: Omit<Role, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: PERMISSIONS.map(p => p.id),
    isActive: true
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Manage website requests and view analytics',
    permissions: [
      'dashboard:read',
      'demandes:read',
      'demandes:write',
      'demandes:generate',
      'sites:read',
      'sites:write',
      'analytics:read'
    ],
    isActive: true
  },
  {
    id: 'operator',
    name: 'Operator',
    description: 'Process website requests and basic dashboard access',
    permissions: [
      'dashboard:read',
      'demandes:read',
      'demandes:generate',
      'sites:read'
    ],
    isActive: true
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to dashboard and sites',
    permissions: [
      'dashboard:read',
      'demandes:read',
      'sites:read'
    ],
    isActive: true
  }
];

export class RBACManager {
  private static instance: RBACManager;

  private constructor() {}

  public static getInstance(): RBACManager {
    if (!RBACManager.instance) {
      RBACManager.instance = new RBACManager();
    }
    return RBACManager.instance;
  }

  /**
   * Check if a user has a specific permission
   */
  public hasPermission(user: User, permissionId: string): boolean {
    if (!user.isActive) return false;

    // Get user roles
    const userRoles = ROLES.filter(role => 
      role.isActive && user.roles.includes(role.id)
    );

    // Check if any role has the required permission
    return userRoles.some(role => 
      role.permissions.includes(permissionId)
    );
  }

  /**
   * Check if a user has any of the specified permissions
   */
  public hasAnyPermission(user: User, permissionIds: string[]): boolean {
    return permissionIds.some(permissionId => 
      this.hasPermission(user, permissionId)
    );
  }

  /**
   * Check if a user has all of the specified permissions
   */
  public hasAllPermissions(user: User, permissionIds: string[]): boolean {
    return permissionIds.every(permissionId => 
      this.hasPermission(user, permissionId)
    );
  }

  /**
   * Get all permissions for a user
   */
  public getUserPermissions(user: User): Permission[] {
    if (!user.isActive) return [];

    const userRoles = ROLES.filter(role => 
      role.isActive && user.roles.includes(role.id)
    );

    const permissionIds = new Set<string>();
    userRoles.forEach(role => {
      role.permissions.forEach(permissionId => {
        permissionIds.add(permissionId);
      });
    });

    return PERMISSIONS.filter(permission => 
      permissionIds.has(permission.id)
    );
  }

  /**
   * Get user roles
   */
  public getUserRoles(user: User): Role[] {
    return ROLES.filter(role => 
      role.isActive && user.roles.includes(role.id)
    ).map(role => ({
      ...role,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  /**
   * Validate permission against resource and action
   */
  public canAccess(user: User, resource: string, action: string): boolean {
    const permissionId = `${resource}:${action}`;
    return this.hasPermission(user, permissionId);
  }

  /**
   * Create audit log entry
   */
  public async createAuditLog(
    userId: string,
    action: string,
    resource: string,
    success: boolean,
    ip: string,
    userAgent: string,
    resourceId?: string,
    error?: string,
    metadata?: Record<string, any>
  ): Promise<AuditLog> {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      resource,
      resourceId,
      ip,
      userAgent,
      success,
      error,
      metadata,
      timestamp: new Date()
    };

    // In a real implementation, save to database
    console.log('Audit Log Created:', auditLog);
    
    return auditLog;
  }

  /**
   * Get audit logs for a user
   */
  public async getAuditLogs(
    userId?: string,
    resource?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100
  ): Promise<AuditLog[]> {
    // In a real implementation, query from database
    // For now, return empty array
    return [];
  }

  /**
   * Security middleware for API routes
   */
  public createSecurityMiddleware(requiredPermissions: string[]) {
    return async (req: any, res: any, next: any) => {
      try {
        // Extract user from request (from auth middleware)
        const user = req.user as User;
        if (!user) {
          return res.status(401).json({ 
            success: false, 
            error: 'Authentication required' 
          });
        }

        // Check permissions
        const hasPermission = this.hasAllPermissions(user, requiredPermissions);
        if (!hasPermission) {
          // Log unauthorized access attempt
          await this.createAuditLog(
            user.id,
            'unauthorized_access',
            req.path,
            false,
            req.ip,
            req.get('User-Agent') || '',
            undefined,
            `Missing permissions: ${requiredPermissions.join(', ')}`
          );

          return res.status(403).json({ 
            success: false, 
            error: 'Insufficient permissions' 
          });
        }

        // Log successful access
        await this.createAuditLog(
          user.id,
          req.method.toLowerCase(),
          req.path,
          true,
          req.ip,
          req.get('User-Agent') || ''
        );

        next();
      } catch (error) {
        console.error('Security middleware error:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Internal security error' 
        });
      }
    };
  }
}

// Export singleton instance
export const rbacManager = RBACManager.getInstance();