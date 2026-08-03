import React, { useState } from 'react';
import { X, QrCode, CheckCircle2, MapPin, BookOpen, User, Calendar, Clock, Sparkles, ArrowRight, ShieldCheck, Camera, Radio } from 'lucide-react';
import { Book } from '../types';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

interface BorrowBookModalProps {
  book: Book | null;
  onClose: () => void;
  onSuccess?: (issuedRecord: any) => void;
}

export const BorrowBookModal: React.FC<BorrowBookModalProps> = ({ book, onClose, onSuccess }) => {
  const { currentPreset } = useTheme();

  const [studentId, setStudentId] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [borrowType, setBorrowType] = useState<'home' | 'reading_room' | 'project_work'>('home');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isIssued, setIsIssued] = useState<boolean>(false);
  const [issuedRecord, setIssuedRecord] = useState<any>(null);

  if (!book) return null;

  // Determine shelf corner / side for the blinking red light based on accession number
  const getShelfCorner = (bookId: string) => {
    const lastChar = bookId.slice(-1);
    const num = parseInt(lastChar, 10) || 1;
    if (num % 3 === 0) return { side: 'Right Corner / East Side', positionCol: 'col-start-3', colIndex: 2 };
    if (num % 3 === 1) return { side: 'Left Corner / West Side', positionCol: 'col-start-1', colIndex: 0 };
    return { side: 'Center Compartment', positionCol: 'col-start-2', colIndex: 1 };
  };

  const shelfCorner = getShelfCorner(book.id);

  // Determine row index (0 = Top, 1 = Middle, 2 = Bottom)
  const getRowIndex = (pos: string) => {
    if (pos.toLowerCase().includes('top')) return 0;
    if (pos.toLowerCase().includes('bottom')) return 2;
    return 1;
  };

  const targetRowIdx = getRowIndex(book.location.shelfPosition);

  // Simulate barcode scan from College Identity Card
  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const demoId = `GEC-${book.department.slice(0, 3).toUpperCase()}-2024-${Math.floor(100 + Math.random() * 899)}`;
      setStudentId(demoId);
      if (!studentName) {
        setStudentName('Rahul Sawant');
      }
    }, 1200);
  };

  const handleConfirmBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !studentName.trim()) return;

    const returnDate = new Date();
    if (borrowType === 'home') {
      returnDate.setDate(returnDate.getDate() + 14); // 14 days home issue
    } else if (borrowType === 'project_work') {
      returnDate.setDate(returnDate.getDate() + 30); // 30 days project
    } else {
      returnDate.setHours(returnDate.getHours() + 6); // Same day reading room
    }

    const newIssue = {
      id: `ISS-${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      author: book.author,
      isbn: book.isbn,
      accessionNumber: book.accessionNumber,
      almariNumber: book.location.almariNumber,
      shelfCode: book.location.shelfCode,
      studentId: studentId.trim(),
      studentName: studentName.trim(),
      borrowType,
      issuedAt: new Date().toISOString(),
      returnDueDate: returnDate.toISOString(),
      status: 'Issued'
    };

    // Save to localStorage so staff/admin can see real borrowing logs
    try {
      const existing = localStorage.getItem('library_issued_books');
      const parsed = existing ? JSON.parse(existing) : [];
      const updated = [newIssue, ...parsed];
      localStorage.setItem('library_issued_books', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to store borrowing record:', err);
    }

    setIssuedRecord(newIssue);
    setIsIssued(true);
    if (onSuccess) {
      onSuccess(newIssue);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/85 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 15 }}
        className={`${currentPreset.modalBg} rounded-3xl max-w-2xl w-full border ${currentPreset.cardBorder} shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col`}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${currentPreset.bannerBg} text-white p-5 sm:p-6 flex items-center justify-between gap-4 border-b border-slate-800`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase tracking-wider flex items-center gap-1">
                <QrCode className="w-3 h-3" />
                <span>Self-Service Scan & Borrow</span>
              </span>
              <span className="text-xs font-mono text-slate-300">
                Almari {book.location.almariNumber}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold leading-tight">
              {book.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl bg-black/20 hover:bg-black/40 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {isIssued ? (
            /* SUCCESS CONFIRMATION SCREEN */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-5"
            >
              <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Book Issued Successfully!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Please pick up your book from the blinking red light location on the shelf below.
                </p>
              </div>

              {/* Shelf Photo Reminder Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>Exact Shelf Location (Almari {book.location.almariNumber})</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-rose-600 text-white text-xs font-mono font-extrabold animate-pulse">
                    BLINKING RED LIGHT
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">ALMARI & ROW</span>
                    <span className="font-bold text-white">Almari {book.location.almariNumber} • Row {book.location.rowNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">SHELF LEVEL & SIDE</span>
                    <span className="font-bold text-amber-300">{book.location.shelfPosition} Shelf • {shelfCorner.side}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Student Name:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{issuedRecord?.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Student Roll / ID:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{issuedRecord?.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Issue Type:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase">{issuedRecord?.borrowType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Return Due Date:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {new Date(issuedRecord?.returnDueDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className={`w-full py-3 px-6 ${currentPreset.buttonBg} text-white font-bold rounded-xl shadow-md transition-all`}
              >
                Done & Continue Browsing
              </button>
            </motion.div>
          ) : (
            /* BORROW FORM & SHELF LOCATION PHOTO WITH BLINKING RED LIGHT */
            <form onSubmit={handleConfirmBorrow} className="space-y-6">
              
              {/* VISUAL LIBRARY SHELF RACK WITH BLINKING RED LIGHT */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-500 animate-bounce" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                        Physical Shelf Photo & GPS Spot
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Almari {book.location.almariNumber} • Row {book.location.rowNumber} • {book.location.shelfPosition} Shelf ({shelfCorner.side})
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-400 text-xs font-mono font-extrabold flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>RED LIGHT BLINKING</span>
                  </span>
                </div>

                {/* 3x3 Shelf Diagram Photo Simulation */}
                <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 space-y-2">
                  <div className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-mono">
                    — Almari {book.location.almariNumber} Cabinet Front View —
                  </div>
                  <div className="grid grid-rows-3 gap-2 py-1">
                    {['Top Shelf', 'Middle Shelf', 'Bottom Shelf'].map((shelfLabel, rIdx) => {
                      const isTargetRow = rIdx === targetRowIdx;
                      return (
                        <div
                          key={shelfLabel}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium ${
                            isTargetRow
                              ? 'bg-slate-800/90 border-amber-500/60 shadow-md'
                              : 'bg-slate-950/60 border-slate-800/60 text-slate-500'
                          }`}
                        >
                          <span className="w-20 font-mono text-[11px]">{shelfLabel}</span>
                          
                          {/* 3 Columns: Left, Center, Right */}
                          <div className="flex-1 grid grid-cols-3 gap-2 px-2">
                            {[0, 1, 2].map(cIdx => {
                              const isTargetSpot = isTargetRow && cIdx === shelfCorner.colIndex;
                              return (
                                <div
                                  key={cIdx}
                                  className={`h-7 rounded flex items-center justify-center relative transition-all ${
                                    isTargetSpot
                                      ? 'bg-rose-950 border-2 border-rose-500 shadow-lg shadow-rose-500/40'
                                      : 'bg-slate-800/40 border border-slate-700/40'
                                  }`}
                                >
                                  {isTargetSpot ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute" />
                                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 relative z-10" />
                                      <span className="text-[10px] font-extrabold text-rose-300 uppercase tracking-wider relative z-10 hidden sm:inline">
                                        HERE
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <span className="text-[10px] text-slate-400 w-16 text-right">
                            {isTargetRow ? (
                              <span className="text-amber-400 font-bold">★ Active</span>
                            ) : (
                              'Rack'
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[11px] text-center text-amber-300 font-medium pt-1">
                    📍 Go to <strong className="text-white">Almari {book.location.almariNumber}</strong> — Look for the <strong className="text-rose-400 underline">blinking red light</strong> on the {book.location.shelfPosition} shelf ({shelfCorner.side}).
                  </div>
                </div>
              </div>

              {/* Barcode ID Scanner Simulation Box */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Step 1: Scan Student ID Card Barcode or Enter Roll No
                  </label>
                  <button
                    type="button"
                    onClick={handleSimulateScan}
                    disabled={isScanning}
                    className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isScanning ? 'Scanning Barcode...' : 'Simulate ID Card Barcode Scan'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Student Roll / Barcode ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={studentId}
                      onChange={e => setStudentId(e.target.value)}
                      placeholder="e.g. GEC-CS-2024-045"
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${currentPreset.borderColor} ${currentPreset.innerCardBg} text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      placeholder="e.g. Rahul Sawant"
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${currentPreset.borderColor} ${currentPreset.innerCardBg} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                  </div>
                </div>

                {/* Borrow Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Step 2: Where will you take this book? *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        id: 'home',
                        label: 'Take Home',
                        sub: '14 Days Check-Out',
                        icon: '🏠'
                      },
                      {
                        id: 'reading_room',
                        label: 'Reading Room',
                        sub: 'Same Day Reference',
                        icon: '📖'
                      },
                      {
                        id: 'project_work',
                        label: 'Project / Lab',
                        sub: '30 Days Special',
                        icon: '🔬'
                      }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setBorrowType(opt.id as any)}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          borrowType === opt.id
                            ? `border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-white ring-2 ring-indigo-500/30`
                            : `border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:border-slate-300`
                        }`}
                      >
                        <span className="text-xl">{opt.icon}</span>
                        <div>
                          <div className="text-xs font-bold">{opt.label}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{opt.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!studentId.trim() || !studentName.trim()}
                  className={`px-6 py-2.5 rounded-xl ${currentPreset.buttonBg} text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 disabled:opacity-50 transition-all`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Borrow & Issue Book</span>
                </button>
              </div>

            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
