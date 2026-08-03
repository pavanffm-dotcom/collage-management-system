import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Header } from './components/Header';
import { PublicStudentView } from './components/PublicStudentView';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { QRModal } from './components/QRModal';
import { BarcodeShelfMapperModal } from './components/BarcodeShelfMapperModal';
import { ThemeModal } from './components/ThemeModal';
import { HomePortal } from './components/HomePortal';
import { BookOpen, Search, PlusCircle, BarChart2, Settings, QrCode } from 'lucide-react';

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
  handleClearCatalog,
  
  // Custom states passed to AppContent
  selectedDept,
  setSelectedDept,
  handleHomeSignInSuccess
}: any) {
  const { currentPreset } = useTheme();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [scannerModalTab, setScannerModalTab] = useState<'qr' | 'barcode'>('qr');

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
          onOpenQRModal={() => {
            setScannerModalTab('qr');
            setIsQRModalOpen(true);
          }}
          onOpenBarcodeModal={() => {
            setScannerModalTab('barcode');
            setIsQRModalOpen(true);
          }}
          onCloseQRModal={() => setIsQRModalOpen(false)}
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
    <div className={`min-h-screen ${currentPreset.pageBg} text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row font-sans transition-colors duration-500 relative overflow-hidden`}>
      
      {/* Ambient Theme Background Glow */}
      <div className={`absolute top-0 inset-x-0 h-[480px] bg-gradient-to-b ${currentPreset.gradientBg} opacity-80 pointer-events-none blur-3xl transition-all duration-700`} />

      {/* Navigation Header / Left Sidebar */}
      <Header
        currentCollege={currentCollege}
        authUser={authUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenQRModal={() => {
          setScannerModalTab('qr');
          setIsQRModalOpen(true);
        }}
        onOpenBarcodeModal={() => {
          setScannerModalTab('barcode');
          setIsQRModalOpen(true);
        }}
        onCloseQRModal={() => setIsQRModalOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        selectedDept={selectedDept}
        onSelectDept={setSelectedDept}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
      />

      {/* Theme Customization Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      {/* Main Content Area (Wraps BarcodeShelfMapperModal, main & footer to scroll independently from sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:h-screen lg:overflow-y-auto relative z-10 w-full">
        {/* Code Scanner & 2D Shelf Locator Modal */}
        <BarcodeShelfMapperModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          currentCollege={currentCollege}
          books={books}
          onUpdateBook={handleUpdateBook}
          initialTab={scannerModalTab}
          onSimulateEntranceScan={() => {
            setSelectedDept('library');
            setActiveView('public');
          }}
        />

        {/* Main Application Body Container */}
        <main className="flex-1 pb-28 lg:pb-10 z-10 px-4 sm:px-6 lg:px-10 py-6 w-full max-w-full">
          {selectedDept === 'library' ? (
            <div className="space-y-6">

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
                    authUser={authUser}
                    onOpenQRModal={() => {
                      setScannerModalTab('qr');
                      setIsQRModalOpen(true);
                    }}
                    onOpenBarcodeModal={() => {
                      setScannerModalTab('barcode');
                      setIsQRModalOpen(true);
                    }}
                    onClearCatalog={handleClearCatalog}
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
        <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400 z-10 w-full mt-auto">
          <div className="w-full px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
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

    </div>
  );
}

export default function App() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [currentCollege, setCurrentCollege] = useState<College | null>(null);
  
  // Auth & View State (Persisted in localStorage across reloads/updates)
  const [authUser, setAuthUser] = useState<{ name: string; email: string; collegeId: string; role: string; selectedDept?: string } | null>(() => {
    const saved = localStorage.getItem('smart_cms_auth_user');
    return saved ? JSON.parse(saved) : { name: 'Amit Verma', email: 'amit.verma@gmail.com', collegeId: 'col-gec-goa', role: 'Librarian', selectedDept: 'library' };
  });
  const [selectedDept, setSelectedDept] = useState<string>(() => {
    return localStorage.getItem('smart_cms_selected_dept') || 'library';
  });
  const [activeView, setActiveView] = useState<'public' | 'admin'>(() => {
    return (localStorage.getItem('smart_cms_active_view') as 'public' | 'admin') || 'admin';
  });
  const [adminTab, setAdminTab] = useState<'add' | 'analytics' | 'qr' | 'settings' | 'circulation' | 'directory'>(() => {
    return (localStorage.getItem('smart_cms_admin_tab') as any) || 'add';
  });

  useEffect(() => {
    if (authUser) {
      localStorage.setItem('smart_cms_auth_user', JSON.stringify(authUser));
    } else {
      localStorage.removeItem('smart_cms_auth_user');
    }
  }, [authUser]);

  useEffect(() => {
    localStorage.setItem('smart_cms_selected_dept', selectedDept);
  }, [selectedDept]);

  useEffect(() => {
    localStorage.setItem('smart_cms_active_view', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('smart_cms_admin_tab', adminTab);
  }, [adminTab]);
  
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

  const handleClearCatalog = async () => {
    if (!currentCollege) return;
    try {
      const res = await fetch(`/api/books/college/${currentCollege.id}/clear`, { method: 'DELETE' });
      if (res.ok) {
        setBooks([]);
        localStorage.removeItem('library_detected_form_schema');
        fetchAdminStats(currentCollege.id);
        return true;
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to clear catalog sheet from server.');
      }
    } catch (err) {
      console.error('Error clearing catalog:', err);
      throw err;
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
    if (user.role === 'Librarian' || user.role === 'Admin' || user.role === 'HOD' || user.role === 'Staff') {
      setActiveView('admin');
      if (user.role === 'Staff') {
        setAdminTab('circulation');
      } else {
        setAdminTab('add');
      }
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
        handleClearCatalog={handleClearCatalog}
        
        // Custom props
        selectedDept={selectedDept}
        setSelectedDept={setSelectedDept}
        handleHomeSignInSuccess={handleHomeSignInSuccess}
      />
    </ThemeProvider>
  );
}
