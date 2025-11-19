// components/sidebar.tsx
'use client';
import { useState } from 'react';
import { NavLink } from './nav-link';
import { UserRole } from '../../lib/roles';

interface SidebarProps {
  user: {
    role: UserRole | string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrateur';
      default:
        return 'Utilisateur';
    }
  };

  // Desktop nav (visible on md+)
  const desktopNav = (
    <nav className="hidden md:block w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 shadow-2xl border-r border-gray-700">
      {/* User info avec avatar */}
      <div className="mb-8 p-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-lg border border-gray-600">
        <div className="flex items-center space-x-4">
          {user?.image ? (
            <img 
              src={user.image} 
              alt={user.name || 'Utilisateur'}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-600"
            />
          ) : (
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg border-2 border-gray-600">
              {getUserInitials()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg truncate">{user.name || 'Utilisateur'}</p>
            <p className="text-gray-300 text-sm truncate">{user.email}</p>
            <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r ${getRoleColor(user.role)} rounded-full text-white shadow-sm`}>
              {getRoleLabel(user.role)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation principale */}
      <div className="space-y-1">
        <NavLink href="/dashboard" icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        }>
          Tableau de Bord
        </NavLink>
        
        <NavLink href="/dashboard/courses" icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }>
          Mes Cours
        </NavLink>
        
        <NavLink href="/dashboard/content" icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }>
          Mon Contenu
        </NavLink>
        
        <NavLink href="/dashboard/purchases" icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        }>
          Mes Achats
        </NavLink>
        
        <NavLink href="/dashboard/profile" icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }>
          Mon Profil
        </NavLink>
        
        {/* Section Admin */}
        {user.role === UserRole.ADMIN && (
          <div className="pt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Administration
                </span>
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <NavLink href="/admin/dashboard" icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              } variant="premium">
                Tableau Admin
              </NavLink>
              <NavLink href="/admin/users" icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              }>
                Gestion Utilisateurs
              </NavLink>
              <NavLink href="/admin/content" icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }>
                Analytics
              </NavLink>
            </div>
          </div>
        )}
        </div>

      {/* Statistiques rapides */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-gray-700/50 backdrop-blur-sm rounded-xl p-4 border border-gray-600">
          <div className="flex justify-between items-center text-xs">
            <div className="text-center">
              <div className="text-white font-bold">12</div>
              <div className="text-gray-400">Cours</div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold">45h</div>
              <div className="text-gray-400">Visionnage</div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold">98%</div>
              <div className="text-gray-400">Progression</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );

  // Mobile nav drawer content (re-uses the same structure but as a fixed drawer)
  const mobileNav = (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 shadow-2xl border-r border-gray-700 transition-transform ${open ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
      {/* Duplicate of the content inside desktop nav for mobile drawer */}
      <div className="mb-8 p-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-lg border border-gray-600">
        <div className="flex items-center space-x-4">
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || 'Utilisateur'}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-600"
            />
          ) : (
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg border-2 border-gray-600">
              {getUserInitials()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg truncate">{user.name || 'Utilisateur'}</p>
            <p className="text-gray-300 text-sm truncate">{user.email}</p>
            <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold bg-gradient-to-r ${getRoleColor(user.role)} rounded-full text-white shadow-sm`}>
              {getRoleLabel(user.role)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <NavLink href="/dashboard" icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        }>
          Tableau de Bord
        </NavLink>
        {/* other nav links duplicated for mobile */}
        <NavLink href="/dashboard/courses" icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }>
          Mes Cours
        </NavLink>
        <NavLink href="/dashboard/content" icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }>
          Mon Contenu
        </NavLink>
        <NavLink href="/dashboard/purchases" icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        }>
          Mes Achats
        </NavLink>
        <NavLink href="/dashboard/profile" icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }>
          Mon Profil
        </NavLink>

        {user.role === UserRole.ADMIN && (
          <div className="pt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Administration
                </span>
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <NavLink href="/admin/dashboard" icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              } variant="premium">
                Tableau Admin
              </NavLink>
              <NavLink href="/admin/users" icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              }>
                Gestion Utilisateurs
              </NavLink>
              <NavLink href="/admin/content" icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }>
                Analytics
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(!open)}
          className="p-2 rounded-md bg-gray-800 text-white shadow-md"
        >
          {open ? (
            // X icon
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {mobileNav}

      {desktopNav}
    </>
  );
}