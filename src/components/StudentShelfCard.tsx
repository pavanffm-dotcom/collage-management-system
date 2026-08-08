import React from 'react';
import { MapPin, QrCode, BookOpen, ChevronRight, Navigation, Sparkles } from 'lucide-react';
import { Book, AISearchResult } from '../types';
import { useTheme } from '../context/ThemeContext';
import { GrandWoodenAlmari } from './GrandWoodenAlmari';

interface StudentShelfCardProps {
  book: Book;
  aiResult?: AISearchResult;
  onSelectBook: (book: Book, openMap?: boolean) => void;
  onBorrow: (book: Book) => void;
}

export const StudentShelfCard: React.FC<StudentShelfCardProps> = React.memo(({ book, aiResult, onSelectBook, onBorrow }) => {
  const { currentPreset } = useTheme();
  const isAvailable = book.availability === 'Available' && book.availableCopies > 0;

  return (
    <div className={`p-4 sm:p-5 rounded-3xl ${currentPreset.cardBg} border ${currentPreset.cardBorder} shadow-lg space-y-4 hover:shadow-xl transition-all relative overflow-hidden group`}>
      
      {/* Top Banner: 5x4 Grand Wooden Almari Visualizer with Blinking Red Light */}
      <div className="space-y-2">
        <GrandWoodenAlmari book={book} onOpenMap={() => onSelectBook(book, true)} showDetailsBadge={true} />
      </div>

      {/* Book Title & Minimal Info */}
      <div className="space-y-1.5">
        {aiResult && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
              {aiResult.confidenceScore || (aiResult as any).matchScore || 90}% Search Match
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

      {aiResult && (aiResult.matchReason || (aiResult as any).reason) && (
        <p className="text-xs text-slate-600 dark:text-slate-300 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 italic">
          "{aiResult.matchReason || (aiResult as any).reason}"
        </p>
      )}

      {/* Action Buttons: Exactly Two Buttons (Borrow + Locate) */}
      <div className="space-y-2 pt-1">
        {isAvailable ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onBorrow(book)}
              className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/25 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <QrCode className="w-4 h-4 animate-pulse" />
              <span>Scan College ID</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectBook(book, true)}
              className={`py-3 px-3 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm hover:opacity-90`}
            >
              <Navigation className="w-4 h-4" />
              <span>Locate</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="py-2.5 px-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs text-center rounded-xl flex items-center justify-center">
              Issued Out
            </div>
            <button
              type="button"
              onClick={() => onSelectBook(book, true)}
              className={`py-2.5 px-3 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm hover:opacity-90`}
            >
              <Navigation className="w-4 h-4" />
              <span>Locate</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
});
