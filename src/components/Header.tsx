import React from 'react';
import { Globe, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

type HeaderProps = {
  title: string;
  showBackButton?: boolean;
  roomCode?: string;
};

const Header: React.FC<HeaderProps> = ({ title, showBackButton = false, roomCode }) => {
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Link to="/" className="p-1 -ml-1 rounded-full hover:bg-gray-100">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
        )}
        
        <div className="flex items-center gap-2">
          <Globe size={22} className="text-primary-600" />
          <h1 className="font-semibold text-lg text-gray-800">
            {title}
          </h1>
          {roomCode && (
            <span className="ml-2 bg-primary-50 text-primary-700 px-2 py-0.5 rounded text-sm font-medium">
              {roomCode}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;