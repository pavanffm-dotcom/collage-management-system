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
  autoDetectColumnMapping,
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
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImportBooks,
  collegeName
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

        const autoMap = autoDetectColumnMapping(headers);
        setRawHeaders(headers);
        setRawRows(rows);
        setColumnMapping(autoMap);

        // Pre-generate mapped books preview
        const initialBooks = convertRawRowsToBooks(rows, autoMap);
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

    try {
      const result: any = await onImportBooks(parsedBooks);
      const newCount = result?.newCount ?? parsedBooks.length;
      const updatedCount = result?.updatedCount ?? 0;
      
      setImportSummary({
        newCount,
        updatedCount,
        total: parsedBooks.length
      });
      setStep('success');
    } catch (err: any) {
      console.error('Bulk import failed:', err);
      setErrorMsg(err.message || 'Failed to save imported books. Please try again.');
    } finally {
      setIsImporting(false);
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
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                Universal SaaS Schema Adapter
              </span>
              {collegeName && (
                <span className="text-[10px] font-medium text-slate-400">
                  • {collegeName}
                </span>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Import Catalog from Any Excel / CSV File
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
                  Supports .csv or .tsv files with 10,000+ rows. AI will auto-match column headers!
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

        {/* STEP 2: INTERACTIVE COLUMN MAPPER & LIVE PREVIEW */}
        {step === 'map_columns' && (
          <div className="space-y-5 overflow-y-auto pr-1">
            
            {/* Header info bar */}
            <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-indigo-950 dark:text-indigo-200">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Detected {rawHeaders.length} columns & {rawRows.length} data rows</span>
              </div>
              {customAttributesCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-[10px]">
                  + {customAttributesCount} custom fields preserved as metadata
                </span>
              )}
            </div>

            {/* Column Mapping Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Verify or Change Column Mapping:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1 border rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                {TARGET_BOOK_FIELDS.map((field) => (
                  <div key={field.id} className="p-2.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </span>
                      {columnMapping[field.id] && (
                        <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Auto-Mapped
                        </span>
                      )}
                    </div>

                    <select
                      value={columnMapping[field.id] || ''}
                      onChange={(e) => handleMappingChange(field.id, e.target.value)}
                      className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                    >
                      <option value="">-- Skip / Default Value --</option>
                      {rawHeaders.map((header) => (
                        <option key={header} value={header}>
                          Column: "{header}"
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Sample Data Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  Live Import Preview ({parsedBooks.length} Books Ready)
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Upload Different File
                </button>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-2 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {parsedBooks.slice(0, 3).map((b, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                    <div className="truncate min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {b.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        By {b.author} • Dept: {b.department} • Acc: {b.accessionNumber}
                      </div>
                      {b.customAttributes && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono truncate">
                          Custom Extra: {Object.entries(b.customAttributes).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-1 rounded-lg inline-block">
                        {b.almari}-{b.row} ({b.copies} copies)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-2 text-xs text-rose-600 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Confirm & Import Button */}
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isImporting || parsedBooks.length === 0}
              className={`w-full py-3.5 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} font-extrabold text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all`}
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing & Deduplicating {parsedBooks.length} Books...</span>
                </>
              ) : (
                <>
                  <Database className="w-4.5 h-4.5" />
                  <span>Import All {parsedBooks.length} Books to Catalog</span>
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

