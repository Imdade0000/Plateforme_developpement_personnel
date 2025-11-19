'use client';

import { signOut } from 'next-auth/react';

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onMenuToggle?: () => void;
  showMenuToggle?: boolean;
}

export function Header({ user, onMenuToggle, showMenuToggle = false }: HeaderProps) {
  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/60 px-6 py-4 sticky top-0 z-30">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Bouton menu pour mobile */}
          {showMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-xl hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Bonjour, {user?.name || 'Utilisateur'}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Prêt à transformer des vies aujourd'hui ?
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-xl hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 0-6 6v2.25l-2.47 2.47a.75.75 0 0 0 .53 1.28h15.88a.75.75 0 0 0 .53-1.28L16.5 12V9.75a6 6 0 0 0-6-6z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center space-x-3 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200/60">
            {user?.image ? (
              <img 
                src={user.image} 
                alt={user.name || 'Utilisateur'}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getUserInitials()}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{user?.name || 'Utilisateur'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Déconnexion Button */}
          <button
            onClick={() => signOut()}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 border border-gray-300 rounded-xl hover:border-red-200 hover:bg-red-50 transition-all duration-200 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
}