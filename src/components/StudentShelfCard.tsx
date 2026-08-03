import React from 'react';
import { MapPin, QrCode, BookOpen, ChevronRight, Navigation, Sparkles } from 'lucide-react';
import { Book, AISearchResult } from '../types';
import { useTheme } from '../context/ThemeContext';

interface StudentShelfCardProps {
  book: Book;
  aiResult?: AISearchResult;
  onSelectBook: (book: Book, openMap?: boolean) => void;
  onBorrow: (book: Book) => void;
}

export const StudentShelfCard: React.FC<StudentShelfCardProps> = ({ book, aiResult, onSelectBook, onBorrow }) => {
  const { currentPreset } = useTheme();
  const isAvailable = book.availability === 'Available' && book.availableCopies > 0;

  // Determine shelf corner side for blinking light
  const getShelfCorner = (bookId: string) => {
    const lastChar = bookId.slice(-1);
    const num = parseInt(lastChar, 10) || 1;
    if (num % 3 === 0) return 'Right Corner / East Side';
    if (num % 3 === 1) return 'Left Corner / West Side';
    return 'Center Compartment';
  };

  const shelfSide = getShelfCorner(book.id);

  return (
    <div className={`p-5 rounded-3xl ${currentPreset.cardBg} border ${currentPreset.cardBorder} shadow-lg space-y-4 hover:shadow-xl transition-all relative overflow-hidden group`}>
      
      {/* Top Banner: Shelf Locator with Blinking Red Light */}
      <div className="p-4 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Shelf Finder (Red Light Blinking)</span>
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-mono font-bold">
            Almari {book.location.almariNumber}
          </span>
        </div>

        {/* Horizontal Scrollable Shelf Indicator Racks */}
        <div className="overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700 flex gap-2">
          {['Top Shelf', 'Middle Shelf', 'Bottom Shelf'].map((shelfName, sIdx) => {
            const isMatch = book.location.shelfPosition.toLowerCase().includes(shelfName.toLowerCase().split(' ')[0]);
            return (
              <div
                key={shelfName}
                className={`min-w-[130px] p-2.5 rounded-xl border text-center flex-shrink-0 transition-all ${
                  isMatch
                    ? 'bg-slate-900 border-rose-500 shadow-md shadow-rose-950/50'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <div className="text-[10px] text-slate-400 font-mono mb-1">{shelfName}</div>
                <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                  {isMatch ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-rose-400 font-extrabold">Active Spot</span>
                    </>
                  ) : (
                    <span>Rack</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-[11px] text-amber-300 font-medium flex items-center justify-between pt-1">
          <span>📍 Row {book.location.rowNumber} • {book.location.shelfPosition} ({shelfSide})</span>
          <span className="text-slate-400 text-[10px]">👉 Swipe shelves</span>
        </div>
      </div>

      {/* Book Title & Minimal Info */}
      <div className="space-y-1.5">
        {aiResult && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
              {aiResult.matchScore}% AI Match
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Call: {book.callNumber}
            </span>
          </div>
        )}

        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
          {book.title}
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          By {book.author} • <span className="text-slate-500">{book.department}</span>
        </p>
      </div>

      {aiResult && aiResult.reason && (
        <p className="text-xs text-slate-600 dark:text-slate-300 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 italic">
          "{aiResult.reason}"
        </p>
      )}

      {/* Action Buttons: Scan & Borrow (Take Home) + Shelf Map */}
      <div className="space-y-2 pt-1">
        {isAvailable ? (
          <button
            onClick={() => onBorrow(book)}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <QrCode className="w-5 h-5 animate-pulse" />
            <span>Scan Student ID & Take Home / Borrow</span>
          </button>
        ) : (
          <div className="w-full py-2.5 px-4 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs text-center rounded-xl">
            Currently Issued Out (Check Back Soon)
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => onSelectBook(book, true)}
            className={`flex-1 py-2 px-3 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>View Full Library Map</span>
          </button>
          <button
            onClick={() => onSelectBook(book, false)}
            className={`py-2 px-3 ${currentPreset.secondaryButtonBg} ${currentPreset.buttonRadius} font-medium text-xs flex items-center justify-center gap-1 transition-colors`}
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
