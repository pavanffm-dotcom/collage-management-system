import React, { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, Sparkles, RefreshCw, CheckCircle2, X, Search, BarChart2, QrCode, Settings, BookOpen, Building2, Printer, Copy, Check, FileSpreadsheet, Upload, Download } from 'lucide-react';
import { Book, College, LibraryStats } from '../types';
import { AnalyticsView } from './AnalyticsView';
import { SettingsView } from './SettingsView';
import { BulkImportModal } from './BulkImportModal';
import { exportBooksToCSV, downloadSampleTemplateCSV } from '../utils/csvUtils';
import { useTheme } from '../context/ThemeContext';

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
  activeTab?: 'add' | 'analytics' | 'qr' | 'settings';
  setActiveTab?: (tab: 'add' | 'analytics' | 'qr' | 'settings') => void;
  onLogout?: () => void;
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
  onLogout
}) => {
  const { currentPreset } = useTheme();
  const [localActiveTab, setLocalActiveTab] = useState<'add' | 'analytics' | 'qr' | 'settings'>('add');
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = propSetActiveTab || setLocalActiveTab;
  const [searchFilter, setSearchFilter] = useState('');
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

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

      {/* Tab 1: Add & Manage Books */}
      {activeTab === 'add' && (
        <div className="space-y-5">

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
        </div>
      )}

      {/* Tab 2: Search Analytics */}
      {activeTab === 'analytics' && (
        <AnalyticsView
          stats={stats}
          recentLogs={recentLogs}
          onRefresh={onRefreshStats}
        />
      )}

      {/* Tab 3: Entrance QR Code */}
      {activeTab === 'qr' && (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl text-center space-y-6">
          
          {/* Header Badge */}
          <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full ${currentPreset.badgeBg} text-xs font-bold tracking-wide`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Library Entrance QR</span>
          </div>

          {/* QR Frame */}
          <div className={`relative mx-auto w-60 h-60 p-4 rounded-3xl ${currentPreset.buttonBg} shadow-xl flex items-center justify-center`}>
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-2xl p-3 flex flex-col items-center justify-center shadow-inner relative">
              <img
                src={qrImageUrl}
                alt="Entrance QR Code"
                className="w-44 h-44 object-contain rounded-xl"
              />
              <div className="absolute -bottom-2 bg-slate-900 text-white text-[10px] font-semibold px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-amber-300" />
                <span>Scan to Search Books</span>
              </div>
            </div>
          </div>

          {/* Simple Public Link Box */}
          <div className="space-y-2 pt-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Public Search Link
            </label>
            <div className="p-2 pl-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300">
              <span className="truncate font-mono text-[11px] text-slate-600 dark:text-slate-400">
                {publicPageUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className={`px-3.5 py-1.5 rounded-xl ${currentPreset.buttonBg} text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-xs`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Tab 4: College Settings */}
      {activeTab === 'settings' && (
        <SettingsView
          currentCollege={currentCollege}
          onUpdateCollege={onUpdateCollege}
          onLogout={onLogout}
        />
      )}

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
