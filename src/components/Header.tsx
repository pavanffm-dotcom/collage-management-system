import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  BarChart2, 
  QrCode, 
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
  Palette
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { College } from '../types';

interface HeaderProps {
  currentCollege: College | null;
  authUser: { name: string; email: string; photoUrl?: string; role: string; selectedDept?: string } | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenQRModal: () => void;
  activeView: 'public' | 'admin';
  setActiveView: (view: 'public' | 'admin') => void;
  adminTab: 'add' | 'analytics' | 'qr' | 'settings';
  setAdminTab: (tab: 'add' | 'analytics' | 'qr' | 'settings') => void;
  
  // Department-switching parameters
  selectedDept?: string;
  onSelectDept?: (deptId: string) => void;
  onOpenThemeModal?: () => void;
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
  setAdminTab,
  selectedDept,
  onSelectDept,
  onOpenThemeModal
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

  const handleTabClick = (targetView: 'public' | 'admin', tab?: 'add' | 'analytics' | 'qr' | 'settings') => {
    setActiveView(targetView);
    if (tab) {
      setAdminTab(tab);
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-40 ${currentPreset.headerBg} border-b border-slate-200/40 dark:border-zinc-800/40 backdrop-blur-xl transition-colors duration-500`}>
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

            {/* Department Dropdown Switcher */}
            {authUser && onSelectDept && (
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
            )}
          </div>

          {/* Center Navigation - Standard Library management tabs only shown if 'library' is selected */}
          {authUser && selectedDept === 'library' && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-zinc-900/40 backdrop-blur-md p-1 rounded-2xl border border-slate-200/40 dark:border-zinc-800/40">
              <button
                onClick={() => handleTabClick('public')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeView === 'public'
                    ? `${currentPreset.badgeBg} shadow-sm font-extrabold scale-[1.02]`
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Student Find</span>
              </button>

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
          )}

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

            {/* Library Entrance QR Button */}
            {onOpenQRModal && selectedDept === 'library' && (
              <button
                onClick={onOpenQRModal}
                className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl transition-all border border-slate-200 dark:border-zinc-700/60 flex items-center justify-center gap-1.5"
                title="View Library Entrance QR Code"
              >
                <QrCode className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold hidden sm:inline text-slate-700 dark:text-slate-300">Entrance QR</span>
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

      {/* Persistent Bottom Tab Bar for Mobile / Tablet Library users */}
      {authUser && selectedDept === 'library' && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-slate-200/60 dark:border-zinc-800/80 shadow-lg py-2 px-6 flex items-center justify-around z-50 md:hidden pb-safe">
          <button
            onClick={() => handleTabClick('public')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeView === 'public'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-bold">Student Find</span>
          </button>

          <button
            onClick={() => handleTabClick('admin', 'add')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeView === 'admin' && adminTab === 'add'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span className="text-[10px] font-bold">Add Books</span>
          </button>

          <button
            onClick={() => handleTabClick('admin', 'analytics')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeView === 'admin' && adminTab === 'analytics'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px] font-bold">Analytics</span>
          </button>

          <button
            onClick={() => handleTabClick('admin', 'settings')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeView === 'admin' && adminTab === 'settings'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-bold">Settings</span>
          </button>
        </div>
      )}
    </>
  );
};
