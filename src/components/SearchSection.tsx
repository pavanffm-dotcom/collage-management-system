import React, { useState } from 'react';
import { Sparkles, Search, Mic, X, Filter, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SearchSectionProps {
  searchMode: 'ai' | 'exact';
  setSearchMode: (mode: 'ai' | 'exact') => void;
  aiQuery: string;
  setAiQuery: (val: string) => void;
  exactQuery: string;
  setExactQuery: (val: string) => void;
  selectedDept: string;
  setSelectedDept: (val: string) => void;
  onlyAvailable: boolean;
  setOnlyAvailable: (val: boolean) => void;
  onRunAISearch: (queryToRun?: string) => void;
  onRunExactSearch: () => void;
  isSearching: boolean;
  departments: string[];
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  searchMode,
  setSearchMode,
  aiQuery,
  setAiQuery,
  exactQuery,
  setExactQuery,
  selectedDept,
  setSelectedDept,
  onlyAvailable,
  setOnlyAvailable,
  onRunAISearch,
  onRunExactSearch,
  isSearching,
  departments
}) => {
  const { currentPreset } = useTheme();
  const [isListening, setIsListening] = useState(false);

  const sampleQueries = [
    { label: 'Fish Curry of Goa', query: 'I need a Fish Curry book' },
    { label: 'Python Beginners', query: 'Book for Python beginners' },
    { label: 'Organic Chemistry', query: 'Organic Chemistry reactions' },
    { label: 'History of Maharashtra', query: 'History of Maharashtra' },
    { label: 'Java Interview', query: 'I need a book for Java Interview' },
    { label: 'Indian Constitution', query: 'I need a book about Indian Constitution' }
  ];

  const handleVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      const voiceSample = 'I need a Fish Curry book';
      setAiQuery(voiceSample);
      setIsListening(false);
      onRunAISearch(voiceSample);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (searchMode === 'ai') {
        onRunAISearch();
      } else {
        onRunExactSearch();
      }
    }
  };

  return (
    <div className={`bg-gradient-to-b ${currentPreset.bannerBg} text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden border`}>
      
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        
        {/* Main Heading */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs sm:text-sm font-medium mb-4 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Natural Language & Exact Catalog Finder</span>
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
          Locate Any Library Book Instantly
        </h2>

        <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto mb-8">
          Don't know the exact title or author? Simply describe what topic you are looking for in natural language or search by exact book name.
        </p>

        {/* Mode Selector Tabs */}
        <div className="inline-flex p-1 bg-slate-950/60 border border-white/10 rounded-2xl mb-6 shadow-inner backdrop-blur-md">
          <button
            onClick={() => setSearchMode('ai')}
            id="ai-search-mode-tab"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              searchMode === 'ai'
                ? `${currentPreset.buttonBg} shadow-lg`
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Search with AI</span>
          </button>
          <button
            onClick={() => setSearchMode('exact')}
            id="exact-search-mode-tab"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              searchMode === 'exact'
                ? `${currentPreset.buttonBg} shadow-lg`
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search by Book Name</span>
          </button>
        </div>

        {/* Search Input Box */}
        {searchMode === 'ai' ? (
          <div className="space-y-4">
            <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-2xl border-2 border-white/20 focus-within:border-white transition-all text-slate-900 dark:text-white">
              
              <div className="pl-3 sm:pl-4">
                <Sparkles className={`w-6 h-6 ${currentPreset.accentText}`} />
              </div>

              <input
                type="text"
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Describe the book you need... e.g. "I need a Fish Curry book"'
                id="ai-search-input"
                className="w-full py-3 px-3 sm:px-4 text-sm sm:text-base bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              />

              {aiQuery && (
                <button
                  onClick={() => setAiQuery('')}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* Voice Search Button */}
              <button
                onClick={handleVoiceSearch}
                id="voice-search-btn"
                className={`p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mr-1 ${
                  isListening ? 'animate-bounce text-red-500' : ''
                }`}
                title="Voice Search Simulation"
              >
                <Mic className={`w-5 h-5 ${isListening ? 'text-red-500' : ''}`} />
              </button>

              {/* AI Search Action Button */}
              <button
                onClick={() => onRunAISearch()}
                disabled={isSearching}
                id="find-book-ai-btn"
                className={`py-3 px-6 ${currentPreset.buttonBg} font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg flex items-center gap-2 whitespace-nowrap disabled:opacity-50`}
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Find Book</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Voice Listening Feedback */}
            {isListening && (
              <div className="text-xs text-amber-300 font-semibold animate-pulse flex items-center justify-center gap-2">
                <Mic className="w-4 h-4 text-red-400" />
                <span>Listening... Speak your book topic or question</span>
              </div>
            )}

            {/* Sample Natural Language Prompts */}
            <div className="text-left pt-2">
              <div className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                <span>Try asking in natural language:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sampleQueries.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAiQuery(sample.query);
                      onRunAISearch(sample.query);
                    }}
                    className="text-xs py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span>"{sample.query}"</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Exact Search Mode */
          <div className="space-y-4">
            <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-2xl border-2 border-white/20 focus-within:border-white transition-all text-slate-900 dark:text-white">
              
              <div className="pl-3 sm:pl-4">
                <Search className={`w-6 h-6 ${currentPreset.accentText}`} />
              </div>

              <input
                type="text"
                value={exactQuery}
                onChange={e => setExactQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by Title, Author, ISBN, Subject, Call Number..."
                id="exact-search-input"
                className="w-full py-3 px-3 sm:px-4 text-sm sm:text-base bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              />

              {exactQuery && (
                <button
                  onClick={() => setExactQuery('')}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={onRunExactSearch}
                id="search-button"
                className={`py-3 px-6 ${currentPreset.buttonBg} font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg flex items-center gap-2 whitespace-nowrap`}
              >
                <span>Search</span>
              </button>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-6 border-t border-white/15 text-xs sm:text-sm text-slate-200">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 font-medium text-white">
              <Filter className="w-4 h-4" />
              <span>Department:</span>
            </div>

            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              id="department-filter-select"
              className="bg-slate-950/70 border border-white/20 text-white rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-white">All Departments</option>
              {departments.map((dept, idx) => (
                <option key={idx} value={dept} className="bg-slate-900 text-white">{dept}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-200 hover:text-white">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={e => setOnlyAvailable(e.target.checked)}
              id="only-available-checkbox"
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-white/30 bg-slate-950"
            />
            <span className="text-xs font-medium">Show Only Available Books</span>
          </label>

        </div>

      </div>
    </div>
  );
};
