import React from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import RoomCodeDisplay from './RoomCodeDisplay';
import Logo from '../assets/logo.svg';

type HeaderProps = {
  title: string;
  showBackButton?: boolean;
  roomCode?: string;
  onLeaveRoom?: () => void;
};

const Header: React.FC<HeaderProps> = ({ title, showBackButton = false, roomCode, onLeaveRoom }) => {
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Link to="/" className="p-1 -ml-1 rounded-full hover:bg-gray-100">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
        )}
        
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80">
            <img src={Logo} alt="Logo" className="w-[30px] h-[30px]" />
            <h1 className="font-semibold text-lg text-gray-800">
              {title}
            </h1>
          </Link>
          {roomCode && (
            <div className="relative group">
              <span className="ml-2 bg-primary-50 text-primary-700 px-2 py-0.5 rounded text-sm font-medium cursor-help">
                {roomCode}
              </span>
              <div className="absolute left-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 min-w-[280px]">
                  <RoomCodeDisplay code={roomCode} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {onLeaveRoom && (
        <button
          onClick={onLeaveRoom}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut size={16} />
          <span>Leave Room</span>
        </button>
      )}
    </header>
  );
};

export default Header;