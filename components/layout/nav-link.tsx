// components/nav-link.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** Optional icon rendered before the children */
  icon?: React.ReactNode;
  /** Variant for special styling, e.g. 'accent' */
  variant?: 'accent' | 'default' | string;
}

export function NavLink({ href, children, className = '', icon, variant = 'default' }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const base = `block px-4 py-2 rounded-lg transition-colors ${
    isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
  } ${className}`;

  // Variant overrides (keep simple and non-breaking)
  const variantClass =
    variant === 'accent' || variant === 'premium'
      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm'
      : '';

  return (
    <Link href={href} className={`${base} ${variantClass}`}>
      <div className="flex items-center space-x-3">
        {icon ? (
          <span className="flex items-center justify-center w-5 h-5 text-current">{icon}</span>
        ) : null}
        <span className="truncate">{children}</span>
      </div>
    </Link>
  );
}