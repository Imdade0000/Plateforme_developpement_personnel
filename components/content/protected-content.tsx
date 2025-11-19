// components/protected-content.tsx
import { hasPermission } from "../../lib/permissions";

interface ProtectedContentProps {
  userRole: string;
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export async function ProtectedContent({ 
  userRole, 
  permission, 
  children, 
  fallback = null 
}: ProtectedContentProps) {
  const hasAccess = hasPermission(userRole, permission);

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
}