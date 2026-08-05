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
  Download,
  SlidersHorizontal,
  Globe
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
      {/* YouTube-Style Fixed Mobile Bottom Navigation Bar */}
      {selectedDept === 'library' && (
        <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-[60] ${currentPreset.headerBg} border-t ${currentPreset.borderColor} backdrop-blur-2xl px-2 py-1.5 shadow-2xl flex items-center justify-around select-none transition-all duration-500`}>
          {/* 1. Find Button (Student Find -> Find) */}
          <button
            type="button"
            onClick={() => handleTabClick('public')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              activeView === 'public'
                ? `${currentPreset.accentText} font-extrabold scale-105`
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Search className={`w-5 h-5 mb-0.5 ${activeView === 'public' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] tracking-tight font-bold">Find</span>
          </button>

          {/* 2. Add Book Button */}
          <button
            type="button"
            onClick={() => handleTabClick('admin', 'add')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              activeView === 'admin' && adminTab === 'add'
                ? `${currentPreset.accentText} font-extrabold scale-105`
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <PlusCircle className={`w-5 h-5 mb-0.5 ${activeView === 'admin' && adminTab === 'add' ? 'stroke-[2.5]' : ''}`} />
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
                ? `${currentPreset.accentText} font-extrabold scale-105`
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Settings className={`w-5 h-5 mb-0.5 ${activeView === 'admin' && adminTab === 'settings' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] tracking-tight font-bold">Settings</span>
          </button>
        </nav>
      )}

      {/* Persistent Left Sidebar (Visible only on Desktop - lg: screens) */}
      {authUser && (
        <aside className={`hidden lg:flex lg:flex-col lg:w-72 lg:h-screen lg:sticky lg:top-0 lg:shrink-0 border-r ${currentPreset.borderColor} ${currentPreset.headerBg} backdrop-blur-2xl z-30 overflow-y-auto p-5 justify-between transition-all duration-500`}>
        {/* Sidebar Top: Logo and Campus Profile */}
        <div className="space-y-6">
          <div 
            onClick={() => handleTabClick('public')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className={`w-10 h-10 ${currentPreset.buttonRadius} ${currentPreset.buttonBg} flex items-center justify-center text-white shadow-md transition-all group-hover:scale-105`}>
              <School className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Smart CMS
              </h1>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">College Management</span>
            </div>
          </div>

          {currentCollege && (
            <div className={`p-3.5 ${currentPreset.innerCardBg} ${currentPreset.buttonRadius} border ${currentPreset.borderColor} text-left transition-all shadow-xs`}>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 block mb-0.5">Campus Profile</span>
              <span className={`text-xs font-bold ${currentPreset.accentText} block truncate`}>{currentCollege.name}</span>
            </div>
          )}

          {/* Sidebar Navigation - Main Departments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                {selectedDept ? 'Active Department' : 'Departments'}
              </span>
              {selectedDept && onSelectDept && !authUser && (
                <button
                  onClick={() => onSelectDept('')}
                  className={`text-[9px] font-extrabold ${currentPreset.accentText} uppercase tracking-wider transition-colors hover:underline`}
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 ${currentPreset.buttonRadius} text-xs font-bold transition-all ${
                        isSelected
                          ? `${currentPreset.badgeBg} ${currentPreset.accentText} shadow-xs font-black border ${currentPreset.borderColor}`
                          : `text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white ${currentPreset.secondaryButtonBg} opacity-80 hover:opacity-100`
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <DeptIcon className={`w-4 h-4 ${dept.color}`} />
                        <span className="truncate">{dept.name}</span>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Sub-Navigation: Specific Tab Actions for active department (Library) */}
          {authUser && selectedDept === 'library' && (
            <div className="space-y-2 pt-2 border-t border-slate-200/40 dark:border-zinc-800/40">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider block px-2">
                Library Operations
              </span>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleTabClick('public')}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 ${currentPreset.buttonRadius} text-xs font-bold transition-all ${
                    activeView === 'public'
                      ? `${currentPreset.buttonBg} text-white shadow-md font-extrabold scale-[1.01]`
                      : `text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white ${currentPreset.secondaryButtonBg} opacity-80 hover:opacity-100`
                  }`}
                >
                  <Search className={`w-4 h-4 ${activeView === 'public' ? 'text-white' : 'text-indigo-500'}`} />
                  <span>Student Find</span>
                </button>

                {/* Circulation Desk Tab */}
                <button
                  onClick={() => handleTabClick('admin', 'circulation')}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 ${currentPreset.buttonRadius} text-xs font-bold transition-all ${
                    activeView === 'admin' && adminTab === 'circulation'
                      ? `${currentPreset.buttonBg} text-white shadow-md font-extrabold scale-[1.01]`
                      : `text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white ${currentPreset.secondaryButtonBg} opacity-80 hover:opacity-100`
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${activeView === 'admin' && adminTab === 'circulation' ? 'text-white' : 'text-indigo-500'}`} />
                  <span>Circulation Desk</span>
                </button>

                {/* Cataloging & Add Books Tab (Librarian/Admin only) */}
                {authUser.role !== 'Staff' && (
                  <button
                    onClick={() => handleTabClick('admin', 'add')}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 ${currentPreset.buttonRadius} text-xs font-bold transition-all ${
                      activeView === 'admin' && adminTab === 'add'
                        ? `${currentPreset.buttonBg} text-white shadow-md font-extrabold scale-[1.01]`
                        : `text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white ${currentPreset.secondaryButtonBg} opacity-80 hover:opacity-100`
                    }`}
                  >
                    <PlusCircle className={`w-4 h-4 ${activeView === 'admin' && adminTab === 'add' ? 'text-white' : 'text-emerald-500'}`} />
                    <span>Add Books</span>
                  </button>
                )}

                {/* Analytics Tab (Librarian/Admin only) */}
                {authUser.role !== 'Staff' && (
                  <button
                    onClick={() => handleTabClick('admin', 'analytics')}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 ${currentPreset.buttonRadius} text-xs font-bold transition-all ${
                      activeView === 'admin' && adminTab === 'analytics'
                        ? `${currentPreset.buttonBg} text-white shadow-md font-extrabold scale-[1.01]`
                        : `text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white ${currentPreset.secondaryButtonBg} opacity-80 hover:opacity-100`
                    }`}
                  >
                    <BarChart2 className={`w-4 h-4 ${activeView === 'admin' && adminTab === 'analytics' ? 'text-white' : 'text-amber-500'}`} />
                    <span>Analytics</span>
                  </button>
                )}

                {/* Staff Directory Tab */}
                <button
                  onClick={() => handleTabClick('admin', 'directory')}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 ${currentPreset.buttonRadius} text-xs font-bold transition-all ${
                    activeView === 'admin' && adminTab === 'directory'
                      ? `${currentPreset.buttonBg} text-white shadow-md font-extrabold scale-[1.01]`
                      : `text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white ${currentPreset.secondaryButtonBg} opacity-80 hover:opacity-100`
                  }`}
                >
                  <Users className={`w-4 h-4 ${activeView === 'admin' && adminTab === 'directory' ? 'text-white' : 'text-emerald-500'}`} />
                  <span>Library Directory</span>
                </button>

                {/* Control Panel (Direct Access) */}
                <button
                  onClick={() => handleTabClick('admin', 'settings')}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 ${currentPreset.buttonRadius} text-xs font-bold transition-all ${
                    activeView === 'admin' && adminTab === 'settings'
                      ? `${currentPreset.buttonBg} text-white shadow-md font-extrabold scale-[1.01]`
                      : `text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white ${currentPreset.secondaryButtonBg} opacity-80 hover:opacity-100`
                  }`}
                >
                  <SlidersHorizontal className={`w-4 h-4 ${activeView === 'admin' && adminTab === 'settings' ? 'text-white' : 'text-indigo-500'}`} />
                  <span>Control Panel</span>
                </button>

                {/* Public Link (Direct Access) */}
                <button
                  onClick={() => window.open(window.location.origin, '_blank')}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 ${currentPreset.buttonRadius} text-xs font-bold transition-all ${currentPreset.secondaryButtonBg} hover:scale-[1.01]`}
                >
                  <Globe className="w-4 h-4 text-emerald-500" />
                  <span>Public Link</span>
                </button>

                <button
                  onClick={onOpenQRModal}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 ${currentPreset.buttonRadius} text-xs font-bold transition-all ${currentPreset.secondaryButtonBg} hover:scale-[1.01]`}
                >
                  <QrCode className="w-4 h-4 text-emerald-500" />
                  <span>Entrance QR</span>
                </button>

                <button
                  onClick={onOpenBarcodeModal || onOpenQRModal}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 ${currentPreset.buttonRadius} text-xs font-bold transition-all ${currentPreset.secondaryButtonBg} hover:scale-[1.01]`}
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
            <div className={`p-3 ${currentPreset.innerCardBg} ${currentPreset.buttonRadius} border ${currentPreset.borderColor} flex items-center justify-between gap-2.5 transition-all shadow-xs`}>
              <div className="flex items-center gap-2 overflow-hidden">
                <img 
                  src={authUser.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authUser.name)}`} 
                  alt={authUser.name} 
                  className="w-8 h-8 rounded-full border border-slate-200/60 object-cover shadow-xs shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left overflow-hidden">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 block leading-tight truncate">
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
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 ${currentPreset.buttonBg} text-white font-bold text-xs ${currentPreset.buttonRadius} shadow-xs transition-all active:scale-95`}
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
              className={`w-full py-2 px-3 ${currentPreset.buttonBg} text-white font-extrabold text-xs ${currentPreset.buttonRadius} shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 border border-indigo-400/30`}
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
                className={`w-1/2 p-2 ${currentPreset.secondaryButtonBg} ${currentPreset.buttonRadius} transition-all flex items-center justify-center shrink-0 hover:scale-[1.02] border ${currentPreset.borderColor}`}
                title="Customize Theme"
              >
                <Palette className={`w-4 h-4 ${currentPreset.accentText}`} />
                <span className="text-[10px] font-bold ml-1">Theme</span>
              </button>
            )}

            {/* Light/Dark mode toggler */}
            <button
              onClick={toggleTheme}
              className={`flex-1 p-2 ${currentPreset.secondaryButtonBg} ${currentPreset.buttonRadius} transition-all flex items-center justify-center shrink-0 hover:scale-[1.02] border ${currentPreset.borderColor}`}
              title="Switch Dark/Light Theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
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
