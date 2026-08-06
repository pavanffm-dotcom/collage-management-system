import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Save, 
  MapPin, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  Edit3, 
  Palette, 
  Check, 
  X, 
  ChevronRight, 
  SlidersHorizontal, 
  LogOut,
  RefreshCw,
  BarChart2,
  Users,
  QrCode,
  Barcode,
  BookOpen,
  PlusCircle,
  Layers,
  Globe,
  ExternalLink,
  Copy,
  Lock,
  ShieldAlert,
  Link2,
  Cpu,
  Search,
  FileSpreadsheet,
  Target,
  ArrowRight,
  Info,
  Box,
  LayoutGrid,
  FileText,
  Zap,
  Sun,
  Moon,
  Download,
  Smartphone
} from 'lucide-react';
import { College, Book } from '../types';
import { useTheme, THEME_PRESETS, ColorTheme } from '../context/ThemeContext';
import { FullscreenButton } from './FullscreenButton';

interface SettingsViewProps {
  currentCollege: College | null;
  onUpdateCollege: (updatedCollege: Partial<College>) => Promise<void>;
  onLogout?: () => void;
  onSelectTab?: (tab: 'add' | 'analytics' | 'qr' | 'settings' | 'circulation' | 'directory') => void;
  onOpenQRModal?: () => void;
  onOpenBarcodeModal?: () => void;
  onOpenPublicKiosk?: () => void;
  onOpenInstallModal?: () => void;
  books?: Book[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentCollege,
  onUpdateCollege,
  onLogout,
  onSelectTab,
  onOpenQRModal,
  onOpenBarcodeModal,
  onOpenPublicKiosk,
  onOpenInstallModal,
  books = []
}) => {
  const { theme, toggleTheme, colorTheme, setColorTheme, currentPreset } = useTheme();

  // Modal State for College Info Editor, Theme Selector & Control Panel Modals
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isControlPanelModalOpen, setIsControlPanelModalOpen] = useState(false);
  const [isSearchLinkerModalOpen, setIsSearchLinkerModalOpen] = useState(false);
  const [isAlmariConfiguratorModalOpen, setIsAlmariConfiguratorModalOpen] = useState(false);
  const [isRedirectLinksModalOpen, setIsRedirectLinksModalOpen] = useState(false);
  const [isPublicLinkModalOpen, setIsPublicLinkModalOpen] = useState(false);
  const [copiedPublicLink, setCopiedPublicLink] = useState(false);

  // 🔗 Redirect Links & Dynamic URLs State
  const [quickRedirectLinks, setQuickRedirectLinks] = useState<{
    pyqUrl: string;
    pyqTitle: string;
    dynamicUrl: string;
    dynamicTitle: string;
    dynamicEnabled: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('gec_quick_redirect_links');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      pyqUrl: 'https://drive.google.com/drive/folders/sample_pyq_papers',
      pyqTitle: 'Previous Year Question Papers',
      dynamicUrl: 'https://college.edu/notices/exam-timetable',
      dynamicTitle: 'Notice & Dynamic Event Link',
      dynamicEnabled: true
    };
  });
  const [redirectSaveSuccessMsg, setRedirectSaveSuccessMsg] = useState(false);

  // 🏛️ Almari (Shelf) Design Configurator Types & State
  const [almariConfigs, setAlmariConfigs] = useState<Array<{
    id: string;
    almariNum: number;
    name: string;
    designType: 'grand_double' | 'compact_corner' | 'archive_closed' | 'periodical_rack' | 'digital_tower';
    barcodePrefix: string;
    rowCount: number;
    capacity: number;
    zone: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('gec_almari_configs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'almari_1', almariNum: 1, name: 'Almari 1 - Computer Science Bay', designType: 'grand_double', barcodePrefix: 'CS-100', rowCount: 5, capacity: 200, zone: 'Main Entrance Aisle 1' },
      { id: 'almari_2', almariNum: 2, name: 'Almari 2 - Quick Reference Corner', designType: 'compact_corner', barcodePrefix: 'REF-200', rowCount: 3, capacity: 80, zone: 'Central Reading Area' },
      { id: 'almari_3', almariNum: 3, name: 'Almari 3 - Examination & Rare Vault', designType: 'archive_closed', barcodePrefix: 'ARCH-300', rowCount: 4, capacity: 120, zone: 'North Secure Archives' },
      { id: 'almari_4', almariNum: 4, name: 'Almari 4 - Journal & Magazine Lounge', designType: 'periodical_rack', barcodePrefix: 'MAG-400', rowCount: 4, capacity: 50, zone: 'Periodical Gallery' },
      { id: 'almari_5', almariNum: 5, name: 'Almari 5 - Tech CDs & Media Tower', designType: 'digital_tower', barcodePrefix: 'TECH-500', rowCount: 6, capacity: 90, zone: 'Digital Resource Kiosk' },
    ];
  });
  const [selectedAlmariId, setSelectedAlmariId] = useState<string>('almari_1');
  const [almariSaveSuccessMsg, setAlmariSaveSuccessMsg] = useState(false);

  // Form State
  const [name, setName] = useState(currentCollege?.name || '');
  const [code, setCode] = useState(currentCollege?.code || '');
  const [location, setLocation] = useState(currentCollege?.location || '');
  const [librarianName, setLibrarianName] = useState(currentCollege?.librarianName || '');
  const [email, setEmail] = useState(currentCollege?.email || '');

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Control Panel Search Connection State
  const [controlPanelTab, setControlPanelTab] = useState<'exact' | 'ai'>('exact');
  
  const [selectedNameColumns, setSelectedNameColumns] = useState<string[]>(() => {
    return currentCollege?.searchMappings?.nameColumns || ['Title'];
  });

  const [selectedAiColumns, setSelectedAiColumns] = useState<string[]>(() => {
    return currentCollege?.searchMappings?.aiColumns || ['Description', 'Keywords', 'Summary', 'Subject', 'Title'];
  });

  const [isSavingControlPanel, setIsSavingControlPanel] = useState(false);
  const [controlPanelSuccessMsg, setControlPanelSuccessMsg] = useState(false);

  // Sync state if currentCollege updates
  useEffect(() => {
    if (currentCollege?.searchMappings) {
      if (currentCollege.searchMappings.nameColumns?.length) {
        setSelectedNameColumns(currentCollege.searchMappings.nameColumns);
      }
      if (currentCollege.searchMappings.aiColumns?.length) {
        setSelectedAiColumns(currentCollege.searchMappings.aiColumns);
      }
    }
  }, [currentCollege]);

  // Extract all available spreadsheet columns/headers from books dataset
  const availableCatalogColumns = useMemo(() => {
    const colSet = new Set<string>();
    // Default standard fields
    colSet.add('Title');
    colSet.add('Author');
    colSet.add('Subject');
    colSet.add('Description');
    colSet.add('Keywords');
    colSet.add('Summary');
    colSet.add('ISBN');
    colSet.add('AccessionNumber');
    colSet.add('Publisher');
    colSet.add('Department');

    if (books && Array.isArray(books)) {
      books.forEach(b => {
        if (b.rawCsvData) {
          Object.keys(b.rawCsvData).forEach(k => {
            if (k.trim()) colSet.add(k.trim());
          });
        }
        if (b.customAttributes) {
          Object.keys(b.customAttributes).forEach(k => {
            if (k.trim()) colSet.add(k.trim());
          });
        }
      });
    }

    return Array.from(colSet);
  }, [books]);

  const toggleNameColumn = (colName: string) => {
    setSelectedNameColumns(prev => {
      if (prev.includes(colName)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(c => c !== colName);
      }
      return [...prev, colName];
    });
  };

  const toggleAiColumn = (colName: string) => {
    setSelectedAiColumns(prev => {
      if (prev.includes(colName)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(c => c !== colName);
      }
      return [...prev, colName];
    });
  };

  const handleSaveControlPanel = async () => {
    setIsSavingControlPanel(true);
    try {
      await onUpdateCollege({
        searchMappings: {
          nameColumns: selectedNameColumns.length > 0 ? selectedNameColumns : ['Title'],
          aiColumns: selectedAiColumns.length > 0 ? selectedAiColumns : ['Description', 'Keywords', 'Summary', 'Subject', 'Title']
        }
      });
      setControlPanelSuccessMsg(true);
      setTimeout(() => {
        setControlPanelSuccessMsg(false);
        setIsControlPanelModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to update search connections:', err);
    } finally {
      setIsSavingControlPanel(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateCollege({
        name,
        code,
        location,
        librarianName,
        email
      });
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setIsCollegeModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Error updating college settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* 🎛️ MINIMALIST CONTROL PANEL BUTTON CARD */}
      <div className={`${currentPreset.cardBg} rounded-2xl p-4 sm:p-5 border ${currentPreset.cardBorder} shadow-sm flex items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Control Panel
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Link uploaded sheet columns to search features
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsControlPanelModalOpen(true)}
          className={`px-4 py-2.5 ${currentPreset.buttonBg} rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-2 active:scale-98`}
        >
          <SlidersHorizontal className="w-4 h-4 shrink-0" />
          <span>Control Panel</span>
        </button>
      </div>

      {/* Library Modules Quick Access Panel (Crucial for Mobile & Tablet access) */}
      <div className={`${currentPreset.cardBg} ${currentPreset.cardRadius} p-6 border ${currentPreset.cardBorder} shadow-xl space-y-4`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className={`w-4 h-4 ${currentPreset.accentText}`} />
            <span>Library Operations & Module Shortcuts</span>
          </h3>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 ${currentPreset.badgeRadius} ${currentPreset.badgeBg}`}>
            Quick Navigation
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
          {/* Circulation Desk */}
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('circulation')}
            className={`p-3.5 ${currentPreset.cardRadius} ${currentPreset.innerCardBg} border ${currentPreset.cardBorder} hover:border-current transition-all flex flex-col items-center justify-center gap-2 text-center group active:scale-95`}
          >
            <div className={`w-9 h-9 ${currentPreset.buttonRadius} bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-xs font-bold text-slate-900 dark:text-white group-hover:${currentPreset.accentText} block transition-colors`}>Circulation</span>
              <span className="text-[10px] text-slate-400 block font-medium">Issue & Return</span>
            </div>
          </button>

          {/* Analytics */}
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('analytics')}
            className={`p-3.5 ${currentPreset.cardRadius} ${currentPreset.innerCardBg} border ${currentPreset.cardBorder} hover:border-current transition-all flex flex-col items-center justify-center gap-2 text-center group active:scale-95`}
          >
            <div className={`w-9 h-9 ${currentPreset.buttonRadius} bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-xs font-bold text-slate-900 dark:text-white group-hover:${currentPreset.accentText} block transition-colors`}>Analytics</span>
              <span className="text-[10px] text-slate-400 block font-medium">Reports & Stats</span>
            </div>
          </button>

          {/* Directory */}
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('directory')}
            className={`p-3.5 ${currentPreset.cardRadius} ${currentPreset.innerCardBg} border ${currentPreset.cardBorder} hover:border-current transition-all flex flex-col items-center justify-center gap-2 text-center group active:scale-95`}
          >
            <div className={`w-9 h-9 ${currentPreset.buttonRadius} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-xs font-bold text-slate-900 dark:text-white group-hover:${currentPreset.accentText} block transition-colors`}>Directory</span>
              <span className="text-[10px] text-slate-400 block font-medium">Staff & Faculty</span>
            </div>
          </button>

          {/* Entrance Gate QR */}
          <button
            type="button"
            onClick={() => {
              if (onSelectTab) onSelectTab('qr');
              if (onOpenQRModal) onOpenQRModal();
            }}
            className={`p-3.5 ${currentPreset.cardRadius} ${currentPreset.innerCardBg} border ${currentPreset.cardBorder} hover:border-current transition-all flex flex-col items-center justify-center gap-2 text-center group active:scale-95`}
          >
            <div className={`w-9 h-9 ${currentPreset.buttonRadius} bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-xs font-bold text-slate-900 dark:text-white group-hover:${currentPreset.accentText} block transition-colors`}>Entrance QR</span>
              <span className="text-[10px] text-slate-400 block font-medium">Gate Scanner</span>
            </div>
          </button>

          {/* Barcode & Shelf Mapper */}
          <button
            type="button"
            onClick={() => {
              if (onOpenBarcodeModal) onOpenBarcodeModal();
              else if (onOpenQRModal) onOpenQRModal();
            }}
            className={`p-3.5 ${currentPreset.cardRadius} ${currentPreset.innerCardBg} border ${currentPreset.cardBorder} hover:border-current transition-all flex flex-col items-center justify-center gap-2 text-center group active:scale-95`}
          >
            <div className={`w-9 h-9 ${currentPreset.buttonRadius} bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-xs font-bold text-slate-900 dark:text-white group-hover:${currentPreset.accentText} block transition-colors`}>Barcode & Shelf</span>
              <span className="text-[10px] text-slate-400 block font-medium">Camera Mapper</span>
            </div>
          </button>

          {/* Control Panel */}
          <button
            type="button"
            onClick={() => setIsControlPanelModalOpen(true)}
            className={`p-3.5 ${currentPreset.cardRadius} ${currentPreset.innerCardBg} border ${currentPreset.cardBorder} hover:border-current transition-all flex flex-col items-center justify-center gap-2 text-center group active:scale-95`}
          >
            <div className={`w-9 h-9 ${currentPreset.buttonRadius} bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-xs font-bold text-slate-900 dark:text-white group-hover:${currentPreset.accentText} block transition-colors`}>Control Panel</span>
              <span className="text-[10px] text-slate-400 block font-medium">Manage Columns</span>
            </div>
          </button>

          {/* Public Link (Kiosk Mode) Shortcut */}
          <button
            type="button"
            onClick={() => setIsPublicLinkModalOpen(true)}
            className={`p-3.5 ${currentPreset.cardRadius} ${currentPreset.innerCardBg} border ${currentPreset.cardBorder} hover:border-current transition-all flex flex-col items-center justify-center gap-2 text-center group active:scale-95`}
          >
            <div className={`w-9 h-9 ${currentPreset.buttonRadius} ${currentPreset.buttonBg} flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-xs font-extrabold text-slate-900 dark:text-white group-hover:${currentPreset.accentText} block transition-colors`}>Public Link</span>
              <span className="text-[10px] text-slate-400 block font-medium">Student Kiosk</span>
            </div>
          </button>
        </div>

      </div>

      {/* Main Settings Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Option 1: College Info Card */}
        <div className={`${currentPreset.cardBg} rounded-[28px] p-6 border ${currentPreset.cardBorder} shadow-xl flex flex-col justify-between space-y-5 transition-all duration-500`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-2xl ${currentPreset.buttonBg} flex items-center justify-center shadow-lg`}>
                <Building2 className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${currentPreset.badgeBg}`}>
                {currentCollege?.code || 'GEC-LIB'}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentCollege?.name || 'Institution Library Profile'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Librarian: {currentCollege?.librarianName || 'Not specified'} • {currentCollege?.location || 'Main Campus'}
              </p>
            </div>

            {/* Information Summary */}
            <div className={`p-3 ${currentPreset.innerCardBg} rounded-2xl border ${currentPreset.borderColor} space-y-1.5 text-xs text-slate-600 dark:text-slate-300`}>
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">{currentCollege?.location || 'Campus Address'}</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">{currentCollege?.email || 'librarian@college.ac.in'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCollegeModalOpen(true)}
            className={`w-full py-3 px-4 ${currentPreset.buttonBg} font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Add / Edit College Information</span>
          </button>
        </div>

        {/* Option 2: Themes & Palette Overview Card */}
        <div className={`${currentPreset.cardBg} rounded-[28px] p-6 border ${currentPreset.cardBorder} shadow-xl flex flex-col justify-between space-y-5 transition-all duration-500`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-2xl ${currentPreset.buttonBg} flex items-center justify-center shadow-lg`}>
                <Palette className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${currentPreset.badgeBg}`}>
                Active: {currentPreset.emoji} {currentPreset.name}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Application Themes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select from 5 professionally designed glassmorphic color palettes.
              </p>
            </div>

            {/* Quick Palette Preview Dots */}
            <div className={`flex items-center justify-center gap-2 p-3 ${currentPreset.innerCardBg} rounded-2xl border ${currentPreset.borderColor}`}>
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setColorTheme(preset.id)}
                  title={preset.name}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    colorTheme === preset.id
                      ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${preset.previewColors[0]}, ${preset.previewColors[1]})`
                  }}
                >
                  <span className="text-xs">{preset.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsThemeModalOpen(true)}
            className={`w-full py-3 px-4 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]`}
          >
            <Palette className="w-4 h-4" />
            <span>Choose Theme Preset</span>
          </button>
        </div>

        {/* Option 3: Light/Dark Display Mode & PWA Installation */}
        <div className={`${currentPreset.cardBg} rounded-[28px] p-6 border ${currentPreset.cardBorder} shadow-xl flex flex-col justify-between space-y-5 transition-all duration-500`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-2xl ${currentPreset.buttonBg} flex items-center justify-center shadow-lg`}>
                {theme === 'dark' ? <Moon className="w-6 h-6 text-amber-300" /> : <Sun className="w-6 h-6 text-amber-500" />}
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${currentPreset.badgeBg}`}>
                {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Display & App Installation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Toggle light/dark appearance and install as standalone mobile or desktop app.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className={`p-3.5 ${currentPreset.innerCardBg} ${currentPreset.buttonRadius} border ${currentPreset.borderColor} flex items-center justify-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200 hover:scale-[1.02] transition-all shadow-xs`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                <span>{theme === 'dark' ? 'Switch Light' : 'Switch Dark'}</span>
              </button>

              <FullscreenButton variant="button" className="w-full justify-center p-3.5" />

              {onOpenInstallModal ? (
                <button
                  type="button"
                  onClick={onOpenInstallModal}
                  className={`p-3.5 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} text-white flex items-center justify-center gap-2 text-xs font-extrabold shadow-md hover:scale-[1.02] active:scale-95 transition-all`}
                >
                  <Download className="w-4 h-4 animate-bounce" />
                  <span>Install App</span>
                </button>
              ) : (
                <div className={`p-3.5 ${currentPreset.innerCardBg} ${currentPreset.buttonRadius} border ${currentPreset.borderColor} flex items-center justify-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400`}>
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  <span>App Ready</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Option 3: Account & Session (Sign Out / Change Department) */}
      {onLogout && (
        <div className={`${currentPreset.cardBg} rounded-[28px] p-6 border border-rose-200/50 dark:border-rose-900/30 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-500`}>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse" />
              <span className="text-rose-600 dark:text-rose-400">Exit Portal & Switch Department</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xl">
              You are currently logged into the <span className="font-bold text-indigo-600 dark:text-indigo-400">Library Portal</span>. 
              Sign out here to return to the Main Portal where you can select other departments, switch user profiles, or test different administrative views.
            </p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="py-3 px-6 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out & Switch Portal</span>
          </button>
        </div>
      )}

      {/* Modal: Select Theme Preset Popover */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className={`${currentPreset.modalBg} ${currentPreset.cardRadius} max-w-3xl w-full border ${currentPreset.cardBorder} shadow-2xl p-5 sm:p-7 relative space-y-5 my-auto max-h-[88vh] flex flex-col`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${currentPreset.buttonRadius} ${currentPreset.buttonBg} flex items-center justify-center text-white shrink-0 shadow-md`}>
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Select Application Theme
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click any theme to instantly apply across the portal
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of 6 Theme Cards inside modal with proper internal padding so edges/shadows don't clip */}
            <div className="overflow-y-auto p-2 sm:p-3 -mx-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {THEME_PRESETS.map((preset) => {
                  const isSelected = colorTheme === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setColorTheme(preset.id)}
                      className={`p-4 ${preset.cardRadius} border-2 cursor-pointer transition-all duration-200 relative flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? `border-indigo-500 dark:border-indigo-400 ${preset.cardBg} ring-2 ring-indigo-500/30 shadow-lg`
                          : `border-slate-200 dark:border-slate-800/90 ${preset.innerCardBg} hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md`
                      }`}
                    >
                      {/* Selected Indicator Badge */}
                      {isSelected && (
                        <div className={`absolute top-3 right-3 w-5 h-5 ${preset.badgeRadius} ${preset.buttonBg} flex items-center justify-center shadow-md z-10`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}

                      <div className="flex items-start gap-3 pr-6">
                        <div
                          className={`w-10 h-10 ${preset.buttonRadius} flex items-center justify-center text-lg shadow-sm shrink-0 border border-white/20`}
                          style={{
                            background: `linear-gradient(135deg, ${preset.previewColors[0]}, ${preset.previewColors[1]})`
                          }}
                        >
                          <span>{preset.emoji}</span>
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {preset.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-2">
                            {preset.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Color Palette Swatches & Status Pill */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 mt-auto">
                        <div className="flex items-center gap-1.5">
                          {preset.previewColors.map((color, i) => (
                            <span
                              key={i}
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shadow-xs inline-block"
                              style={{ backgroundColor: color }}
                              title={`Color ${i + 1}: ${color}`}
                            />
                          ))}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 ${preset.badgeRadius} ${preset.badgeBg}`}>
                          {isSelected ? 'Active' : 'Apply'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer Action */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Current Active: <strong className="text-slate-900 dark:text-white capitalize">{currentPreset.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className={`px-5 py-2 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} font-bold text-xs shadow-md transition-all hover:opacity-90`}
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Add / Edit College Profile Info */}
      {isCollegeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className={`${currentPreset.modalBg} rounded-[32px] max-w-lg w-full border ${currentPreset.cardBorder} shadow-2xl overflow-hidden p-6 sm:p-8 relative space-y-5`}>
            
            <button
              type="button"
              onClick={() => setIsCollegeModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl ${currentPreset.badgeBg} flex items-center justify-center shrink-0`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  College Information Setup
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update library name, code, librarian details, and location.
                </p>
              </div>
            </div>

            {successMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>College profile saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  College / Institution Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Goa Engineering College"
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm ${currentPreset.inputBg} rounded-2xl focus:outline-none`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Library Short Code
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="GEC-LIB"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm ${currentPreset.inputBg} rounded-2xl focus:outline-none font-mono`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Location / Campus
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Farmagudi, Ponda, Goa"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm ${currentPreset.inputBg} rounded-2xl focus:outline-none`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Librarian Name
                  </label>
                  <input
                    type="text"
                    required
                    value={librarianName}
                    onChange={e => setLibrarianName(e.target.value)}
                    placeholder="Dr. Ramesh Naik"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm ${currentPreset.inputBg} rounded-2xl focus:outline-none`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="librarian@college.ac.in"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm ${currentPreset.inputBg} rounded-2xl focus:outline-none`}
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCollegeModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`py-2.5 px-5 ${currentPreset.buttonBg} font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center gap-2 transition-all`}
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save College Profile'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 🎛️ CONTROL PANEL HUB MODAL */}
      {isControlPanelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className={`${currentPreset.modalBg} rounded-[24px] max-w-md w-full border ${currentPreset.cardBorder} shadow-2xl p-5 sm:p-6 relative space-y-4 my-auto flex flex-col`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl ${currentPreset.buttonBg} flex items-center justify-center shadow-xs shrink-0`}>
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Control Panel
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Manage library features and catalog mappings
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsControlPanelModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Control Panel Feature Buttons List */}
            <div className="space-y-2 py-1">
              <button
                type="button"
                onClick={() => {
                  setIsControlPanelModalOpen(false);
                  setIsSearchLinkerModalOpen(true);
                }}
                className={`w-full p-3.5 rounded-xl border ${currentPreset.cardBorder} hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/80 dark:bg-slate-900/80 transition-all flex items-center justify-between gap-3 text-left group`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${currentPreset.buttonBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Search & Catalog Column Linker
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      Connect sheet columns to search triggers
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsControlPanelModalOpen(false);
                  setIsAlmariConfiguratorModalOpen(true);
                }}
                className={`w-full p-3.5 rounded-xl border ${currentPreset.cardBorder} hover:border-amber-400 dark:hover:border-amber-500 bg-slate-50/80 dark:bg-slate-900/80 transition-all flex items-center justify-between gap-3 text-left group`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${currentPreset.buttonBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Almirah & Shelf Design Configurator
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      5 visual Almirah designs, barcode mappings & shelf capacities
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsControlPanelModalOpen(false);
                  setIsRedirectLinksModalOpen(true);
                }}
                className={`w-full p-3.5 rounded-xl border ${currentPreset.cardBorder} hover:border-emerald-400 dark:hover:border-emerald-500 bg-slate-50/80 dark:bg-slate-900/80 transition-all flex items-center justify-between gap-3 text-left group`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${currentPreset.buttonBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Redirect Links & Dynamic URLs
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      Configure PYQ papers link & temporary dynamic event link for Find Page
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsControlPanelModalOpen(false);
                  if (onOpenQRModal) onOpenQRModal();
                }}
                className={`w-full p-3.5 rounded-xl border ${currentPreset.cardBorder} hover:border-purple-400 dark:hover:border-purple-500 bg-slate-50/80 dark:bg-slate-900/80 transition-all flex items-center justify-between gap-3 text-left group`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${currentPreset.buttonBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Entrance Gate Pass QR & Public Link
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      Open Cute Entrance QR Code linked directly to Public Kiosk catalog view
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsControlPanelModalOpen(false)}
                className={`py-2 px-5 ${currentPreset.buttonBg} rounded-xl font-bold text-xs shadow-xs transition-all`}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🎛️ SEARCH LINKER SUB-MODAL */}
      {isSearchLinkerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className={`${currentPreset.modalBg} rounded-[24px] max-w-lg w-full border ${currentPreset.cardBorder} shadow-2xl p-5 sm:p-6 relative space-y-4 my-auto flex flex-col`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchLinkerModalOpen(false);
                    setIsControlPanelModalOpen(true);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Back to Control Panel"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Search Column Linker
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsSearchLinkerModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Two Search Purpose Buttons */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shrink-0">
              <button
                type="button"
                onClick={() => setControlPanelTab('exact')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  controlPanelTab === 'exact'
                    ? `${currentPreset.buttonBg} shadow-sm`
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Search className="w-4 h-4 shrink-0" />
                <span className="truncate">Search by Book Name</span>
              </button>

              <button
                type="button"
                onClick={() => setControlPanelTab('ai')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  controlPanelTab === 'ai'
                    ? `${currentPreset.buttonBg} shadow-sm`
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span className="truncate">Search with AI</span>
              </button>
            </div>

            {/* Fields Selection Area */}
            <div className="space-y-3 py-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
                <span>Select Catalog Columns ({availableCatalogColumns.length} Detected):</span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                {availableCatalogColumns.map((col) => {
                  const isSelected = controlPanelTab === 'exact'
                    ? selectedNameColumns.some(c => c.toLowerCase() === col.toLowerCase())
                    : selectedAiColumns.some(c => c.toLowerCase() === col.toLowerCase());

                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => {
                        if (controlPanelTab === 'exact') {
                          toggleNameColumn(col);
                        } else {
                          toggleAiColumn(col);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                        isSelected
                          ? `${currentPreset.buttonBg} border-transparent shadow-xs scale-101`
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {isSelected ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <Link2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                      <span>{col}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer with Single Update Button */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
              <div className="text-[11px]">
                {controlPanelSuccessMsg ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Updated Successfully!
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">Auto-synced</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveControlPanel}
                disabled={isSavingControlPanel}
                className={`py-2.5 px-6 ${currentPreset.buttonBg} rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50`}
              >
                <span>{isSavingControlPanel ? 'Updating...' : 'Update'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🏛️ ALMARI & SHELF DESIGN CONFIGURATOR MODAL */}
      {isAlmariConfiguratorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className={`${currentPreset.modalBg} rounded-[28px] max-w-4xl w-full border ${currentPreset.cardBorder} shadow-2xl p-5 sm:p-7 relative space-y-5 my-auto flex flex-col max-h-[92vh] overflow-y-auto`}>
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/60 dark:border-slate-800/80 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAlmariConfiguratorModalOpen(false);
                    setIsControlPanelModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Back to Control Panel"
                >
                  <ArrowRight className="w-4.5 h-4.5 rotate-180" />
                </button>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-500" />
                    <span>Almirah & Shelf Visual Design Configurator</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Configure Almirah categories, 3D visual designs, barcode prefixes & shelf row capacities
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAlmariConfiguratorModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Bar: Select Almirah Unit */}
            <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/60 dark:border-slate-800 shrink-0">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-indigo-500" /> Select Almirah Unit:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {almariConfigs.map((a) => {
                  const isActive = a.id === selectedAlmariId;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedAlmariId(a.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isActive
                          ? `${currentPreset.buttonBg} border-transparent shadow-xs scale-102`
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                      }`}
                    >
                      {a.name.split(' - ')[0] || `Almari ${a.almariNum}`}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    const nextNum = almariConfigs.length + 1;
                    const newId = `almari_${Date.now()}`;
                    const newItem = {
                      id: newId,
                      almariNum: nextNum,
                      name: `Almari ${nextNum} - General Bay`,
                      designType: 'grand_double' as const,
                      barcodePrefix: `ALM-${nextNum}00`,
                      rowCount: 5,
                      capacity: 150,
                      zone: 'Central Aisle'
                    };
                    setAlmariConfigs(prev => [...prev, newItem]);
                    setSelectedAlmariId(newId);
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Almirah</span>
                </button>
              </div>
            </div>

            {/* Main Content Split: Form Options + 3D Interactive Almirah Preview */}
            {(() => {
              const activeAlmari = almariConfigs.find(a => a.id === selectedAlmariId) || almariConfigs[0];

              if (!activeAlmari) return null;

              const updateActive = (fields: Partial<typeof activeAlmari>) => {
                setAlmariConfigs(prev => prev.map(item => item.id === activeAlmari.id ? { ...item, ...fields } : item));
              };

              const ALMARI_PRESETS = [
                {
                  type: 'grand_double' as const,
                  title: 'Grand Double Almirah (Tall 5-Tier)',
                  tag: '5 Tiers • Tall Mahogany',
                  badge: 'High Capacity',
                  desc: 'Grand double-bay mahogany bookcase with 5 wide rows for major core textbook collections.',
                  icon: Layers,
                  color: 'from-amber-600 to-yellow-700',
                  rows: 5,
                  defaultCapacity: 200,
                },
                {
                  type: 'compact_corner' as const,
                  title: 'Compact Reading Shelf (Short 3-Tier)',
                  badge: 'Quick Access',
                  tag: '3 Tiers • Low Shelf',
                  desc: '3-tier open rack placed near reading tables for rapid reference books & dictionary catalog.',
                  icon: BookOpen,
                  color: 'from-emerald-600 to-teal-700',
                  rows: 3,
                  defaultCapacity: 80,
                },
                {
                  type: 'archive_closed' as const,
                  title: 'Archive Closed Cabinet (Wide 4-Tier)',
                  badge: 'Vault Secure',
                  tag: '4 Tiers + Lockers',
                  desc: 'Glass-panel 4-tier cabinet with lower locking lockers for rare manuscripts & thesis papers.',
                  icon: Lock,
                  color: 'from-indigo-600 to-blue-700',
                  rows: 4,
                  defaultCapacity: 120,
                },
                {
                  type: 'periodical_rack' as const,
                  title: 'Periodical Magazine Display (Slanted 4-Tier)',
                  badge: 'Journals',
                  tag: '4 Slanted Displays',
                  desc: 'Angled display shelves for current journals, research papers & monthly magazine publications.',
                  icon: FileSpreadsheet,
                  color: 'from-rose-600 to-pink-700',
                  rows: 4,
                  defaultCapacity: 50,
                },
                {
                  type: 'digital_tower' as const,
                  title: 'Digital Tower Rack (Slim Vertical 6-Tier)',
                  badge: 'Compact Tower',
                  tag: '6 Slim Micro Tiers',
                  desc: 'Compact vertical tower rack for digital CDs, barcode manuals, and micro-volume publications.',
                  icon: Cpu,
                  color: 'from-purple-600 to-violet-700',
                  rows: 6,
                  defaultCapacity: 90,
                },
              ];

              const currentPresetObj = ALMARI_PRESETS.find(p => p.type === activeAlmari.designType) || ALMARI_PRESETS[0];

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* Left Column: Preset Selection & Configuration Inputs (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    
                    {/* Design Category Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                        <LayoutGrid className="w-4 h-4 text-amber-500" /> Choose Almirah 3D Design & Size Category:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ALMARI_PRESETS.map((p) => {
                          const isSelected = activeAlmari.designType === p.type;
                          const IconComp = p.icon;
                          return (
                            <button
                              key={p.type}
                              type="button"
                              onClick={() => {
                                updateActive({
                                  designType: p.type,
                                  rowCount: p.rows,
                                  capacity: p.defaultCapacity
                                });
                              }}
                              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-1.5 ${
                                isSelected
                                  ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-500/10 dark:bg-amber-950/30 shadow-md'
                                  : 'border-slate-200/80 dark:border-slate-800 hover:border-amber-400 bg-white dark:bg-slate-900/60'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${p.color} text-white flex items-center justify-center shadow-xs shrink-0`}>
                                    <IconComp className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {p.title.split(' (')[0]}
                                  </span>
                                </div>
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                                  {p.badge}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                {p.desc}
                              </p>
                              <div className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 pt-0.5 border-t border-slate-100 dark:border-slate-800">
                                {p.tag}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Metadata Inputs */}
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Almirah Name / Label
                        </label>
                        <input
                          type="text"
                          value={activeAlmari.name}
                          onChange={(e) => updateActive({ name: e.target.value })}
                          placeholder="e.g. Almari 1 - Computer Science Bay"
                          className={`w-full px-3.5 py-2 text-xs ${currentPreset.inputBg} rounded-xl focus:outline-none`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                            <Barcode className="w-3.5 h-3.5 text-indigo-500" /> Barcode / Accession Range
                          </label>
                          <input
                            type="text"
                            value={activeAlmari.barcodePrefix}
                            onChange={(e) => updateActive({ barcodePrefix: e.target.value })}
                            placeholder="e.g. CS-100 to CS-500"
                            className={`w-full px-3.5 py-2 text-xs ${currentPreset.inputBg} rounded-xl focus:outline-none font-mono`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" /> Location Zone / Aisle
                          </label>
                          <input
                            type="text"
                            value={activeAlmari.zone}
                            onChange={(e) => updateActive({ zone: e.target.value })}
                            placeholder="e.g. Entrance Aisle 1"
                            className={`w-full px-3.5 py-2 text-xs ${currentPreset.inputBg} rounded-xl focus:outline-none`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Shelf Row Tiers Count
                          </label>
                          <input
                            type="number"
                            min="2"
                            max="8"
                            value={activeAlmari.rowCount}
                            onChange={(e) => updateActive({ rowCount: parseInt(e.target.value) || 3 })}
                            className={`w-full px-3.5 py-2 text-xs ${currentPreset.inputBg} rounded-xl focus:outline-none font-bold`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Max Book Capacity
                          </label>
                          <input
                            type="number"
                            min="10"
                            max="500"
                            value={activeAlmari.capacity}
                            onChange={(e) => updateActive({ capacity: parseInt(e.target.value) || 100 })}
                            className={`w-full px-3.5 py-2 text-xs ${currentPreset.inputBg} rounded-xl focus:outline-none font-bold`}
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Live Interactive 3D Almirah Model Visualizer (5 cols) */}
                  <div className={`lg:col-span-5 flex flex-col justify-between p-4 ${currentPreset.heroCardBg} rounded-3xl border ${currentPreset.cardBorder} shadow-2xl relative overflow-hidden min-h-[340px]`}>
                    
                    {/* Ambient Glow */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                    {/* Almirah Top Title Badge */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/40 dark:border-slate-800/80 relative z-10">
                      <div>
                        <span className={`text-[10px] font-extrabold uppercase tracking-widest ${currentPreset.accentText} block`}>
                          3D Visual Almirah Model
                        </span>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px]">
                          {activeAlmari.name}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {activeAlmari.barcodePrefix}
                      </span>
                    </div>

                    {/* 3D Rendered Almirah Frame */}
                    <div className={`my-3 p-3 ${currentPreset.innerCardBg} rounded-2xl border ${currentPreset.cardBorder} shadow-inner space-y-2 relative z-10`}>
                      
                      {/* Almirah Header Crown */}
                      <div className={`text-center py-1.5 bg-gradient-to-r ${currentPreset.bannerBg} rounded-xl text-[10px] font-black tracking-widest text-white uppercase shadow-md`}>
                        {currentPresetObj.title.split(' (')[0]}
                      </div>

                      {/* Render Dynamic Rows based on rowCount */}
                      <div className="space-y-1.5 py-1">
                        {Array.from({ length: Math.min(activeAlmari.rowCount, 6) }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-xl border ${currentPreset.cardBorder} bg-black/10 dark:bg-black/30 flex items-center justify-between gap-2 shadow-xs`}
                          >
                            <span className="text-[9px] font-bold font-mono text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded bg-white/50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                              Row #{idx + 1}
                            </span>
                            
                            {/* Visual Simulated Books Tiers */}
                            <div className="flex items-center gap-1 flex-1 overflow-hidden px-1">
                              {Array.from({ length: 7 }).map((_, bIdx) => {
                                const colors = ['bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-purple-500', 'bg-cyan-500'];
                                return (
                                  <div
                                    key={bIdx}
                                    className={`h-5 w-2.5 rounded-xs ${colors[(idx + bIdx) % colors.length]} shadow-xs border-r border-black/30 transform hover:-translate-y-0.5 transition-transform`}
                                    title={`Book position #${bIdx + 1}`}
                                  />
                                );
                              })}
                            </div>

                            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">
                              {Math.round(activeAlmari.capacity / activeAlmari.rowCount)} books
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Almirah Base Base/Plank */}
                      <div className={`h-2 bg-gradient-to-r ${currentPreset.bannerBg} rounded-b-lg opacity-80`} />
                    </div>

                    {/* Location & Capacity Info Footer */}
                    <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 relative z-10">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" /> {activeAlmari.zone}
                      </span>
                      <span className={`font-bold ${currentPreset.accentText}`}>
                        Total Capacity: {activeAlmari.capacity} Books
                      </span>
                    </div>

                  </div>

                </div>
              );
            })()}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
              <div className="text-[11px]">
                {almariSaveSuccessMsg ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Almirah Configurations Saved!
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">Changes stored locally</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAlmariConfiguratorModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem('gec_almari_configs', JSON.stringify(almariConfigs));
                      setAlmariSaveSuccessMsg(true);
                      setTimeout(() => setAlmariSaveSuccessMsg(false), 2500);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className={`py-2.5 px-6 ${currentPreset.buttonBg} rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5`}
                >
                  <Save className="w-4 h-4" />
                  <span>Save Almirah Settings</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🔗 REDIRECT LINKS & DYNAMIC URLS CONFIGURATOR MODAL */}
      {isRedirectLinksModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className={`${currentPreset.modalBg} rounded-[28px] max-w-2xl w-full border ${currentPreset.cardBorder} shadow-2xl p-5 sm:p-7 relative space-y-5 my-auto flex flex-col`}>
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/60 dark:border-slate-800/80 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsRedirectLinksModalOpen(false);
                    setIsControlPanelModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Back to Control Panel"
                >
                  <ArrowRight className="w-4.5 h-4.5 rotate-180" />
                </button>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-emerald-500" />
                    <span>Redirect Links & Dynamic URLs Manager</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Connect Previous Year Question Papers (PYQ) & temporary event link for Student Find Page
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRedirectLinksModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 2 Main Sections */}
            <div className="space-y-5 py-1">
              
              {/* Option 1: Previous Year Question Papers (PYQ) Link */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        1. Previous Year Question Papers (PYQ) Link
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Connect drive or cloud paper repository URL for instant student access
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    Always Connected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Button Title on Find Page
                    </label>
                    <input
                      type="text"
                      value={quickRedirectLinks.pyqTitle}
                      onChange={(e) => setQuickRedirectLinks(prev => ({ ...prev, pyqTitle: e.target.value }))}
                      placeholder="e.g. Previous Year Question Papers"
                      className={`w-full px-3 py-2 text-xs ${currentPreset.inputBg} rounded-xl focus:outline-none`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Redirect URL (Drive / Paper Bank)
                    </label>
                    <input
                      type="text"
                      value={quickRedirectLinks.pyqUrl}
                      onChange={(e) => setQuickRedirectLinks(prev => ({ ...prev, pyqUrl: e.target.value }))}
                      placeholder="https://drive.google.com/..."
                      className={`w-full px-3 py-2 text-xs ${currentPreset.inputBg} rounded-xl focus:outline-none font-mono`}
                    />
                  </div>
                </div>
              </div>

              {/* Option 2: Temporary Dynamic Link (Event / Notice) */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        2. Temporary Dynamic Link (Notice / Event)
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Updates dynamically right below the PYQ button on Find Page & QR Scans
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Enable</span>
                    <input
                      type="checkbox"
                      checked={quickRedirectLinks.dynamicEnabled}
                      onChange={(e) => setQuickRedirectLinks(prev => ({ ...prev, dynamicEnabled: e.target.checked }))}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Dynamic Button Title
                    </label>
                    <input
                      type="text"
                      value={quickRedirectLinks.dynamicTitle}
                      onChange={(e) => setQuickRedirectLinks(prev => ({ ...prev, dynamicTitle: e.target.value }))}
                      placeholder="e.g. Exam Time Table & Tech Fest 2026"
                      className={`w-full px-3 py-2 text-xs ${currentPreset.inputBg} rounded-xl focus:outline-none`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Dynamic Target URL
                    </label>
                    <input
                      type="text"
                      value={quickRedirectLinks.dynamicUrl}
                      onChange={(e) => setQuickRedirectLinks(prev => ({ ...prev, dynamicUrl: e.target.value }))}
                      placeholder="https://college.edu/notices"
                      className={`w-full px-3 py-2 text-xs ${currentPreset.inputBg} rounded-xl focus:outline-none font-mono`}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
              <div className="text-[11px]">
                {redirectSaveSuccessMsg ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Redirect Links Updated & Live!
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">Live sync with Student Find Page</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRedirectLinksModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem('gec_quick_redirect_links', JSON.stringify(quickRedirectLinks));
                      window.dispatchEvent(new Event('gec_quick_links_updated'));
                      setRedirectSaveSuccessMsg(true);
                      setTimeout(() => setRedirectSaveSuccessMsg(false), 2500);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className={`py-2.5 px-6 ${currentPreset.buttonBg} rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5`}
                >
                  <Save className="w-4 h-4" />
                  <span>Save Link Settings</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {isPublicLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className={`${currentPreset.modalBg} rounded-[24px] max-w-sm w-full border ${currentPreset.cardBorder} shadow-2xl p-5 sm:p-6 relative space-y-4 my-auto flex flex-col`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl ${currentPreset.buttonBg} flex items-center justify-center shadow-xs shrink-0`}>
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Public Link Options
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsPublicLinkModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Options */}
            <div className="space-y-2 py-1">
              <button
                type="button"
                onClick={() => {
                  if (onOpenPublicKiosk) onOpenPublicKiosk();
                  setIsPublicLinkModalOpen(false);
                }}
                className={`w-full p-3.5 rounded-xl border ${currentPreset.cardBorder} hover:border-emerald-400 dark:hover:border-emerald-600 bg-slate-50/80 dark:bg-slate-900/80 transition-all flex items-center justify-between gap-3 text-left group`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${currentPreset.buttonBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Open Link
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const publicUrl = `${window.location.origin}${window.location.pathname}?collegeId=${currentCollege?.id || 'col-gec-goa'}&public=true`;
                  navigator.clipboard.writeText(publicUrl);
                  setCopiedPublicLink(true);
                  setTimeout(() => setCopiedPublicLink(false), 2500);
                  setIsPublicLinkModalOpen(false);
                }}
                className={`w-full p-3.5 rounded-xl border ${currentPreset.cardBorder} hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/80 dark:bg-slate-900/80 transition-all flex items-center justify-between gap-3 text-left group`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${currentPreset.buttonBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                    <Copy className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {copiedPublicLink ? 'Link Copied!' : 'Copy Link'}
                  </span>
                </div>
              </button>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsPublicLinkModalOpen(false)}
                className={`py-2 px-5 ${currentPreset.buttonBg} rounded-xl font-bold text-xs shadow-xs transition-all`}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
