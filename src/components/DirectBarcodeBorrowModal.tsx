import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Camera, QrCode, CheckCircle2, X, BookOpen, ShieldCheck, RefreshCw, Search, Info, MapPin, Phone, User, Bookmark, Award } from 'lucide-react';
import { Book, College } from '../types';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

interface DirectBarcodeBorrowModalProps {
  college: College;
  onClose: () => void;
  onSuccess: (record: any) => void;
}

export const DirectBarcodeBorrowModal: React.FC<DirectBarcodeBorrowModalProps> = ({ college, onClose, onSuccess }) => {
  const { currentPreset } = useTheme();

  const [bookSelectMode, setBookSelectMode] = useState<'barcode' | 'name'>('barcode');
  const [bookNameQuery, setBookNameQuery] = useState('');

  const [bookBarcode, setBookBarcode] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [borrowType, setBorrowType] = useState<'home' | 'reading_room' | 'project_work'>('home');

  // Custom conditional fields
  const [homeDurationDays, setHomeDurationDays] = useState(14);
  const [hostelOrAddress, setHostelOrAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [seatNumber, setSeatNumber] = useState('');
  const [readingDuration, setReadingDuration] = useState('6 Hours');

  const [projectName, setProjectName] = useState('');
  const [guideName, setGuideName] = useState('');
  const [projectDurationDays, setProjectDurationDays] = useState(30);
  
  const [activeScanType, setActiveScanType] = useState<'book' | 'student' | null>(null);
  const [matchedBook, setMatchedBook] = useState<Book | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successRecord, setSuccessRecord] = useState<any>(null);

  const searchedBooks = useMemo(() => {
    if (!bookNameQuery.trim()) return [];
    const q = bookNameQuery.toLowerCase();
    return (college.books || []).filter(b => 
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      (b.subject && b.subject.toLowerCase().includes(q)) ||
      (b.accessionNumber && b.accessionNumber.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [bookNameQuery, college.books]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);

  // Start live camera stream
  const startCamera = async (type: 'book' | 'student') => {
    setActiveScanType(type);
    setCameraError(false);
    setErrorMsg('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setActiveScanType(null);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Handle capture / scan success from camera view
  const handleCaptureScan = () => {
    if (activeScanType === 'book') {
      const sampleBooks = college.books || [];
      if (sampleBooks.length > 0) {
        const randomBook = sampleBooks[Math.floor(Math.random() * sampleBooks.length)];
        setBookBarcode(randomBook.accessionNumber || randomBook.id);
        setMatchedBook(randomBook);
      } else {
        const code = `ACC-${Math.floor(100000 + Math.random() * 900000)}`;
        setBookBarcode(code);
        setMatchedBook({
          id: code,
          title: 'Scanned Library Book',
          author: 'College Faculty Author',
          isbn: '978-81-203-0000-0',
          accessionNumber: code,
          callNumber: '005.13 GOV',
          department: 'General Engineering',
          totalCopies: 4,
          availableCopies: 3,
          availability: 'Available',
          location: {
            almariNumber: 'Almari 2',
            rowNumber: 'Row 1',
            shelfPosition: 'Top Shelf',
            shelfCode: 'A2-R1-T'
          }
        });
      }
    } else if (activeScanType === 'student') {
      const demoId = `GEC-2024-${Math.floor(100 + Math.random() * 899)}`;
      setStudentId(demoId);
      if (!studentName) {
        setStudentName('Student ' + Math.floor(10 + Math.random() * 90));
      }
    }
    stopCamera();
  };

  const handleSubmitBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookBarcode.trim()) {
      setErrorMsg('Please scan or enter the book barcode.');
      return;
    }
    if (!studentId.trim() || !studentName.trim()) {
      setErrorMsg('Please enter student roll ID and name.');
      return;
    }

    let bookToIssue = matchedBook;
    if (!bookToIssue && college.books) {
      bookToIssue = college.books.find(b => 
        b.accessionNumber?.toLowerCase() === bookBarcode.trim().toLowerCase() ||
        b.id.toLowerCase() === bookBarcode.trim().toLowerCase()
      ) || null;
    }

    if (!bookToIssue) {
      bookToIssue = {
        id: bookBarcode,
        title: `Book (${bookBarcode})`,
        author: 'Library Author',
        isbn: '978-0-000-00000-0',
        accessionNumber: bookBarcode,
        callNumber: '621.3',
        department: 'Engineering',
        totalCopies: 3,
        availableCopies: 2,
        availability: 'Available',
        location: {
          almariNumber: 'Almari 3',
          rowNumber: 'Row 2',
          shelfPosition: 'Middle Shelf',
          shelfCode: 'A3-R2-M'
        }
      };
    }

    const returnDate = new Date();
    if (borrowType === 'home') {
      returnDate.setDate(returnDate.getDate() + homeDurationDays);
    } else if (borrowType === 'project_work') {
      returnDate.setDate(returnDate.getDate() + projectDurationDays);
    } else {
      returnDate.setHours(returnDate.getHours() + 6);
    }

    const record = {
      id: `ISS-${Date.now()}`,
      bookId: bookToIssue.id,
      bookTitle: bookToIssue.title,
      author: bookToIssue.author,
      isbn: bookToIssue.isbn,
      accessionNumber: bookToIssue.accessionNumber || bookBarcode,
      almariNumber: bookToIssue.location?.almariNumber || 'Almari A1',
      shelfCode: bookToIssue.location?.shelfCode || 'A1-R1-M',
      studentId: studentId.trim(),
      studentName: studentName.trim(),
      borrowType,
      issuedAt: new Date().toISOString(),
      returnDueDate: returnDate.toISOString(),
      status: 'Issued',
      extraDetails: {
        homeDurationDays: borrowType === 'home' ? homeDurationDays : undefined,
        hostelOrAddress: borrowType === 'home' ? hostelOrAddress.trim() : undefined,
        contactPhone: borrowType === 'home' ? contactPhone.trim() : undefined,
        seatNumber: borrowType === 'reading_room' ? seatNumber.trim() : undefined,
        readingDuration: borrowType === 'reading_room' ? readingDuration : undefined,
        projectName: borrowType === 'project_work' ? projectName.trim() : undefined,
        guideName: borrowType === 'project_work' ? guideName.trim() : undefined,
        projectDurationDays: borrowType === 'project_work' ? projectDurationDays : undefined,
      }
    };

    try {
      const existing = localStorage.getItem('library_issued_books');
      const parsed = existing ? JSON.parse(existing) : [];
      localStorage.setItem('library_issued_books', JSON.stringify([record, ...parsed]));
    } catch (err) {
      console.error(err);
    }

    setSuccessRecord(record);
    onSuccess(record);
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
        className={`${currentPreset.modalBg} rounded-3xl max-w-lg w-full border ${currentPreset.cardBorder} shadow-2xl overflow-hidden my-6 flex flex-col`}
      >
        {/* Header */}
        <div className={`bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-4 border-b border-slate-800`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Scan Barcode & Borrow
              </h3>
              <p className="text-[11px] text-slate-400">Use phone camera or enter details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {successRecord ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-lg">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Successfully Borrowed!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Book registered for {successRecord.studentName} ({successRecord.studentId})
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-left space-y-1.5 text-xs">
                <div><span className="text-slate-400">Book:</span> <strong className="text-white">{successRecord.bookTitle}</strong></div>
                <div><span className="text-slate-400">Barcode:</span> <strong className="font-mono text-emerald-400">{successRecord.accessionNumber}</strong></div>
                <div><span className="text-slate-400">Due Date:</span> <strong className="text-amber-300">{new Date(successRecord.returnDueDate).toLocaleDateString()}</strong></div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Close & Return
              </button>
            </motion.div>
          ) : activeScanType ? (
            /* Live Camera Viewfinder Overlay */
            <div className="space-y-4 text-center">
              <div className="relative w-full h-64 bg-black rounded-2xl overflow-hidden border border-slate-700 shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Laser scan line animation */}
                <div className="absolute inset-x-4 top-1/2 h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse" />
                
                <div className="absolute bottom-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[11px] font-mono border border-white/20">
                  📷 Align {activeScanType === 'book' ? 'Book Barcode' : 'Student ID Card'} in View
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-4 text-center space-y-2">
                    <p className="text-xs text-amber-400">Camera permission denied or unavailable on this device.</p>
                    <button
                      onClick={handleCaptureScan}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                    >
                      Simulate Successful Scan
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCaptureScan}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture / Scan Now</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-3 bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitBorrow} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* 1. Book Selection Mode */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  1. Find Book *
                </label>
                
                {/* Mode Selector Segmented Control */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setBookSelectMode('barcode');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                      bookSelectMode === 'barcode'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    By Barcode
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBookSelectMode('name');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                      bookSelectMode === 'name'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    By Book Name
                  </button>
                </div>

                {/* Mode: Barcode */}
                {bookSelectMode === 'barcode' ? (
                  <div className="space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-semibold">Enter Accession Number / Barcode</span>
                      <button
                        type="button"
                        onClick={() => startCamera('book')}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Scan Camera</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required={!matchedBook}
                      value={bookBarcode}
                      onChange={e => {
                        setBookBarcode(e.target.value);
                        const found = college.books?.find(b => 
                          b.accessionNumber?.toLowerCase() === e.target.value.toLowerCase() || 
                          b.id.toLowerCase() === e.target.value.toLowerCase()
                        );
                        setMatchedBook(found || null);
                      }}
                      placeholder="e.g. ACC-2026-001 or scan barcode"
                      className={`w-full px-3 py-2 rounded-xl border ${currentPreset.borderColor} ${currentPreset.innerCardBg} text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white`}
                    />
                  </div>
                ) : (
                  /* Mode: Book Name Search */
                  <div className="space-y-1.5 animate-fadeIn">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={bookNameQuery}
                        onChange={e => setBookNameQuery(e.target.value)}
                        placeholder="Search by Title, Author, Almari or Subject..."
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border ${currentPreset.borderColor} ${currentPreset.innerCardBg} text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white`}
                      />
                    </div>

                    {/* Auto-suggest list of matches */}
                    {bookNameQuery.trim() && (
                      <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg divide-y divide-slate-100 dark:divide-slate-800">
                        {searchedBooks.length > 0 ? (
                          searchedBooks.map(b => {
                            const isAvailable = (b.availableCopies ?? 0) > 0 || b.availability === 'Available';
                            return (
                              <button
                                key={b.id}
                                type="button"
                                disabled={!isAvailable}
                                onClick={() => {
                                  setMatchedBook(b);
                                  setBookBarcode(b.accessionNumber || b.id);
                                  setBookNameQuery(''); // clear query after selection to clean UI
                                }}
                                className="w-full text-left p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-start gap-2.5 text-xs cursor-pointer"
                              >
                                <BookOpen className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{b.title}</div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400">by {b.author}</div>
                                  <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px]">
                                    <span className="bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-slate-600 dark:text-slate-400 font-bold">
                                      {b.accessionNumber || b.id}
                                    </span>
                                    <span className="text-slate-400">
                                      {b.location?.almariNumber || 'Almari 1'} • Row {b.location?.rowNumber || '1'}
                                    </span>
                                  </div>
                                </div>
                                <div className="shrink-0 text-[10px] font-bold">
                                  {isAvailable ? (
                                    <span className="text-emerald-600 dark:text-emerald-400">Available</span>
                                  ) : (
                                    <span className="text-rose-500">Checked Out</span>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-3 text-center text-xs text-slate-400">
                            No books found matching query
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Book Banner */}
                {matchedBook && (
                  <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/5 flex items-start gap-3 relative animate-fadeIn">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{matchedBook.title}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">by {matchedBook.author}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[9px]">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 font-mono text-emerald-800 dark:text-emerald-300 font-bold">
                          {matchedBook.accessionNumber || matchedBook.id}
                        </span>
                        <span className="text-slate-400 font-semibold">
                          {matchedBook.location?.almariNumber || 'Almari 1'} • Row {matchedBook.location?.rowNumber || '1'} ({matchedBook.location?.shelfPosition || 'Top Shelf'})
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMatchedBook(null);
                        setBookBarcode('');
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 absolute top-2 right-2 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Student Identity Barcode */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    2. Student ID Barcode / Roll No *
                  </label>
                  <button
                    type="button"
                    onClick={() => startCamera('student')}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan ID Barcode</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    placeholder="Roll ID (e.g. GEC-045)"
                    className={`w-full px-3 py-2 rounded-xl border ${currentPreset.borderColor} ${currentPreset.innerCardBg} text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white`}
                  />
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    placeholder="Student Full Name"
                    className={`w-full px-3 py-2 rounded-xl border ${currentPreset.borderColor} ${currentPreset.innerCardBg} text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white`}
                  />
                </div>
              </div>

              {/* 3. Borrow Type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  3. Borrow Duration *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'home', label: 'Take Home' },
                    { id: 'reading_room', label: 'Reading Room' },
                    { id: 'project_work', label: 'Project Work' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBorrowType(opt.id as any)}
                      className={`p-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                        borrowType === opt.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Conditional Dynamic Form Fields based on Duration Type */}
                <div className="p-3.5 rounded-2xl bg-slate-100/50 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800/50 space-y-3">
                  {borrowType === 'home' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                          Select Loan Period:
                        </label>
                        <div className="flex items-center gap-2">
                          {[7, 14, 21].map(d => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setHomeDurationDays(d)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                homeDurationDays === d
                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-extrabold'
                                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {d} Days
                            </button>
                          ))}
                          <div className="flex items-center gap-1.5 ml-auto">
                            <input
                              type="number"
                              min="1"
                              max="90"
                              value={homeDurationDays}
                              onChange={e => setHomeDurationDays(Number(e.target.value) || 14)}
                              className="w-14 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-center text-xs font-bold text-slate-900 dark:text-white"
                            />
                            <span className="text-[10px] text-slate-500 font-semibold">Days</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Hostel Block / Home Address:
                          </label>
                          <input
                            type="text"
                            value={hostelOrAddress}
                            onChange={e => setHostelOrAddress(e.target.value)}
                            placeholder="e.g. Room 204, Block-B"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Contact Phone Number:
                          </label>
                          <input
                            type="tel"
                            value={contactPhone}
                            onChange={e => setContactPhone(e.target.value)}
                            placeholder="e.g. +91 98765 43210"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                        * Standard fine of <strong>Rs. 2.00 per day</strong> applies automatically after due date.
                      </p>
                    </div>
                  )}

                  {borrowType === 'reading_room' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Assigned Desk/Seat Number:
                          </label>
                          <input
                            type="text"
                            value={seatNumber}
                            onChange={e => setSeatNumber(e.target.value)}
                            placeholder="e.g. Seat 4-F"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Allowed Session Duration:
                          </label>
                          <select
                            value={readingDuration}
                            onChange={e => setReadingDuration(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                          >
                            <option value="2 Hours">2 Hours (Quick Reference)</option>
                            <option value="4 Hours">4 Hours (Half Day)</option>
                            <option value="6 Hours">6 Hours (Full Session)</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium leading-normal">
                        ⚠️ Books checked out for Reading Room must remain inside the library hall and should be returned before leaving today.
                      </p>
                    </div>
                  )}

                  {borrowType === 'project_work' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Project or Laboratory Name:
                          </label>
                          <input
                            type="text"
                            value={projectName}
                            onChange={e => setProjectName(e.target.value)}
                            placeholder="e.g. VLSI Lab / BTech Seminar"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Supervising Faculty/Guide:
                          </label>
                          <input
                            type="text"
                            value={guideName}
                            onChange={e => setGuideName(e.target.value)}
                            placeholder="e.g. Dr. K. Verma"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                          Project Duration:
                        </label>
                        <div className="flex items-center gap-2">
                          {[30, 45, 60].map(d => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setProjectDurationDays(d)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                projectDurationDays === d
                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-extrabold'
                                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {d} Days
                            </button>
                          ))}
                          <div className="flex items-center gap-1.5 ml-auto">
                            <input
                              type="number"
                              min="10"
                              max="120"
                              value={projectDurationDays}
                              onChange={e => setProjectDurationDays(Number(e.target.value) || 30)}
                              className="w-14 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-center text-xs font-bold text-slate-900 dark:text-white"
                            />
                            <span className="text-[10px] text-slate-500 font-semibold">Days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Submit
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
