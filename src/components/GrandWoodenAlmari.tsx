import React from 'react';
import { MapPin, Sparkles, Layers, BookOpen, Lock, FileSpreadsheet, Cpu } from 'lucide-react';
import { Book } from '../types';
import { useTheme } from '../context/ThemeContext';

interface GrandWoodenAlmariProps {
  book: Book;
  onOpenMap?: () => void;
  showDetailsBadge?: boolean;
}

export const GrandWoodenAlmari: React.FC<GrandWoodenAlmariProps> = ({
  book,
  onOpenMap,
  showDetailsBadge = true
}) => {
  const { currentPreset } = useTheme();

  // Parse Almari Number (e.g. "Almari 3" -> 3)
  const almariNum = parseInt(book.location.almariNumber.replace(/\D/g, ''), 10) || 1;

  // Check if saved Almirah config exists in localStorage
  let savedConfig: { rowCount?: number; designType?: string; name?: string } | null = null;
  try {
    const raw = localStorage.getItem('gec_almari_configs');
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        savedConfig = list.find((item: any) => item.almariNum === almariNum) || null;
      }
    }
  } catch (e) {}

  // Determine design category properties based on savedConfig or almariNum % 5
  // Total 5 distinct size categories:
  // 1. Compact Reading Rack (3 Rows x 3 Cols)
  // 2. Archive Closed Cabinet (4 Rows x 4 Cols)
  // 3. Periodical Display Desk (2 Rows x 3 Cols)
  // 4. Grand Library Bay (5 Rows x 4 Cols)
  // 5. Digital Micro-Tower (6 Rows x 4 Cols)
  const designType = savedConfig?.designType || (() => {
    const mod = almariNum % 5;
    if (mod === 1) return 'grand_double';
    if (mod === 2) return 'compact_corner';
    if (mod === 3) return 'archive_closed';
    if (mod === 4) return 'periodical_rack';
    return 'digital_tower';
  })();

  const getCategoryDetails = () => {
    switch (designType) {
      case 'compact_corner':
        return {
          title: 'Compact Reading Rack',
          badge: '3-Tier Short',
          rows: savedConfig?.rowCount || 3,
          cols: 3,
          slotHeight: 'h-14 sm:h-18',
          icon: BookOpen
        };
      case 'archive_closed':
        return {
          title: 'Archive Secure Cabinet',
          badge: '4-Tier Vault',
          rows: savedConfig?.rowCount || 4,
          cols: 4,
          slotHeight: 'h-16 sm:h-20',
          icon: Lock
        };
      case 'periodical_rack':
        return {
          title: 'Periodical Display Desk',
          badge: '2-Tier Low',
          rows: savedConfig?.rowCount || 2,
          cols: 3,
          slotHeight: 'h-24 sm:h-28',
          icon: FileSpreadsheet
        };
      case 'digital_tower':
        return {
          title: 'Digital Micro-Tower',
          badge: '6-Tier Slim',
          rows: savedConfig?.rowCount || 6,
          cols: 4,
          slotHeight: 'h-12 sm:h-14',
          icon: Cpu
        };
      case 'grand_double':
      default:
        return {
          title: 'Grand Library Bay',
          badge: '5-Tier Tall',
          rows: savedConfig?.rowCount || 5,
          cols: 4,
          slotHeight: 'h-16 sm:h-20',
          icon: Layers
        };
    }
  };

  const category = getCategoryDetails();
  const totalRows = category.rows;
  const totalCols = category.cols;
  const CategoryIcon = category.icon;

  // Calculate target row index (0..totalRows-1)
  const getTargetRowIndex = (rowStr: string, posStr: string) => {
    const parsedRow = parseInt(rowStr.replace(/\D/g, ''), 10);
    if (!isNaN(parsedRow) && parsedRow >= 1 && parsedRow <= totalRows) {
      return parsedRow - 1; // 0-based
    }
    const pos = posStr.toLowerCase();
    if (pos.includes('top')) return 0;
    if (pos.includes('upper')) return Math.min(1, totalRows - 1);
    if (pos.includes('middle') || pos.includes('center')) return Math.floor(totalRows / 2);
    if (pos.includes('lower')) return Math.max(0, totalRows - 2);
    if (pos.includes('bottom')) return totalRows - 1;
    return Math.floor(totalRows / 2);
  };

  // Calculate target column index (0..totalCols-1)
  const getTargetColIndex = (bookId: string, accessionNo?: string) => {
    const raw = (accessionNo || bookId || '1').replace(/\D/g, '');
    const num = parseInt(raw.slice(-2), 10) || parseInt(raw.slice(-1), 10) || 1;
    return num % totalCols;
  };

  const targetRowIdx = getTargetRowIndex(book.location.rowNumber, book.location.shelfPosition);
  const targetColIdx = getTargetColIndex(book.id, book.accessionNumber);

  // Decorative book spine colors
  const bookColors = [
    'from-indigo-600 to-indigo-900 border-indigo-400',
    'from-amber-600 to-amber-900 border-amber-400',
    'from-rose-600 to-rose-900 border-rose-400',
    'from-emerald-600 to-emerald-900 border-emerald-400',
    'from-purple-600 to-purple-900 border-purple-400',
    'from-cyan-600 to-cyan-900 border-cyan-400',
    'from-teal-600 to-teal-900 border-teal-400',
  ];

  const getBookSpinesForSlot = (rIdx: number, cIdx: number) => {
    const count = ((rIdx + 1) * (cIdx + 1) * 3) % 3 + 3; // 3 to 5 books per slot
    const spines = [];
    for (let i = 0; i < count; i++) {
      const colorClass = bookColors[(rIdx + cIdx + i) % bookColors.length];
      const heightPercent = 70 + ((i * 8 + rIdx * 5) % 25);
      spines.push({ colorClass, heightPercent });
    }
    return spines;
  };

  return (
    <div className={`w-full max-w-3xl mx-auto ${currentPreset.cardRadius} ${currentPreset.cardBg} border ${currentPreset.cardBorder} shadow-2xl overflow-hidden font-sans transition-all`}>
      
      {/* Top Almari Header Banner - Matches Active App Theme */}
      <div className={`bg-gradient-to-r ${currentPreset.bannerBg} px-3.5 py-2.5 sm:px-4 sm:py-2.5 border-b ${currentPreset.cardBorder} flex items-center justify-between gap-2`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <CategoryIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
              <span>Almirah #{almariNum} - {category.title}</span>
            </h4>
            <div className="text-[10px] text-white/80 font-mono flex items-center gap-1.5">
              <span>{category.badge}</span>
              <span>•</span>
              <span>{book.location.shelfPosition} Shelf (Row {book.location.rowNumber})</span>
            </div>
          </div>
        </div>

        {onOpenMap && (
          <button
            type="button"
            onClick={onOpenMap}
            className={`px-3 py-1.5 rounded-xl ${currentPreset.buttonBg} text-[10px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md active:scale-95`}
          >
            <span>Navigate</span>
            <MapPin className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Almirah Frame Container - Theme Adaptive Background */}
      <div className={`p-2.5 sm:p-4 ${currentPreset.heroCardBg} relative`}>
        
        {/* Interior Shelf Backpanel with Grid Matrix */}
        <div className={`p-2 sm:p-3 rounded-2xl ${currentPreset.innerCardBg} border ${currentPreset.cardBorder} space-y-2 relative shadow-inner`}>
          
          {/* Dynamic Rows */}
          {Array.from({ length: totalRows }).map((_, rIdx) => {
            const rowNumberLabel = `Row ${rIdx + 1}`;
            const isTargetRow = rIdx === targetRowIdx;

            return (
              <div key={rIdx} className="space-y-1">
                {/* Row Header Indicator */}
                <div className="flex items-center justify-between px-2 text-[9px] sm:text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <span>{rowNumberLabel}</span>
                  {isTargetRow && (
                    <span className={`${currentPreset.accentText} font-black flex items-center gap-1 animate-pulse`}>
                      ★ TARGET ROW ACTIVE
                    </span>
                  )}
                </div>

                {/* Dynamic Columns Grid */}
                <div className={`grid gap-1.5 sm:gap-2 ${totalCols === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                  {Array.from({ length: totalCols }).map((_, cIdx) => {
                    const isTargetSpot = isTargetRow && cIdx === targetColIdx;
                    const colLabel = `Col ${cIdx + 1}`;
                    const bookSpines = getBookSpinesForSlot(rIdx, cIdx);

                    return (
                      <div
                        key={cIdx}
                        className={`${category.slotHeight} rounded-xl border relative flex flex-col justify-end p-1 transition-all overflow-hidden ${
                          isTargetSpot
                            ? `${currentPreset.innerCardBg} border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)] ring-2 ring-rose-500/50 scale-[1.02] z-10`
                            : 'bg-black/10 dark:bg-black/30 border-slate-200/40 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                        }`}
                      >
                        {/* Shelf Floor Plank */}
                        <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-300/60 dark:bg-slate-700/60 border-t border-slate-400/40 dark:border-slate-600/40" />

                        {/* Simulated Books Spine Stack */}
                        <div className="flex items-end justify-center gap-0.5 sm:gap-1 h-full pb-1.5 px-0.5">
                          {bookSpines.map((spine, sIdx) => {
                            const isSelectedBookSpine = isTargetSpot && sIdx === 1; // Highlight target book
                            return (
                              <div
                                key={sIdx}
                                style={{ height: `${spine.heightPercent}%` }}
                                className={`w-1.5 sm:w-2.5 rounded-t-xs bg-gradient-to-r ${
                                  isSelectedBookSpine
                                    ? 'from-rose-500 via-amber-400 to-rose-600 border border-yellow-300 shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-pulse'
                                    : spine.colorClass
                                } border-t border-x transition-all`}
                              />
                            );
                          })}
                        </div>

                        {/* BLINKING BEACON OVERLAY FOR TARGET BOOK */}
                        {isTargetSpot && (
                          <div className="absolute inset-0 bg-rose-500/15 backdrop-blur-[0.5px] flex flex-col items-center justify-center p-1 pointer-events-none">
                            <div className="relative flex items-center justify-center">
                              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-rose-500/30 animate-ping absolute" />
                              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-rose-600/60 animate-pulse absolute" />
                              <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-rose-500 border-2 border-white shadow-lg relative z-10 animate-bounce" />
                            </div>

                            <div className="mt-1 px-1.5 py-0.5 rounded bg-rose-600 text-white font-black text-[8px] sm:text-[9px] uppercase tracking-wider shadow-md whitespace-nowrap animate-pulse">
                              📍 HERE
                            </div>
                          </div>
                        )}

                        {/* Column Label */}
                        <span className={`absolute top-1 left-1.5 text-[8px] font-mono ${isTargetSpot ? 'text-rose-500 font-black' : 'text-slate-400 dark:text-slate-500'}`}>
                          {colLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Shelf Plank Divider */}
                <div className={`h-1 sm:h-1.5 ${currentPreset.buttonBg} rounded-full opacity-60 shadow-xs`} />
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};

