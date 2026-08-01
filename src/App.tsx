import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Header } from './components/Header';
import { PublicStudentView } from './components/PublicStudentView';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { QRModal } from './components/QRModal';
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
  handleUpdateCollege
}: any) {
  const { currentPreset } = useTheme();

  return (
    <div className={`min-h-screen ${currentPreset.pageBg} text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-500 relative overflow-hidden`}>
      
      {/* Ambient Theme Background Glow */}
      <div className={`absolute top-0 inset-x-0 h-[480px] bg-gradient-to-b ${currentPreset.gradientBg} opacity-80 pointer-events-none blur-3xl transition-all duration-700`} />

      {/* Crystal Glass Ambient Spheres & 3D Glassy Bubbles (Mockup Style) */}
      {currentPreset.id === 'glass' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Base Sky Blue/Teal Glows */}
          <div className="absolute -top-12 -left-12 w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-cyan-400 to-sky-300 dark:from-cyan-600 dark:to-sky-500 opacity-40 dark:opacity-30 blur-2xl animate-pulse" style={{ animationDuration: '8s' }} />
          
          {/* High-Contrast Blurred Black Fluid Blobs from Mockup Image */}
          <div className="absolute top-[20%] -right-12 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-slate-950/40 dark:bg-black/90 opacity-80 dark:opacity-60 blur-[80px]" />
          <div className="absolute bottom-[15%] -left-16 w-80 h-80 sm:w-[450px] sm:h-[450px] rounded-full bg-slate-950/30 dark:bg-black/80 opacity-70 dark:opacity-50 blur-[90px]" />

          {/* Large Floating Glassy Sphere behind content */}
          <div className="absolute top-[15%] left-[25%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-sky-400/20 via-cyan-300/10 to-transparent blur-3xl" />

          {/* 3D Glassy Water Droplets / Bubbles from Reference Image */}
          {/* Droplet 1: Middle Left Floating */}
          <div className="absolute top-[35%] left-[3%] sm:left-[5%] w-24 h-24 rounded-full border border-white/60 dark:border-white/20 bg-white/5 backdrop-blur-[2px] shadow-[inset_-8px_-8px_16px_rgba(255,255,255,0.1),_inset_8px_8px_16px_rgba(0,0,0,0.05),_inset_0_4px_8px_rgba(255,255,255,0.6),_0_12px_24px_-8px_rgba(0,0,0,0.2)] animate-bounce" style={{ animationDuration: '6s' }}>
            {/* Highlight glare */}
            <div className="absolute top-3 left-4 w-6 h-3 rounded-full bg-white/75 rotate-[-25deg] filter blur-[0.3px]" />
            <div className="absolute bottom-3 right-5 w-2.5 h-2.5 rounded-full bg-white/40" />
          </div>

          {/* Droplet 2: Lower Right Floating */}
          <div className="absolute bottom-[25%] right-[2%] sm:right-[6%] w-28 h-28 rounded-full border border-white/60 dark:border-white/20 bg-white/5 backdrop-blur-[2px] shadow-[inset_-10px_-10px_20px_rgba(255,255,255,0.15),_inset_10px_10px_20px_rgba(0,0,0,0.05),_inset_0_5px_10px_rgba(255,255,255,0.7),_0_16px_32px_-10px_rgba(0,0,0,0.25)] animate-bounce" style={{ animationDuration: '8s' }}>
            {/* Highlight glare */}
            <div className="absolute top-4 left-5 w-7 h-3.5 rounded-full bg-white/80 rotate-[-28deg] filter blur-[0.2px]" />
            <div className="absolute bottom-4 right-6 w-3 h-3 rounded-full bg-white/45" />
          </div>

          {/* Droplet 3: Small Floating Top Right */}
          <div className="absolute top-[12%] right-[15%] w-14 h-14 rounded-full border border-white/50 dark:border-white/20 bg-white/5 backdrop-blur-[1px] shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.1),_inset_4px_4px_8px_rgba(0,0,0,0.05),_inset_0_2px_4px_rgba(255,255,255,0.5),_0_8px_16px_rgba(0,0,0,0.15)] animate-pulse" style={{ animationDuration: '4s' }}>
            {/* Highlight glare */}
            <div className="absolute top-2 left-2.5 w-3.5 h-2 rounded-full bg-white/70 rotate-[-20deg]" />
            <div className="absolute bottom-2 right-3.5 w-1.5 h-1.5 rounded-full bg-white/30" />
          </div>

          {/* Droplet 4: Medium Left Bottom */}
          <div className="absolute bottom-[10%] left-[12%] w-18 h-18 rounded-full border border-white/50 dark:border-white/20 bg-white/5 backdrop-blur-[2px] shadow-[inset_-6px_-6px_12px_rgba(255,255,255,0.12),_inset_6px_6px_12px_rgba(0,0,0,0.05),_inset_0_3px_6px_rgba(255,255,255,0.6),_0_10px_20px_rgba(0,0,0,0.18)] animate-pulse" style={{ animationDuration: '10s' }}>
            {/* Highlight glare */}
            <div className="absolute top-2 left-3 w-4.5 h-2 rounded-full bg-white/75 rotate-[-22deg]" />
            <div className="absolute bottom-2.5 right-4 w-2 h-2 rounded-full bg-white/35" />
          </div>
        </div>
      )}

      {/* Dreamy Pastel Claymorphism & Ultra-Frosted 3D Glass Mockup Elements */}
      {currentPreset.id === 'clayglass' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Pastel Radial Background Glows */}
          <div className="absolute top-[5%] left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-300/20 dark:bg-indigo-900/10 blur-[130px] animate-pulse" style={{ animationDuration: '14s' }} />
          <div className="absolute top-[35%] right-[-5%] w-[600px] h-[600px] rounded-full bg-purple-300/20 dark:bg-purple-900/10 blur-[150px]" />
          <div className="absolute bottom-[5%] left-[15%] w-[450px] h-[450px] rounded-full bg-pink-300/20 dark:bg-pink-950/10 blur-[110px] animate-pulse" style={{ animationDuration: '10s' }} />

          {/* High-Contrast Soft Dark Liquid Blobs (from background mockup) */}
          <div className="absolute top-[18%] right-[12%] w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-slate-900/10 dark:bg-black/40 blur-[70px]" />
          <div className="absolute bottom-[22%] left-[8%] w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-slate-900/10 dark:bg-black/30 blur-[80px]" />

          {/* 1. Pink Textured 3D Donut (Torus) - Upper Left Area */}
          <div className="absolute top-[14%] left-[14%] sm:left-[18%] w-24 h-24 sm:w-32 sm:h-32 rounded-full border-[18px] sm:border-[24px] border-transparent bg-clip-border bg-gradient-to-tr from-pink-500 via-rose-400 to-pink-300 shadow-[0_20px_40px_rgba(244,63,94,0.35),_inset_0_-8px_16px_rgba(0,0,0,0.12),_inset_0_8px_16px_rgba(255,255,255,0.7),_inset_0_0_0_99px_rgba(253,244,245,0.01)] flex items-center justify-center animate-spin" style={{ animationDuration: '20s' }}>
            {/* Inner negative space shadow */}
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,0.15),_0_4px_8px_rgba(255,255,255,0.3)] bg-[#dfd3f6] dark:bg-[#110c1f] transition-all" />
          </div>

          {/* 2. Yellow 3D Clay Plus Sign (Cross) - Upper Right Area */}
          <div className="absolute top-[22%] right-[10%] sm:right-[15%] w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rotate-[15deg] animate-bounce" style={{ animationDuration: '8s' }}>
            {/* Horizontal bar */}
            <div className="absolute w-12 h-4 sm:w-16 sm:h-5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 shadow-[0_12px_24px_rgba(245,158,11,0.3),_inset_0_-2px_4px_rgba(0,0,0,0.1),_inset_0_3px_6px_rgba(255,255,255,0.7)]" />
            {/* Vertical bar */}
            <div className="absolute h-12 w-4 sm:h-16 sm:w-5 rounded-full bg-gradient-to-b from-amber-400 via-yellow-300 to-amber-400 shadow-[0_12px_24px_rgba(245,158,11,0.3),_inset_0_-2px_4px_rgba(0,0,0,0.1),_inset_0_3px_6px_rgba(255,255,255,0.7)]" />
          </div>

          {/* 3. Lime Green 3D Clay Capsule - Bottom Left Area */}
          <div className="absolute bottom-[16%] left-[6%] sm:left-[10%] w-8 h-20 sm:w-10 sm:h-28 rounded-full bg-gradient-to-b from-lime-400 via-emerald-400 to-teal-300 shadow-[0_16px_32px_rgba(132,204,22,0.35),_inset_0_-4px_8px_rgba(0,0,0,0.1),_inset_0_5px_10px_rgba(255,255,255,0.7)] rotate-[35deg] animate-pulse" style={{ animationDuration: '6s' }} />

          {/* 4. Small Pink 3D Floating Torus / Rings - Bottom Right Area */}
          <div className="absolute bottom-[28%] right-[14%] sm:right-[18%] w-14 h-14 sm:w-20 sm:h-20 rounded-full border-[10px] sm:border-[14px] border-transparent bg-clip-border bg-gradient-to-tr from-pink-400 to-rose-300 shadow-[0_12px_24px_rgba(244,63,94,0.25),_inset_0_-4px_8px_rgba(0,0,0,0.1),_inset_0_4px_8px_rgba(255,255,255,0.7)] flex items-center justify-center animate-spin" style={{ animationDuration: '15s' }}>
            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] bg-[#fad2e1] dark:bg-[#170611] transition-all" />
          </div>

          {/* 5. Central Floating Claymorphic Pin/Star Badge */}
          <div className="absolute top-[48%] left-[2%] sm:left-[4%] w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/20 shadow-[0_12px_28px_rgba(0,0,0,0.08),_inset_0_2px_4px_rgba(255,255,255,0.6)] flex items-center justify-center animate-bounce" style={{ animationDuration: '11s' }}>
            {/* Pastel violet core */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-violet-500 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-white text-xs font-black">+</span>
            </div>
          </div>

          {/* 6. Floating Glass Orb with Glossy Reflection - Middle Right */}
          <div className="absolute top-[44%] right-[2%] sm:right-[5%] w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-white/60 dark:border-white/20 bg-white/5 backdrop-blur-[2px] shadow-[inset_-8px_-8px_16px_rgba(255,255,255,0.15),_inset_8px_8px_16px_rgba(0,0,0,0.05),_inset_0_5px_10px_rgba(255,255,255,0.7),_0_16px_32px_-10px_rgba(109,40,217,0.15)] animate-bounce" style={{ animationDuration: '9s' }}>
            {/* Reflection Glare */}
            <div className="absolute top-3 left-4 w-5 h-2.5 rounded-full bg-white/85 rotate-[-25deg] filter blur-[0.2px]" />
            <div className="absolute bottom-3 right-5 w-2 h-2 rounded-full bg-white/45" />
          </div>

          {/* 7. Soft Pastel Pink Sphere / Cone style shape - Lower Center */}
          <div className="absolute bottom-[8%] right-[32%] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-pink-400 via-rose-300 to-white shadow-[0_12px_24px_rgba(244,63,94,0.2),_inset_-4px_-4px_8px_rgba(0,0,0,0.1),_inset_4px_4px_8px_rgba(255,255,255,0.8)] animate-pulse" style={{ animationDuration: '5s' }} />
        </div>
      )}

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
      />

      {/* Librarian Login & College Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessLogin={handleSuccessLogin}
        colleges={colleges}
      />

      {/* Entrance QR Generator & Simulator Modal */}
      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        currentCollege={currentCollege}
        onSimulateScan={() => {
          setActiveView('public');
        }}
      />

      {/* Main Application Body */}
      <div className="flex-1 pb-16 md:pb-6 z-10">
        {activeView === 'public' ? (
          <PublicStudentView
            currentCollege={currentCollege}
            colleges={colleges}
            onSelectCollege={(col) => setCurrentCollege(col)}
            onOpenLibrarianLogin={() => setIsAuthModalOpen(true)}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400 z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>AI Smart Library Finder • {currentCollege?.name || 'Central College Library'}</span>
          </div>
          <div>
            100% Public Student Access via Entrance QR Code • Scoped Library Database Search
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
  const [authUser, setAuthUser] = useState<{ name: string; email: string; collegeId: string } | null>(null);
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

  const handleSuccessLogin = (user: { name: string; email: string; collegeId: string }, college: College) => {
    setAuthUser(user);
    setCurrentCollege(college);
    // Refresh colleges list in case a new college was registered
    fetchColleges();
    setActiveView('admin');
  };

  const handleLogout = () => {
    setAuthUser(null);
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
      />
    </ThemeProvider>
  );
}
