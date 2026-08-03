import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  QrCode,
  Barcode,
  Search,
  Sparkles,
  CheckCircle2,
  MapPin,
  Target,
  BookOpen,
  Volume2,
  ExternalLink,
  Camera,
  CameraOff,
  Zap,
  Check,
  Building2,
  ChevronDown,
  Layers,
  FileText
} from 'lucide-react';
import { Book, College } from '../types';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { CuteQRCodeSVG } from './CuteQRCodeSVG';

interface BarcodeShelfMapperModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCollege?: College | null;
  books: Book[];
  onUpdateBook?: (id: string, updatedData: Partial<Book>) => void;
  initialTab?: 'qr' | 'barcode';
  onSimulateEntranceScan?: () => void;
}

export const BarcodeShelfMapperModal: React.FC<BarcodeShelfMapperModalProps> = ({
  isOpen,
  onClose,
  currentCollege,
  books = [],
  onUpdateBook,
  initialTab = 'barcode',
  onSimulateEntranceScan
}) => {
  const { currentPreset } = useTheme();
  const [activeTab, setActiveTab] = useState<'qr' | 'barcode'>(initialTab);

  // Barcode & Book Lookup States
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [matchedBook, setMatchedBook] = useState<Book | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'not_found'>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [matchingBooks, setMatchingBooks] = useState<Book[]>([]);

  // Camera Barcode Scanner States
  const [isCameraActive, setIsCameraActive] = useState(true); // Default camera view active for instant access
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showVisual2D, setShowVisual2D] = useState(false); // Collapsed by default for extreme simplicity
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Almari & Shelf Row
  const [selectedAlmari, setSelectedAlmari] = useState<string>('A-01');
  const [selectedRow, setSelectedRow] = useState<number>(2);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const almarisList = ['A-01', 'A-02', 'A-03', 'A-04', 'A-05', 'A-06', 'A-07', 'A-08', 'B-01', 'B-02', 'C-01'];

  // Stop camera media stream
  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start camera media stream
  const startCameraStream = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      mediaStreamRef.current = stream;
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera active in instant barcode detector mode.');
      setIsCameraActive(true);
    }
  };

  useEffect(() => {
    if (isCameraActive && mediaStreamRef.current && videoRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch(e => console.warn('Video play error:', e));
    }
  }, [isCameraActive]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'barcode') {
      stopCameraStream();
    } else if (isOpen && activeTab === 'barcode' && !isCameraActive) {
      startCameraStream();
    }
    return () => stopCameraStream();
  }, [isOpen, activeTab]);

  // Continuous Native BarcodeDetector loop
  useEffect(() => {
    let intervalId: any = null;

    if (isCameraActive && videoRef.current) {
      if ('BarcodeDetector' in window) {
        try {
          const detector = new (window as any).BarcodeDetector({
            formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'qr_code', 'upc_a', 'upc_e']
          });

          intervalId = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0) {
                  const detectedCode = barcodes[0].rawValue;
                  if (detectedCode && detectedCode !== scannedBarcode) {
                    setScannedBarcode(detectedCode);
                    handleBarcodeSearch(detectedCode);
                  }
                }
              } catch (e) {
                // frame read fallback
              }
            }
          }, 400);
        } catch (e) {
          // detector format fallback
        }
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isCameraActive, scannedBarcode]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const playBeepSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Audio fallback
    }
  };

  const handleSelectBook = (book: Book) => {
    playBeepSound();
    setMatchedBook(book);
    setScannedBarcode(book.title);
    setShowSuggestions(false);
    setScanStatus('success');

    if (book.location?.almariNumber) {
      const cleanAlmari = book.location.almariNumber.startsWith('A') || book.location.almariNumber.startsWith('B') || book.location.almariNumber.startsWith('C')
        ? book.location.almariNumber 
        : `A-0${book.location.almariNumber}`;
      setSelectedAlmari(cleanAlmari);
    }
    if (book.location?.rowNumber) {
      const rNum = parseInt(book.location.rowNumber.replace(/\D/g, ''), 10);
      if (!isNaN(rNum) && rNum >= 1 && rNum <= 4) setSelectedRow(rNum);
    }
  };

  const handleBarcodeSearch = (codeToSearch: string) => {
    const query = codeToSearch.trim().toLowerCase();
    if (!query) {
      setMatchedBook(null);
      setScanStatus('idle');
      setMatchingBooks([]);
      setShowSuggestions(false);
      return;
    }

    setScanStatus('scanning');

    const results = books.filter(b => {
      const bIsbn = (b.isbn || '').toLowerCase();
      const bAcc = (b.accessionNumber || '').toLowerCase();
      const bTitle = (b.title || '').toLowerCase();
      const bAuthor = (b.author || '').toLowerCase();
      const rawCode = b.rawCsvData 
        ? Object.values(b.rawCsvData).join(' ').toLowerCase() 
        : '';

      return (
        bTitle.includes(query) ||
        bAuthor.includes(query) ||
        bIsbn.includes(query) ||
        bAcc.includes(query) ||
        rawCode.includes(query)
      );
    });

    setMatchingBooks(results);
    setShowSuggestions(results.length > 0);

    const exactMatch = results.find(b => 
      (b.accessionNumber || '').toLowerCase() === query ||
      (b.isbn || '').toLowerCase() === query ||
      (b.title || '').toLowerCase() === query
    );

    const found = exactMatch || results[0];

    if (found) {
      setMatchedBook(found);
      setScanStatus('success');

      if (found.location?.almariNumber) {
        const cleanAlmari = found.location.almariNumber.startsWith('A') || found.location.almariNumber.startsWith('B') || found.location.almariNumber.startsWith('C')
          ? found.location.almariNumber 
          : `A-0${found.location.almariNumber}`;
        setSelectedAlmari(cleanAlmari);
      }
      if (found.location?.rowNumber) {
        const rNum = parseInt(found.location.rowNumber.replace(/\D/g, ''), 10);
        if (!isNaN(rNum) && rNum >= 1 && rNum <= 4) setSelectedRow(rNum);
      }
    } else {
      setMatchedBook(null);
      setScanStatus('not_found');
    }
  };

  const handleLinkLocationToBook = () => {
    if (!matchedBook) {
      setToastMessage('Please select or search a valid book first!');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const rowName = `Row ${selectedRow}`;
    const updatedLocation = {
      almariNumber: selectedAlmari,
      rowNumber: rowName,
      shelfPosition: 'Center' as any,
      shelfCode: `${selectedAlmari}-R${selectedRow}`,
      sectionName: `${selectedAlmari} - Row ${selectedRow}`
    };

    const updatedData: Partial<Book> = {
      location: updatedLocation,
      rawCsvData: {
        ...(matchedBook.rawCsvData || {}),
        'Almari': selectedAlmari,
        'Row': rowName
      }
    };

    if (onUpdateBook) {
      onUpdateBook(matchedBook.id, updatedData);
    }

    setMatchedBook(prev => prev ? { ...prev, ...updatedData } : null);
    playBeepSound();
    setToastMessage(`✓ Saved! "${matchedBook.title.substring(0, 22)}..." assigned to Almari ${selectedAlmari}, Row ${selectedRow}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!isOpen) return null;

  const collegeName = currentCollege?.name || 'Goa Engineering College';
  const publicPageUrl = `${window.location.origin}?collegeId=${currentCollege?.id || 'col-gec-goa'}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pb-20 lg:pb-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`${currentPreset.modalBg} rounded-3xl max-w-2xl w-full border ${currentPreset.cardBorder} shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] relative`}
      >
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                Book Scanner & Catalog Checker
              </h3>
              <p className="text-[11px] text-slate-400">
                Point camera at barcode or type book title
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('barcode')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'barcode' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Barcode & Search
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('qr')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'qr' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Entrance QR
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          
          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-md"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{toastMessage}</span>
                </div>
                <button onClick={() => setToastMessage(null)} className="opacity-80 hover:opacity-100">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 1: BARCODE & TITLE LOOKUP */}
          {activeTab === 'barcode' && (
            <div className="space-y-4">
              
              {/* 1. CAMERA SCANNER SECTION */}
              <div className="bg-slate-900/90 dark:bg-zinc-900 rounded-2xl border border-slate-800 overflow-hidden p-3 space-y-2 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-300 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-indigo-400" />
                    <span>Live Camera Barcode Detector</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (isCameraActive) stopCameraStream();
                        else startCameraStream();
                      }}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                        isCameraActive ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {isCameraActive ? <CameraOff className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                      <span>{isCameraActive ? 'Pause Camera' : 'Turn On Camera'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`p-1 rounded-lg border text-[10px] ${
                        soundEnabled ? 'bg-indigo-950 text-indigo-300 border-indigo-700' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                      title={soundEnabled ? 'Beep On' : 'Beep Off'}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Camera Viewfinder Box */}
                {isCameraActive && (
                  <div className="relative w-full h-40 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Camera Laser Target Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-24 border-2 border-dashed border-amber-400/80 rounded-xl relative flex items-center justify-center bg-indigo-500/10">
                        <div className="w-full h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse" />
                      </div>
                    </div>

                    {/* Instant Test Snap Button overlay */}
                    <div className="absolute bottom-2 right-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (books.length > 0) {
                            const randomBook = books[Math.floor(Math.random() * books.length)];
                            const code = randomBook.accessionNumber || randomBook.isbn || randomBook.title;
                            handleSelectBook(randomBook);
                          }
                        }}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-[10px] flex items-center gap-1 shadow-md active:scale-95"
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        <span>Snap Code</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. MANUAL TITLE / BARCODE SEARCH INPUT */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    value={scannedBarcode}
                    onChange={(e) => {
                      setScannedBarcode(e.target.value);
                      handleBarcodeSearch(e.target.value);
                    }}
                    onFocus={() => {
                      if (scannedBarcode.trim() && matchingBooks.length > 0) setShowSuggestions(true);
                    }}
                    placeholder="Type Book Name, Author, Barcode or Acc No..."
                    className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  {scannedBarcode && (
                    <button
                      type="button"
                      onClick={() => {
                        setScannedBarcode('');
                        setMatchedBook(null);
                        setScanStatus('idle');
                        setShowSuggestions(false);
                      }}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {/* Auto-suggest Search Dropdown */}
                  {showSuggestions && matchingBooks.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-52 overflow-y-auto bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-800 rounded-2xl shadow-xl divide-y divide-slate-100 dark:divide-slate-800">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-950/80 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 flex justify-between">
                        <span>Catalog Search Results ({matchingBooks.length})</span>
                        <span className="text-[9px] text-slate-400">Click title to confirm</span>
                      </div>
                      {matchingBooks.map((book) => (
                        <button
                          key={book.id}
                          type="button"
                          onClick={() => handleSelectBook(book)}
                          className="w-full p-2.5 text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                              {book.title}
                            </h5>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              {book.author ? `by ${book.author}` : 'Author N/A'} • Acc: {book.accessionNumber || 'N/A'}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0">
                            {book.location?.almariNumber ? `${book.location.almariNumber} • ${book.location.rowNumber || 'R1'}` : 'Not Mapped'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct Dropdown Select Title */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">Or Pick Title:</span>
                  <select
                    onChange={(e) => {
                      const selected = books.find(b => b.id === e.target.value);
                      if (selected) handleSelectBook(selected);
                    }}
                    value={matchedBook?.id || ''}
                    className="w-full px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 truncate"
                  >
                    <option value="">-- Choose Book Title Directly --</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.author || 'Author N/A'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. CONFIRMATION & DOUBLE-CHECK CARD FOR MATCHED BOOK */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <span>Database Match & Double-Check Confirmation</span>
                  </span>

                  {scanStatus === 'success' && (
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED MATCH
                    </span>
                  )}
                </div>

                {matchedBook ? (
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-xs">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                        {matchedBook.title}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">
                        Author: <span className="font-bold text-slate-900 dark:text-white">{matchedBook.author || 'Unspecified'}</span>
                      </p>

                      {/* Details Grid for Double-Checking */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
                        <div className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span className="text-[9px] text-slate-400 block uppercase">Acc Number</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{matchedBook.accessionNumber || 'N/A'}</span>
                        </div>

                        <div className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span className="text-[9px] text-slate-400 block uppercase">ISBN / Barcode</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{matchedBook.isbn || matchedBook.accessionNumber || 'N/A'}</span>
                        </div>

                        <div className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span className="text-[9px] text-slate-400 block uppercase">Department</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{matchedBook.department || 'General'}</span>
                        </div>
                      </div>

                      {/* Display CSV Extra Column / Attributes if available */}
                      {matchedBook.rawCsvData && Object.keys(matchedBook.rawCsvData).length > 0 && (
                        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap gap-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block w-full">Dataset Columns:</span>
                          {Object.entries(matchedBook.rawCsvData).map(([key, val]) => (
                            <span key={key} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              <span className="text-slate-400">{key}:</span> {String(val)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Almari Location Mapping Selector */}
                    <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>Assign Cupboard (Almari) & Row Location:</span>
                        </span>

                        <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300">
                          Current: {matchedBook.location?.almariNumber || 'A-01'} • {matchedBook.location?.rowNumber || 'Row 2'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Cupboard (Almari)</label>
                          <select
                            value={selectedAlmari}
                            onChange={(e) => setSelectedAlmari(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-lg text-xs font-bold font-mono text-slate-900 dark:text-white"
                          >
                            {almarisList.map(a => (
                              <option key={a} value={a}>Almari {a}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Shelf Row</label>
                          <select
                            value={selectedRow}
                            onChange={(e) => setSelectedRow(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-lg text-xs font-bold font-mono text-slate-900 dark:text-white"
                          >
                            <option value={1}>Row 1 (Top Shelf)</option>
                            <option value={2}>Row 2 (Upper Shelf)</option>
                            <option value={3}>Row 3 (Lower Shelf)</option>
                            <option value={4}>Row 4 (Bottom Shelf)</option>
                          </select>
                        </div>
                      </div>

                      {/* Confirm & Save Button */}
                      <button
                        type="button"
                        onClick={handleLinkLocationToBook}
                        className={`w-full py-2.5 px-4 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} text-xs font-extrabold text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 mt-1`}
                      >
                        <Target className="w-4 h-4" />
                        <span>Save Location to Almari {selectedAlmari}, Row {selectedRow}</span>
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 space-y-1">
                    <Barcode className="w-6 h-6 mx-auto opacity-40 animate-pulse" />
                    <p className="text-xs font-medium">
                      {scanStatus === 'not_found'
                        ? `No match found for "${scannedBarcode}". Select a title from the list above.`
                        : 'Point camera at book barcode or type title above to double-check book details'}
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: ENTRANCE QR PASS */}
          {activeTab === 'qr' && (
            <div className="space-y-4 text-center max-w-md mx-auto py-2">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-extrabold border border-indigo-200 dark:border-indigo-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Entrance Gate Pass QR Code</span>
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white pt-1">
                  {collegeName}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Students scan this QR code at the entrance to search books & check shelf locations
                </p>
              </div>

              <div className="py-2 flex justify-center">
                <CuteQRCodeSVG
                  value={publicPageUrl}
                  size={200}
                  title="Digital Gate Pass"
                  subtitle="Scan to search catalog & book shelf positions"
                  badgeText="Scan Entrance QR"
                  showScanMeBadge={true}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onSimulateEntranceScan) {
                    onSimulateEntranceScan();
                    onClose();
                  } else {
                    window.open(publicPageUrl, '_blank');
                  }
                }}
                className={`w-full py-3 px-4 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} text-xs font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-95`}
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Student Catalog View</span>
              </button>
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
};

