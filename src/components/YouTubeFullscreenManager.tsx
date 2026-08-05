import React, { useState, useEffect, useRef } from 'react';
import { Minimize2, X, Maximize2 } from 'lucide-react';
import { isFullscreenActive, requestAppFullscreen, exitAppFullscreen } from '../utils/fullscreen';

export const YouTubeFullscreenManager: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(isFullscreenActive());
  const [showExitBar, setShowExitBar] = useState<boolean>(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userGestureDone = useRef<boolean>(false);

  useEffect(() => {
    // 1. Sync Fullscreen state
    const handleFullscreenChange = () => {
      const active = isFullscreenActive();
      setIsFullscreen(active);
      if (!active) {
        setShowExitBar(false);
      } else {
        // Temporarily show exit bar for 2.5s on entering fullscreen so user knows how to exit
        triggerExitBarBriefly();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // 2. Default Fullscreen Trigger on First User Interaction (Click or Touch)
    const handleFirstUserInteraction = () => {
      if (!userGestureDone.current) {
        userGestureDone.current = true;
        if (!isFullscreenActive()) {
          requestAppFullscreen().catch(() => {
            // Browsers may block if gesture context expired; silently fail
          });
        }
      }
    };

    window.addEventListener('click', handleFirstUserInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstUserInteraction, { once: true });

    // 3. YouTube-style Top Mouse/Touch Detection
    const handleMouseMove = (e: MouseEvent) => {
      if (!isFullscreenActive()) return;

      // If cursor is within top 60px of screen or hovering near top
      if (e.clientY < 60) {
        setShowExitBar(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      } else {
        // Schedule auto-hide after 1.8 seconds when cursor moves away
        if (!hideTimerRef.current) {
          hideTimerRef.current = setTimeout(() => {
            setShowExitBar(false);
            hideTimerRef.current = null;
          }, 1800);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!isFullscreenActive()) return;
      if (e.touches && e.touches[0] && e.touches[0].clientY < 70) {
        setShowExitBar(true);
        triggerExitBarBriefly();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const triggerExitBarBriefly = () => {
    setShowExitBar(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowExitBar(false);
      hideTimerRef.current = null;
    }, 3000);
  };

  const handleExit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await exitAppFullscreen();
    } catch (err) {
      console.warn('Failed to exit fullscreen:', err);
    }
  };

  const handleEnterManual = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await requestAppFullscreen();
    } catch (err) {
      console.warn('Failed to enter fullscreen:', err);
    }
  };

  return (
    <>
      {/* Top Mouse Hover Sensor Area (Invisible top 16px strip to capture mouse hover like YouTube) */}
      {isFullscreen && (
        <div
          onMouseEnter={() => setShowExitBar(true)}
          className="fixed top-0 left-0 right-0 h-5 z-[9998] pointer-events-auto"
        />
      )}

      {/* YouTube-style Top Center Exit Overlay */}
      <div
        onMouseEnter={() => {
          setShowExitBar(true);
          if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        }}
        onMouseLeave={() => {
          if (!hideTimerRef.current) {
            hideTimerRef.current = setTimeout(() => {
              setShowExitBar(false);
              hideTimerRef.current = null;
            }, 1200);
          }
        }}
        className={`fixed top-3 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 transform ${
          isFullscreen && showExitBar
            ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
            : '-translate-y-16 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <button
          type="button"
          onClick={handleExit}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-950/90 text-white border border-white/20 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-xs font-black hover:bg-slate-900 hover:border-amber-400/50 transition-all hover:scale-105 active:scale-95 group select-none"
          title="Exit Full Screen Mode (Press Esc or Click)"
        >
          <Minimize2 className="w-4 h-4 text-amber-400 animate-pulse group-hover:rotate-90 transition-transform" />
          <span className="tracking-wide">Exit Full Screen</span>
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center ml-1 group-hover:bg-amber-500/20">
            <X className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-300" />
          </div>
        </button>
      </div>
    </>
  );
};
