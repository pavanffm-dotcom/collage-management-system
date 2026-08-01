import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling, {
  DotType,
  CornerSquareType,
  CornerDotType,
  DrawType,
  TypeNumber,
  Options
} from 'qr-code-styling';
import { Download, Sparkles, Heart, Copy, Check, QrCode, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface CuteQRCodeSVGProps {
  value: string;
  size?: number;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  showScanMeBadge?: boolean;
  centerLogo?: string;
  className?: string;
}

export type CuteQRStyle = 'cute_rounded' | 'cute_monochrome' | 'cute_pastel_gradient' | 'cyber_neon' | 'classic_dots';

export const CuteQRCodeSVG: React.FC<CuteQRCodeSVGProps> = ({
  value,
  size = 220,
  title = "Library Digital Access QR",
  subtitle = "Scan with camera to open catalog",
  badgeText = "Scan Me 💕",
  showScanMeBadge = true,
  centerLogo,
  className = ""
}) => {
  const { colorTheme, theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<CuteQRStyle>('cute_monochrome');
  const [dotType, setDotType] = useState<DotType>('dots');
  const [cornerSquareType, setCornerSquareType] = useState<CornerSquareType>('extra-rounded');
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>('dot');

  // Determine colors based on selected style & global theme
  const getStyleConfig = () => {
    const isDark = theme === 'dark' || colorTheme === 'superblack';

    switch (selectedStyle) {
      case 'cute_monochrome':
        return {
          bgColor: '#ffffff',
          dotsColor: '#000000',
          cornersSquareColor: '#000000',
          cornersDotColor: '#000000',
          badgeBg: 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border border-zinc-800 dark:border-zinc-200',
          gradient: null,
          dotShape: 'dots' as DotType,
          cornerSquareShape: 'extra-rounded' as CornerSquareType,
          cornerDotShape: 'dot' as CornerDotType,
        };
      case 'cute_pastel_gradient':
        return {
          bgColor: '#ffffff',
          dotsColor: '#8b5cf6',
          cornersSquareColor: '#ec4899',
          cornersDotColor: '#d946ef',
          badgeBg: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20',
          gradient: {
            type: 'linear' as const,
            rotation: 45,
            colorStops: [
              { offset: 0, color: '#ec4899' },
              { offset: 0.5, color: '#a855f7' },
              { offset: 1, color: '#6366f1' }
            ]
          },
          dotShape: 'rounded' as DotType,
          cornerSquareShape: 'extra-rounded' as CornerSquareType,
          cornerDotShape: 'dot' as CornerDotType,
        };
      case 'cyber_neon':
        return {
          bgColor: '#09090b',
          dotsColor: '#06b6d4',
          cornersSquareColor: '#38bdf8',
          cornersDotColor: '#00f0ff',
          badgeBg: 'bg-cyan-500 text-black font-black shadow-md shadow-cyan-500/30',
          gradient: {
            type: 'linear' as const,
            rotation: 90,
            colorStops: [
              { offset: 0, color: '#00f0ff' },
              { offset: 1, color: '#3b82f6' }
            ]
          },
          dotShape: 'classy-rounded' as DotType,
          cornerSquareShape: 'extra-rounded' as CornerSquareType,
          cornerDotShape: 'dot' as CornerDotType,
        };
      case 'classic_dots':
        return {
          bgColor: '#ffffff',
          dotsColor: '#0f172a',
          cornersSquareColor: '#0f172a',
          cornersDotColor: '#0f172a',
          badgeBg: 'bg-slate-900 text-white border border-slate-800',
          gradient: null,
          dotShape: 'dots' as DotType,
          cornerSquareShape: 'dot' as CornerSquareType,
          cornerDotShape: 'dot' as CornerDotType,
        };
      case 'cute_rounded':
      default:
        return {
          bgColor: '#ffffff',
          dotsColor: '#18181b',
          cornersSquareColor: '#09090b',
          cornersDotColor: '#09090b',
          badgeBg: 'bg-zinc-950 text-white dark:bg-white dark:text-black border border-zinc-700',
          gradient: null,
          dotShape: 'extra-rounded' as DotType,
          cornerSquareShape: 'extra-rounded' as CornerSquareType,
          cornerDotShape: 'dot' as CornerDotType,
        };
    }
  };

  const styleConfig = getStyleConfig();

  useEffect(() => {
    if (!containerRef.current) return;

    // Create or update QRCodeStyling instance
    const qrOptions: Options = {
      width: size,
      height: size,
      type: 'svg' as DrawType,
      data: value || 'https://library.college.edu',
      image: centerLogo,
      margin: 12,
      qrOptions: {
        typeNumber: 0 as TypeNumber,
        mode: 'Byte' as const,
        errorCorrectionLevel: 'H' as const
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.25,
        margin: 4,
        crossOrigin: 'anonymous'
      },
      dotsOptions: {
        color: styleConfig.dotsColor,
        type: dotType || styleConfig.dotShape,
        gradient: styleConfig.gradient || undefined
      },
      backgroundOptions: {
        color: styleConfig.bgColor,
      },
      cornersSquareOptions: {
        color: styleConfig.cornersSquareColor,
        type: cornerSquareType || styleConfig.cornerSquareShape,
      },
      cornersDotOptions: {
        color: styleConfig.cornersDotColor,
        type: cornerDotType || styleConfig.cornerDotShape,
      }
    };

    if (!qrCodeRef.current) {
      qrCodeRef.current = new QRCodeStyling(qrOptions);
      containerRef.current.innerHTML = '';
      qrCodeRef.current.append(containerRef.current);
    } else {
      qrCodeRef.current.update(qrOptions);
    }
  }, [value, size, selectedStyle, dotType, cornerSquareType, cornerDotType, centerLogo, theme, colorTheme]);

  const handleDownloadSVG = () => {
    if (qrCodeRef.current) {
      qrCodeRef.current.download({
        name: 'cute-library-access-qr',
        extension: 'svg'
      });
    }
  };

  const handleDownloadPNG = () => {
    if (qrCodeRef.current) {
      qrCodeRef.current.download({
        name: 'cute-library-access-qr',
        extension: 'png'
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      
      {/* Style selector pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => {
            setSelectedStyle('cute_monochrome');
            setDotType('dots');
            setCornerSquareType('extra-rounded');
            setCornerDotType('dot');
          }}
          className={`px-3 py-1 text-[11px] font-black rounded-xl transition-all ${
            selectedStyle === 'cute_monochrome'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          🖤 B&W Cute SVG
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedStyle('cute_pastel_gradient');
            setDotType('rounded');
            setCornerSquareType('extra-rounded');
            setCornerDotType('dot');
          }}
          className={`px-3 py-1 text-[11px] font-black rounded-xl transition-all ${
            selectedStyle === 'cute_pastel_gradient'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          ✨ Cute Gradient
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedStyle('cyber_neon');
            setDotType('classy-rounded');
            setCornerSquareType('extra-rounded');
            setCornerDotType('dot');
          }}
          className={`px-3 py-1 text-[11px] font-black rounded-xl transition-all ${
            selectedStyle === 'cyber_neon'
              ? 'bg-cyan-500 text-black shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          ⚡ Cyber Cyan
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedStyle('cute_rounded');
            setDotType('extra-rounded');
            setCornerSquareType('extra-rounded');
            setCornerDotType('dot');
          }}
          className={`px-3 py-1 text-[11px] font-black rounded-xl transition-all ${
            selectedStyle === 'cute_rounded'
              ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          🟢 Soft Blobs
        </button>
      </div>

      {/* Main Cute QR Frame Card */}
      <div className="relative flex flex-col items-center justify-center p-6 rounded-[36px] bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 shadow-xl transition-all duration-300">
        
        {/* Floating Cute Sparkles / Hearts Decorative Graphics around the QR */}
        <div className="absolute -top-3 -right-3 text-pink-500 animate-bounce pointer-events-none">
          <Heart className="w-5 h-5 fill-pink-500/20 stroke-pink-500" />
        </div>
        <div className="absolute -bottom-2 -left-3 text-amber-400 animate-pulse pointer-events-none">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="absolute top-1/2 -right-4 text-purple-400 opacity-80 pointer-events-none">
          <Sparkles className="w-4 h-4" />
        </div>

        {/* Outer White Card Frame with Soft Rounded Shadow */}
        <div 
          className="p-3 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800 shadow-inner flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: styleConfig.bgColor }}
        >
          <div ref={containerRef} className="rounded-2xl overflow-hidden flex items-center justify-center" />
        </div>

        {/* Cute "Scan Me 💕" Badge underneath */}
        {showScanMeBadge && (
          <div className="mt-3">
            <span className={`inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-black tracking-wide shadow-md transform hover:scale-105 transition-transform ${styleConfig.badgeBg}`}>
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
              <span>{badgeText}</span>
            </span>
          </div>
        )}
      </div>

      {/* QR Code Title & Subtitle */}
      {(title || subtitle) && (
        <div className="text-center space-y-1 max-w-xs">
          {title && <p className="text-xs font-black text-zinc-900 dark:text-zinc-100">{title}</p>}
          {subtitle && <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
        </div>
      )}

      {/* Action Buttons: SVG Download, PNG Download, Copy Link */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 w-full max-w-sm">
        <button
          type="button"
          onClick={handleDownloadSVG}
          className="flex-1 py-2.5 px-3 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download SVG</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadPNG}
          className="flex-1 py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-zinc-300 dark:border-zinc-700 active:scale-95"
        >
          <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
          <span>Save PNG</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-1 transition-all border border-zinc-300 dark:border-zinc-700 active:scale-95"
          title="Copy URL"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
          <span>{copied ? 'Copied' : 'Link'}</span>
        </button>
      </div>

    </div>
  );
};
