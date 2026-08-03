import React, { useState } from 'react';
import { X, MapPin, BookOpen, Layers, CheckCircle2, Share2, Printer, Tag, Calendar, Globe, Building2, Bookmark } from 'lucide-react';
import { Book } from '../types';
import { LibraryMap } from './LibraryMap';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'motion/react';

interface BookDetailModalProps {
  book: Book | null;
  initialTab?: 'details' | 'map';
  onClose: () => void;
  onBorrow?: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, initialTab = 'details', onClose, onBorrow }) => {
  const { currentPreset } = useTheme();
  const [activeTab, setActiveTab] = useState<'details' | 'map'>(initialTab);

  if (!book) return null;

  const isAvailable = book.availability === 'Available' && book.availableCopies > 0;

  const handlePrintSlip = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `Locate "${book.title}" in Central Library at Shelf Code: ${book.location.shelfCode} (Almari ${book.location.almariNumber}, Row ${book.location.rowNumber})`
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`Book: ${book.title} | Location: ${book.location.shelfCode} (Almari ${book.location.almariNumber})`);
      alert('Location copied to clipboard!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className={`${currentPreset.modalBg} rounded-3xl max-w-3xl w-full border ${currentPreset.cardBorder} shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col`}
      >
        
        {/* Modal Header Banner */}
        <div className={`bg-gradient-to-r ${currentPreset.bannerBg} text-white p-5 sm:p-6 flex items-start justify-between gap-4 border-b border-slate-800`}>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${currentPreset.badgeBg}`}>
                {book.department}
              </span>
              <span className="text-xs font-mono text-slate-300">
                Acc: {book.accessionNumber}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold leading-tight">
              {book.title}
            </h2>
            {book.subtitle && (
              <p className="text-xs sm:text-sm text-slate-300 italic">
                {book.subtitle}
              </p>
            )}
            <p className="text-xs text-slate-200 font-medium pt-1">
              Author: <span className="font-bold text-white">{book.author}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl bg-black/20 hover:bg-black/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'details'
                ? `bg-white dark:bg-slate-900 ${currentPreset.accentText} shadow-sm`
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Book Metadata & Summary</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'map'
                ? `bg-white dark:bg-slate-900 ${currentPreset.accentText} shadow-sm`
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4 text-amber-500" />
            <span>Interactive Map & Shelf GPS</span>
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              
              {/* Cover + Location GPS Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Book Cover */}
                <div className="sm:col-span-1 flex flex-col items-center">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-36 h-52 object-cover rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md"
                    />
                  ) : (
                    <div className={`w-36 h-52 ${currentPreset.buttonBg} rounded-2xl flex items-center justify-center text-white shadow-md`}>
                      <BookOpen className="w-12 h-12 opacity-80" />
                    </div>
                  )}

                  <div className="mt-3 text-center">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5 ${
                        isAvailable
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{book.availability} ({book.availableCopies}/{book.totalCopies} Available)</span>
                    </span>
                  </div>
                </div>

                {/* Physical Location GPS Card */}
                <div className={`sm:col-span-2 p-5 rounded-2xl border ${currentPreset.borderColor} bg-slate-50 dark:bg-slate-800/60 space-y-4 flex flex-col justify-between`}>
                  
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-5 h-5 ${currentPreset.accentText}`} />
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                          Physical GPS Shelf Coordinates
                        </h4>
                      </div>
                      <span className={`px-3 py-1 rounded-lg ${currentPreset.buttonBg} font-mono font-black text-sm tracking-widest shadow-xs`}>
                        {book.location.shelfCode}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Almari Number</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{book.location.almariNumber}</span>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Row Number</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{book.location.rowNumber}</span>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Shelf Level</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{book.location.shelfPosition} Shelf</span>
                      </div>
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Floor Wing</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{book.location.floorWing}</span>
                      </div>
                    </div>
                  </div>

                  {/* Button to Switch to Map Tab */}
                  <button
                    onClick={() => setActiveTab('map')}
                    className={`w-full py-2.5 px-4 ${currentPreset.buttonBg} font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all`}
                  >
                    <MapPin className="w-4 h-4 text-amber-300" />
                    <span>Open Interactive 2D Floor Plan</span>
                  </button>

                </div>

              </div>

              {/* Book Summary & Tags */}
              <div className="space-y-4">
                {book.description && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Bookmark className={`w-3.5 h-3.5 ${currentPreset.accentText}`} />
                      <span>Synopsis / Book Overview</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">Publisher</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{book.publisher}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">Publish Year</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{book.publishYear}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">ISBN Number</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{book.isbn}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">Call Number</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{book.callNumber}</span>
                  </div>
                </div>

                {/* Keywords & Tags */}
                {book.keywords && book.keywords.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className={`w-3.5 h-3.5 ${currentPreset.accentText}`} />
                      <span>Search Keywords & Index Topics</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {book.keywords.map((tag, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2.5 py-1 rounded-lg ${currentPreset.badgeBg} font-medium`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Interactive Map Tab */
            <div className="space-y-4">
              <LibraryMap selectedBook={book} />
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {onBorrow && isAvailable && (
              <button
                onClick={() => {
                  onClose();
                  onBorrow(book);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all animate-pulse"
              >
                <span>Scan & Borrow / Take Home</span>
              </button>
            )}
            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Location</span>
            </button>
            <button
              onClick={handlePrintSlip}
              className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Location Slip</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl ${currentPreset.buttonBg} text-xs font-bold shadow-sm transition-all`}
          >
            Close
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
};
