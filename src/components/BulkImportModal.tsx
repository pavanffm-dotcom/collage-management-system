import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  FileText,
  Sliders,
  ChevronRight,
  Database,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  parseCSVToRawDataset,
  convertExactRawRowsToBooks,
  convertRawRowsToBooks,
  TARGET_BOOK_FIELDS,
  downloadSampleTemplateCSV
} from '../utils/csvUtils';
import { useTheme } from '../context/ThemeContext';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportBooks: (importedBooks: any[]) => Promise<any>;
  collegeName?: string;
  onSchemaDetected?: (headers: string[]) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImportBooks,
  collegeName,
  onSchemaDetected
}) => {
  const { currentPreset } = useTheme();

  // Wizard Steps: 'upload' -> 'map_columns' -> 'preview' -> 'success'
  const [step, setStep] = useState<'upload' | 'map_columns' | 'success'>('upload');

  const [file, setFile] = useState<File | null>(null);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  
  const [parsedBooks, setParsedBooks] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ processed: number; total: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<{ newCount: number; updatedCount: number; total: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setFile(null);
    setRawHeaders([]);
    setRawRows([]);
    setColumnMapping({});
    setParsedBooks([]);
    setErrorMsg(null);
    setImportSummary(null);
    setStep('upload');
  };

  const processFile = (file: File) => {
    setFile(file);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const { headers, rows } = parseCSVToRawDataset(text);

        if (headers.length === 0 || rows.length === 0) {
          setErrorMsg('Uploaded file is empty or missing data rows.');
          return;
        }

        setRawHeaders(headers);
        setRawRows(rows);
        if (onSchemaDetected) {
          onSchemaDetected(headers);
        }

        // Convert raw rows to exact books list without auto-detect/mapping overrides
        const initialBooks = convertExactRawRowsToBooks(rows);
        setParsedBooks(initialBooks);

        setStep('map_columns');
      } catch (err: any) {
        setErrorMsg(err.message || 'Error parsing CSV file. Please check file formatting.');
      }
    };

    reader.onerror = () => {
      setErrorMsg('Failed to read file from disk.');
    };

    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  // Re-map column handler
  const handleMappingChange = (fieldId: string, headerName: string) => {
    const updated = { ...columnMapping, [fieldId]: headerName };
    setColumnMapping(updated);

    // Re-convert rows with new mapping
    if (rawRows.length > 0) {
      const reConverted = convertRawRowsToBooks(rawRows, updated);
      setParsedBooks(reConverted);
    }
  };

  const handleConfirmImport = async () => {
    if (parsedBooks.length === 0) return;
    setIsImporting(true);
    setErrorMsg(null);
    setImportProgress({ processed: 0, total: parsedBooks.length });

    try {
      const CHUNK_SIZE = 1000;
      let totalNew = 0;
      let totalUpdated = 0;

      for (let i = 0; i < parsedBooks.length; i += CHUNK_SIZE) {
        const chunk = parsedBooks.slice(i, i + CHUNK_SIZE);
        const result: any = await onImportBooks(chunk);
        
        totalNew += result?.newCount ?? chunk.length;
        totalUpdated += result?.updatedCount ?? 0;

        const currentProcessed = Math.min(i + CHUNK_SIZE, parsedBooks.length);
        setImportProgress({ processed: currentProcessed, total: parsedBooks.length });

        // Yield execution briefly to keep UI responsive on massive 1,000,000 row imports
        if (parsedBooks.length > 5000) {
          await new Promise(r => setTimeout(r, 10));
        }
      }

      setImportSummary({
        newCount: totalNew,
        updatedCount: totalUpdated,
        total: parsedBooks.length
      });
      setStep('success');
    } catch (err: any) {
      console.error('Bulk import failed:', err);
      setErrorMsg(err.message || 'Failed to save imported books. Please try again.');
    } finally {
      setIsImporting(false);
      setImportProgress(null);
    }
  };

  // Compute unmapped CSV columns count (custom attributes)
  const mappedCsvHeaders = new Set(Object.values(columnMapping).filter(Boolean));
  const customAttributesCount = rawHeaders.filter(h => !mappedCsvHeaders.has(h)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className={`${currentPreset.modalBg} ${currentPreset.cardRadius} max-w-3xl w-full border ${currentPreset.cardBorder} shadow-2xl overflow-hidden p-6 sm:p-8 relative space-y-6 my-auto max-h-[90vh] flex flex-col`}>
        
        {/* Modal Close Button */}
        <button
          onClick={() => {
            handleReset();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Safe Append Mode (Preserves Existing Database)
              </span>
              {collegeName && (
                <span className="text-[10px] font-medium text-slate-400">
                  • {collegeName}
                </span>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Import & Append New Entries to Catalog
            </h3>
          </div>
        </div>

        {/* STEP 1: UPLOAD FILE */}
        {step === 'upload' && (
          <div className="space-y-5 overflow-y-auto p-1">
            {/* Download Template Bar */}
            <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-indigo-950 dark:text-indigo-200 font-medium">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Works with ANY column names (Koha, SLIM21, Excel, Google Sheets)</span>
              </div>
              <button
                type="button"
                onClick={downloadSampleTemplateCSV}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-xs flex items-center gap-1.5 transition-all shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample Template</span>
              </button>
            </div>

            {/* Dropzone Upload Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50/80 dark:bg-slate-800/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
                <Upload className="w-7 h-7" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Click to Upload or Drag & Drop Any Library Spreadsheet
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports .csv, .tsv or .txt files up to 1,000,000 (1 Million) rows. AI auto-matches all exact columns!
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-2 text-xs text-rose-600 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: EXACT SPREADSHEET PREVIEW & IMPORT */}
        {step === 'map_columns' && (
          <div className="space-y-5 overflow-y-auto pr-1">
            
            {/* Header info bar */}
            <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-extrabold text-indigo-950 dark:text-indigo-200">
                <FileSpreadsheet className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Spreadsheet Loaded: {rawHeaders.length} Exact Columns • {rawRows.length} Data Rows</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Upload Different File
              </button>
            </div>

            {/* Exact Spreadsheet Columns List Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Detected Columns in Sheet ({rawHeaders.length}):</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  100% Exact Columns Preserved
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 max-h-28 overflow-y-auto">
                {rawHeaders.map((header, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono font-bold px-2 py-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs"
                  >
                    {idx + 1}. {header}
                  </span>
                ))}
              </div>
            </div>

            {/* Scrollable Live Sample Rows Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Exact Sample Rows Preview (First 5 Rows):</span>
              </h4>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl max-h-48 scroll-smooth bg-white dark:bg-slate-900">
                <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="p-2 border-b border-r border-slate-200 dark:border-slate-700 text-center">#</th>
                      {rawHeaders.map((h, i) => (
                        <th key={i} className="p-2 border-b border-r border-slate-200 dark:border-slate-700">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                    {rawRows.slice(0, 5).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors">
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800 text-center font-mono text-slate-400">
                          {rIdx + 1}
                        </td>
                        {rawHeaders.map((h, cIdx) => (
                          <td key={cIdx} className="p-2 border-r border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                            {row[h] || <span className="text-slate-300 dark:text-slate-600">-</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-2 text-xs text-rose-600 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Progress Bar & Confirm Import Button */}
            {isImporting && importProgress && (
              <div className="space-y-2 p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                <div className="flex items-center justify-between text-xs font-extrabold text-indigo-900 dark:text-indigo-200">
                  <span>Processing Batch: {importProgress.processed.toLocaleString()} / {importProgress.total.toLocaleString()} rows</span>
                  <span>{Math.round((importProgress.processed / importProgress.total) * 100)}%</span>
                </div>
                <div className="w-full h-2.5 bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 rounded-full"
                    style={{ width: `${Math.round((importProgress.processed / importProgress.total) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isImporting || parsedBooks.length === 0}
              className={`w-full py-3.5 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} font-extrabold text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01]`}
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Importing {parsedBooks.length.toLocaleString()} Rows with {rawHeaders.length} Exact Columns...</span>
                </>
              ) : (
                <>
                  <Database className="w-4.5 h-4.5" />
                  <span>Import All {parsedBooks.length.toLocaleString()} Rows (Exact Sheet View)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 3: SUCCESS FEEDBACK */}
        {step === 'success' && importSummary && (
          <div className="py-8 text-center space-y-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-3xl border border-emerald-200 dark:border-emerald-800/40 p-6">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            
            <div className="space-y-1">
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Import Processed Successfully!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Smart duplicate detection merged matching books and updated inventory copies in real time.
              </p>
            </div>

            {/* Stats Breakdown Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto pt-2">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 text-center">
                <div className="text-xs text-slate-400 font-medium">New Added</div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  +{importSummary.newCount}
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-800/50 text-center">
                <div className="text-xs text-slate-400 font-medium">Merged Copies</div>
                <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {importSummary.updatedCount}
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-xs text-slate-400 font-medium">Total Processed</div>
                <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {importSummary.total}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                handleReset();
                onClose();
              }}
              className={`px-8 py-2.5 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} font-bold text-xs shadow-md mt-2`}
            >
              Done & Return to Catalog
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

