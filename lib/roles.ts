// lib/roles.ts
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export const permissions = {
  [UserRole.USER]: [
    'access_dashboard',
    'view_courses',
    'enroll_courses',
    'view_profile'
  ],
  [UserRole.ADMIN]: [
    '*', // Tout accès
    'manage_users',
    'manage_courses',
    'view_analytics',
    'system_settings'
  ]
};

// Vérificateur de permission
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const userPermissions = permissions[userRole];
  return userPermissions.includes('*') || userPermissions.includes(permission);
}