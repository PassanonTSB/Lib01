import React, { useState } from 'react';
import { Page } from '../types';
import { BookOpen, Trophy, User, Home, Sparkles, Menu, X, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  totalScore: number;
  onLogOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, totalScore, onLogOut }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Home', value: 'home' as Page, icon: Home },
    { label: 'Activities', value: 'activities' as Page, icon: BookOpen },
    { label: 'Leaderboard', value: 'leaderboard' as Page, icon: Trophy },
    { label: 'Profile', value: 'profile' as Page, icon: User },
    { label: 'Admin', value: 'admin' as Page, icon: LayoutDashboard },
  ];

  const handleNavClick = (value: Page) => {
    setCurrentPage(value);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-blue-600 shadow-lg h-[72px]" id="main-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between h-full items-center">
          {/* Logo / Brand */}
          <div 
            className="flex items-center cursor-pointer space-x-2.5 group"
            onClick={() => handleNavClick('home')}
          >
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-black text-blue-900 border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-5 h-5 text-blue-950" />
            </div>
            <div>
              <span className="font-sans font-black text-white tracking-tight text-lg leading-tight block">
                Library Reading Challenge
              </span>
              <span className="text-[10px] uppercase tracking-wider text-yellow-300 font-bold block leading-none">
                Vibrant Reading League
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2" id="nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => handleNavClick(item.value)}
                  className={`flex items-center px-4 py-2 rounded-full text-xs font-bold transition-all duration-250 gap-1.5 ${
                    isActive
                      ? 'bg-yellow-400 text-blue-900 font-black shadow-md scale-105'
                      : 'text-blue-100 hover:text-white hover:bg-blue-700/50'
                  }`}
                  id={`nav-item-${item.value}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-900' : 'text-blue-200'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Score counter & Mobile trigger */}
          <div className="flex items-center space-x-2">
            {/* Score pill */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-400 text-blue-900 rounded-full text-xs font-black shadow shadow-blue-800/10 hover:scale-105 transition-transform duration-200 border-2 border-white">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-blue-900 fill-blue-900" />
              <span>{totalScore} pts</span>
            </div>

            {onLogOut && (
              <button
                onClick={onLogOut}
                className="hidden md:flex items-center justify-center p-2 rounded-full text-blue-100 hover:text-white hover:bg-blue-700/60 transition-all border border-blue-400 cursor-pointer text-xs font-bold gap-1"
                title="Sign Out"
                id="navbar-logout-btn"
              >
                Sign Out
              </button>
            )}

            {/* Mobile menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl text-blue-100 hover:bg-blue-750 hover:text-white transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
              id="mobile-menu-toggle"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden border-t border-blue-500 bg-blue-700 shadow-xl animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="px-2 pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => handleNavClick(item.value)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-base font-bold transition-all gap-3 ${
                    isActive
                      ? 'bg-yellow-400 text-blue-900'
                      : 'text-blue-100 hover:text-white hover:bg-blue-650'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-900' : 'text-blue-200'}`} />
                  {item.label}
                </button>
              );
            })}
            {onLogOut && (
              <button
                onClick={onLogOut}
                className="w-full flex items-center px-4 py-3 rounded-xl text-base font-bold text-red-200 hover:text-white hover:bg-red-950 transition-all gap-3 cursor-pointer border-none"
                id="mobile-logout-btn"
              >
                <span className="text-xl">🚪</span>
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
