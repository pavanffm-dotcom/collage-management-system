import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Tv } from 'lucide-react';
import { isFullscreenActive, toggleAppFullscreen } from '../utils/fullscreen';
import { useTheme } from '../context/ThemeContext';

interface FullscreenButtonProps {
  variant?: 'floating' | 'button' | 'icon';
  className?: string;
}

export const FullscreenButton: React.FC<FullscreenButtonProps> = ({ variant = 'floating', className = '' }) => {
  const { currentPreset } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(isFullscreenActive());

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(isFullscreenActive());
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handleToggle = async () => {
    try {
      await toggleAppFullscreen();
    } catch (err) {
      console.warn('Fullscreen request blocked or failed:', err);
    }
  };

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center gap-2 px-3 py-2 ${currentPreset.buttonRadius} ${currentPreset.secondaryButtonBg} border ${currentPreset.borderColor} text-xs font-bold transition-all active:scale-95 shadow-sm ${className}`}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Immersive Fullscreen Mode (YouTube Style)'}
      >
        {isFullscreen ? (
          <>
            <Minimize2 className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Exit Fullscreen</span>
          </>
        ) : (
          <>
            <Maximize2 className={`w-4 h-4 ${currentPreset.accentText}`} />
            <span>YouTube Fullscreen</span>
          </>
        )}
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`p-2.5 ${currentPreset.buttonRadius} ${currentPreset.secondaryButtonBg} border ${currentPreset.borderColor} text-slate-700 dark:text-slate-200 transition-all active:scale-95 shadow-sm ${className}`}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Immersive Fullscreen Mode (YouTube Style)'}
      >
        {isFullscreen ? (
          <Minimize2 className="w-4 h-4 text-amber-400" />
        ) : (
          <Maximize2 className={`w-4 h-4 ${currentPreset.accentText}`} />
        )}
      </button>
    );
  }

  // Floating Variant (Fixed position on top right for instant 1-tap immersion)
  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`fixed top-3 right-3 z-[100] px-3 py-1.5 rounded-full ${
        isFullscreen
          ? 'bg-amber-500/90 text-slate-950 font-black shadow-amber-500/30'
          : 'bg-indigo-600/90 hover:bg-indigo-500 text-white font-extrabold shadow-indigo-600/30'
      } border border-white/30 backdrop-blur-xl text-xs shadow-2xl flex items-center gap-1.5 transition-all active:scale-90 hover:scale-105 select-none ${className}`}
      title={isFullscreen ? 'Exit Fullscreen Mode' : 'YouTube-Style Fullscreen Immersive Mode'}
    >
      <Tv className="w-3.5 h-3.5 animate-pulse" />
      <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
      {isFullscreen ? (
        <Minimize2 className="w-3 h-3 ml-0.5" />
      ) : (
        <Maximize2 className="w-3 h-3 ml-0.5" />
      )}
    </button>
  );
};
