import React, { useState, useEffect } from 'react';
import { Search, Sparkles, BookOpen, Filter, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Book, College, AISearchResult, AISearchResponse } from '../types';
import { BookCard } from './BookCard';
import { BookDetailModal } from './BookDetailModal';
import { useTheme } from '../context/ThemeContext';

interface PublicStudentViewProps {
  currentCollege: College | null;
  colleges: College[];
  onSelectCollege: (col: College) => void;
  onOpenLibrarianLogin?: () => void;
}

export const PublicStudentView: React.FC<PublicStudentViewProps> = ({
  currentCollege,
  colleges,
  onSelectCollege,
  onOpenLibrarianLogin
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

  // Departments list for filter
  const departments = Array.from(new Set(books.map(b => b.department))).filter(Boolean);

  // Fetch catalog books when college changes
  useEffect(() => {
    if (currentCollege) {
      fetchCollegeBooks(currentCollege.id);
    }
  }, [currentCollege]);

  const fetchCollegeBooks = async (collegeId: string) => {
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
  };

  // Run Exact Search (Search by Book Name)
  const handleExactSearch = async () => {
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
          collegeId: currentCollege.id
        })
      });
      const data = await res.json();
      setBooks(data.books || []);
    } catch (err) {
      console.error('Exact search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Run AI Search
  const handleAISearch = async (queryToRun?: string) => {
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
          collegeId: currentCollege.id
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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (searchMode === 'exact') handleExactSearch();
      else handleAISearch();
    }
  };

  return (
    <div className={`min-h-screen ${currentPreset.pageBg} text-slate-900 dark:text-slate-100 pb-28 transition-colors duration-500`}>
      
      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        
        {/* Search Header Box */}
        <div className={`${currentPreset.heroCardBg} ${currentPreset.cardRadius} p-6 sm:p-8 text-center space-y-5 transition-all duration-500`}>
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
              Smart AI
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Search any book by title or describe your topic in natural language.
            </p>
          </div>

          {/* Search Mode Tabs: Default "Search by Book Name" first, then "Search with AI" */}
          <div className={`inline-flex p-1 ${currentPreset.innerCardBg} ${currentPreset.cardRadius} border ${currentPreset.borderColor}`}>
            <button
              onClick={() => { setSearchMode('exact'); setHasSearched(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 ${currentPreset.buttonRadius} text-xs sm:text-sm font-bold transition-all ${
                searchMode === 'exact'
                  ? `${currentPreset.buttonBg} shadow-md`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search by Book Name</span>
            </button>

            <button
              onClick={() => { setSearchMode('ai'); setHasSearched(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 ${currentPreset.buttonRadius} text-xs sm:text-sm font-bold transition-all ${
                searchMode === 'ai'
                  ? `${currentPreset.buttonBg} shadow-md`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Search with AI</span>
            </button>
          </div>

          {/* Search Input Box */}
          {searchMode === 'exact' ? (
            <div className="max-w-2xl mx-auto space-y-4">
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
                <button
                  onClick={handleExactSearch}
                  disabled={isSearching}
                  className={`py-2.5 px-5 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50`}
                >
                  {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Search</span>}
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Filter className={`w-3.5 h-3.5 ${currentPreset.accentText}`} />
                  <span>Department:</span>
                  <select
                    value={selectedDept}
                    onChange={e => setSelectedDept(e.target.value)}
                    className={`${currentPreset.inputBg} ${currentPreset.buttonRadius} px-2.5 py-1 text-xs text-slate-900 dark:text-white`}
                  >
                    <option value="All">All Departments</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={e => setOnlyAvailable(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Show Only Available Books</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
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
                <button
                  onClick={() => handleAISearch()}
                  disabled={isSearching}
                  className={`py-2.5 px-5 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50`}
                >
                  {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>AI Search</span>}
                </button>
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
                    <button
                      key={idx}
                      onClick={() => {
                        setAiQuery(q);
                        handleAISearch(q);
                      }}
                      className={`text-[11px] py-1 px-2.5 ${currentPreset.badgeRadius} ${currentPreset.secondaryButtonBg} transition-colors`}
                    >
                      "{q}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Results Section */}
        <div className="space-y-6">
          
          {/* Header showing result count or scope message */}
          <div className={`flex items-center justify-between border-b ${currentPreset.borderColor} pb-3`}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className={`w-5 h-5 ${currentPreset.accentText}`} />
              <span>
                {searchMode === 'exact'
                  ? 'Library Catalog'
                  : `AI Search Results for "${aiQuery}"`}
              </span>
            </h3>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${currentPreset.badgeBg}`}>
              {searchMode === 'exact' ? `${books.length} Books` : `${aiResults.length} Matched`}
            </span>
          </div>

          {/* AI Concept Badges */}
          {searchMode === 'ai' && extractedConcepts.length > 0 && (
            <div className={`flex items-center gap-2 flex-wrap p-3 rounded-2xl ${currentPreset.badgeBg}`}>
              <span className="text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                AI Understood Concepts:
              </span>
              {extractedConcepts.map((concept, idx) => (
                <span
                  key={idx}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${currentPreset.innerCardBg} text-slate-800 dark:text-slate-200 border ${currentPreset.borderColor} shadow-xs`}
                >
                  {concept}
                </span>
              ))}
            </div>
          )}

          {/* Content Listing */}
          {isSearching ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Searching library catalog...
              </p>
            </div>
          ) : searchMode === 'exact' ? (
            books.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map(book => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onSelectBook={setSelectedBook}
                  />
                ))}
              </div>
            ) : (
              <div className={`py-12 px-4 text-center ${currentPreset.cardBg} ${currentPreset.cardRadius} border ${currentPreset.cardBorder} space-y-3`}>
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No Books Found
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  "{exactQuery}" was not found in the library catalog.
                </p>
              </div>
            )
          ) : (
            aiResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiResults.map(res => (
                  <BookCard
                    key={res.book.id}
                    book={res.book}
                    aiResult={res}
                    onSelectBook={setSelectedBook}
                  />
                ))}
              </div>
            ) : (
              <div className={`py-12 px-4 text-center ${currentPreset.cardBg} ${currentPreset.cardRadius} border ${currentPreset.cardBorder} space-y-3`}>
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No Relevant AI Match
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  We could not find matching books for topic "{aiQuery}".
                </p>
              </div>
            )
          )}

        </div>

      </main>

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}

    </div>
  );
};
