import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Shield, Plus, Edit2, Trash2, Sparkles, RefreshCw, CheckCircle2, X, Search, BarChart2, QrCode, Settings, BookOpen, Building2, Printer, Copy, Check, FileSpreadsheet, Upload, Download, Users, ArrowLeftRight, Clock, HelpCircle, Coins, User, Sliders, RotateCcw, Layers, FileCode, Table, LayoutGrid, ExternalLink, ChevronLeft, ChevronRight, Maximize2, Minimize2, AlertTriangle, AlertCircle } from 'lucide-react';
import { Book, College, LibraryStats, IssuedBook } from '../types';
import { AnalyticsView } from './AnalyticsView';
import { SettingsView } from './SettingsView';
import { BulkImportModal } from './BulkImportModal';
import { LibraryStaffDirectory } from './LibraryStaffDirectory';
import { CuteQRCodeSVG } from './CuteQRCodeSVG';
import { exportBooksToCSV, downloadSampleTemplateCSV, parseCSVToRawDataset } from '../utils/csvUtils';
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
  onOpenQRModal?: () => void;
  onOpenBarcodeModal?: () => void;
  onClearCatalog?: () => Promise<void>;
  onOpenPublicKiosk?: () => void;
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
  authUser,
  onOpenQRModal,
  onOpenBarcodeModal,
  onClearCatalog,
  onOpenPublicKiosk
}) => {
  const { currentPreset } = useTheme();
  const [localActiveTab, setLocalActiveTab] = useState<'add' | 'analytics' | 'qr' | 'settings' | 'circulation' | 'directory'>('add');
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = propSetActiveTab || setLocalActiveTab;
  const [searchFilter, setSearchFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilter]);
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
      setToast({ type: 'info', message: `Book returned! Overdue fine of Rs. ${fine}.00 recorded.` });
    } else {
      setToast({ type: 'success', message: `Book '${issueRecord.bookTitle}' returned successfully!` });
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

  const [showSchemaInfoModal, setShowSchemaInfoModal] = useState(false);

  // Dynamic Schema & Custom CSV Columns State
  const schemaFileInputRef = useRef<HTMLInputElement>(null);
  const [detectedCustomSchema, setDetectedCustomSchema] = useState<string[] | null>(() => {
    const saved = localStorage.getItem('library_detected_form_schema');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Dynamic values store for detected fields
  const [dynamicFormValues, setDynamicFormValues] = useState<Record<string, string>>({});

  // Form Panel Toggle State & Table Horizontal Scroll Controls
  const [isAddBookPanelOpen, setIsAddBookPanelOpen] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearSheetModal, setShowClearSheetModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Table View Mode: 'sheet' (Exact Spreadsheet Columns Grid) vs 'standard' (Compact Card Catalog)
  const [tableViewMode, setTableViewMode] = useState<'sheet' | 'standard'>('sheet');

  // Global Keyboard listener for smooth horizontal scrolling in sheet view using Left/Right arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'add' || tableViewMode !== 'sheet') return;
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) {
        return; // Do not intercept arrow keys when typing inside input/textarea/select
      }
      if (e.key === 'ArrowLeft') {
        if (tableScrollRef.current) {
          tableScrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowRight') {
        if (tableScrollRef.current) {
          tableScrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, tableViewMode]);

  const tableScrollRef = useRef<HTMLDivElement>(null);

  const scrollTable = (direction: 'left' | 'right') => {
    if (tableScrollRef.current) {
      const scrollAmount = direction === 'left' ? -450 : 450;
      tableScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getActiveTableColumns = (): string[] => {
    if (detectedCustomSchema && detectedCustomSchema.length > 0) {
      return detectedCustomSchema;
    }

    const keysInOrder: string[] = [];
    const keysSeen = new Set<string>();

    books.forEach(b => {
      const rowData = b.rawCsvData || b.customAttributes;
      if (rowData) {
        Object.keys(rowData).forEach(k => {
          if (!keysSeen.has(k)) {
            keysSeen.add(k);
            keysInOrder.push(k);
          }
        });
      }
    });

    if (keysInOrder.length > 0) {
      return keysInOrder;
    }

    return [
      'Accession / Register No',
      'Book Title',
      'Author(s)',
      'Department / Branch',
      'Subject',
      'Publisher',
      'Publication Year',
      'ISBN / Barcode',
      'Description / Notes'
    ];
  };

  const getCellValue = (book: Book, colHeader: string): string => {
    if (!book) return '-';

    // 1. Direct exact key check in rawCsvData
    if (book.rawCsvData && colHeader in book.rawCsvData) {
      const val = book.rawCsvData[colHeader];
      return val !== null && val !== undefined && val !== '' ? String(val) : '-';
    }

    // 2. Direct exact key check in customAttributes
    if (book.customAttributes && colHeader in book.customAttributes) {
      const val = book.customAttributes[colHeader];
      return val !== null && val !== undefined && val !== '' ? String(val) : '-';
    }

    // 3. Case-insensitive key check in rawCsvData
    if (book.rawCsvData) {
      const norm = colHeader.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const matchingKey = Object.keys(book.rawCsvData).find(
        k => k.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === norm
      );
      if (matchingKey) {
        const val = book.rawCsvData[matchingKey];
        return val !== null && val !== undefined && val !== '' ? String(val) : '-';
      }
    }

    // 4. Case-insensitive key check in customAttributes
    if (book.customAttributes) {
      const norm = colHeader.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const matchingKey = Object.keys(book.customAttributes).find(
        k => k.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === norm
      );
      if (matchingKey) {
        const val = book.customAttributes[matchingKey];
        return val !== null && val !== undefined && val !== '' ? String(val) : '-';
      }
    }

    // 5. Fallback for manually added structured books (when no rawCsvData exists)
    const norm = colHeader.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (norm.includes('title') || norm.includes('booktitle') || norm.includes('bookname') || norm.includes('item') || norm === 'name') {
      return book.title || '-';
    }
    if (norm.includes('author') || norm.includes('contributor') || norm.includes('writer') || norm.includes('creator') || norm.includes('by') || norm === 'pengarang') {
      return book.author || '-';
    }
    if (norm.includes('otlid') || norm.includes('accession') || norm.includes('acc') || norm.includes('register') || norm.includes('asset') || norm === 'id') {
      return book.accessionNumber || '-';
    }
    if (norm.includes('isbn') || norm.includes('barcode') || norm.includes('code')) {
      return book.isbn || '-';
    }
    if (norm.includes('publisher') || norm.includes('press')) {
      return book.publisher || '-';
    }
    if (norm.includes('year') || norm.includes('copyright') || norm.includes('pubyear')) {
      return book.publicationYear ? String(book.publicationYear) : '-';
    }
    if (norm.includes('dept') || norm.includes('department') || norm.includes('branch') || norm.includes('faculty') || norm.includes('subject1') || norm.includes('category')) {
      return book.department || '-';
    }
    if (norm.includes('subject') || norm.includes('course') || norm.includes('topic') || norm.includes('subject2') || norm.includes('type1')) {
      return book.subject || book.department || '-';
    }
    if (norm.includes('location') || norm.includes('almari') || norm.includes('shelf') || norm.includes('rack') || norm.includes('row')) {
      return `${book.location?.almariNumber || ''} - ${book.location?.rowNumber || ''}`;
    }
    if (norm.includes('copies') || norm.includes('quantity')) {
      return `${book.availableCopies ?? 1}/${book.totalCopies ?? 1}`;
    }
    if (norm.includes('desc') || norm.includes('summary') || norm.includes('license') || norm.includes('remark') || norm.includes('about')) {
      return book.description || book.summary || '-';
    }

    const directVal = (book as any)[colHeader];
    if (directVal !== undefined && directVal !== null && directVal !== '') {
      return String(directVal);
    }

    return '-';
  };

  const handleSchemaDetected = (headers: string[]) => {
    if (!headers || headers.length === 0) return;
    setDetectedCustomSchema(headers);
    localStorage.setItem('library_detected_form_schema', JSON.stringify(headers));
  };

  const handleAutoDetectSchemaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const { headers } = parseCSVToRawDataset(text);
        if (headers && headers.length > 0) {
          handleSchemaDetected(headers);
          alert(`Auto-detected ${headers.length} columns from file!\nAdd/Edit form buttons and fields have been replaced with columns: ${headers.join(', ')}`);
        }
      } catch (err: any) {
        alert('Could not detect CSV columns: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleResetFormSchema = () => {
    setDetectedCustomSchema(null);
    localStorage.removeItem('library_detected_form_schema');
    setDynamicFormValues({});
  };

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
  const [formPosition, setFormPosition] = useState<any>('MIDDLE');
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

    let title = formTitle;
    let author = formAuthor;
    let dept = formDepartment;
    let subject = formSubject;
    let almari = formAlmari;
    let row = formRow;
    let position = formPosition;
    let publisher = formPublisher;
    let isbn = formIsbn;
    let callNum = formCallNumber;
    let copies = formCopies;
    let customAttrs: Record<string, string> = {};

    if (detectedCustomSchema && detectedCustomSchema.length > 0) {
      detectedCustomSchema.forEach(colHeader => {
        const val = dynamicFormValues[colHeader] || '';
        const norm = colHeader.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (norm.includes('title') || norm.includes('book') || norm.includes('name')) {
          if (val) title = val;
        } else if (norm.includes('author') || norm.includes('writer') || norm.includes('by')) {
          if (val) author = val;
        } else if (norm.includes('dept') || norm.includes('department') || norm.includes('branch')) {
          if (val) dept = val;
        } else if (norm.includes('subject') || norm.includes('topic')) {
          if (val) subject = val;
        } else if (norm.includes('almari') || norm.includes('rack') || norm.includes('cupboard') || norm.includes('shelfid')) {
          if (val) almari = val;
        } else if (norm.includes('row')) {
          if (val) row = val;
        } else if (norm.includes('pos') || norm.includes('section') || norm.includes('level')) {
          if (val) position = val as any;
        } else if (norm.includes('publisher') || norm.includes('press')) {
          if (val) publisher = val;
        } else if (norm.includes('isbn') || norm.includes('barcode')) {
          if (val) isbn = val;
        } else if (norm.includes('call') || norm.includes('ddc')) {
          if (val) callNum = val;
        } else if (norm.includes('copies') || norm.includes('qty')) {
          if (val && !isNaN(Number(val))) copies = Number(val);
        } else {
          if (val) customAttrs[colHeader] = val;
        }
      });
    }

    if (!title) {
      alert('Book Title is required.');
      return;
    }

    const bookPayload = {
      title,
      subtitle: formSubtitle,
      author: author || 'Unknown Author',
      publisher: publisher || 'Standard Academic Publishers',
      department: dept || 'General Collection',
      subject: subject || dept || 'General',
      description: formDescription || `${title} by ${author || 'Unknown'}.`,
      summary: formSummary || `${title} reference manual.`,
      keywords: formKeywords ? formKeywords.split(',').map(k => k.trim()) : [dept, author],
      isbn: isbn || `978-81-${Math.floor(100000 + Math.random() * 900000)}`,
      callNumber: callNum || `${dept.substring(0, 3).toUpperCase()} ${Math.floor(100 + Math.random() * 900)}`,
      location: {
        almariNumber: almari.startsWith('Almari') ? almari : `Almari ${almari}`,
        rowNumber: row.startsWith('Row') ? row : `Row ${row}`,
        shelfPosition: position,
        shelfCode: `${almari}-${row}-${position.charAt(0)}`,
        floorWing: 'Central Wing'
      },
      totalCopies: Number(copies) || 5,
      availableCopies: Number(copies) || 5,
      customAttributes: Object.keys(customAttrs).length > 0 ? customAttrs : (editingBook?.customAttributes || undefined),
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
    setDynamicFormValues({});
  };

  const handleStartEdit = (b: Book) => {
    setIsAddBookPanelOpen(true);
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

    if (detectedCustomSchema && detectedCustomSchema.length > 0) {
      const initialDynamic: Record<string, string> = {};
      detectedCustomSchema.forEach(col => {
        const norm = col.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (norm.includes('title') || norm.includes('book') || norm.includes('name')) initialDynamic[col] = b.title;
        else if (norm.includes('author') || norm.includes('writer')) initialDynamic[col] = b.author;
        else if (norm.includes('dept') || norm.includes('department')) initialDynamic[col] = b.department;
        else if (norm.includes('subject')) initialDynamic[col] = b.subject;
        else if (norm.includes('almari') || norm.includes('rack')) initialDynamic[col] = b.location.almariNumber;
        else if (norm.includes('row')) initialDynamic[col] = b.location.rowNumber;
        else if (norm.includes('pos')) initialDynamic[col] = b.location.shelfPosition;
        else if (norm.includes('publisher')) initialDynamic[col] = b.publisher;
        else if (norm.includes('isbn')) initialDynamic[col] = b.isbn;
        else if (norm.includes('call')) initialDynamic[col] = b.callNumber;
        else if (norm.includes('copies')) initialDynamic[col] = String(b.totalCopies);
        else if (b.customAttributes && b.customAttributes[col]) initialDynamic[col] = b.customAttributes[col];
        else initialDynamic[col] = '';
      });
      setDynamicFormValues(initialDynamic);
    }
  };

  const publicPageUrl = `${window.location.origin}?collegeId=${currentCollege?.id || 'col-gec-goa'}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicPageUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicPageUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredBooks = useMemo(() => {
    if (!searchFilter.trim()) return books;
    const query = searchFilter.toLowerCase().trim();
    return books.filter(b => {
      const title = (b.title || '').toLowerCase();
      const author = (b.author || '').toLowerCase();
      const dept = (b.department || '').toLowerCase();
      const acc = (b.accessionNumber || '').toLowerCase();
      const isbn = (b.isbn || '').toLowerCase();
      const publisher = (b.publisher || '').toLowerCase();
      const rawValues = Object.values(b.rawCsvData || {}).map(v => String(v).toLowerCase());

      return (
        title.includes(query) ||
        author.includes(query) ||
        dept.includes(query) ||
        acc.includes(query) ||
        isbn.includes(query) ||
        publisher.includes(query) ||
        rawValues.some(v => v.includes(query))
      );
    });
  }, [books, searchFilter]);

  const totalPages = Math.ceil(filteredBooks.length / pageSize) || 1;
  const paginatedBooks = filteredBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

          {/* Clean Excel / CSV Actions Bar - Mobile Redesigned */}
          <div className={`${currentPreset.cardBg} ${currentPreset.cardRadius} p-3.5 sm:p-5 border ${currentPreset.cardBorder} shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${currentPreset.badgeRadius} ${currentPreset.badgeBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Excel / CSV Catalog Actions
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Import 10,000+ entries — all original columns & data rows preserved 100% as-is
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(true)}
                className={`w-full sm:w-auto px-4 py-2.5 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98`}
                title="Import or append new entries from Excel/CSV to catalog"
              >
                <Upload className="w-4 h-4 shrink-0" />
                <span>+ Upload / Append Spreadsheet</span>
              </button>

              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => exportBooksToCSV(books, currentCollege?.name)}
                  className={`w-full sm:w-auto px-3.5 py-2.5 ${currentPreset.secondaryButtonBg} ${currentPreset.buttonRadius} font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-98`}
                >
                  <Download className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={downloadSampleTemplateCSV}
                  className={`w-full sm:w-auto px-3 py-2.5 ${currentPreset.accentText} ${currentPreset.buttonRadius} hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-200/50 dark:border-slate-700/50 active:scale-98`}
                  title="Download formatted sample template"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Sample</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add / Edit Book Form */}
          {isAddBookPanelOpen && (
            <div className={`lg:col-span-1 ${currentPreset.cardBg} ${currentPreset.cardRadius} p-4 sm:p-6 border ${currentPreset.cardBorder} shadow-xl space-y-4`}>
              
              {/* Form Header */}
              <div className={`flex items-center justify-between border-b ${currentPreset.borderColor} pb-3`}>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className={`w-5 h-5 ${currentPreset.accentText}`} />
                  <span>{editingBook ? 'Edit Book' : 'Add New Book'}</span>
                </h3>
                <div className="flex items-center gap-2">
                  {editingBook && (
                    <button
                      onClick={() => {
                        setEditingBook(null);
                        setFormTitle('');
                        setFormAuthor('');
                        setDynamicFormValues({});
                      }}
                      className="text-xs text-rose-500 hover:underline font-semibold"
                    >
                      Cancel Edit
                    </button>
                  )}
                  {detectedCustomSchema && (
                    <button
                      type="button"
                      onClick={handleResetFormSchema}
                      className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30"
                      title="Reset to standard default form fields"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Default Fields</span>
                    </button>
                  )}
                  
                  {/* CUT / CLOSE FORM BUTTON TO VIEW FULLSCREEN CATALOG */}
                  <button
                    type="button"
                    onClick={() => setIsAddBookPanelOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                    title="Close form panel to view College Catalog in full screen width"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

            {/* Active Custom Schema Alert Banner */}
            {detectedCustomSchema && detectedCustomSchema.length > 0 && (
              <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/60 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <Sliders className="w-3.5 h-3.5" />
                    Custom Schema Detected ({detectedCustomSchema.length} Columns)
                  </span>
                  <button
                    type="button"
                    onClick={handleResetFormSchema}
                    className="text-[10px] text-indigo-500 hover:underline font-semibold"
                  >
                    Reset
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Form fields replaced with file headers: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-300">{detectedCustomSchema.slice(0, 5).join(', ')}{detectedCustomSchema.length > 5 ? '...' : ''}</span>
                </p>
              </div>
            )}

            <form onSubmit={handleSaveBook} className="space-y-3">

              {/* Dynamic Field Inputs when CSV Schema is Auto-Detected */}
              {detectedCustomSchema && detectedCustomSchema.length > 0 ? (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Auto-Detected Form Fields</span>
                    <span className="text-[10px] text-emerald-500 font-mono">Synced from CSV</span>
                  </div>

                  {detectedCustomSchema.map((header) => {
                    const norm = header.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const isTitle = norm.includes('title') || norm.includes('book') || norm.includes('name');
                    const isAuthor = norm.includes('author') || norm.includes('writer');

                    return (
                      <div key={header}>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                          <span>{header} {(isTitle || isAuthor) && <span className="text-rose-500">*</span>}</span>
                          <span className="text-[9px] font-mono text-slate-400 uppercase">Column</span>
                        </label>
                        <input
                          type="text"
                          required={isTitle || isAuthor}
                          value={dynamicFormValues[header] || ''}
                          onChange={(e) => setDynamicFormValues(prev => ({ ...prev, [header]: e.target.value }))}
                          placeholder={`Enter ${header}...`}
                          className={`w-full px-3 py-2 text-xs ${currentPreset.inputBg} ${currentPreset.inputRadius} focus:outline-none`}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Default Form Fields */
                <>
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
                </>
              )}

              {/* By Default 3 Physical Location Options (Almari, Row, Section Position) */}
              <div className={`p-3.5 rounded-2xl ${currentPreset.innerCardBg} border ${currentPreset.borderColor} space-y-2`}>
                <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Physical Shelf Location (Default 3 Mapping Options)</span>
                  <span className="text-[10px] font-bold text-amber-500 font-mono">Shelf GPS</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">1. Almari / Rack</label>
                    <input
                      type="text"
                      value={formAlmari}
                      onChange={e => setFormAlmari(e.target.value)}
                      placeholder="e.g. A1 or 2F-SF-05"
                      className={`w-full px-2 py-1.5 text-xs ${currentPreset.inputBg} rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">2. Row No</label>
                    <input
                      type="text"
                      value={formRow}
                      onChange={e => setFormRow(e.target.value)}
                      placeholder="e.g. Row 1 or R3"
                      className={`w-full px-2 py-1.5 text-xs ${currentPreset.inputBg} rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">3. Position Section</label>
                    <select
                      value={formPosition}
                      onChange={e => setFormPosition(e.target.value as any)}
                      className={`w-full px-1.5 py-1.5 text-xs ${currentPreset.inputBg} rounded-lg font-extrabold`}
                    >
                      <option value="LEFT">LEFT (Green Section)</option>
                      <option value="MIDDLE">MIDDLE (Blue Section)</option>
                      <option value="RIGHT">RIGHT (Red Section)</option>
                      <option value="Top">Top Tier</option>
                      <option value="Bottom">Bottom Tier</option>
                    </select>
                  </div>
                </div>
              </div>

              {!detectedCustomSchema && (
                <>
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
                </>
              )}

              <button
                type="submit"
                className={`w-full py-3 ${currentPreset.buttonBg} font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2`}
              >
                <Plus className="w-4 h-4" />
                <span>{editingBook ? 'Update Book in Catalog' : 'Save Book to Library'}</span>
              </button>
            </form>
          </div>
          )}

          {/* Book Catalog Table */}
          <div className={`${isAddBookPanelOpen ? 'lg:col-span-2' : 'lg:col-span-3'} ${currentPreset.cardBg} rounded-3xl p-3.5 sm:p-6 border ${currentPreset.cardBorder} shadow-xl space-y-4 transition-all duration-300`}>
            
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 border-b border-slate-200 dark:border-slate-800 pb-3.5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full md:w-auto">
                {!isAddBookPanelOpen && (
                  <button
                    type="button"
                    onClick={() => setIsAddBookPanelOpen(true)}
                    className={`w-full sm:w-auto px-3.5 py-2.5 ${currentPreset.buttonBg} text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:scale-102 transition-transform active:scale-98`}
                    title="Re-open Add New Book Form Panel"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>+ Add New Book</span>
                  </button>
                )}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className={`w-5 h-5 ${currentPreset.accentText} shrink-0`} />
                    <span>College Catalog ({books.length} Books)</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    {currentCollege?.name} library database
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                {/* View Mode Toggle Buttons */}
                <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setTableViewMode('sheet')}
                    className={`py-2 px-3 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      tableViewMode === 'sheet'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Display exact rows and columns from Excel/CSV file"
                  >
                    <Table className="w-3.5 h-3.5 shrink-0" />
                    <span>Exact Sheet ({getActiveTableColumns().length} Cols)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableViewMode('standard')}
                    className={`py-2 px-3 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      tableViewMode === 'standard'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Display compact standard catalog cards"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                    <span>Standard View</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={e => setSearchFilter(e.target.value)}
                      placeholder="Filter catalog..."
                      className={`w-full pl-9 pr-3 py-2 text-xs ${currentPreset.inputBg} rounded-xl border border-slate-200/50 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                  </div>

                  {onClearCatalog && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowClearSheetModal(true);
                        setDeleteConfirmInput('');
                      }}
                      disabled={isClearing}
                      className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-500/30 flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-50 shrink-0"
                      title="Delete full sheet / clear all books in catalog"
                    >
                      {isClearing ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">{isClearing ? 'Deleting...' : 'Delete Full Sheet'}</span>
                      <span className="sm:hidden">{isClearing ? '...' : 'Clear Sheet'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {filteredBooks.length > 0 ? (
              tableViewMode === 'sheet' ? (
                /* EXACT SPREADSHEET GRID VIEW */
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 px-3 py-2 font-medium bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-extrabold">
                        <FileSpreadsheet className="w-4 h-4 shrink-0 text-indigo-500" />
                        <span>Showing all {getActiveTableColumns().length} columns</span>
                      </span>
                      <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono px-2.5 py-0.5 rounded-full font-bold">
                        Swipe or ◄ ► arrow keys to scroll
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isAddBookPanelOpen && (
                        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          FULLSCREEN ACTIVE
                        </span>
                      )}
                      <span className="font-mono text-slate-400 font-bold">{filteredBooks.length} Rows</span>
                    </div>
                  </div>

                  <div ref={tableScrollRef} tabIndex={0} className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner max-w-full scroll-smooth focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                    <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                      <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-extrabold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3 border-b border-r border-slate-200 dark:border-slate-800 bg-slate-200/70 dark:bg-slate-800/80 text-center w-10">
                            #
                          </th>
                          {getActiveTableColumns().map((colHeader, idx) => (
                            <th
                              key={idx}
                              className="py-2.5 px-3 border-b border-r border-slate-200 dark:border-slate-800 min-w-[140px] max-w-[300px]"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold">{colHeader}</span>
                                <span className="text-[9px] font-mono text-indigo-500 lowercase opacity-70">col</span>
                              </div>
                            </th>
                          ))}
                          <th className="py-2.5 px-3 border-b border-r border-slate-200 dark:border-slate-800 min-w-[120px] bg-amber-500/10 text-amber-700 dark:text-amber-300">
                            Shelf Location
                          </th>
                          <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-right sticky right-0 bg-slate-100 dark:bg-slate-900 z-10 min-w-[80px]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                        {paginatedBooks.map((b, rowIdx) => (
                          <tr key={b.id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors">
                            <td className="py-2.5 px-2.5 border-r border-slate-100 dark:border-slate-800/60 text-slate-400 text-center font-mono font-bold bg-slate-50/50 dark:bg-slate-900/30">
                              {(currentPage - 1) * pageSize + rowIdx + 1}
                            </td>
                            {getActiveTableColumns().map((colHeader, colIdx) => {
                              const cellValue = getCellValue(b, colHeader);
                              const isLink = cellValue.startsWith('http://') || cellValue.startsWith('https://');

                              return (
                                <td
                                  key={colIdx}
                                  className="py-2.5 px-3 border-r border-slate-100 dark:border-slate-800/60 max-w-[300px] truncate font-sans text-slate-800 dark:text-slate-200"
                                  title={cellValue}
                                >
                                  {isLink ? (
                                    <a
                                      href={cellValue}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 inline-flex font-medium"
                                    >
                                      <span className="truncate max-w-[200px]">{cellValue}</span>
                                      <ExternalLink className="w-3 h-3 shrink-0" />
                                    </a>
                                  ) : (
                                    <span>{cellValue}</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="py-2.5 px-3 border-r border-slate-100 dark:border-slate-800/60 font-mono font-bold text-amber-600 dark:text-amber-400">
                              {b.location.almariNumber} - {b.location.rowNumber} ({b.location.shelfPosition})
                            </td>
                            <td className="py-2.5 px-3 text-right sticky right-0 bg-white dark:bg-slate-900 z-10">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleStartEdit(b)}
                                  className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 ${currentPreset.accentText}`}
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setBookToDelete(b)}
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
                </div>
              ) : (
                /* STANDARD COMPACT CATALOG VIEW */
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
                      {paginatedBooks.map(b => (
                        <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 dark:text-white">{b.title}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">by {b.author}</div>
                            {b.customAttributes && (
                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                {Object.entries(b.customAttributes).slice(0, 4).map(([key, val]) => (
                                  <span key={key} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                                    {key}: {String(val)}
                                  </span>
                                ))}
                                {Object.keys(b.customAttributes).length > 4 && (
                                  <span className="text-[9px] font-mono text-slate-400">
                                    +{Object.keys(b.customAttributes).length - 4} more
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-md ${currentPreset.badgeBg} font-medium`}>
                              {b.department}
                            </span>
                            {b.subject && b.subject !== b.department && (
                              <div className="text-[10px] text-slate-400 font-medium mt-0.5">{b.subject}</div>
                            )}
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
                                onClick={() => setBookToDelete(b)}
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
              )
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <div>No books in {currentCollege?.name}'s catalog yet.</div>
                <div className="text-[11px] text-slate-500">Fill the form on the left to add your first book!</div>
              </div>
            )}

            {/* PAGINATION CONTROLS BAR */}
            {filteredBooks.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>Showing {Math.min((currentPage - 1) * pageSize + 1, filteredBooks.length)} to {Math.min(currentPage * pageSize, filteredBooks.length)} of {filteredBooks.length.toLocaleString()} books</span>
                  <div className="flex items-center gap-1.5 ml-2">
                    <span className="text-[11px] text-slate-400">Rows/page:</span>
                    <select
                      value={pageSize}
                      onChange={e => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={250}>250</option>
                      <option value={500}>500</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <span className="px-2 font-mono font-bold text-slate-800 dark:text-slate-200">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
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
            onSelectTab={setActiveTab}
            onOpenQRModal={onOpenQRModal}
            onOpenBarcodeModal={onOpenBarcodeModal}
            onOpenPublicKiosk={onOpenPublicKiosk}
            books={books}
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
                                  <span>Issued: <span className="text-slate-600 dark:text-slate-300">{rec.issueDate || (rec.issuedAt ? new Date(rec.issuedAt).toISOString().split('T')[0] : 'Today')}</span></span>
                                  <span>Due: <span className={isLate ? "text-rose-600 font-extrabold" : "text-slate-600 dark:text-slate-300"}>{rec.dueDate || (rec.returnDueDate ? new Date(rec.returnDueDate).toISOString().split('T')[0] : 'TBD')}</span></span>
                                  {rec.status === 'Returned' && (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                                      Returned: {rec.returnDate || 'Settle Date'}
                                    </span>
                                  )}
                                </div>

                                {rec.extraDetails && (
                                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800/40 text-[10px] text-slate-500 dark:text-slate-400">
                                    {rec.borrowType === 'home' && (
                                      <>
                                        <span className="bg-amber-100 dark:bg-amber-950/40 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-300 font-extrabold uppercase text-[9px]">Home Loan</span>
                                        {rec.extraDetails.contactPhone && (
                                          <span>📞 Phone: <strong className="text-slate-700 dark:text-slate-200">{rec.extraDetails.contactPhone}</strong></span>
                                        )}
                                        {rec.extraDetails.hostelOrAddress && (
                                          <span>🏠 Room/Address: <strong className="text-slate-700 dark:text-slate-200">{rec.extraDetails.hostelOrAddress}</strong></span>
                                        )}
                                      </>
                                    )}
                                    {rec.borrowType === 'reading_room' && (
                                      <>
                                        <span className="bg-blue-100 dark:bg-blue-950/40 px-1.5 py-0.5 rounded text-blue-800 dark:text-blue-300 font-extrabold uppercase text-[9px]">Reading Room</span>
                                        {rec.extraDetails.seatNumber && (
                                          <span>🪑 Seat: <strong className="text-slate-700 dark:text-slate-200">{rec.extraDetails.seatNumber}</strong></span>
                                        )}
                                        {rec.extraDetails.readingDuration && (
                                          <span>⏱️ Session: <strong className="text-slate-700 dark:text-slate-200">{rec.extraDetails.readingDuration}</strong></span>
                                        )}
                                      </>
                                    )}
                                    {rec.borrowType === 'project_work' && (
                                      <>
                                        <span className="bg-emerald-100 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded text-emerald-800 dark:text-emerald-300 font-extrabold uppercase text-[9px]">Project Work</span>
                                        {rec.extraDetails.projectName && (
                                          <span>🔬 Lab: <strong className="text-slate-700 dark:text-slate-200">{rec.extraDetails.projectName}</strong></span>
                                        )}
                                        {rec.extraDetails.guideName && (
                                          <span>👨‍🏫 Guide: <strong className="text-slate-700 dark:text-slate-200">{rec.extraDetails.guideName}</strong></span>
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}
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
        onSchemaDetected={handleSchemaDetected}
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

      {/* Auto-Detect Fields Info Modal */}
      {showSchemaInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`${currentPreset.modalBg} ${currentPreset.cardRadius} max-w-lg w-full border ${currentPreset.cardBorder} shadow-2xl p-6 relative space-y-5`}>
            <button
              onClick={() => setShowSchemaInfoModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/20">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Auto-Detect Fields Feature
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  How dynamic form column adaptation works
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 space-y-1.5">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Upload className="w-4 h-4" />
                  <span>1. Append New Entries (+ Append New Entries Button)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Whether you imported 23,000 books yesterday or need to add 23 new books today, simply upload your spreadsheet! It <strong>appends new books directly into the existing database</strong> without needing manual form entry or re-uploading old files. Column headers are also auto-detected to customize your form fields.
                </p>
              </div>

              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/60 space-y-1.5">
                <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" />
                  <span>2. Standalone "Auto-Detect Fields" Button</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Use this button if you only want to <strong>update the Add / Edit Book form fields</strong> to match your spreadsheet's custom column headers <strong>without saving any books</strong> to the database.
                </p>
              </div>

              <div className="p-2.5 bg-slate-100 dark:bg-slate-900/80 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                💡 <strong>Default Physical Shelf Options:</strong> Location inputs — Almari/Rack No, Row No, and Shelf Position Section (LEFT, MIDDLE, RIGHT) — remain permanently available by default in both modes.
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSchemaInfoModal(false)}
                className={`px-4 py-2 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} text-xs font-bold`}
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 max-w-md text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900 text-rose-100 border-rose-700'
                : 'bg-slate-900 text-slate-100 border-slate-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Full Sheet Modal */}
      {showClearSheetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-4">
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Entire Catalog Sheet?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{currentCollege?.name || 'College Library'}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 font-medium">
                ⚠️ <strong>WARNING:</strong> This will permanently erase <strong>ALL {books.length} books</strong> in this college catalog sheet from the database. This action cannot be undone.
              </div>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                To confirm deletion, please type <span className="font-mono font-bold text-rose-600 dark:text-rose-400 underline">DELETE</span> below:
              </p>
              <input
                type="text"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder='Type "DELETE" here'
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowClearSheetModal(false);
                  setDeleteConfirmInput('');
                }}
                disabled={isClearing}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmInput.trim().toUpperCase() !== 'DELETE' || isClearing}
                onClick={async () => {
                  if (!onClearCatalog) return;
                  setIsClearing(true);
                  try {
                    await onClearCatalog();
                    setDetectedCustomSchema(null);
                    localStorage.removeItem('library_detected_form_schema');
                    setShowClearSheetModal(false);
                    setDeleteConfirmInput('');
                    setToast({ type: 'success', message: 'Entire catalog sheet permanently deleted!' });
                  } catch (err: any) {
                    setToast({ type: 'error', message: err.message || 'Failed to delete catalog sheet.' });
                  } finally {
                    setIsClearing(false);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all flex items-center gap-2 shadow-md shadow-rose-600/20"
              >
                {isClearing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting Sheet...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Permanently Delete Sheet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Book Delete Confirmation Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-4">
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Book Entry?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Remove from library database</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-xs text-slate-600 dark:text-slate-300">
              <p className="text-slate-600 dark:text-slate-300">Are you sure you want to permanently delete this book from the library catalog?</p>
              <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
                "{bookToDelete.title}" <span className="font-normal text-slate-500 dark:text-slate-400 block text-[11px] mt-0.5">by {bookToDelete.author}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setBookToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await onDeleteBook(bookToDelete.id);
                    setToast({ type: 'success', message: `Book "${bookToDelete.title}" deleted permanently!` });
                  } catch (err: any) {
                    setToast({ type: 'error', message: 'Failed to delete book.' });
                  } finally {
                    setBookToDelete(null);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/20"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
