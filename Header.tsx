import React from 'react';
import { MapPin } from 'lucide-react';

interface HeaderProps {
  title: string;
  showAdminLink?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showAdminLink = false }) => {
  return (
    <header className="p-4 shadow-lg bg-white border-b-2 border-orange-100">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tr from-orange-500 to-orange-600 text-white soft-glow shadow-lg hover:shadow-xl transition-shadow duration-300 active:scale-95">
            <MapPin className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-900" style={{ letterSpacing: '0.2px' }}>{title}</h1>
        </div>
        {showAdminLink && (
          <a
            href="/admin"
            className="text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
          >
            ניהול
          </a>
        )}
      </div>
    </header>
  );
};

export default Header;