import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Sparkles, BookOpen, Filter, X, CheckCircle2, AlertCircle, RefreshCw, QrCode, Camera, FileText, Zap, ExternalLink, Link2 } from 'lucide-react';
import { Book, College, AISearchResult, AISearchResponse } from '../types';
import { StudentShelfCard } from './StudentShelfCard';
import { BookDetailModal } from './BookDetailModal';
import { BorrowBookModal } from './BorrowBookModal';
import { DirectBarcodeBorrowModal } from './DirectBarcodeBorrowModal';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

import { FullscreenButton } from './FullscreenButton';

interface PublicStudentViewProps {
  currentCollege: College | null;
  colleges: College[];
  onSelectCollege: (col: College) => void;
  onOpenLibrarianLogin?: () => void;
  onOpenQRModal?: () => void;
}

export const PublicStudentView: React.FC<PublicStudentViewProps> = ({
  currentCollege,
  colleges,
  onSelectCollege,
  onOpenLibrarianLogin,
  onOpenQRModal
}) => {
  const { currentPreset } = useTheme();
  // Default search mode is "Search by Book Name"
  const [searchMode, setSearchMode] = useState<'exact' | 'ai'>('exact');
  
  const [exactQuery, setExactQuery] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const [books, setBooks] = useState<Book[]>([]);
  const [aiResults, setAiResults] = useState<AISearchResult[]>([]);
  const [suggestedBooks, setSuggestedBooks] = useState<Book[]>([]);
  const [extractedConcepts, setExtractedConcepts] = useState<string[]>([]);
  
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [borrowingBook, setBorrowingBook] = useState<Book | null>(null);
  const [isDirectBorrowOpen, setIsDirectBorrowOpen] = useState(false);

  // Quick Redirect Links (PYQ & Dynamic Event Link)
  const [quickLinks, setQuickLinks] = useState<{
    pyqUrl: string;
    pyqTitle: string;
    dynamicUrl: string;
    dynamicTitle: string;
    dynamicEnabled: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('gec_quick_redirect_links');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      pyqUrl: 'https://drive.google.com/drive/folders/sample_pyq_papers',
      pyqTitle: 'Previous Year Question Papers',
      dynamicUrl: 'https://college.edu/notices/exam-timetable',
      dynamicTitle: 'Notice & Dynamic Event Link',
      dynamicEnabled: true
    };
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('gec_quick_redirect_links');
        if (saved) setQuickLinks(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('gec_quick_links_updated', handleStorage);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('gec_quick_links_updated', handleStorage);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Student Pagination
  const [studentPage, setStudentPage] = useState(1);
  const STUDENT_PAGE_SIZE = 60;

  useEffect(() => {
    setStudentPage(1);
  }, [exactQuery, selectedDept, onlyAvailable]);

  const displayBooks = useMemo(() => {
    return books.slice((studentPage - 1) * STUDENT_PAGE_SIZE, studentPage * STUDENT_PAGE_SIZE);
  }, [books, studentPage]);

  const totalStudentPages = Math.ceil(books.length / STUDENT_PAGE_SIZE) || 1;

  // Departments list for filter (Memoized to prevent recalculated overhead on every render)
  const departments = useMemo(() => {
    return Array.from(new Set(books.map(b => b.department))).filter(Boolean);
  }, [books]);

  // Fetch catalog books when college changes (Does not force display until user searches)
  const fetchCollegeBooks = useCallback(async (collegeId: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/books?collegeId=${collegeId}`);
      const data = await res.json();
      setBooks(data.books || []);
    } catch (err) {
      console.error('Failed to fetch college books:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (currentCollege) {
      fetchCollegeBooks(currentCollege.id);
    }
  }, [currentCollege, fetchCollegeBooks]);

  // Run Exact Search (Search by Book Name)
  const handleExactSearch = useCallback(async () => {
    if (!currentCollege) return;
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const res = await fetch('/api/search/exact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: exactQuery,
          department: selectedDept,
          onlyAvailable,
          collegeId: currentCollege.id,
          searchMappings: currentCollege.searchMappings
        })
      });
      const data = await res.json();
      setBooks(data.books || []);
    } catch (err) {
      console.error('Exact search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, [currentCollege, exactQuery, selectedDept, onlyAvailable]);

  // Debounced auto-run exact search ONLY when user types query
  useEffect(() => {
    if (!currentCollege || searchMode !== 'exact') return;
    if (!exactQuery.trim()) return; // Keep default clean view without auto-populating default books/locations
    const timer = setTimeout(() => {
      handleExactSearch();
    }, 350);
    return () => clearTimeout(timer);
  }, [exactQuery, selectedDept, onlyAvailable, currentCollege, searchMode, handleExactSearch]);

  // Run AI Search
  const handleAISearch = useCallback(async (queryToRun?: string) => {
    if (!currentCollege) return;
    const queryStr = queryToRun !== undefined ? queryToRun : aiQuery;
    if (!queryStr.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch('/api/search/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryStr,
          collegeId: currentCollege.id,
          searchMappings: currentCollege.searchMappings
        })
      });

      const data: AISearchResponse = await res.json();
      setAiResults(data.results || []);
      setSuggestedBooks(data.suggestedRelatedBooks || []);
      setExtractedConcepts(data.extractedConcepts || []);
    } catch (err) {
      console.error('AI search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, [currentCollege, aiQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (searchMode === 'exact') handleExactSearch();
      else handleAISearch();
    }
  }, [searchMode, handleExactSearch, handleAISearch]);

  return (
    <div className={`min-h-screen ${currentPreset.pageBg} text-slate-900 dark:text-slate-100 pb-28 transition-colors duration-500`}>
      
      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-1 sm:pt-3 space-y-4">
        
        {/* Search Header Box */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`${currentPreset.heroCardBg} ${currentPreset.cardRadius} p-4 sm:p-8 text-center space-y-4 transition-all duration-500`}
        >
          
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/20 pb-3">
            <div className="text-left">
              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <BookOpen className={`w-6 h-6 sm:w-7 sm:h-7 ${currentPreset.accentText}`} />
                <span>Smart AI Finder</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md font-medium">
                Search books by title or describe your query in conversational English.
              </p>
            </div>
          </div>

          {/* Search Mode Tabs with layoutId for fluid active tab sliding */}
          <div className={`inline-flex p-1 ${currentPreset.innerCardBg} ${currentPreset.cardRadius} border ${currentPreset.borderColor} relative`}>
            <button
              onClick={() => { setSearchMode('exact'); setHasSearched(false); }}
              className="relative flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold transition-all select-none z-10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              {searchMode === 'exact' && (
                <motion.div
                  layoutId="activeSearchTab"
                  className={`absolute inset-0 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} shadow-md -z-10`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Search className={`w-4 h-4 ${searchMode === 'exact' ? 'text-white' : ''}`} />
              <span className={searchMode === 'exact' ? 'text-white font-black' : ''}>Search by Book Name</span>
            </button>

            <button
              onClick={() => { setSearchMode('ai'); setHasSearched(false); }}
              className="relative flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold transition-all select-none z-10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              {searchMode === 'ai' && (
                <motion.div
                  layoutId="activeSearchTab"
                  className={`absolute inset-0 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} shadow-md -z-10`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Sparkles className={`w-4 h-4 text-amber-300 ${searchMode === 'ai' ? 'text-white' : ''}`} />
              <span className={searchMode === 'ai' ? 'text-white font-black' : ''}>Search with AI</span>
            </button>
          </div>

          {/* Search Input Box with AnimatePresence for flawless transitions */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              {searchMode === 'exact' ? (
                <motion.div
                  key="exact"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-2xl mx-auto space-y-4"
                >
                  <div className={`relative flex items-center ${currentPreset.inputBg} ${currentPreset.inputRadius} p-2 border ${currentPreset.borderColor} transition-all`}>
                    <Search className={`w-5 h-5 ml-3 mr-2 ${currentPreset.accentText}`} />
                    <input
                      type="text"
                      value={exactQuery}
                      onChange={e => setExactQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter book title, author, or subject name..."
                      className="w-full py-2.5 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                    />
                    {exactQuery && (
                      <button onClick={() => setExactQuery('')} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleExactSearch}
                      disabled={isSearching}
                      className={`py-2.5 px-5 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50`}
                    >
                      {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Search</span>}
                    </motion.button>
                  </div>

                  {/* Filters */}
                  <div className="flex items-center justify-end pt-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <label className="flex items-center gap-2 cursor-pointer select-none py-1.5 px-3.5 bg-slate-100/50 dark:bg-slate-800/40 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all border border-slate-200/40 dark:border-slate-800/40">
                      <input
                        type="checkbox"
                        checked={onlyAvailable}
                        onChange={e => setOnlyAvailable(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="font-semibold">Show Only Available Books</span>
                    </label>
                  </div>

                  {/* Direct Barcode Scan & Borrow Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => setIsDirectBorrowOpen(true)}
                      className={`w-full py-3 px-6 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} text-sm font-black flex items-center justify-center gap-2 shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer`}
                    >
                      <Camera className="w-5 h-5" />
                      <span>Borrow Book</span>
                    </button>
                    <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 font-medium leading-relaxed max-w-lg mx-auto">
                      💡 <strong>What is Borrowing?</strong> You can instantly check out books to <strong className="text-slate-700 dark:text-slate-200">Take Home</strong>, study inside the <strong className="text-slate-700 dark:text-slate-200">Reading Room</strong>, or use for semester <strong className="text-slate-700 dark:text-slate-200">Project / Lab work</strong>.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-2xl mx-auto space-y-4"
                >
                  <div className={`relative flex items-center ${currentPreset.inputBg} ${currentPreset.inputRadius} p-2 border ${currentPreset.borderColor} transition-all`}>
                    <Sparkles className="w-5 h-5 text-amber-500 ml-3 mr-2" />
                    <input
                      type="text"
                      value={aiQuery}
                      onChange={e => setAiQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder='Describe topic in plain English... e.g. "I need a Fish Curry book"'
                      className="w-full py-2.5 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                    />
                    {aiQuery && (
                      <button onClick={() => setAiQuery('')} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAISearch()}
                      disabled={isSearching}
                      className={`py-2.5 px-5 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50`}
                    >
                      {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>AI Search</span>}
                    </motion.button>
                  </div>

                  {/* Sample Natural Queries */}
                  <div className="text-left pt-1">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                      Try asking in natural language:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Fish Curry of Goa',
                        'Python beginners book',
                        'Java Interview Preparation',
                        'Indian Constitution',
                        'Organic Chemistry'
                      ].map((q, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setAiQuery(q);
                            handleAISearch(q);
                          }}
                          className={`text-[11px] py-1 px-2.5 ${currentPreset.badgeRadius} ${currentPreset.secondaryButtonBg} transition-colors cursor-pointer`}
                        >
                          "{q}"
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 🚀 QUICK STUDENT ACCESS & DYNAMIC REDIRECT LINKS SECTION */}
            <div className="pt-4 border-t border-slate-200/40 dark:border-slate-800/60 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Previous Year Question Papers (PYQ) Button */}
                <button
                  type="button"
                  onClick={() => {
                    const targetUrl = quickLinks.pyqUrl || 'https://drive.google.com';
                    window.open(targetUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className={`p-3.5 rounded-2xl border ${currentPreset.cardBorder} hover:border-indigo-500 dark:hover:border-indigo-400 bg-white/80 dark:bg-slate-900/80 transition-all flex items-center justify-between gap-3 text-left shadow-xs hover:shadow-md group cursor-pointer`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-900 dark:text-white block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        PYQ
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                {/* 2. Notice Button */}
                {quickLinks.dynamicEnabled && (
                  <button
                    type="button"
                    onClick={() => {
                      const targetUrl = quickLinks.dynamicUrl || 'https://college.edu';
                      window.open(targetUrl, '_blank', 'noopener,noreferrer');
                    }}
                    className={`p-3.5 rounded-2xl border ${currentPreset.cardBorder} hover:border-amber-500 dark:hover:border-amber-400 bg-white/80 dark:bg-slate-900/80 transition-all flex items-center justify-between gap-3 text-left shadow-xs hover:shadow-md group cursor-pointer`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-black text-slate-900 dark:text-white block group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          Notice
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                )}
              </div>
            </div>
          </div>

        </motion.div>

        {/* Results Section */}
        <div className="space-y-6">
          
          {hasSearched && (
            <>
              {/* Header showing short result count text as requested */}
              <div className={`flex items-center justify-between border-b ${currentPreset.borderColor} pb-3`}>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className={`w-5 h-5 ${currentPreset.accentText}`} />
                  {searchMode === 'exact' ? (
                    <span>
                      Showing Results {exactQuery.trim() ? `for "${exactQuery}"` : ''}
                    </span>
                  ) : (
                    <span>
                      Show Matching {aiQuery.trim() ? `for "${aiQuery}"` : ''}
                    </span>
                  )}
                </h3>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono">
                  {searchMode === 'exact' ? `(${books.length})` : `(${aiResults.length})`}
                </span>
              </div>

          {/* Content Listing with Staggered Animations */}
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div 
                key="searching"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center space-y-3"
              >
                <div className="w-10 h-10 border-4 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Searching library catalog...
                </p>
              </motion.div>
            ) : searchMode === 'exact' ? (
              books.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
                    <span>Showing {Math.min((studentPage - 1) * STUDENT_PAGE_SIZE + 1, books.length)}–{Math.min(studentPage * STUDENT_PAGE_SIZE, books.length)} of {books.length.toLocaleString()} catalog books</span>
                    <span>Page {studentPage} of {totalStudentPages}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayBooks.map(book => (
                      <div key={book.id}>
                        <StudentShelfCard
                          book={book}
                          onSelectBook={setSelectedBook}
                          onBorrow={setBorrowingBook}
                        />
                      </div>
                    ))}
                  </div>

                  {totalStudentPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-4">
                      <button
                        type="button"
                        disabled={studentPage === 1}
                        onClick={() => setStudentPage(prev => Math.max(prev - 1, 1))}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Previous Page
                      </button>
                      <span className="text-xs font-mono font-extrabold text-slate-700 dark:text-slate-300">
                        {studentPage} / {totalStudentPages}
                      </span>
                      <button
                        type="button"
                        disabled={studentPage >= totalStudentPages}
                        onClick={() => setStudentPage(prev => Math.min(prev + 1, totalStudentPages))}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Next Page →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <motion.div 
                  key="no-books"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`py-12 px-4 text-center ${currentPreset.cardBg} ${currentPreset.cardRadius} border ${currentPreset.cardBorder} space-y-3`}
                >
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    No Books Found
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    "{exactQuery}" was not found in the library catalog.
                  </p>
                </motion.div>
              )
            ) : (
              aiResults.length > 0 ? (
                <motion.div 
                  key="ai-results-list"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05
                      }
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {aiResults.map(res => (
                    <motion.div
                      key={res.book.id}
                      variants={{
                        hidden: { opacity: 0, y: 15 },
                        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
                      }}
                    >
                      <StudentShelfCard
                        book={res.book}
                        aiResult={res}
                        onSelectBook={setSelectedBook}
                        onBorrow={setBorrowingBook}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="no-ai-results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`py-12 px-4 text-center ${currentPreset.cardBg} ${currentPreset.cardRadius} border ${currentPreset.cardBorder} space-y-3`}
                >
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    No Relevant AI Match
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    We could not find matching books for topic "{aiQuery}".
                  </p>
                </motion.div>
              )
            )}
          </AnimatePresence>
            </>
          )}

        </div>

      </main>

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onBorrow={setBorrowingBook}
        />
      )}

      {/* Borrow Book Modal with Blinking Red Light & Barcode Scanner */}
      {borrowingBook && (
        <BorrowBookModal
          book={borrowingBook}
          onClose={() => setBorrowingBook(null)}
          onSuccess={() => {
            // Refresh books if needed
            if (currentCollege) {
              fetchCollegeBooks(currentCollege.id);
            }
          }}
        />
      )}

      {/* Direct Barcode Borrow Modal */}
      {isDirectBorrowOpen && currentCollege && (
        <DirectBarcodeBorrowModal
          college={currentCollege}
          onClose={() => setIsDirectBorrowOpen(false)}
          onSuccess={() => {
            if (currentCollege) {
              fetchCollegeBooks(currentCollege.id);
            }
          }}
        />
      )}

    </div>
  );
};
