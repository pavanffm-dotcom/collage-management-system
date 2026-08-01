import React from 'react';
import { Search, BookOpen, BarChart2, QrCode, Settings, Sun, Moon, LogIn, LogOut, PlusCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { College } from '../types';

interface HeaderProps {
  currentCollege: College | null;
  authUser: { name: string; email: string; collegeId: string } | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenQRModal: () => void;
  activeView: 'public' | 'admin';
  setActiveView: (view: 'public' | 'admin') => void;
  adminTab: 'add' | 'analytics' | 'qr' | 'settings';
  setAdminTab: (tab: 'add' | 'analytics' | 'qr' | 'settings') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCollege,
  authUser,
  onOpenAuthModal,
  onLogout,
  onOpenQRModal,
  activeView,
  setActiveView,
  adminTab,
  setAdminTab
}) => {
  const { theme, toggleTheme, currentPreset } = useTheme();

  const handleTabClick = (targetView: 'public' | 'admin', tab?: 'add' | 'analytics' | 'qr' | 'settings') => {
    if (targetView === 'admin' && !authUser) {
      onOpenAuthModal();
      return;
    }
    setActiveView(targetView);
    if (tab) {
      setAdminTab(tab);
    }
  };

  return (
    <>
      {/* Top Header Bar - Minimal & Clean */}
      <header className={`sticky top-0 z-40 ${currentPreset.headerBg} transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveView('public')}>
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl ${currentPreset.buttonBg} flex items-center justify-center shadow-md transition-all`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                AI Smart Library
              </h1>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Visible on PC & Large Screens) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-zinc-900/40 backdrop-blur-md p-1 rounded-2xl border border-slate-200/40 dark:border-zinc-800/40">
            {/* Tab 1: Public Search */}
            <button
              onClick={() => handleTabClick('public')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'public'
                  ? `${currentPreset.badgeBg} shadow-sm font-extrabold scale-[1.02]`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>

            {/* Tab 2: Add / Manage Books */}
            <button
              onClick={() => handleTabClick('admin', 'add')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'admin' && adminTab === 'add'
                  ? `${currentPreset.badgeBg} shadow-sm font-extrabold scale-[1.02]`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Books</span>
            </button>

            {/* Tab 3: Search Analytics */}
            <button
              onClick={() => handleTabClick('admin', 'analytics')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'admin' && adminTab === 'analytics'
                  ? `${currentPreset.badgeBg} shadow-sm font-extrabold scale-[1.02]`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            {/* Tab 4: Entrance QR Code */}
            <button
              onClick={() => {
                if (authUser) {
                  handleTabClick('admin', 'qr');
                } else {
                  onOpenQRModal();
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'admin' && adminTab === 'qr'
                  ? `${currentPreset.badgeBg} shadow-sm font-extrabold scale-[1.02]`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <QrCode className="w-4 h-4 text-amber-500" />
              <span>QR Code</span>
            </button>

            {/* Tab 5: Settings */}
            <button
              onClick={() => handleTabClick('admin', 'settings')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'admin' && adminTab === 'settings'
                  ? `${currentPreset.badgeBg} shadow-sm font-extrabold scale-[1.02]`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            
            {/* User Profile / Auth Status */}
            {authUser ? (
              <div className="flex items-center gap-2 pr-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">
                  {authUser.name}
                </span>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className={`flex items-center gap-1.5 px-3 py-1.5 ${currentPreset.buttonBg} font-bold text-xs rounded-xl shadow-xs transition-all`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Dark/Light Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Fixed Bottom Navigation Bar (Mobile Only) */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 ${currentPreset.headerBg} py-2 px-3 shadow-2xl transition-colors duration-500`}>
        <div className="max-w-md mx-auto flex items-center justify-around">
          
          {/* Tab 1: Public Search */}
          <button
            onClick={() => handleTabClick('public')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-2xl transition-all ${
              activeView === 'public'
                ? `${currentPreset.accentText} font-bold`
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              activeView === 'public' ? `${currentPreset.badgeBg} scale-105` : ''
            }`}>
              <Search className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Search</span>
          </button>

          {/* Tab 2: Add / Manage Books */}
          <button
            onClick={() => handleTabClick('admin', 'add')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-2xl transition-all ${
              activeView === 'admin' && adminTab === 'add'
                ? `${currentPreset.accentText} font-bold`
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              activeView === 'admin' && adminTab === 'add' ? `${currentPreset.badgeBg} scale-105` : ''
            }`}>
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Add Books</span>
          </button>

          {/* Tab 3: Search Analytics */}
          <button
            onClick={() => handleTabClick('admin', 'analytics')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-2xl transition-all ${
              activeView === 'admin' && adminTab === 'analytics'
                ? `${currentPreset.accentText} font-bold`
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              activeView === 'admin' && adminTab === 'analytics' ? `${currentPreset.badgeBg} scale-105` : ''
            }`}>
              <BarChart2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Analytics</span>
          </button>

          {/* Tab 4: Entrance QR Code */}
          <button
            onClick={() => {
              if (authUser) {
                handleTabClick('admin', 'qr');
              } else {
                onOpenQRModal();
              }
            }}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-2xl transition-all ${
              activeView === 'admin' && adminTab === 'qr'
                ? `${currentPreset.accentText} font-bold`
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              activeView === 'admin' && adminTab === 'qr' ? `${currentPreset.badgeBg} scale-105` : ''
            }`}>
              <QrCode className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-[10px] tracking-tight">QR Code</span>
          </button>

          {/* Tab 5: Settings / Profile */}
          <button
            onClick={() => handleTabClick('admin', 'settings')}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-2xl transition-all ${
              activeView === 'admin' && adminTab === 'settings'
                ? `${currentPreset.accentText} font-bold`
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              activeView === 'admin' && adminTab === 'settings' ? `${currentPreset.badgeBg} scale-105` : ''
            }`}>
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Settings</span>
          </button>

        </div>
      </nav>
    </>
  );
};
