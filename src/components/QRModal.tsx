import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  BookOpen,
  Download,
  ExternalLink,
  GraduationCap,
  Scan,
  Zap,
  Palette,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { College } from '../types';
import { useTheme } from '../context/ThemeContext';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateScan?: () => void;
  currentCollege?: College | null;
}

export const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
  onSimulateScan,
  currentCollege
}) => {
  const { currentPreset, colorTheme } = useTheme();
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<'theme' | 'cyber' | 'classic' | 'neon'>('theme');
  const [centerIcon, setCenterIcon] = useState<'book' | 'cap' | 'sparkle' | 'college'>('book');
  const [isDownloading, setIsDownloading] = useState(false);
  const qrRef = useRef<SVGSVGElement | null>(null);

  if (!isOpen) return null;

  const collegeId = currentCollege?.id || 'col-gec-goa';
  const collegeName = currentCollege?.name || 'Goa Engineering College';
  const collegeCode = currentCollege?.code || 'GEC-LIB';
  const publicPageUrl = `${window.location.origin}?collegeId=${collegeId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicPageUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Determine QR Code Foreground Color based on selectedStyle & theme
  const getQRColors = () => {
    if (selectedStyle === 'cyber') {
      return { fg: '#06b6d4', bg: 'transparent', eyeColor: '#0891b2' };
    }
    if (selectedStyle === 'neon') {
      return { fg: '#10b981', bg: 'transparent', eyeColor: '#059669' };
    }
    if (selectedStyle === 'classic') {
      return { fg: '#0f172a', bg: '#ffffff', eyeColor: '#020617' };
    }
    // 'theme' default
    if (colorTheme === 'superblack') {
      return { fg: '#ffffff', bg: 'transparent', eyeColor: '#ffffff' };
    }
    if (colorTheme === 'lavender') {
      return { fg: '#7e22ce', bg: 'transparent', eyeColor: '#6b21a8' };
    }
    if (colorTheme === 'peach') {
      return { fg: '#ea580c', bg: 'transparent', eyeColor: '#c2410c' };
    }
    if (colorTheme === 'mint') {
      return { fg: '#059669', bg: 'transparent', eyeColor: '#047857' };
    }
    if (colorTheme === 'rose') {
      return { fg: '#e11d48', bg: 'transparent', eyeColor: '#be123c' };
    }
    return { fg: '#2563eb', bg: 'transparent', eyeColor: '#1d4ed8' };
  };

  const qrColors = getQRColors();

  // Handle PNG Download for printing
  const handleDownloadPNG = () => {
    setIsDownloading(true);
    try {
      const svgElement = document.getElementById('library-qr-svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = 800;
      canvas.height = 800;

      img.onload = () => {
        if (ctx) {
          // Clean white background for printing
          ctx.fillStyle = colorTheme === 'superblack' ? '#000000' : '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Header Text on PNG
          ctx.fillStyle = colorTheme === 'superblack' ? '#ffffff' : '#0f172a';
          ctx.font = 'bold 32px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(collegeName, 400, 70);

          ctx.fillStyle = colorTheme === 'superblack' ? '#a1a1aa' : '#64748b';
          ctx.font = '20px sans-serif';
          ctx.fillText('Digital Library Entrance QR Code', 400, 105);

          // Draw QR Image
          ctx.drawImage(img, 150, 140, 500, 500);

          // Footer info on PNG
          ctx.fillStyle = colorTheme === 'superblack' ? '#e4e4e7' : '#334155';
          ctx.font = 'bold 22px monospace';
          ctx.fillText(`SCAN TO SEARCH BOOKS • ${collegeCode}`, 400, 690);

          ctx.fillStyle = colorTheme === 'superblack' ? '#71717a' : '#94a3b8';
          ctx.font = '16px sans-serif';
          ctx.fillText(publicPageUrl, 400, 725);

          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `${collegeCode.toLowerCase()}-library-entrance-qr.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
        setIsDownloading(false);
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error('Download error:', err);
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className={`${currentPreset.modalBg} ${currentPreset.cardRadius} max-w-md w-full border ${currentPreset.cardBorder} shadow-2xl overflow-hidden p-6 text-center relative space-y-5 transition-all duration-500 my-auto`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cute Header Badge */}
        <div className="space-y-1">
          <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 ${currentPreset.badgeRadius} ${currentPreset.badgeBg} text-xs font-bold tracking-wide shadow-xs`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Modern Entrance QR Portal</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate pt-1">
            {collegeName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scan with any mobile camera to open book search catalog
          </p>
        </div>

        {/* Customization Controls: Style & Center Emblem */}
        <div className={`p-2.5 ${currentPreset.innerCardBg} ${currentPreset.inputRadius} border ${currentPreset.borderColor} space-y-2 text-xs`}>
          <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Palette className="w-3 h-3 text-indigo-500" />
              <span>QR Style:</span>
            </span>
            <span className="flex items-center gap-1">
              <QrCode className="w-3 h-3 text-emerald-500" />
              <span>Center Badge:</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Color preset selector */}
            <div className="flex items-center gap-1 bg-white/50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => setSelectedStyle('theme')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  selectedStyle === 'theme' ? `${currentPreset.buttonBg} text-white` : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Theme
              </button>
              <button
                onClick={() => setSelectedStyle('cyber')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  selectedStyle === 'cyber' ? 'bg-cyan-500 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Cyber
              </button>
              <button
                onClick={() => setSelectedStyle('neon')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  selectedStyle === 'neon' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Neon
              </button>
              <button
                onClick={() => setSelectedStyle('classic')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  selectedStyle === 'classic' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                B&W
              </button>
            </div>

            {/* Emblem icon selector */}
            <div className="flex items-center justify-around bg-white/50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => setCenterIcon('book')}
                className={`p-1 rounded-lg text-xs transition-all ${
                  centerIcon === 'book' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Book Emblem"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCenterIcon('cap')}
                className={`p-1 rounded-lg text-xs transition-all ${
                  centerIcon === 'cap' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="College Cap Emblem"
              >
                <GraduationCap className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCenterIcon('sparkle')}
                className={`p-1 rounded-lg text-xs transition-all ${
                  centerIcon === 'sparkle' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="AI Sparkles Emblem"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* MODERN HUD SCANNER FRAME CONTAINER WITH GLOWING AURA & FLOAT EFFECT */}
        <div className="relative mx-auto w-70 h-70 p-6 flex items-center justify-center group my-1">
          
          {/* Dynamic Background Glowing Pulsing Aura Ring */}
          <div 
            className="absolute inset-2 rounded-3xl blur-xl opacity-50 animate-glow-ring transition-all duration-700 pointer-events-none"
            style={{
              background: selectedStyle === 'cyber' 
                ? 'radial-gradient(circle, rgba(6,182,212,0.6) 0%, rgba(59,130,246,0.3) 100%)'
                : selectedStyle === 'neon'
                ? 'radial-gradient(circle, rgba(16,185,129,0.6) 0%, rgba(20,184,166,0.3) 100%)'
                : selectedStyle === 'classic'
                ? 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(148,163,184,0.2) 100%)'
                : `radial-gradient(circle, ${qrColors.fg}80 0%, ${qrColors.fg}20 100%)`
            }}
          />

          {/* Floating HUD Container Box */}
          <div className="relative w-full h-full p-4 rounded-3xl bg-slate-950/95 dark:bg-slate-950 border-2 border-slate-800/90 shadow-2xl flex items-center justify-center animate-float-qr hover:scale-[1.02] transition-transform duration-300 overflow-hidden">
            
            {/* Animated corner HUD brackets */}
            <div className="absolute top-2.5 left-2.5 w-5 h-5 border-t-2 border-l-2 border-indigo-400 rounded-tl-lg z-10" />
            <div className="absolute top-2.5 right-2.5 w-5 h-5 border-t-2 border-r-2 border-indigo-400 rounded-tr-lg z-10" />
            <div className="absolute bottom-2.5 left-2.5 w-5 h-5 border-b-2 border-l-2 border-indigo-400 rounded-bl-lg z-10" />
            <div className="absolute bottom-2.5 right-2.5 w-5 h-5 border-b-2 border-r-2 border-indigo-400 rounded-br-lg z-10" />

            {/* Animated Laser Scanning Line */}
            <div className="absolute inset-x-3 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] animate-laser-scan z-20 pointer-events-none" />

            {/* High Contrast White QR Card */}
            <div className="w-full h-full bg-white rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-inner relative group/qr">
              
              <QRCodeSVG
                ref={qrRef}
                id="library-qr-svg"
                value={publicPageUrl}
                size={175}
                bgColor="#ffffff"
                fgColor={qrColors.fg}
                level="H"
                marginSize={1}
              />

              {/* Center Floating Emblem Badge with Glowing Ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-slate-900 text-white border-2 border-white shadow-xl flex items-center justify-center pointer-events-none z-10 transition-transform duration-300 group-hover/qr:scale-110">
                {centerIcon === 'book' && <BookOpen className="w-5 h-5 text-amber-300 animate-pulse" />}
                {centerIcon === 'cap' && <GraduationCap className="w-5 h-5 text-indigo-300 animate-pulse" />}
                {centerIcon === 'sparkle' && <Sparkles className="w-5 h-5 text-emerald-300 animate-spin-slow" />}
                {centerIcon === 'college' && (
                  <span className="text-[10px] font-black text-amber-300 tracking-tighter">
                    {collegeCode.split('-')[0] || 'LIB'}
                  </span>
                )}
              </div>

              {/* Interactive Scan Verification Tag */}
              <div className="absolute -bottom-2.5 bg-slate-900 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-lg border border-slate-700 flex items-center gap-1.5 z-30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Active Entrance Scanner</span>
              </div>

            </div>
          </div>
        </div>

        {/* Action Buttons Bar: Download PNG & Simulate / Open Search */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleDownloadPNG}
            disabled={isDownloading}
            className={`py-2.5 px-3 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md disabled:opacity-50`}
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Saving...' : 'Download PNG'}</span>
          </button>

          <button
            onClick={() => {
              if (onSimulateScan) {
                onSimulateScan();
                onClose();
              } else {
                window.open(publicPageUrl, '_blank');
              }
            }}
            className={`py-2.5 px-3 ${currentPreset.secondaryButtonBg} ${currentPreset.buttonRadius} text-xs font-bold flex items-center justify-center gap-1.5 transition-all`}
          >
            <ExternalLink className="w-4 h-4 text-indigo-500" />
            <span>Open Link</span>
          </button>
        </div>

        {/* Public Copy Link Box */}
        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
            Public Direct URL
          </label>
          <div className={`p-1.5 pl-3 ${currentPreset.inputBg} ${currentPreset.inputRadius} border ${currentPreset.borderColor} flex items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300`}>
            <span className="truncate font-mono text-[11px] text-slate-600 dark:text-slate-400">
              {publicPageUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 ${currentPreset.buttonRadius} ${currentPreset.buttonBg} font-bold text-xs flex items-center gap-1 shrink-0 transition-all shadow-xs`}
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
    </div>
  );
};
