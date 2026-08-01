import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Sparkles, RefreshCw, CheckCircle2, X, Search, BarChart2, QrCode, Settings, BookOpen, Building2, Printer, Copy, Check, FileSpreadsheet, Upload, Download, Users, ArrowLeftRight, Clock, HelpCircle, Coins, User } from 'lucide-react';
import { Book, College, LibraryStats, IssuedBook } from '../types';
import { AnalyticsView } from './AnalyticsView';
import { SettingsView } from './SettingsView';
import { BulkImportModal } from './BulkImportModal';
import { LibraryStaffDirectory } from './LibraryStaffDirectory';
import { CuteQRCodeSVG } from './CuteQRCodeSVG';
import { exportBooksToCSV, downloadSampleTemplateCSV } from '../utils/csvUtils';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  books: Book[];
  onAddBook: (newBook: Partial<Book>) => Promise<void>;
  onBulkAddBooks?: (importedBooks: any[]) => Promise<void>;
  onUpdateBook: (id: string, updatedBook: Partial<Book>) => Promise<void>;
  onDeleteBook: (id: string) => Promise<void>;
  stats: LibraryStats | null;
  recentLogs: any[];
  onRefreshStats: () => void;
  departments: string[];
  currentCollege: College | null;
  onUpdateCollege: (updatedCollege: Partial<College>) => Promise<void>;
  activeTab?: 'add' | 'analytics' | 'qr' | 'settings' | 'circulation' | 'directory';
  setActiveTab?: (tab: 'add' | 'analytics' | 'qr' | 'settings' | 'circulation' | 'directory') => void;
  onLogout?: () => void;
  authUser?: any;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  books,
  onAddBook,
  onBulkAddBooks,
  onUpdateBook,
  onDeleteBook,
  stats,
  recentLogs,
  onRefreshStats,
  departments,
  currentCollege,
  onUpdateCollege,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  onLogout,
  authUser
}) => {
  const { currentPreset } = useTheme();
  const [localActiveTab, setLocalActiveTab] = useState<'add' | 'analytics' | 'qr' | 'settings' | 'circulation' | 'directory'>('add');
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = propSetActiveTab || setLocalActiveTab;
  const [searchFilter, setSearchFilter] = useState('');
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // --- Library Circulation States ---
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>(() => {
    const saved = localStorage.getItem('library_issued_books');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse issued books:', e);
      }
    }
    return [
      {
        id: 'iss-1',
        bookId: '1',
        bookTitle: 'Introduction to Algorithms',
        studentId: 'GEC-CS-2024-032',
        studentName: 'Priya Sen',
        issueDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days overdue
        status: 'Issued'
      },
      {
        id: 'iss-2',
        bookId: '2',
        bookTitle: 'Computer Networks',
        studentId: 'GEC-EC-2024-118',
        studentName: 'Karan Sharma',
        issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Issued'
      }
    ];
  });

  // Circulation Logging
  const [circulationLog, setCirculationLog] = useState<string>('Ready for student lookup & checkout operations.');

  // Form States for Issuing
  const [issueBookId, setIssueBookId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [daysToIssue, setDaysToIssue] = useState('14');

  // Student Search Lookup State
  const [lookupStudentId, setLookupStudentId] = useState('');

  // Persist issued books in localStorage
  useEffect(() => {
    localStorage.setItem('library_issued_books', JSON.stringify(issuedBooks));
  }, [issuedBooks]);

  const handleIssueBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueBookId || !studentId || !studentName) {
      alert('Please fill out all fields to issue a book!');
      return;
    }

    const targetBook = books.find(b => b.id === issueBookId);
    if (!targetBook) {
      alert('Book not found in library catalog!');
      return;
    }

    if (targetBook.availableCopies <= 0) {
      alert(`No copies of '${targetBook.title}' are currently available for issue!`);
      return;
    }

    const newIssue: IssuedBook = {
      id: `iss-${Math.random().toString(36).substring(2, 11)}`,
      bookId: issueBookId,
      bookTitle: targetBook.title,
      studentId: studentId.trim().toUpperCase(),
      studentName: studentName.trim(),
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + Number(daysToIssue) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Issued'
    };

    setIssuedBooks(prev => [newIssue, ...prev]);

    // Update book copies available
    onUpdateBook(issueBookId, {
      availableCopies: Math.max(0, targetBook.availableCopies - 1)
    });

    // Reset Form
    setIssueBookId('');
    setStudentId('');
    setStudentName('');
    setCirculationLog(`Book '${targetBook.title}' issued to student ${studentName.trim()} (${studentId.trim().toUpperCase()}) for ${daysToIssue} days.`);
  };

  const handleReturnBookSubmit = (issueId: string) => {
    const issueRecord = issuedBooks.find(iss => iss.id === issueId);
    if (!issueRecord) return;

    const dueDateObj = new Date(issueRecord.dueDate);
    dueDateObj.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let fine = 0;
    if (today > dueDateObj) {
      const delayTime = today.getTime() - dueDateObj.getTime();
      const delayDays = Math.max(1, Math.ceil(delayTime / (1000 * 3600 * 24)));
      fine = delayDays * 2; // Rs. 2 per day of delay
    }

    if (fine > 0) {
      const delayDays = Math.max(1, Math.ceil((today.getTime() - dueDateObj.getTime()) / (1000 * 3600 * 24)));
      const confirmPaid = window.confirm(`Overdue Alert!\nThis book is late by ${delayDays} days.\nLate fine is Rs. ${fine}.00 (charged at Rs. 2/day).\n\nMark as paid and accept book return?`);
      if (!confirmPaid) return;
    } else {
      const confirmNormal = window.confirm(`Confirm return of '${issueRecord.bookTitle}'?`);
      if (!confirmNormal) return;
    }

    setIssuedBooks(prev => prev.map(iss => {
      if (iss.id === issueId) {
        return {
          ...iss,
          status: 'Returned',
          returnDate: new Date().toISOString().split('T')[0],
          fineAmount: fine
        };
      }
      return iss;
    }));

    // Update books available copies in catalog
    const bookObj = books.find(b => b.id === issueRecord.bookId);
    if (bookObj) {
      onUpdateBook(issueRecord.bookId, {
        availableCopies: Math.min(bookObj.totalCopies, bookObj.availableCopies + 1)
      });
    }

    setCirculationLog(`Book '${issueRecord.bookTitle}' returned. Overdue fine of Rs. ${fine}.00 has been cleared.`);
  };

  // --- End Library Circulation ---

  // New Book Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formPublisher, setFormPublisher] = useState('');
  const [formDepartment, setFormDepartment] = useState('Computer Science & Engineering');
  const [formSubject, setFormSubject] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formKeywords, setFormKeywords] = useState('');
  const [formIsbn, setFormIsbn] = useState('');
  const [formCallNumber, setFormCallNumber] = useState('');
  const [formAlmari, setFormAlmari] = useState('A1');
  const [formRow, setFormRow] = useState('R1');
  const [formPosition, setFormPosition] = useState<'Top' | 'Middle' | 'Bottom'>('Middle');
  const [formCopies, setFormCopies] = useState(5);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-fill form with AI
  const handleGenerateAI = async () => {
    if (!formTitle) {
      alert('Please enter at least a Book Title first.');
      return;
    }
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/ai/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          department: formDepartment,
          subject: formSubject
        })
      });
      const data = await res.json();
      if (data.keywords) {
        setFormKeywords(data.keywords.join(', '));
      }
      if (data.summary) {
        setFormSummary(data.summary);
      }
      if (data.callNumber) {
        setFormCallNumber(data.callNumber);
      }
      if (data.suggestedAlmari) {
        setFormAlmari(data.suggestedAlmari);
      }
      if (data.suggestedRow) {
        setFormRow(data.suggestedRow);
      }
    } catch (err) {
      console.error('Failed to generate AI details:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formAuthor) return;

    const bookPayload = {
      title: formTitle,
      subtitle: formSubtitle,
      author: formAuthor,
      publisher: formPublisher || 'Standard Academic Publishers',
      department: formDepartment,
      subject: formSubject || formDepartment,
      description: formDescription || `${formTitle} by ${formAuthor}.`,
      summary: formSummary || `${formTitle} reference manual.`,
      keywords: formKeywords ? formKeywords.split(',').map(k => k.trim()) : [formDepartment, formAuthor],
      isbn: formIsbn || `978-81-${Math.floor(100000 + Math.random() * 900000)}`,
      callNumber: formCallNumber || `${formDepartment.substring(0, 3).toUpperCase()} ${Math.floor(100 + Math.random() * 900)}`,
      location: {
        almariNumber: formAlmari.startsWith('Almari') ? formAlmari : `Almari ${formAlmari}`,
        rowNumber: formRow.startsWith('Row') ? formRow : `Row ${formRow}`,
        shelfPosition: formPosition,
        shelfCode: `${formAlmari}-${formRow}-${formPosition.charAt(0)}`,
        floorWing: 'Central Wing'
      },
      totalCopies: Number(formCopies) || 5,
      availableCopies: Number(formCopies) || 5,
      collegeId: currentCollege?.id || 'col-gec-goa'
    };

    if (editingBook) {
      await onUpdateBook(editingBook.id, bookPayload);
      setEditingBook(null);
    } else {
      await onAddBook(bookPayload);
    }

    // Reset Form
    setFormTitle('');
    setFormSubtitle('');
    setFormAuthor('');
    setFormPublisher('');
    setFormSubject('');
    setFormDescription('');
    setFormSummary('');
    setFormKeywords('');
    setFormIsbn('');
    setFormCallNumber('');
  };

  const handleStartEdit = (b: Book) => {
    setEditingBook(b);
    setFormTitle(b.title);
    setFormSubtitle(b.subtitle || '');
    setFormAuthor(b.author);
    setFormPublisher(b.publisher);
    setFormDepartment(b.department);
    setFormSubject(b.subject);
    setFormDescription(b.description);
    setFormSummary(b.summary);
    setFormKeywords(b.keywords.join(', '));
    setFormIsbn(b.isbn);
    setFormCallNumber(b.callNumber);
    setFormAlmari(b.location.almariNumber);
    setFormRow(b.location.rowNumber);
    setFormPosition(b.location.shelfPosition);
    setFormCopies(b.totalCopies);
  };

  const publicPageUrl = `${window.location.origin}?collegeId=${currentCollege?.id || 'col-gec-goa'}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicPageUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicPageUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.author.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.department.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">

      <AnimatePresence mode="wait">
        {/* Tab 1: Add & Manage Books */}
        {activeTab === 'add' && (
          <motion.div
            key="add"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="space-y-5"
          >

          {/* Clean Excel / CSV Actions Bar */}
          <div className={`${currentPreset.cardBg} ${currentPreset.cardRadius} p-4 border ${currentPreset.cardBorder} shadow-sm flex flex-wrap items-center justify-between gap-3`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 ${currentPreset.badgeRadius} ${currentPreset.badgeBg} flex items-center justify-center shrink-0`}>
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Excel / CSV Catalog Actions
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Bulk import 10,000+ books or download catalog CSV backup
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(true)}
                className={`px-3.5 py-1.5 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} font-bold text-xs shadow-xs transition-all flex items-center gap-1.5`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Excel/CSV</span>
              </button>

              <button
                type="button"
                onClick={() => exportBooksToCSV(books, currentCollege?.name)}
                className={`px-3 py-1.5 ${currentPreset.secondaryButtonBg} ${currentPreset.buttonRadius} font-bold text-xs transition-all flex items-center gap-1.5`}
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>Export Catalog CSV</span>
              </button>

              <button
                type="button"
                onClick={downloadSampleTemplateCSV}
                className={`px-2.5 py-1.5 ${currentPreset.accentText} ${currentPreset.buttonRadius} hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all flex items-center gap-1`}
                title="Download formatted sample template"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Sample</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add / Edit Book Form */}
          <div className={`lg:col-span-1 ${currentPreset.cardBg} ${currentPreset.cardRadius} p-6 border ${currentPreset.cardBorder} shadow-xl space-y-4`}>
            <div className={`flex items-center justify-between border-b ${currentPreset.borderColor} pb-3`}>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className={`w-5 h-5 ${currentPreset.accentText}`} />
                <span>{editingBook ? 'Edit Book' : 'Add New Book'}</span>
              </h3>
              {editingBook && (
                <button
                  onClick={() => {
                    setEditingBook(null);
                    setFormTitle('');
                    setFormAuthor('');
                  }}
                  className="text-xs text-rose-500 hover:underline font-semibold"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveBook} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Higher Engineering Mathematics"
                  className={`w-full px-3 py-2 text-xs ${currentPreset.inputBg} ${currentPreset.inputRadius} focus:outline-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Author Name *
                </label>
                <input
                  type="text"
                  required
                  value={formAuthor}
                  onChange={e => setFormAuthor(e.target.value)}
                  placeholder="e.g. Dr. B.S. Grewal"
                  className={`w-full px-3 py-2 text-xs ${currentPreset.inputBg} ${currentPreset.inputRadius} focus:outline-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formDepartment}
                    onChange={e => setFormDepartment(e.target.value)}
                    className={`w-full px-2.5 py-2 text-xs ${currentPreset.inputBg} ${currentPreset.inputRadius}`}
                  >
                    <option value="Computer Science & Engineering">Computer Science</option>
                    <option value="Mechanical Engineering">Mechanical Eng</option>
                    <option value="Civil Engineering">Civil Eng</option>
                    <option value="Electrical Engineering">Electrical Eng</option>
                    <option value="Mathematics & Basic Sciences">Mathematics</option>
                    <option value="Culinary Arts & Hotel Management">Culinary Arts</option>
                    <option value="General Literature">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={e => setFormSubject(e.target.value)}
                    placeholder="e.g. Calculus"
                    className={`w-full px-3 py-2 text-xs ${currentPreset.inputBg} ${currentPreset.inputRadius}`}
                  />
                </div>
              </div>

              {/* Shelf Location Fields */}
              <div className={`p-3 rounded-2xl ${currentPreset.innerCardBg} border ${currentPreset.borderColor} space-y-2`}>
                <div className="text-xs font-bold">
                  Physical Shelf Mapping
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400">Almari No</label>
                    <input
                      type="text"
                      value={formAlmari}
                      onChange={e => setFormAlmari(e.target.value)}
                      placeholder="A1"
                      className={`w-full px-2 py-1.5 text-xs ${currentPreset.inputBg} rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400">Row No</label>
                    <input
                      type="text"
                      value={formRow}
                      onChange={e => setFormRow(e.target.value)}
                      placeholder="R3"
                      className={`w-full px-2 py-1.5 text-xs ${currentPreset.inputBg} rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400">Position</label>
                    <select
                      value={formPosition}
                      onChange={e => setFormPosition(e.target.value as any)}
                      className={`w-full px-1.5 py-1.5 text-xs ${currentPreset.inputBg} rounded-lg`}
                    >
                      <option value="Top">Top</option>
                      <option value="Middle">Middle</option>
                      <option value="Bottom">Bottom</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Search Keywords / AI Metadata
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 hover:bg-amber-500/20 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Fill with AI</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={formKeywords}
                  onChange={e => setFormKeywords(e.target.value)}
                  placeholder="e.g. calculus, differential equations, matrices"
                  className={`w-full px-3 py-2 text-xs ${currentPreset.inputBg} rounded-xl focus:outline-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Call Number
                  </label>
                  <input
                    type="text"
                    value={formCallNumber}
                    onChange={e => setFormCallNumber(e.target.value)}
                    placeholder="510.76 G74H"
                    className={`w-full px-3 py-2 text-xs ${currentPreset.inputBg} rounded-xl`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Copies
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formCopies}
                    onChange={e => setFormCopies(Number(e.target.value))}
                    className={`w-full px-3 py-2 text-xs ${currentPreset.inputBg} rounded-xl`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 ${currentPreset.buttonBg} font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2`}
              >
                <Plus className="w-4 h-4" />
                <span>{editingBook ? 'Update Book in Catalog' : 'Save Book to Library'}</span>
              </button>
            </form>
          </div>

          {/* Book Catalog Table */}
          <div className={`lg:col-span-2 ${currentPreset.cardBg} rounded-3xl p-6 border ${currentPreset.cardBorder} shadow-xl space-y-4`}>
            
            <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${currentPreset.borderColor} pb-3`}>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className={`w-5 h-5 ${currentPreset.accentText}`} />
                  <span>College Catalog ({books.length} Books)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentCollege?.name} library database
                </p>
              </div>

              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder="Filter catalog..."
                  className={`pl-9 pr-3 py-1.5 text-xs ${currentPreset.inputBg} rounded-xl`}
                />
              </div>
            </div>

            {filteredBooks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`${currentPreset.innerCardBg} text-slate-500 dark:text-slate-400 font-semibold uppercase`}>
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-xl">Book Title & Author</th>
                      <th className="py-2.5 px-3">Dept</th>
                      <th className="py-2.5 px-3">Shelf Location</th>
                      <th className="py-2.5 px-3">Copies</th>
                      <th className="py-2.5 px-3 rounded-r-xl text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredBooks.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-white">{b.title}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">by {b.author}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-md ${currentPreset.badgeBg} font-medium`}>
                            {b.department}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {b.location.almariNumber} - {b.location.rowNumber} ({b.location.shelfPosition})
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {b.availableCopies}/{b.totalCopies}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(b)}
                              className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 ${currentPreset.accentText}`}
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteBook(b.id)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <div>No books in {currentCollege?.name}'s catalog yet.</div>
                <div className="text-[11px] text-slate-500">Fill the form on the left to add your first book!</div>
              </div>
            )}

          </div>

        </div>
        </motion.div>
      )}

      {/* Tab 2: Search Analytics */}
      {activeTab === 'analytics' && (
        <motion.div
          key="analytics"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.15 }}
        >
          <AnalyticsView
            stats={stats}
            recentLogs={recentLogs}
            onRefresh={onRefreshStats}
          />
        </motion.div>
      )}

      {/* Tab 3: Entrance QR Code */}
      {activeTab === 'qr' && (
        <motion.div
          key="qr"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
          className="max-w-lg mx-auto bg-white dark:bg-zinc-950 rounded-[32px] p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl text-center space-y-6"
        >
          {/* Header Badge */}
          <div className="space-y-1">
            <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full ${currentPreset.badgeBg} text-xs font-bold tracking-wide`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Library Entrance SVG QR Generator</span>
            </div>
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
              Cute Vector QR Code Portal
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              High resolution SVG download for physical entrance banners & poster printing
            </p>
          </div>

          <CuteQRCodeSVG
            value={publicPageUrl}
            size={220}
            title={`${currentCollege?.name || 'Library Entrance Gate Pass'}`}
            subtitle="Scan to instantly search book catalog"
            badgeText="Scan Me 💕"
            showScanMeBadge={true}
          />
        </motion.div>
      )}

      {/* Tab 4: College Settings */}
      {activeTab === 'settings' && (
        <motion.div
          key="settings"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.15 }}
        >
          <SettingsView
            currentCollege={currentCollege}
            onUpdateCollege={onUpdateCollege}
            onLogout={onLogout}
          />
        </motion.div>
      )}

      {/* Tab 5: Circulation Desk */}
      {activeTab === 'circulation' && (
        <motion.div
          key="circulation"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.15 }}
          className="space-y-6"
        >
          {/* Section Header */}
          <div className={`${currentPreset.cardBg} ${currentPreset.cardRadius} p-6 border ${currentPreset.cardBorder} shadow-sm relative overflow-hidden`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ArrowLeftRight className={`w-5 h-5 ${currentPreset.accentText}`} />
                  <span>Library Circulation Desk & Transaction Ledger</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Issue college books, receive returned volumes, and collect overdue fine settlements (Rs. 2.00 per day).
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 bg-slate-500/5 px-3 py-1.5 rounded-xl border border-slate-200/10 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Counter Access</span>
                </span>
              </div>
            </div>

            {/* Circulation Desk Status Logger */}
            <div className="mt-4 p-3 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl border border-indigo-500/10 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping shrink-0" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold uppercase mr-1">System Log:</span>
                {circulationLog}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUMN 1: Issue Book Form & Student Profile Lookup (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Box 1.1: Student Quick Lookup Finder */}
              <div className={`${currentPreset.cardBg} ${currentPreset.cardRadius} p-5 border ${currentPreset.cardBorder} shadow-sm`}>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-indigo-500" />
                  <span>Student Card Lookup</span>
                </h4>
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter Student Card ID (e.g. GEC-CS-2024-032)"
                      value={lookupStudentId}
                      onChange={(e) => setLookupStudentId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-500/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {lookupStudentId && (
                      <button
                        onClick={() => setLookupStudentId('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Student Search Results Container */}
                  <AnimatePresence mode="popLayout">
                    {lookupStudentId ? (() => {
                      const searchId = lookupStudentId.trim().toUpperCase();
                      const matchRecord = issuedBooks.find(b => b.studentId === searchId);
                      const activeIssues = issuedBooks.filter(b => b.studentId === searchId && b.status === 'Issued');
                      const pastReturns = issuedBooks.filter(b => b.studentId === searchId && b.status === 'Returned');
                      
                      // Calculate active overdue fees
                      let totalOwed = 0;
                      activeIssues.forEach(rec => {
                        const due = new Date(rec.dueDate);
                        due.setHours(0,0,0,0);
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        if (today > due) {
                          const delay = today.getTime() - due.getTime();
                          totalOwed += Math.max(1, Math.ceil(delay / (1000 * 3600 * 24))) * 2;
                        }
                      });

                      if (!matchRecord && activeIssues.length === 0 && pastReturns.length === 0) {
                        return (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 text-center rounded-2xl bg-slate-500/5 border border-dashed border-slate-200 dark:border-zinc-800"
                          >
                            <HelpCircle className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                            <p className="text-[11px] font-semibold text-slate-500">No active or past transaction records for this Student ID.</p>
                          </motion.div>
                        );
                      }

                      const studentNameDisp = activeIssues[0]?.studentName || pastReturns[0]?.studentName || 'Student Profile';

                      return (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-4"
                        >
                          {/* Student Header */}
                          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/50 dark:border-zinc-800/40">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm font-black uppercase">
                              {studentNameDisp.substring(0, 2)}
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-900 dark:text-white">{studentNameDisp}</p>
                              <p className="text-[10px] font-bold text-slate-400">{searchId}</p>
                            </div>
                            {totalOwed > 0 && (
                              <div className="ml-auto text-right">
                                <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border border-rose-500/10 block">
                                  Pending Fines
                                </span>
                                <span className="text-xs font-black text-rose-600 dark:text-rose-400 mt-0.5 block">Rs. {totalOwed}.00</span>
                              </div>
                            )}
                          </div>

                          {/* Active Borrowed Books */}
                          <div>
                            <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                              Active Borrowed Books ({activeIssues.length})
                            </h5>
                            {activeIssues.length === 0 ? (
                              <p className="text-[10px] font-bold text-slate-400 italic">No books currently checked out.</p>
                            ) : (
                              <div className="space-y-2">
                                {activeIssues.map(rec => {
                                  const isLate = new Date() > new Date(rec.dueDate);
                                  const dueDays = Math.ceil((new Date(rec.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                  return (
                                    <div key={rec.id} className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{rec.bookTitle}</p>
                                        <p className="text-[9px] font-medium text-slate-400 mt-0.5">
                                          Due: {rec.dueDate} {isLate ? (
                                            <span className="text-rose-600 dark:text-rose-400 font-extrabold ml-1">({Math.abs(dueDays)} days overdue)</span>
                                          ) : (
                                            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold ml-1">({dueDays} days left)</span>
                                          )}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => handleReturnBookSubmit(rec.id)}
                                        className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                                      >
                                        <RefreshCw className="w-3 h-3 animate-spin-slow" />
                                        <span>Return</span>
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Past Returned Books */}
                          {pastReturns.length > 0 && (
                            <div className="pt-2 border-t border-slate-200/50 dark:border-zinc-800/40">
                              <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                                Returned History ({pastReturns.length})
                              </h5>
                              <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                                {pastReturns.map(rec => (
                                  <div key={rec.id} className="text-[10px] font-semibold text-slate-500 flex justify-between gap-2 py-0.5">
                                    <span className="truncate flex-1">{rec.bookTitle}</span>
                                    <span className="text-slate-400 text-[9px] shrink-0">Returned {rec.returnDate}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })() : (
                      <div className="p-4 text-center rounded-2xl bg-slate-500/5 border border-dashed border-slate-200 dark:border-zinc-800">
                        <User className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                        <p className="text-[11px] font-semibold text-slate-500">Type a student card ID above to perform a student verification check.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Box 1.2: Check-Out/Issue Form */}
              <div className={`${currentPreset.cardBg} ${currentPreset.cardRadius} p-5 border ${currentPreset.cardBorder} shadow-sm`}>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-1.5">
                  <ArrowLeftRight className="w-4 h-4 text-indigo-500" />
                  <span>Issue / Check-Out Volume</span>
                </h4>
                
                <form onSubmit={handleIssueBookSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                      Select Book to Issue *
                    </label>
                    <select
                      value={issueBookId}
                      onChange={(e) => setIssueBookId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-500/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">-- Choose available book --</option>
                      {books.map(b => (
                        <option 
                          key={b.id} 
                          value={b.id} 
                          disabled={b.availableCopies <= 0}
                        >
                          {b.title} ({b.availableCopies}/{b.totalCopies} available)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                        Student Card ID *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. GEC-CS-2024-032"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-500/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                        Student Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Priya Sen"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-500/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                        Issue Date *
                      </label>
                      <input
                        type="date"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-500/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                        Issue Duration *
                      </label>
                      <select
                        value={daysToIssue}
                        onChange={(e) => setDaysToIssue(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-500/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="7">7 Days (Short Term)</option>
                        <option value="14">14 Days (Standard)</option>
                        <option value="21">21 Days (Extended)</option>
                        <option value="30">30 Days (Long-Term Scholar)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Complete Book Checkout</span>
                  </button>
                </form>
              </div>

            </div>

            {/* COLUMN 2: Live Circulation Directory & Overdue Ledger (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Box 2.1: Transaction Ledger */}
              <div className={`${currentPreset.cardBg} ${currentPreset.cardRadius} p-5 border ${currentPreset.cardBorder} shadow-sm flex flex-col h-full min-h-[500px]`}>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/50 dark:border-zinc-800/40">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Circulation Transaction Register
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Live index of student borrow logs</p>
                  </div>
                  
                  {/* Ledger quick count statistics */}
                  <div className="flex items-center gap-3">
                    <div className="text-center px-2 py-1 bg-amber-500/5 rounded-lg border border-amber-500/10">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Overdue</span>
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                        {issuedBooks.filter(iss => iss.status === 'Issued' && new Date() > new Date(iss.dueDate)).length}
                      </span>
                    </div>
                    <div className="text-center px-2 py-1 bg-indigo-500/5 rounded-lg border border-indigo-500/10">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">On Loan</span>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                        {issuedBooks.filter(iss => iss.status === 'Issued').length}
                      </span>
                    </div>
                    <div className="text-center px-2 py-1 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Returned</span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {issuedBooks.filter(iss => iss.status === 'Returned').length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Search / Filter bar for transactions */}
                <div className="py-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search transactions by Student Name, ID Card, or Book Title..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-500/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Main Transaction Records List */}
                <div className="flex-grow overflow-y-auto space-y-3.5 pr-1 max-h-[460px]">
                  <AnimatePresence mode="popLayout">
                    {(() => {
                      const filtered = issuedBooks.filter(rec => {
                        const term = searchFilter.toLowerCase();
                        return rec.bookTitle.toLowerCase().includes(term) ||
                               rec.studentId.toLowerCase().includes(term) ||
                               rec.studentName.toLowerCase().includes(term);
                      });

                      if (filtered.length === 0) {
                        return (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-8 text-center text-slate-400"
                          >
                            <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-700" />
                            <p className="text-xs font-black text-slate-500">No Transaction Records Found</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">Try entering another query or reset the search filter.</p>
                          </motion.div>
                        );
                      }

                      return filtered.map(rec => {
                        const isIssued = rec.status === 'Issued';
                        const isLate = isIssued && new Date() > new Date(rec.dueDate);
                        
                        // Calculate live overdue fine for rendering
                        let activeFine = 0;
                        let delayDays = 0;
                        if (isLate) {
                          const due = new Date(rec.dueDate);
                          due.setHours(0,0,0,0);
                          const today = new Date();
                          today.setHours(0,0,0,0);
                          const delay = today.getTime() - due.getTime();
                          delayDays = Math.max(1, Math.ceil(delay / (1000 * 3600 * 24)));
                          activeFine = delayDays * 2;
                        }

                        return (
                          <motion.div
                            key={rec.id}
                            layout
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={`p-4 rounded-2xl border transition-all ${
                              rec.status === 'Returned'
                                ? 'bg-slate-50 dark:bg-zinc-900/20 border-slate-200/50 dark:border-zinc-800/30'
                                : isLate
                                ? 'bg-rose-500/5 border-rose-500/20 dark:border-rose-500/10 shadow-xs'
                                : 'bg-white dark:bg-zinc-900/60 border-slate-200/60 dark:border-zinc-800/60 shadow-xs'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] font-black bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                    {rec.studentId}
                                  </span>
                                  <span className="text-[10px] font-black text-slate-400">•</span>
                                  <span className="text-[11px] font-black text-slate-800 dark:text-slate-100">
                                    {rec.studentName}
                                  </span>
                                </div>
                                <h5 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                                  <span>{rec.bookTitle}</span>
                                </h5>
                                
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1.5 text-[10px] font-bold text-slate-400">
                                  <span>Issued: <span className="text-slate-600 dark:text-slate-300">{rec.issueDate}</span></span>
                                  <span>Due: <span className={isLate ? "text-rose-600 font-extrabold" : "text-slate-600 dark:text-slate-300"}>{rec.dueDate}</span></span>
                                  {rec.status === 'Returned' && (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                                      Returned: {rec.returnDate}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Action side */}
                              <div className="sm:text-right shrink-0 flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2">
                                {rec.status === 'Returned' ? (
                                  <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border border-emerald-500/10">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Returned & Settled</span>
                                    {rec.fineAmount !== undefined && rec.fineAmount > 0 && (
                                      <span className="ml-1 font-bold">(Paid Rs. {rec.fineAmount})</span>
                                    )}
                                  </div>
                                ) : isLate ? (
                                  <div className="flex flex-col sm:items-end gap-1.5">
                                    <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-rose-500/10">
                                      Overdue fine: Rs. {activeFine}.00
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleReturnBookSubmit(rec.id)}
                                      className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                                    >
                                      <RefreshCw className="w-3 h-3 animate-spin-slow" />
                                      <span>Receive & Collect Rs. {activeFine}</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col sm:items-end gap-1.5">
                                    <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-indigo-500/10">
                                      On Loan
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleReturnBookSubmit(rec.id)}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      <span>Mark Returned</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      });
                    })()}
                  </AnimatePresence>
                </div>

              </div>

            </div>

          </div>
        </motion.div>
      )}

      {/* Tab 6: Staff Directory */}
      {activeTab === 'directory' && (
        <motion.div
          key="directory"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.15 }}
        >
          <LibraryStaffDirectory />
        </motion.div>
      )}
    </AnimatePresence>

      {/* Bulk Import CSV Modal */}
      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onImportBooks={async (importedBooks) => {
          if (onBulkAddBooks) {
            return await onBulkAddBooks(importedBooks);
          } else {
            for (const b of importedBooks) {
              await onAddBook(b);
            }
            return { newCount: importedBooks.length, updatedCount: 0 };
          }
        }}
        collegeName={currentCollege?.name}
      />

    </div>
  );
};
