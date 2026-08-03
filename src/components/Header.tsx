import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  BarChart2, 
  QrCode, 
  Barcode,
  Settings, 
  Sun, 
  Moon, 
  LogIn, 
  LogOut, 
  PlusCircle,
  GraduationCap,
  Terminal,
  Calculator,
  Users,
  TrendingUp,
  School,
  ChevronDown,
  User,
  Palette,
  RefreshCw,
  Download
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { College } from '../types';

interface HeaderProps {
  currentCollege: College | null;
  authUser: { name: string; email: string; photoUrl?: string; role: string; selectedDept?: string } | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenQRModal: () => void;
  onOpenBarcodeModal?: () => void;
  onCloseQRModal?: () => void;
  activeView: 'public' | 'admin';
  setActiveView: (view: 'public' | 'admin') => void;
  adminTab: 'add' | 'analytics' | 'qr' | 'settings' | 'circulation' | 'directory';
  setAdminTab: (tab: 'add' | 'analytics' | 'qr' | 'settings' | 'circulation' | 'directory') => void;
  
  // Department-switching parameters
  selectedDept?: string;
  onSelectDept?: (deptId: string) => void;
  onOpenThemeModal?: () => void;
  onOpenInstallModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCollege,
  authUser,
  onOpenAuthModal,
  onLogout,
  onOpenQRModal,
  onOpenBarcodeModal,
  onCloseQRModal,
  activeView,
  setActiveView,
  adminTab,
  setAdminTab,
  selectedDept,
  onSelectDept,
  onOpenThemeModal,
  onOpenInstallModal
}) => {
  const { theme, toggleTheme, currentPreset } = useTheme();
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);

  // Department listings based on the blueprint
  const departments = [
    { id: 'library', name: 'Library Department', icon: BookOpen, color: 'text-emerald-500' },
    { id: 'cs', name: 'Computer Science', icon: Terminal, color: 'text-purple-500' },
    { id: 'math', name: 'Mathematics Dept', icon: Calculator, color: 'text-blue-500' },
    { id: 'sports', name: 'Physical Ed. / Sports', icon: Users, color: 'text-orange-500' },
    { id: 'placement', name: 'Training & Placement', icon: TrendingUp, color: 'text-amber-500' },
    { id: 'exam', name: 'Examination Cell', icon: GraduationCap, color: 'text-rose-500' }
  ];

  const currentDeptObj = departments.find(d => d.id === selectedDept) || departments[0];
  const CurrentDeptIcon = currentDeptObj.icon;

  const handleTabClick = (targetView: 'public' | 'admin', tab?: 'add' | 'analytics' | 'qr' | 'settings' | 'circulation' | 'directory') => {
    setActiveView(targetView);
    if (tab) {
      setAdminTab(tab);
    }
    if (onCloseQRModal) {
      onCloseQRModal();
    }
  };

  return (
    <>
      {/* Mobile & Tablet Header (Hidden on Desktop ONLY if logged in) */}
      <header className={`${authUser ? 'lg:hidden' : ''} sticky top-0 z-40 ${currentPreset.headerBg} border-b border-slate-200/40 dark:border-zinc-800/40 backdrop-blur-xl transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          
          {/* Brand Logo & Department Dropdown Switcher */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => handleTabClick('public')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md transition-all group-hover:scale-105`}>
                <School className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Smart CMS
                </h1>
                <span className="text-[10px] text-slate-400 font-semibold block">College Management</span>
              </div>
            </div>

            {/* Divider */}
            {authUser && (
              <div className="h-6 w-[1px] bg-slate-200 dark:bg-zinc-800" />
            )}

            {/* Active Department Badge (Read-Only when Logged In) */}
            {authUser ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 text-xs font-black text-slate-750 dark:text-slate-300 select-none">
                <CurrentDeptIcon className={`w-4 h-4 ${currentDeptObj.color}`} />
                <span className="truncate max-w-[120px] sm:max-w-[160px] uppercase tracking-wider text-[10px]">{currentDeptObj.name}</span>
              </div>
            ) : (
              /* Department Dropdown Switcher for Guests */
              onSelectDept && (
                <div className="relative">
                  <button
                    onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-zinc-700/60 transition-all select-none"
                  >
                    <CurrentDeptIcon className={`w-4 h-4 ${currentDeptObj.color}`} />
                    <span className="truncate max-w-[100px] sm:max-w-[160px]">{currentDeptObj.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isDeptDropdownOpen && (
                    <>
                      {/* Overlay click shield */}
                      <div className="fixed inset-0 z-10" onClick={() => setIsDeptDropdownOpen(false)} />
                      
                      <div className="absolute top-full left-0 mt-1.5 w-56 sm:w-64 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xl py-1.5 z-20">
                        <span className="text-[10px] font-bold text-slate-400 px-3 py-1.5 block uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800 mb-1">
                          Switch Department View
                        </span>
                        {departments.map((dept) => {
                          const DeptIcon = dept.icon;
                          const isSelected = selectedDept === dept.id;
                          return (
                            <button
                              key={dept.id}
                              onClick={() => {
                                onSelectDept(dept.id);
                                setIsDeptDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-colors ${
                                isSelected
                                  ? 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                                  : 'text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <DeptIcon className={`w-4 h-4 ${dept.color}`} />
                                <span>{dept.name}</span>
                              </div>
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            
            {/* User Profile Info */}
            {authUser ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <img 
                    src={authUser.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authUser.name)}`} 
                    alt={authUser.name} 
                    className="w-8 h-8 rounded-full border border-slate-200/60 object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="hidden md:block text-left">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block leading-none">
                      {authUser.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide">
                      {authUser.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-850 border border-slate-200/50 dark:border-zinc-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all active:scale-95"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-indigo-500 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}

            {/* Install App (PWA) Button */}
            {onOpenInstallModal && (
              <button
                type="button"
                onClick={onOpenInstallModal}
                className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95 border border-indigo-400/30 shrink-0"
                title="Install Application on Phone or PC"
              >
                <Download className="w-3.5 h-3.5 animate-bounce" />
                <span className="hidden xs:inline sm:inline">Install</span>
              </button>
            )}

            {/* Theme Customizer Button */}
            {onOpenThemeModal && (
              <button
                onClick={onOpenThemeModal}
                className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl transition-all border border-slate-200 dark:border-zinc-700/60 flex items-center justify-center"
                title="Customize Theme"
              >
                <Palette className="w-4 h-4 text-indigo-500" />
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl transition-all border border-slate-200 dark:border-zinc-700/60"
              title={`Switch Theme`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-755" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>
          </div>

        </div>

      </header>

      {/* YouTube-Style Fixed Mobile Bottom Navigation Bar */}
      {selectedDept === 'library' && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-slate-900/95 dark:bg-zinc-950/95 border-t border-slate-800/80 dark:border-zinc-800/80 backdrop-blur-xl px-2 py-1.5 shadow-2xl flex items-center justify-around select-none">
          {/* 1. Find Button (Student Find -> Find) */}
          <button
            type="button"
            onClick={() => handleTabClick('public')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              activeView === 'public'
                ? 'text-indigo-400 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className={`w-5 h-5 mb-0.5 ${activeView === 'public' ? 'text-indigo-400 stroke-[2.5]' : ''}`} />
            <span className="text-[10px] tracking-tight font-bold">Find</span>
          </button>

          {/* 2. Add Book Button */}
          <button
            type="button"
            onClick={() => handleTabClick('admin', 'add')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              activeView === 'admin' && adminTab === 'add'
                ? 'text-emerald-400 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className={`w-5 h-5 mb-0.5 ${activeView === 'admin' && adminTab === 'add' ? 'text-emerald-400 stroke-[2.5]' : ''}`} />
            <span className="text-[10px] tracking-tight font-bold">Add Book</span>
          </button>

          {/* 3. QR / Barcode Button (Direct Camera Scanner) */}
          <button
            type="button"
            onClick={onOpenBarcodeModal || onOpenQRModal}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all active:scale-95 group"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center -mt-2 shadow-lg shadow-amber-500/10 group-hover:scale-110 transition-transform">
              <Barcode className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <span className="text-[10px] tracking-tight font-extrabold text-amber-400 mt-0.5">QR</span>
          </button>

          {/* 4. Settings Button */}
          <button
            type="button"
            onClick={() => handleTabClick('admin', 'settings')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              activeView === 'admin' && adminTab === 'settings'
                ? 'text-purple-400 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className={`w-5 h-5 mb-0.5 ${activeView === 'admin' && adminTab === 'settings' ? 'text-purple-400 stroke-[2.5]' : ''}`} />
            <span className="text-[10px] tracking-tight font-bold">Settings</span>
          </button>
        </nav>
      )}

      {/* Persistent Left Sidebar (Visible only on Desktop - lg: screens) */}
      {authUser && (
        <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:h-screen lg:sticky lg:top-0 lg:shrink-0 border-r border-slate-200/40 dark:border-zinc-800/40 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl z-30 overflow-y-auto p-5 justify-between">
        {/* Sidebar Top: Logo and Campus Profile */}
        <div className="space-y-6">
          <div 
            onClick={() => handleTabClick('public')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md transition-all group-hover:scale-105">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Smart CMS
              </h1>
              <span className="text-[10px] text-slate-400 font-semibold block">College Management</span>
            </div>
          </div>

          {currentCollege && (
            <div className="p-3 bg-slate-500/5 rounded-2xl border border-slate-200/10 text-left">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Campus Profile</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block truncate">{currentCollege.name}</span>
            </div>
          )}

          {/* Sidebar Navigation - Main Departments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {selectedDept ? 'Active Department' : 'Departments'}
              </span>
              {selectedDept && onSelectDept && !authUser && (
                <button
                  onClick={() => onSelectDept('')}
                  className="text-[9px] font-extrabold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 uppercase tracking-wider transition-colors"
                >
                  Switch
                </button>
              )}
            </div>
            <div className="space-y-1">
              {departments
                .filter((dept) => !selectedDept || selectedDept === dept.id)
                .map((dept) => {
                  const DeptIcon = dept.icon;
                  const isSelected = selectedDept === dept.id;
                  return (
                    <button
                      key={dept.id}
                      onClick={() => onSelectDept && onSelectDept(dept.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? `${currentPreset.badgeBg} text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-indigo-500/10`
                          : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <DeptIcon className={`w-4 h-4 ${dept.color}`} />
                        <span className="truncate">{dept.name}</span>
                      </div>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Sub-Navigation: Specific Tab Actions for active department (Library) */}
          {authUser && selectedDept === 'library' && (
            <div className="space-y-2 pt-2 border-t border-slate-200/40 dark:border-zinc-800/40">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-2">
                Library Operations
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => handleTabClick('public')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeView === 'public'
                      ? 'bg-slate-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-855'
                  }`}
                >
                  <Search className="w-4 h-4 text-indigo-500" />
                  <span>Student Find</span>
                </button>

                {/* Circulation Desk Tab */}
                <button
                  onClick={() => handleTabClick('admin', 'circulation')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeView === 'admin' && adminTab === 'circulation'
                      ? 'bg-slate-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-850'
                  }`}
                >
                  <RefreshCw className="w-4 h-4 text-indigo-500" />
                  <span>Circulation Desk</span>
                </button>

                {/* Cataloging & Add Books Tab (Librarian/Admin only) */}
                {authUser.role !== 'Staff' && (
                  <button
                    onClick={() => handleTabClick('admin', 'add')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeView === 'admin' && adminTab === 'add'
                        ? 'bg-slate-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-850'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-500" />
                    <span>Add Books</span>
                  </button>
                )}

                {/* Analytics Tab (Librarian/Admin only) */}
                {authUser.role !== 'Staff' && (
                  <button
                    onClick={() => handleTabClick('admin', 'analytics')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeView === 'admin' && adminTab === 'analytics'
                        ? 'bg-slate-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-850'
                    }`}
                  >
                    <BarChart2 className="w-4 h-4 text-amber-500" />
                    <span>Analytics</span>
                  </button>
                )}

                {/* Staff Directory Tab */}
                <button
                  onClick={() => handleTabClick('admin', 'directory')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeView === 'admin' && adminTab === 'directory'
                      ? 'bg-slate-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-850'
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>Library Directory</span>
                </button>

                {/* Settings Tab (Librarian/Admin only) */}
                {authUser.role !== 'Staff' && (
                  <button
                    onClick={() => handleTabClick('admin', 'settings')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeView === 'admin' && adminTab === 'settings'
                        ? 'bg-slate-100 dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-850'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-purple-500" />
                    <span>Settings</span>
                  </button>
                )}

                <button
                  onClick={onOpenQRModal}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-850"
                >
                  <QrCode className="w-4 h-4 text-emerald-500" />
                  <span>Entrance QR</span>
                </button>

                <button
                  onClick={onOpenBarcodeModal || onOpenQRModal}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/40 dark:border-indigo-800/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                >
                  <Barcode className="w-4 h-4 text-indigo-500" />
                  <span>Barcode & Shelf Scanner</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Bottom: User Profile and Utility Bar */}
        <div className="space-y-4 pt-4 border-t border-slate-200/40 dark:border-zinc-800/40">
          
          {/* Profile summary card */}
          {authUser ? (
            <div className="p-3 bg-slate-500/5 rounded-2xl border border-slate-200/10 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 overflow-hidden">
                <img 
                  src={authUser.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authUser.name)}`} 
                  alt={authUser.name} 
                  className="w-8 h-8 rounded-full border border-slate-200/60 object-cover shadow-xs shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left overflow-hidden">
                  <span className="text-xs font-extrabold text-slate-850 dark:text-slate-250 block leading-tight truncate">
                    {authUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide truncate">
                    {authUser.role}
                  </span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Librarian Login</span>
            </button>
          )}

          {/* Install App (PWA) Button for Desktop Sidebar */}
          {onOpenInstallModal && (
            <button
              type="button"
              onClick={onOpenInstallModal}
              className="w-full py-2 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 border border-indigo-400/30"
              title="Install App on Phone or PC"
            >
              <Download className="w-4 h-4 animate-bounce" />
              <span>Install App (PWA)</span>
            </button>
          )}

          {/* Theme Options & Theme Toggles row */}
          <div className="flex items-center justify-between gap-1.5">
            
            {/* Theme customization shortcut */}
            {onOpenThemeModal && (
              <button
                onClick={onOpenThemeModal}
                className="w-1/2 p-2 text-indigo-500 bg-slate-500/5 hover:bg-slate-500/10 border border-slate-200/10 rounded-xl transition-all flex items-center justify-center shrink-0"
                title="Customize Theme"
              >
                <Palette className="w-4 h-4" />
                <span className="text-[10px] font-bold ml-1">Theme</span>
              </button>
            )}

            {/* Light/Dark mode toggler */}
            <button
              onClick={toggleTheme}
              className="flex-1 p-2 text-slate-600 dark:text-slate-350 bg-slate-500/5 hover:bg-slate-500/10 border border-slate-200/10 rounded-xl transition-all flex items-center justify-center shrink-0"
              title="Switch Dark/Light Theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-655" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-[10px] font-bold ml-1">Mode</span>
            </button>

          </div>

        </div>
      </aside>
      )}
    </>
  );
};
