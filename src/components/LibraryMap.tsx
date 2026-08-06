import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Footprints,
  Grid,
  Sparkles,
  BookOpen,
  Info,
  Clock,
  Zap,
  ZoomIn,
  ZoomOut,
  Maximize2,
  DoorOpen,
  Users,
  Building2,
  Shield,
  Search,
  Target
} from 'lucide-react';
import { ShelfLocation, Book, MapElement } from '../types';
import { useTheme } from '../context/ThemeContext';
import { DEMO_PRESET_MAP } from './MapDesigner';
import { motion, AnimatePresence } from 'motion/react';

interface LibraryMapProps {
  location?: ShelfLocation;
  bookTitle?: string;
  selectedBook?: Book;
}

export const LibraryMap: React.FC<LibraryMapProps> = ({
  location: locationProp,
  bookTitle: bookTitleProp,
  selectedBook
}) => {
  const { currentPreset } = useTheme();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Extract location and title safely
  const location: ShelfLocation = selectedBook?.location || locationProp || {
    almariNumber: 'A14',
    rowNumber: 'R2',
    shelfPosition: 'Middle',
    shelfCode: 'SHELF-014',
    sectionName: 'Central Library Stack'
  };

  const bookTitle: string = selectedBook?.title || bookTitleProp || 'Selected Book';

  // Load saved floor plan elements from localStorage
  const [mapElements, setMapElements] = useState<MapElement[]>(() => {
    const saved = localStorage.getItem('gec_library_map_elements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to load saved floor plan:', e);
      }
    }
    // Fallback to sample map if librarian hasn't designed one yet
    return DEMO_PRESET_MAP;
  });

  // Listen for live updates when librarian saves the floor plan in MapDesigner
  useEffect(() => {
    const handleStorageUpdate = () => {
      const saved = localStorage.getItem('gec_library_map_elements');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) setMapElements(parsed);
        } catch (e) {}
      }
    };
    window.addEventListener('gec_map_elements_updated', handleStorageUpdate);
    return () => window.removeEventListener('gec_map_elements_updated', handleStorageUpdate);
  }, []);

  // Parse raw target identifier numbers & strings
  const targetNumber = parseInt(location.almariNumber.replace(/\D/g, ''), 10) || 14;
  const targetCodeClean = location.shelfCode ? location.shelfCode.toUpperCase() : `A${targetNumber}`;
  const targetAlmariNumClean = location.almariNumber.toUpperCase();

  // Find exact target element on the floorplan map
  const targetElement = mapElements.find(e => {
    if (e.shelfId && (e.shelfId.toUpperCase() === targetCodeClean || e.shelfId.toUpperCase() === targetAlmariNumClean)) return true;
    if (e.code && (e.code.toUpperCase() === targetCodeClean || e.code.toUpperCase() === targetAlmariNumClean)) return true;
    if (e.shelfNumber && Number(e.shelfNumber) === targetNumber) return true;
    if (e.almariNum && Number(e.almariNum) === targetNumber) return true;
    return false;
  }) || mapElements.find(e => e.type === 'almari' || e.type === 'rack') || mapElements[0];

  // Find entrance element on floorplan (or fallback to entrance/first node)
  const entranceElement = mapElements.find(e => e.type === 'entrance' || e.code === 'ENTRANCE') || {
    x: 400,
    y: 500,
    width: 120,
    height: 60,
    label: 'Main Entrance'
  };

  // Student Canvas Pan and Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Navigation Walkthrough State
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Smoothly center target shelf in viewport
  const handleFocusTargetShelf = () => {
    if (!targetElement) return;
    const targetCenterX = targetElement.x + (targetElement.width || 100) / 2;
    const targetCenterY = targetElement.y + (targetElement.height || 60) / 2;
    
    // Calculate pan offset to center target inside 600x450 viewport
    setPan({
      x: 300 - targetCenterX,
      y: 200 - targetCenterY
    });
    setZoom(1.1);
  };

  // Center target on load or when target element changes
  useEffect(() => {
    handleFocusTargetShelf();
  }, [targetElement?.id]);

  // Step-by-step navigation auto-play loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep(prev => {
          if (prev >= 3) {
            setIsPlaying(false);
            return 3;
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Route Path Coordinates (Entrance -> Center Corridor -> Target Shelf)
  const entX = entranceElement.x + (entranceElement.width || 100) / 2;
  const entY = entranceElement.y + (entranceElement.height || 60) / 2;
  const tarX = targetElement ? targetElement.x + (targetElement.width || 100) / 2 : entX + 200;
  const tarY = targetElement ? targetElement.y + (targetElement.height || 60) / 2 : entY - 200;

  const midY = (entY + tarY) / 2;
  const routeSVGPathD = `M ${entX} ${entY} L ${entX} ${midY} L ${tarX} ${midY} L ${tarX} ${tarY}`;

  // Walkthrough waypoints
  const navigationSteps = [
    {
      step: 1,
      title: 'Main Entrance & QR Gate',
      desc: 'Enter through Main Entrance. Scan library access pass at digital scanner.',
      coords: { x: entX, y: entY },
      icon: '🚪'
    },
    {
      step: 2,
      title: 'Central Corridor Aisle',
      desc: 'Proceed along main walking corridor past OPAC terminals.',
      coords: { x: entX, y: midY },
      icon: '🚶'
    },
    {
      step: 3,
      title: `${tarX > entX ? 'East Wing' : 'West Wing'} Turn`,
      desc: `Turn ${tarX > entX ? 'Right' : 'Left'} into ${targetElement?.section || 'Stack Area'}.`,
      coords: { x: tarX, y: midY },
      icon: '↪️'
    },
    {
      step: 4,
      title: `Destination Shelf: ${targetElement?.shelfId || targetElement?.code || 'Target'}`,
      desc: `Locate ${targetElement?.label || 'Shelf'}. Find Row ${location.rowNumber.replace(/\D/g, '')} on ${location.shelfPosition} Shelf.`,
      coords: { x: tarX, y: tarY },
      icon: '🎯'
    }
  ];

  const activeStepCoords = navigationSteps[activeStep].coords;

  // Approximate metrics calculation
  const estimatedDistance = Math.round(Math.hypot(tarX - entX, tarY - entY) / 10 + 10);
  const estimatedSeconds = Math.round(estimatedDistance * 0.85);

  // Mouse pan handlers for student
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }
  };

  const handleMouseUpCanvas = () => {
    setIsPanning(false);
  };

  return (
    <div className="space-y-4">

      {/* Top Banner: Location Header & Metrics */}
      <div className={`${currentPreset.heroCardBg} ${currentPreset.cardRadius} p-4 sm:p-5 border ${currentPreset.cardBorder} shadow-lg flex flex-wrap items-center justify-between gap-4`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 ${currentPreset.badgeRadius} ${currentPreset.badgeBg}`}>
              Book Location Finder
            </span>
            <span className="text-xs font-mono text-emerald-500 font-extrabold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-emerald-500" />
              Real-time Route Active
            </span>
          </div>

          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-500 font-mono tracking-wider">
              {targetElement?.shelfId || location.shelfCode}
            </span>
            <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
              <span>Shelf {targetElement?.shelfNumber || location.almariNumber.replace(/\D/g, '')}</span>
              <span className="mx-1.5 opacity-40">•</span>
              <span>Rack {targetElement?.rackNumber || 'A'}</span>
              <span className="mx-1.5 opacity-40">•</span>
              <span className={`${currentPreset.accentText} font-bold`}>{location.shelfPosition} Shelf</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
            Book: <strong className="text-slate-800 dark:text-slate-200">{bookTitle}</strong>
          </p>
        </div>

        {/* Quick Metrics & Re-Center Button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={`p-2.5 ${currentPreset.innerCardBg} ${currentPreset.buttonRadius} border ${currentPreset.borderColor} text-center space-y-0.5`}>
            <div className="text-[10px] text-slate-400 font-medium uppercase flex items-center justify-center gap-1">
              <Footprints className="w-3 h-3 text-indigo-500" />
              <span>Distance</span>
            </div>
            <div className="text-xs sm:text-sm font-bold font-mono text-slate-800 dark:text-white">
              ~{estimatedDistance}m
            </div>
          </div>

          <div className={`p-2.5 ${currentPreset.innerCardBg} ${currentPreset.buttonRadius} border ${currentPreset.borderColor} text-center space-y-0.5`}>
            <div className="text-[10px] text-slate-400 font-medium uppercase flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>Walk Time</span>
            </div>
            <div className="text-xs sm:text-sm font-bold font-mono text-slate-800 dark:text-white">
              ~{estimatedSeconds}s
            </div>
          </div>

          <button
            type="button"
            onClick={handleFocusTargetShelf}
            className="px-3.5 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all transform hover:scale-105"
            title="Re-center map on target shelf"
          >
            <Target className="w-4 h-4 animate-spin-slow" />
            <span>Center Target</span>
          </button>
        </div>
      </div>

      {/* Interactive Step Walkthrough Bar */}
      <div className={`p-3 ${currentPreset.cardBg} ${currentPreset.cardRadius} border ${currentPreset.cardBorder} flex flex-wrap items-center justify-between gap-3`}>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause Walkthrough' : 'Play Animated Route'}</span>
          </button>

          <button
            onClick={() => { setIsPlaying(false); setActiveStep(0); }}
            className={`p-1.5 ${currentPreset.secondaryButtonBg} ${currentPreset.buttonRadius} text-slate-600 dark:text-slate-300 hover:text-slate-900`}
            title="Reset route to entrance"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Step Indicators */}
          <div className="flex items-center gap-1 ml-1">
            {navigationSteps.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => { setIsPlaying(false); setActiveStep(idx); }}
                className={`w-6 h-6 ${currentPreset.buttonRadius} text-[11px] font-bold flex items-center justify-center transition-all ${
                  activeStep === idx
                    ? `${currentPreset.buttonBg} text-white shadow-sm scale-110`
                    : activeStep > idx
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {s.step}
              </button>
            ))}
          </div>
        </div>

        {/* Current Active Step Text */}
        <div className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <span>{navigationSteps[activeStep].icon}</span>
          <span>Step {activeStep + 1}: {navigationSteps[activeStep].title}</span>
        </div>
      </div>

      {/* STUDENT MAP CANVAS VIEWPORT */}
      <div
        ref={canvasRef}
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
        className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden h-[500px] select-none cursor-grab active:cursor-grabbing"
      >
        {/* Map View Zoom & Reset Floating Overlay */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))}
            className="p-1.5 text-slate-300 hover:bg-slate-800 rounded-lg"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono text-slate-300 px-1 font-bold">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.min(2.5, prev + 0.1))}
            className="p-1.5 text-slate-300 hover:bg-slate-800 rounded-lg"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleFocusTargetShelf}
            className="p-1.5 text-cyan-400 hover:bg-slate-800 rounded-lg"
            title="Re-center on Target Shelf"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Transform Canvas with Pan & Zoom */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '2000px',
            height: '2000px',
            position: 'absolute',
            top: 0,
            left: 0
          }}
          className="relative"
        >
          {/* Background Grid Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none">
            <defs>
              <pattern id="studentGridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#studentGridPattern)" />
          </svg>

          {/* SVG WALKING ROUTE PATH */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Glowing Path Back Line */}
            <path
              d={routeSVGPathD}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-40 blur-sm"
            />

            {/* Main Dash Animated Navigation Path */}
            <path
              d={routeSVGPathD}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="4"
              strokeDasharray="8 6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            />

            {/* Entrance Pin */}
            <g transform={`translate(${entX}, ${entY})`}>
              <circle r="12" fill="#059669" className="animate-ping opacity-75" />
              <circle r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
            </g>

            {/* Traveler Node for Active Step Walkthrough */}
            <g transform={`translate(${activeStepCoords.x}, ${activeStepCoords.y})`} className="transition-all duration-700 ease-out">
              <circle r="18" fill="#38bdf8" className="animate-ping opacity-60" />
              <circle r="10" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
            </g>
          </svg>

          {/* RENDER ALL SAVED MAP FLOORPLAN ELEMENTS */}
          {mapElements.map(elem => {
            const isTarget = targetElement?.id === elem.id;

            return (
              <div
                key={elem.id}
                style={{
                  position: 'absolute',
                  left: `${elem.x}px`,
                  top: `${elem.y}px`,
                  width: `${elem.width}px`,
                  height: `${elem.height}px`,
                  transform: `rotate(${elem.rotation || 0}deg)`,
                  backgroundColor: elem.fillColor || '#1e293b',
                  borderColor: isTarget ? '#f59e0b' : elem.borderColor || '#475569',
                  borderWidth: isTarget ? '3px' : `${elem.borderWidth || 2}px`,
                  borderStyle: 'solid',
                  borderRadius: `${elem.cornerRadius || 8}px`,
                  opacity: isTarget ? 1 : (elem.opacity ?? 0.85),
                  zIndex: isTarget ? 25 : (elem.zIndex || 1)
                }}
                className={`p-2 flex flex-col justify-between transition-all select-none ${
                  isTarget ? 'ring-4 ring-amber-400 ring-offset-4 ring-offset-slate-950 shadow-2xl scale-105' : 'filter blur-[0.2px]'
                }`}
              >
                {/* Element Label */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    style={{ color: elem.textColor || '#ffffff', fontSize: `${elem.fontSize || 12}px` }}
                    className={`font-bold truncate ${isTarget ? 'text-amber-300' : ''}`}
                  >
                    {elem.label}
                  </span>
                </div>

                {/* Shelf ID Badge */}
                {(elem.type === 'almari' || elem.type === 'rack' || elem.shelfId) && (
                  <div className={`flex items-center justify-between text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isTarget ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900/80 text-amber-300 border border-amber-500/20'
                  }`}>
                    <span>{elem.shelfId || elem.code}</span>
                    {elem.shelfNumber && <span>#{elem.shelfNumber}</span>}
                  </div>
                )}

                {/* TARGET HIGHLIGHT SPOTLIGHT ANIMATION OVERLAY */}
                {isTarget && (
                  <div className="absolute -inset-4 rounded-2xl border-2 border-amber-400 border-dashed animate-spin-slow pointer-events-none flex items-center justify-center">
                    <div className="w-3 h-3 bg-amber-400 rounded-full animate-ping" />
                  </div>
                )}
              </div>
            );
          })}

        </div>

        {/* Floating Target Spotlight Info Card at Bottom */}
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black shrink-0">
              <Target className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white">{targetElement?.label || 'Target Bookshelf'}</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                  {targetElement?.shelfId || location.shelfCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {navigationSteps[activeStep].desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveStep(prev => (prev < 3 ? prev + 1 : 0))}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all"
            >
              {activeStep === 3 ? 'Restart Step 1' : 'Next Step →'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
