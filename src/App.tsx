import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Header } from './components/Header';
import { PublicStudentView } from './components/PublicStudentView';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { QRModal } from './components/QRModal';
import { HomePortal } from './components/HomePortal';
import { BookOpen, Search, PlusCircle, BarChart2, Settings } from 'lucide-react';

// Departments View imports
import { WorkInProgressView } from './components/WorkInProgressView';

import { Book, College, LibraryStats } from './types';

function AppContent({
  colleges,
  currentCollege,
  setCurrentCollege,
  authUser,
  handleLogout,
  isAuthModalOpen,
  setIsAuthModalOpen,
  handleSuccessLogin,
  isQRModalOpen,
  setIsQRModalOpen,
  activeView,
  setActiveView,
  adminTab,
  setAdminTab,
  books,
  handleAddBook,
  handleBulkAddBooks,
  handleUpdateBook,
  handleDeleteBook,
  stats,
  recentLogs,
  fetchAdminStats,
  departments,
  handleUpdateCollege,
  
  // Custom states passed to AppContent
  selectedDept,
  setSelectedDept,
  handleHomeSignInSuccess
}: any) {
  const { currentPreset } = useTheme();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // If there's no logged-in student or faculty profile, display the Home Portal signup sheet
  if (!authUser) {
    return (
      <div className={`min-h-screen ${currentPreset.pageBg} text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-500 relative overflow-hidden`}>
        
        {/* Ambient Theme Background Glow */}
        <div className={`absolute top-0 inset-x-0 h-[480px] bg-gradient-to-b ${currentPreset.gradientBg} opacity-80 pointer-events-none blur-3xl transition-all duration-700`} />
        
        {/* Fixed Header on Portal for Theme Switches */}
        <Header
          currentCollege={currentCollege}
          authUser={null}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onOpenQRModal={() => setIsQRModalOpen(true)}
          activeView={activeView}
          setActiveView={setActiveView}
          adminTab={adminTab}
          setAdminTab={setAdminTab}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccessLogin={(user, college) => {
            handleSuccessLogin(user, college);
            setSelectedDept('library'); // direct librarian logins access the library first
          }}
          colleges={colleges}
        />

        {/* Dynamic Interactive Welcome Portal */}
        <div className="flex-grow flex items-center justify-center py-8">
          <HomePortal 
            onSignInSuccess={handleHomeSignInSuccess} 
            isThemeModalOpen={isThemeModalOpen}
            setIsThemeModalOpen={setIsThemeModalOpen}
          />
        </div>

        {/* Generic Portal Footer */}
        <footer className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md border-t border-slate-200/20 dark:border-zinc-800/20 py-4 text-center text-xs text-slate-400 dark:text-slate-500 z-10">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-3">
            <span>© 2026 Smart CMS Portal. All rights reserved.</span>
            <span>v2.4.0</span>
          </div>
        </footer>
      </div>
    );
  }

  // Once signed in, render the appropriate Department View
  return (
    <div className={`min-h-screen ${currentPreset.pageBg} text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-500 relative overflow-hidden`}>
      
      {/* Ambient Theme Background Glow */}
      <div className={`absolute top-0 inset-x-0 h-[480px] bg-gradient-to-b ${currentPreset.gradientBg} opacity-80 pointer-events-none blur-3xl transition-all duration-700`} />

      {/* Navigation Header */}
      <Header
        currentCollege={currentCollege}
        authUser={authUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenQRModal={() => setIsQRModalOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        selectedDept={selectedDept}
        onSelectDept={setSelectedDept}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
      />

      {/* Entrance QR Generator & Simulator Modal */}
      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        currentCollege={currentCollege}
        onSimulateScan={() => {
          setSelectedDept('library');
          setActiveView('public');
        }}
      />

      {/* Main Application Body Container */}
      <main className="flex-1 pb-16 md:pb-8 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {selectedDept === 'library' ? (
          <div className="space-y-6">
            
            {/* Library On-Page Operations Switcher Hub */}
            <div className="p-6 bg-white/65 dark:bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-zinc-800/40 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className={`w-6 h-6 ${currentPreset.accentText}`} />
                  <span>Library Operations Hub</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {currentCollege?.name || 'Central Campus Library'} • Dynamic database, live search & logs
                </p>
              </div>

              {/* Status Badge with Active Role */}
              <div className="flex items-center gap-2 self-start md:self-auto bg-slate-500/5 px-3 py-1.5 rounded-xl border border-slate-200/10">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Role: <span className={`${currentPreset.accentText} uppercase tracking-wider`}>{authUser?.role || 'Guest Student'}</span>
                </span>
              </div>
            </div>

            {/* The 4 Library Hub Navigation Cards (Buttons) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Button 1: Student Find */}
              <button
                onClick={() => {
                  setActiveView('public');
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between shadow-xs hover:scale-[1.01] active:scale-95 ${
                  activeView === 'public'
                    ? `${currentPreset.badgeBg} border-indigo-500/30 ring-2 ring-indigo-500/10`
                    : 'bg-white/45 dark:bg-zinc-900/30 border-slate-200/50 dark:border-zinc-800/45 hover:bg-white/60 dark:hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2.5 rounded-xl bg-indigo-500 text-white shrink-0`}>
                    <Search className="w-4.5 h-4.5" />
                  </div>
                  {activeView === 'public' && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  )}
                </div>
                <div className="mt-4">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block uppercase tracking-wider">
                    Student Find
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                    Catalog & AI Search
                  </span>
                </div>
              </button>

              {/* Button 2: Add Books */}
              <button
                onClick={() => {
                  setActiveView('admin');
                  setAdminTab('add');
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between shadow-xs hover:scale-[1.01] active:scale-95 ${
                  activeView === 'admin' && adminTab === 'add'
                    ? `${currentPreset.badgeBg} border-indigo-500/30 ring-2 ring-indigo-500/10`
                    : 'bg-white/45 dark:bg-zinc-900/30 border-slate-200/50 dark:border-zinc-800/45 hover:bg-white/60 dark:hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2.5 rounded-xl bg-emerald-500 text-white shrink-0`}>
                    <PlusCircle className="w-4.5 h-4.5" />
                  </div>
                  {activeView === 'admin' && adminTab === 'add' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <div className="mt-4">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block uppercase tracking-wider">
                    Add Books
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                    Insert & Bulk Import
                  </span>
                </div>
              </button>

              {/* Button 3: Books Analysis */}
              <button
                onClick={() => {
                  setActiveView('admin');
                  setAdminTab('analytics');
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between shadow-xs hover:scale-[1.01] active:scale-95 ${
                  activeView === 'admin' && adminTab === 'analytics'
                    ? `${currentPreset.badgeBg} border-indigo-500/30 ring-2 ring-indigo-500/10`
                    : 'bg-white/45 dark:bg-zinc-900/30 border-slate-200/50 dark:border-zinc-800/45 hover:bg-white/60 dark:hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2.5 rounded-xl bg-amber-500 text-white shrink-0`}>
                    <BarChart2 className="w-4.5 h-4.5" />
                  </div>
                  {activeView === 'admin' && adminTab === 'analytics' && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
                <div className="mt-4">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block uppercase tracking-wider">
                    Books Analysis
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                    Query Trends & Inventory
                  </span>
                </div>
              </button>

              {/* Button 4: Settings & Config */}
              <button
                onClick={() => {
                  setActiveView('admin');
                  setAdminTab('settings');
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between shadow-xs hover:scale-[1.01] active:scale-95 ${
                  activeView === 'admin' && adminTab === 'settings'
                    ? `${currentPreset.badgeBg} border-indigo-500/30 ring-2 ring-indigo-500/10`
                    : 'bg-white/45 dark:bg-zinc-900/30 border-slate-200/50 dark:border-zinc-800/45 hover:bg-white/60 dark:hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2.5 rounded-xl bg-purple-500 text-white shrink-0`}>
                    <Settings className="w-4.5 h-4.5" />
                  </div>
                  {activeView === 'admin' && adminTab === 'settings' && (
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                  )}
                </div>
                <div className="mt-4">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block uppercase tracking-wider">
                    Settings & Config
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                    Campus Profile Setup
                  </span>
                </div>
              </button>

            </div>

            {/* Render Active Subsection */}
            <div className="pt-2">
              {activeView === 'public' ? (
                <PublicStudentView
                  currentCollege={currentCollege}
                  colleges={colleges}
                  onSelectCollege={(col) => setCurrentCollege(col)}
                  onOpenLibrarianLogin={() => setIsAuthModalOpen(true)}
                  onOpenQRModal={() => setIsQRModalOpen(true)}
                />
              ) : (
                <AdminPanel
                  books={books}
                  onAddBook={handleAddBook}
                  onBulkAddBooks={handleBulkAddBooks}
                  onUpdateBook={handleUpdateBook}
                  onDeleteBook={handleDeleteBook}
                  stats={stats}
                  recentLogs={recentLogs}
                  onRefreshStats={() => currentCollege && fetchAdminStats(currentCollege.id)}
                  departments={departments}
                  currentCollege={currentCollege}
                  onUpdateCollege={handleUpdateCollege}
                  activeTab={adminTab}
                  setActiveTab={setAdminTab}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </div>
        ) : (
          /* Render Work in Progress View for other departments */
          <WorkInProgressView 
            selectedDept={selectedDept}
            onBackToLibrary={() => {
              setSelectedDept('library');
              setActiveView('public');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400 z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block animate-pulse" />
            <span>Smart College CMS Portal • {currentCollege?.name || 'Central College Campus'}</span>
          </div>
          <div>
            Logged in as {authUser.name} ({authUser.role}) • All modules secured with AES-256
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [currentCollege, setCurrentCollege] = useState<College | null>(null);
  
  // Auth & View State
  const [authUser, setAuthUser] = useState<{ name: string; email: string; collegeId: string; role: string; selectedDept?: string } | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('library');
  const [activeView, setActiveView] = useState<'public' | 'admin'>('public');
  const [adminTab, setAdminTab] = useState<'add' | 'analytics' | 'qr' | 'settings'>('add');
  
  // Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Books & Analytics for Admin Panel
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  // Departments list
  const departments = Array.from(new Set(books.map(b => b.department))).filter(Boolean);

  // Initialize Colleges & URL Params
  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const res = await fetch('/api/colleges');
      const data = await res.json();
      const loadedColleges: College[] = data.colleges || [];
      setColleges(loadedColleges);

      // Check URL query param for ?collegeId=...
      const params = new URLSearchParams(window.location.search);
      const paramCollegeId = params.get('collegeId');

      if (paramCollegeId) {
        const found = loadedColleges.find(c => c.id === paramCollegeId);
        if (found) {
          setCurrentCollege(found);
          return;
        }
      }

      // Default to first college
      if (loadedColleges.length > 0) {
        setCurrentCollege(loadedColleges[0]);
      }
    } catch (err) {
      console.error('Failed to load colleges:', err);
    }
  };

  // Fetch admin books & stats when currentCollege changes
  useEffect(() => {
    if (currentCollege) {
      fetchAdminBooks(currentCollege.id);
      fetchAdminStats(currentCollege.id);
    }
  }, [currentCollege]);

  const fetchAdminBooks = async (collegeId: string) => {
    try {
      const res = await fetch(`/api/books?collegeId=${collegeId}`);
      const data = await res.json();
      setBooks(data.books || []);
    } catch (err) {
      console.error('Failed to fetch admin books:', err);
    }
  };

  const fetchAdminStats = async (collegeId: string) => {
    try {
      const res = await fetch(`/api/analytics?collegeId=${collegeId}`);
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
        setRecentLogs(data.recentLogs || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    }
  };

  // Admin Actions
  const handleAddBook = async (newBookData: Partial<Book>) => {
    if (!currentCollege) return;
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBookData,
          collegeId: currentCollege.id
        })
      });
      if (res.ok) {
        fetchAdminBooks(currentCollege.id);
        fetchAdminStats(currentCollege.id);
      }
    } catch (err) {
      console.error('Error adding book:', err);
    }
  };

  const handleBulkAddBooks = async (importedBooks: any[]) => {
    if (!currentCollege) return;
    try {
      const res = await fetch('/api/books/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          books: importedBooks,
          collegeId: currentCollege.id
        })
      });
      const data = await res.json();
      if (res.ok) {
        fetchAdminBooks(currentCollege.id);
        fetchAdminStats(currentCollege.id);
      }
      return data;
    } catch (err) {
      console.error('Error bulk adding books:', err);
    }
  };

  const handleUpdateBook = async (id: string, updatedData: Partial<Book>) => {
    if (!currentCollege) return;
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        fetchAdminBooks(currentCollege.id);
        fetchAdminStats(currentCollege.id);
      }
    } catch (err) {
      console.error('Error updating book:', err);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!currentCollege) return;
    try {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdminBooks(currentCollege.id);
        fetchAdminStats(currentCollege.id);
      }
    } catch (err) {
      console.error('Error deleting book:', err);
    }
  };

  const handleUpdateCollege = async (updatedCollegeData: Partial<College>) => {
    if (!currentCollege) return;
    try {
      const res = await fetch(`/api/colleges/${currentCollege.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCollegeData)
      });
      const data = await res.json();
      if (data.college) {
        setCurrentCollege(data.college);
        fetchColleges();
      }
    } catch (err) {
      console.error('Error updating college settings:', err);
    }
  };

  const handleSuccessLogin = (user: { name: string; email: string; collegeId: string; role: string }, college: College) => {
    setAuthUser(user);
    setCurrentCollege(college);
    // Refresh colleges list in case a new college was registered
    fetchColleges();
    setActiveView('admin');
  };

  const handleHomeSignInSuccess = (user: { name: string; email: string; photoUrl: string; role: string; selectedDept: string }) => {
    setAuthUser({
      name: user.name,
      email: user.email,
      collegeId: currentCollege?.id || 'gec',
      role: user.role,
      photoUrl: user.photoUrl
    });
    setSelectedDept(user.selectedDept);
    
    // Set view according to role
    if (user.role === 'Librarian' || user.role === 'Admin' || user.role === 'HOD') {
      setActiveView('admin');
    } else {
      setActiveView('public');
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
    setSelectedDept('library');
    setActiveView('public');
  };

  return (
    <ThemeProvider>
      <AppContent
        colleges={colleges}
        currentCollege={currentCollege}
        setCurrentCollege={setCurrentCollege}
        authUser={authUser}
        handleLogout={handleLogout}
        isAuthModalOpen={isAuthModalOpen}
        setIsAuthModalOpen={setIsAuthModalOpen}
        handleSuccessLogin={handleSuccessLogin}
        isQRModalOpen={isQRModalOpen}
        setIsQRModalOpen={setIsQRModalOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        books={books}
        handleAddBook={handleAddBook}
        handleBulkAddBooks={handleBulkAddBooks}
        handleUpdateBook={handleUpdateBook}
        handleDeleteBook={handleDeleteBook}
        stats={stats}
        recentLogs={recentLogs}
        fetchAdminStats={fetchAdminStats}
        departments={departments}
        handleUpdateCollege={handleUpdateCollege}
        
        // Custom props
        selectedDept={selectedDept}
        setSelectedDept={setSelectedDept}
        handleHomeSignInSuccess={handleHomeSignInSuccess}
      />
    </ThemeProvider>
  );
}
