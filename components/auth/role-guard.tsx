// components/auth/role-guard.tsx
'use client';

import { UserRole } from "../../lib/roles";

interface RoleGuardProps {
  userRole: UserRole;
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ 
  userRole, 
  allowedRoles, 
  children,
  fallback = <div>Accès non autorisé</div>
}: RoleGuardProps) {
  if (!allowedRoles.includes(userRole)) {
    return fallback;
  }

  return <>{children}</>;
}

// Utilisation :
// <RoleGuard userRole={user.role} allowedRoles={[UserRole.ADMIN]}>
//   <AdminPanel />
// </RoleGuard>