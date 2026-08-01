import React from 'react';
import { MapPin, BookOpen, CheckCircle, Clock, Sparkles, Navigation, ChevronRight } from 'lucide-react';
import { Book, AISearchResult } from '../types';
import { useTheme } from '../context/ThemeContext';

interface BookCardProps {
  book: Book;
  aiResult?: AISearchResult;
  onSelectBook: (book: Book, openMap?: boolean) => void;
}

export const BookCard: React.FC<BookCardProps> = React.memo(({ book, aiResult, onSelectBook }) => {
  const { currentPreset } = useTheme();
  const isAvailable = book.availability === 'Available' && book.availableCopies > 0;

  return (
    <div className={`${currentPreset.cardBg} ${currentPreset.cardRadius} border ${currentPreset.cardBorder} ${currentPreset.cardExtraClass} shadow-md hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between group relative overflow-hidden`}>
      
      {/* Top Bar: Department & Availability Badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={`text-xs font-bold px-3 py-1 ${currentPreset.badgeRadius} ${currentPreset.badgeBg}`}>
          {book.department}
        </span>

        <div className="flex items-center gap-2">
          {aiResult && (
            <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 ${currentPreset.badgeRadius} ${currentPreset.badgeBg}`}>
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
              <span>{aiResult.confidenceScore}% Match</span>
            </span>
          )}

          <span
            className={`text-xs font-medium px-2.5 py-0.5 ${currentPreset.badgeRadius} flex items-center gap-1 ${
              isAvailable
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {isAvailable ? (
              <>
                <CheckCircle className="w-3 h-3" />
                <span>Available ({book.availableCopies}/{book.totalCopies})</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3" />
                <span>{book.availability}</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Book Cover + Title Info */}
      <div className="flex gap-4 mb-4">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className={`w-20 h-28 object-cover ${currentPreset.buttonRadius} border border-slate-200 dark:border-slate-800 shadow-sm shrink-0`}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={`w-20 h-28 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} flex items-center justify-center text-white shrink-0 shadow-sm`}>
            <BookOpen className="w-8 h-8 opacity-80" />
          </div>
        )}

        <div className="space-y-1 min-w-0 flex-1">
          <h3 className={`text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:${currentPreset.accentText} transition-colors`}>
            {book.title}
          </h3>
          {book.subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">
              {book.subtitle}
            </p>
          )}
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            By <span className="font-semibold">{book.author}</span>
          </p>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-1 font-mono">
            <span>ISBN: {book.isbn}</span>
            <span>•</span>
            <span>Call: {book.callNumber}</span>
          </div>
        </div>
      </div>

      {/* AI Match Reason (If AI Search) */}
      {aiResult && aiResult.matchedConcepts && aiResult.matchedConcepts.length > 0 && (
        <div className={`mb-4 p-2.5 ${currentPreset.badgeRadius} text-xs ${currentPreset.badgeBg}`}>
          <span className="font-bold">AI Topic Match: </span>
          <span className="opacity-90">{aiResult.matchReason}</span>
        </div>
      )}

      {/* Shelf Location Box */}
      <div className={`p-3.5 ${currentPreset.inputRadius} border ${currentPreset.borderColor} ${currentPreset.innerCardBg} mb-4 flex items-center justify-between`}>
        <div className="space-y-0.5">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1">
            <MapPin className={`w-3 h-3 ${currentPreset.accentText}`} />
            Physical Shelf GPS Location
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            Almari {book.location.almariNumber.replace(/\D/g, '')} • Row {book.location.rowNumber.replace(/\D/g, '')} • {book.location.shelfPosition} Shelf
          </div>
        </div>

        <div className={`text-center px-3 py-1.5 ${currentPreset.badgeRadius} ${currentPreset.buttonBg} font-mono font-extrabold text-sm shadow-sm tracking-wider`}>
          {book.location.shelfCode}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onSelectBook(book, true)}
          className={`flex-1 py-2.5 px-3 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm`}
        >
          <Navigation className="w-4 h-4" />
          <span>View Location</span>
        </button>
        <button
          onClick={() => onSelectBook(book, false)}
          className={`py-2.5 px-3 ${currentPreset.secondaryButtonBg} ${currentPreset.buttonRadius} font-medium text-xs sm:text-sm flex items-center justify-center gap-1 transition-colors`}
        >
          <span>Details</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
});
