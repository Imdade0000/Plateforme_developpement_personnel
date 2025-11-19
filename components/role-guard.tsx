// components/role-guard.tsx
interface RoleGuardProps {
  userRole: string;
  allowedRoles: string[];
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