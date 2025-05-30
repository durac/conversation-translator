import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Globe } from 'lucide-react';
import RoomCodeDisplay from './RoomCodeDisplay';

type HeaderProps = {
  title: string;
  roomCode?: string;
  showBackButton?: boolean;
};

const Header: React.FC<HeaderProps> = ({ title, roomCode, showBackButton = false }) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'de' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {showBackButton && (
              <Link to="/" className="mr-4 text-gray-500 hover:text-gray-700">
                <ArrowLeft size={20} />
              </Link>
            )}
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {roomCode && (
              <div className="ml-4">
                <RoomCodeDisplay code={roomCode} />
              </div>
            )}
          </div>
          
          <button
            onClick={toggleLanguage}
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            title={currentLanguage === 'en' ? 'Zu Deutsch wechseln' : 'Switch to English'}
          >
            <Globe size={18} className="mr-2" />
            {currentLanguage === 'en' ? 'DE' : 'EN'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;