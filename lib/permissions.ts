// lib/permissions.ts


export const userPermissions = {
  USER: [
    'access_dashboard',
    'view_content', 
    'purchase_content',
    'view_profile'
  ],
  ADMIN: [
    'access_dashboard',
    'manage_content',
    'manage_users',
    'view_analytics',
    'system_settings'
  ]
};

export function hasPermission(userRole: string, permission: string): boolean {
  const permissions = userPermissions[userRole as keyof typeof userPermissions];
  return permissions ? permissions.includes(permission) : false;
}