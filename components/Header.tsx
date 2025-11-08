
import React, { useState } from 'react';
import { User, Config } from '../types';
import { SearchIcon, UserCircleIcon, LogoutIcon, MenuIcon, ProfileIcon, LoginIcon, XIcon } from './icons/Icons';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onToggleSidebar: () => void;
  onProfileClick: () => void;
  config: Config;
  onLoginClick: () => void;
  searchQuery: string;
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onToggleSidebar, onProfileClick, config, onLoginClick, searchQuery, onSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Reusable search input component with updated colors
  const searchInput = (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="h-5 w-5 text-[var(--color-primary-600)]" />
      </div>
      <input
        type="text"
        placeholder="Tìm kiếm tài liệu..."
        className="block w-full bg-white border border-[var(--color-primary-600)] rounded-md py-2 pl-10 pr-10 text-sm text-gray-800 placeholder-[var(--color-primary-600)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-600)]"
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        aria-label="Tìm kiếm tài liệu"
      />
      {searchQuery && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            onClick={() => onSearch('')}
            className="p-1 rounded-full text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] hover:bg-white/50 focus:outline-none"
            aria-label="Xóa tìm kiếm"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <header 
      className="flex-shrink-0 bg-white border-b border-gray-200 z-10"
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Hamburger for mobile */}
        <div className="flex-shrink-0">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden -ml-2 mr-2 text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]"
              aria-label="Mở menu"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
        </div>
        
        {/* Middle: Search bar (will grow) */}
        <div className="flex-1 px-4 min-w-0">
            <div className="w-full max-w-lg mx-auto">
              {searchInput}
            </div>
        </div>
        
        {/* Right Side: User Area (won't grow) */}
        <div className="flex items-center flex-shrink-0">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)} // Close on blur with delay
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
              >
                <UserCircleIcon className="h-8 w-8 text-[var(--color-primary-600)]" />
                <span className="hidden sm:inline text-sm font-medium text-[var(--color-primary-700)]">{currentUser?.name}</span>
              </button>
              {isMenuOpen && (
                <div 
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-semibold">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                  </div>
                   <button
                    onClick={() => { onProfileClick(); setIsMenuOpen(false); }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <ProfileIcon className="h-5 w-5 mr-3 text-gray-500"/>
                    Thông tin cá nhân
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <LogoutIcon className="h-5 w-5 mr-3 text-gray-500"/>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-600)] transition-colors duration-200 whitespace-nowrap"
            >
              <LoginIcon className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Đăng nhập</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;