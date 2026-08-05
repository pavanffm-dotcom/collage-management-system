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

export const StudentShelfCard: React.FC<StudentShelfCardProps> = ({ book, aiResult, onSelectBook, onBorrow }) => {
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
