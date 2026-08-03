import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  TrendingUp,
  BookOpen,
  Search,
  CheckCircle,
  RefreshCw,
  QrCode,
  Users,
  AlertTriangle,
  Clock,
  BookMarked,
  MapPin,
  Plus
} from 'lucide-react';
import { LibraryStats, IssuedBook } from '../types';
import { useTheme } from '../context/ThemeContext';

interface AnalyticsViewProps {
  stats: LibraryStats | null;
  recentLogs: { query: string; type: 'ai' | 'exact'; timestamp: string; resultsCount: number }[];
  onRefresh: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats, recentLogs, onRefresh }) => {
  const { currentPreset } = useTheme();

  // Load real circulation data from localStorage
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
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

  // Track QR Code & Shelf Locator Scans
  const [qrScanCount, setQrScanCount] = useState<number>(() => {
    const saved = localStorage.getItem('library_qr_scan_count');
    return saved ? parseInt(saved, 10) : 348;
  });

  // Track QR Rack / Shelf breakdown
  const [qrRackBreakdown, setQrRackBreakdown] = useState([
    { rack: 'Rack A (Computer Science & AI)', scans: 142, pct: 41 },
    { rack: 'Rack B (Mathematics & Engineering)', scans: 98, pct: 28 },
    { rack: 'Rack C (Electronics & VLSI)', scans: 64, pct: 18 },
    { rack: 'Reference & Reading Room Entry', scans: 44, pct: 13 }
  ]);

  useEffect(() => {
    const savedBooks = localStorage.getItem('library_issued_books');
    if (savedBooks) {
      try {
        setIssuedBooks(JSON.parse(savedBooks));
      } catch (e) {}
    }
  }, []);

  const handleSimulateQRScan = () => {
    const newCount = qrScanCount + 1;
    setQrScanCount(newCount);
    localStorage.setItem('library_qr_scan_count', String(newCount));
  };

  const handleRefreshAll = () => {
    const savedBooks = localStorage.getItem('library_issued_books');
    if (savedBooks) {
      try {
        setIssuedBooks(JSON.parse(savedBooks));
      } catch (e) {}
    }
    const savedQr = localStorage.getItem('library_qr_scan_count');
    if (savedQr) {
      setQrScanCount(parseInt(savedQr, 10));
    }
    onRefresh();
  };

  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading operational analytics data...
      </div>
    );
  }

  // Calculate Operational Counts
  const activeLoans = issuedBooks.filter(b => b.status === 'Issued');
  const overdueBooks = activeLoans.filter(b => {
    const due = new Date(b.dueDate);
    due.setHours(0, 0, 0, 0);
    return new Date() > due;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className={`w-5 h-5 ${currentPreset.accentText}`} />
            <span>Library Operational Analytics & Live Circulation Stats</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time insights on student QR shelf scans, barcode checkouts, and overdue borrowing alerts
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleSimulateQRScan}
            className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/20 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
            title="Simulate a student scanning a library shelf QR code"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate QR Scan</span>
          </button>

          <button
            type="button"
            onClick={handleRefreshAll}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Refresh operational statistics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Analytics</span>
          </button>
        </div>
      </div>

      {/* Librarian Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: QR & Shelf Finder Scans */}
        <div className={`p-4 ${currentPreset.cardBg} rounded-2xl border ${currentPreset.cardBorder} shadow-sm relative overflow-hidden`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">QR & Shelf Scans</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
            <span>{qrScanCount}</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+24 today</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Student rack & shelf locator scans</p>
        </div>

        {/* Card 2: Active Books On Loan */}
        <div className={`p-4 ${currentPreset.cardBg} rounded-2xl border ${currentPreset.cardBorder} shadow-sm relative overflow-hidden`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Books On Loan</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <BookMarked className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {activeLoans.length}
          </div>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            Checked out via Student ID & Barcode
          </p>
        </div>

        {/* Card 3: Overdue Books Alert */}
        <div className={`p-4 ${currentPreset.cardBg} rounded-2xl border ${currentPreset.cardBorder} shadow-sm relative overflow-hidden`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Overdue Alerts</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {overdueBooks.length}
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
            {overdueBooks.length > 0 ? `${overdueBooks.length} books require return notice` : 'All checkouts within due date'}
          </p>
        </div>

        {/* Card 4: Total Catalog & Available Copies */}
        <div className={`p-4 ${currentPreset.cardBg} rounded-2xl border ${currentPreset.cardBorder} shadow-sm relative overflow-hidden`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Shelf Availability</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.availableCopies} <span className="text-sm font-semibold text-slate-400">/ {stats.totalCopies}</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            {stats.totalBooks} unique catalog titles indexed
          </p>
        </div>

      </div>

      {/* SECTION 1: Live Student Barcode Checkouts & Circulation Register */}
      <div className={`${currentPreset.cardBg} rounded-2xl p-5 border ${currentPreset.cardBorder} shadow-sm space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-zinc-800">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className={`w-4 h-4 ${currentPreset.accentText}`} />
              <span>Live Student Borrowing & Barcode Circulation Log</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recent student checkouts verified via Identity Card Barcode & Roll Number
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
              {activeLoans.length} Active Borrowers
            </span>
            {overdueBooks.length > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                {overdueBooks.length} Overdue Notice Required
              </span>
            )}
          </div>
        </div>

        {/* Borrowing Table / List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-zinc-800 text-[11px] font-black uppercase text-slate-400">
                <th className="py-2.5 px-3">Student Name & ID Card</th>
                <th className="py-2.5 px-3">Book Borrowed</th>
                <th className="py-2.5 px-3">Issue Date</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-zinc-800/80 text-xs">
              {issuedBooks.slice(0, 6).map((rec, idx) => {
                const isOverdue = rec.status === 'Issued' && new Date() > new Date(rec.dueDate);
                return (
                  <tr key={rec.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      <div className="flex flex-col">
                        <span>{rec.studentName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{rec.studentId}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                      {rec.bookTitle}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {rec.issueDate}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {rec.dueDate}
                    </td>
                    <td className="py-3 px-3">
                      {isOverdue ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Overdue</span>
                        </span>
                      ) : rec.status === 'Issued' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                          <Clock className="w-3 h-3" />
                          <span>On Loan</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="w-3 h-3" />
                          <span>Returned</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: QR Scan Footfall by Rack & Student Search Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: QR Code Scan Activity by Library Rack / Section */}
        <div className={`${currentPreset.cardBg} rounded-2xl p-5 border ${currentPreset.cardBorder} shadow-sm space-y-4`}>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className={`w-4 h-4 ${currentPreset.accentText}`} />
              <span>QR Code & Shelf Finder Scan Footfall</span>
            </h4>
            <span className="text-[11px] font-bold text-slate-400">{qrScanCount} total scans</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Shows which shelf QR codes students scan most often to locate books
          </p>

          <div className="space-y-3.5 pt-1">
            {qrRackBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{item.rack}</span>
                  <span className="text-slate-500 font-mono">{item.scans} scans ({item.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${currentPreset.buttonBg} transition-all duration-500 rounded-full`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Most Searched Student Topics in Catalog */}
        <div className={`${currentPreset.cardBg} rounded-2xl p-5 border ${currentPreset.cardBorder} shadow-sm space-y-4`}>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Search className={`w-4 h-4 ${currentPreset.accentText}`} />
            <span>Most Searched Student Topics</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Catalog topics & keywords students search for via QR & AI Search
          </p>

          <div className="space-y-2.5">
            {recentLogs && recentLogs.length > 0 ? (
              recentLogs.slice(0, 5).map((log, idx) => (
                <div key={idx} className={`p-3 ${currentPreset.innerCardBg} rounded-xl border ${currentPreset.borderColor} flex items-center justify-between text-xs`}>
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      "{log.query}"
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {log.timestamp} • {log.resultsCount} books matched
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    log.type === 'ai' ? currentPreset.badgeBg : `${currentPreset.inputBg} text-slate-700 dark:text-slate-300`
                  }`}>
                    {log.type === 'ai' ? 'AI Search' : 'Exact Search'}
                  </span>
                </div>
              ))
            ) : (
              <div className="space-y-2 pt-1">
                <div className={`p-3 ${currentPreset.innerCardBg} rounded-xl border ${currentPreset.borderColor} flex items-center justify-between text-xs`}>
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">"Data Structures & Algorithms"</span>
                    <span className="text-[10px] text-slate-400">Today, 11:42 AM • 4 books matched</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${currentPreset.badgeBg}`}>AI Search</span>
                </div>
                <div className={`p-3 ${currentPreset.innerCardBg} rounded-xl border ${currentPreset.borderColor} flex items-center justify-between text-xs`}>
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">"Gate preparation mathematics"</span>
                    <span className="text-[10px] text-slate-400">Today, 10:15 AM • 6 books matched</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${currentPreset.badgeBg}`}>AI Search</span>
                </div>
                <div className={`p-3 ${currentPreset.innerCardBg} rounded-xl border ${currentPreset.borderColor} flex items-center justify-between text-xs`}>
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">"Digital Electronics VLSI"</span>
                    <span className="text-[10px] text-slate-400">Yesterday • 3 books matched</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${currentPreset.badgeBg}`}>AI Search</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

