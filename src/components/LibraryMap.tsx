import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Footprints,
  Grid,
  Sparkles,
  BookOpen,
  Info,
  Clock,
  ExternalLink,
  Zap
} from 'lucide-react';
import { ShelfLocation, Book } from '../types';
import { useTheme } from '../context/ThemeContext';

interface LibraryMapProps {
  location?: ShelfLocation;
  bookTitle?: string;
  selectedBook?: Book;
}

interface AlmariNode {
  id: string;
  almariNum: number;
  name: string;
  x: number;
  y: number;
  wing: 'West Wing' | 'East Wing';
  subjects: string;
  department: string;
}

export const LibraryMap: React.FC<LibraryMapProps> = ({
  location: locationProp,
  bookTitle: bookTitleProp,
  selectedBook
}) => {
  const { currentPreset, colorTheme } = useTheme();

  // Extract location and title safely
  const location: ShelfLocation = selectedBook?.location || locationProp || {
    almariNumber: 'A7',
    rowNumber: 'R2',
    shelfPosition: 'Middle',
    shelfCode: 'A7-R2-M',
    sectionName: 'Central Library Stack'
  };

  const bookTitle: string = selectedBook?.title || bookTitleProp || 'Selected Book';

  const targetAlmariNum = parseInt(location.almariNumber.replace(/\D/g, ''), 10) || 7;

  // 12 Almaris layout coordinates (viewBox 0 0 100 80)
  const almaris: AlmariNode[] = [
    { id: 'A1', almariNum: 1, name: 'Almari 1', x: 22, y: 22, wing: 'West Wing', subjects: 'Computer Science & Software', department: 'CS & IT' },
    { id: 'A2', almariNum: 2, name: 'Almari 2', x: 22, y: 40, wing: 'West Wing', subjects: 'AI, ML & Data Science', department: 'AI & Data Science' },
    { id: 'A3', almariNum: 3, name: 'Almari 3', x: 22, y: 58, wing: 'West Wing', subjects: 'Electronics & VLSI Systems', department: 'ECE' },
    { id: 'A4', almariNum: 4, name: 'Almari 4', x: 38, y: 22, wing: 'West Wing', subjects: 'Electrical & Power Engineering', department: 'EEE' },
    { id: 'A5', almariNum: 5, name: 'Almari 5', x: 38, y: 40, wing: 'West Wing', subjects: 'Mechanical & Robotics', department: 'Mechanical' },
    { id: 'A6', almariNum: 6, name: 'Almari 6', x: 38, y: 58, wing: 'West Wing', subjects: 'Civil & Structural Design', department: 'Civil' },
    { id: 'A7', almariNum: 7, name: 'Almari 7', x: 62, y: 22, wing: 'East Wing', subjects: 'Mathematics & Calculus', department: 'Applied Sciences' },
    { id: 'A8', almariNum: 8, name: 'Almari 8', x: 62, y: 40, wing: 'East Wing', subjects: 'Physics, Quantum & Optics', department: 'Physics' },
    { id: 'A9', almariNum: 9, name: 'Almari 9', x: 62, y: 58, wing: 'East Wing', subjects: 'Chemistry & Materials', department: 'Chemistry' },
    { id: 'A10', almariNum: 10, name: 'Almari 10', x: 78, y: 22, wing: 'East Wing', subjects: 'Humanities & Social Science', department: 'Humanities' },
    { id: 'A11', almariNum: 11, name: 'Almari 11', x: 78, y: 40, wing: 'East Wing', subjects: 'Management & Finance', department: 'Management' },
    { id: 'A12', almariNum: 12, name: 'Almari 12', x: 78, y: 58, wing: 'East Wing', subjects: 'General Reference & Journals', department: 'General' }
  ];

  const targetAlmari = almaris.find(a => a.almariNum === targetAlmariNum) || almaris[6];

  // Active Map View Mode: '2d' floorplan vs 'grid' matrix
  const [mapMode, setMapMode] = useState<'2d' | 'grid'>('2d');

  // Currently inspected Almari (defaults to targetAlmari)
  const [inspectedAlmari, setInspectedAlmari] = useState<AlmariNode>(targetAlmari);

  // Interactive Walkthrough Step Index (0 to 3)
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Keep target updated when prop changes
  useEffect(() => {
    setInspectedAlmari(targetAlmari);
  }, [targetAlmariNum]);

  // Walkthrough Auto-Play timer
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

  // Navigation Waypoint Steps Data
  const navigationSteps = [
    {
      step: 1,
      title: 'Entrance & QR Scan Gate',
      desc: 'Enter through the main Library Entrance Gate (Ground Floor). Verify access code at digital kiosk.',
      coords: { x: 50, y: 72 },
      icon: '🚪'
    },
    {
      step: 2,
      title: 'Central Aisle Corridor',
      desc: 'Proceed straight down the Central Aisle past OPAC search terminals towards Stack Room.',
      coords: { x: 50, y: targetAlmari.y },
      icon: '🚶'
    },
    {
      step: 3,
      title: `${targetAlmari.wing} Turn`,
      desc: `Turn ${targetAlmari.x > 50 ? 'Right into East Wing' : 'Left into West Wing'} towards ${targetAlmari.department} section.`,
      coords: { x: (50 + targetAlmari.x) / 2, y: targetAlmari.y },
      icon: '↪️'
    },
    {
      step: 4,
      title: `Almari ${targetAlmari.almariNum} - ${location.shelfCode}`,
      desc: `Locate Almari ${targetAlmari.almariNum}. Search Row ${location.rowNumber.replace(/\D/g, '')} on ${location.shelfPosition} Shelf.`,
      coords: { x: targetAlmari.x, y: targetAlmari.y },
      icon: '🎯'
    }
  ];

  // SVG Path calculation for navigation route from Entrance (50, 72) -> (50, target.y) -> (target.x, target.y)
  const routePathD = `M 50 72 L 50 ${targetAlmari.y} L ${targetAlmari.x} ${targetAlmari.y}`;

  // Current active step coordinates for glowing traveler dot on map
  const activeStepCoords = navigationSteps[activeStep].coords;

  // Approximate distance & walking time
  const estimatedDistance = Math.round(Math.abs(50 - targetAlmari.x) + Math.abs(72 - targetAlmari.y) + 8);
  const estimatedSeconds = Math.round(estimatedDistance * 0.8);

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Top Banner: Shelf Code & Fast Navigation Summary */}
      <div className={`${currentPreset.heroCardBg} ${currentPreset.cardRadius} p-4 sm:p-5 border ${currentPreset.cardBorder} shadow-lg relative overflow-hidden flex flex-wrap items-center justify-between gap-4`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 ${currentPreset.badgeRadius} ${currentPreset.badgeBg}`}>
              Exact Physical Location Code
            </span>
            <span className="text-xs font-mono text-emerald-500 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 fill-emerald-500" />
              Live Route Active
            </span>
          </div>

          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-500 font-mono tracking-wider">
              {location.shelfCode}
            </span>
            <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
              <span>Almari {location.almariNumber.replace(/\D/g, '')}</span>
              <span className="mx-1.5 opacity-40">•</span>
              <span>Row {location.rowNumber.replace(/\D/g, '')}</span>
              <span className="mx-1.5 opacity-40">•</span>
              <span className={`${currentPreset.accentText} font-bold`}>{location.shelfPosition} Shelf</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
            Book: <strong className="text-slate-800 dark:text-slate-200">{bookTitle}</strong>
          </p>
        </div>

        {/* Quick Stats Badges */}
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
              {estimatedSeconds} sec
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher & Navigation Step Player Header */}
      <div className={`p-3 ${currentPreset.cardBg} ${currentPreset.cardRadius} border ${currentPreset.cardBorder} flex flex-wrap items-center justify-between gap-3`}>
        
        {/* Step Walkthrough Controller */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 ${currentPreset.buttonBg} ${currentPreset.buttonRadius} font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all`}
            title={isPlaying ? 'Pause Navigation Animation' : 'Play Step-by-Step Navigation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Play Walkthrough'}</span>
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveStep(0);
            }}
            className={`p-1.5 ${currentPreset.secondaryButtonBg} ${currentPreset.buttonRadius} text-slate-600 dark:text-slate-300 hover:text-slate-900`}
            title="Reset to Entrance"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Step Pill Indicators */}
          <div className="flex items-center gap-1 ml-1">
            {navigationSteps.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => {
                  setIsPlaying(false);
                  setActiveStep(idx);
                }}
                className={`w-6 h-6 ${currentPreset.buttonRadius} text-[11px] font-bold flex items-center justify-center transition-all ${
                  activeStep === idx
                    ? `${currentPreset.buttonBg} text-white shadow-sm scale-110`
                    : activeStep > idx
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
                title={s.title}
              >
                {s.step}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle: 2D Floorplan vs Grid Matrix */}
        <div className={`inline-flex p-1 ${currentPreset.innerCardBg} ${currentPreset.buttonRadius} border ${currentPreset.borderColor}`}>
          <button
            onClick={() => setMapMode('2d')}
            className={`px-3 py-1 ${currentPreset.buttonRadius} text-xs font-bold flex items-center gap-1.5 transition-all ${
              mapMode === '2d'
                ? `${currentPreset.buttonBg} shadow-xs`
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>2D Map View</span>
          </button>

          <button
            onClick={() => setMapMode('grid')}
            className={`px-3 py-1 ${currentPreset.buttonRadius} text-xs font-bold flex items-center gap-1.5 transition-all ${
              mapMode === 'grid'
                ? `${currentPreset.buttonBg} shadow-xs`
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid Matrix</span>
          </button>
        </div>
      </div>

      {/* MAP VIEW BODY */}
      {mapMode === '2d' ? (
        /* INTERACTIVE 2D SVG FLOORPLAN MAP */
        <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-2xl relative overflow-hidden space-y-4">
          
          {/* Header Bar inside map */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Library Ground Floor Architectural Layout</span>
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 border border-slate-600 inline-block" />
                <span>Almari</span>
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block animate-ping" />
                <span>Target ({location.shelfCode})</span>
              </span>
            </div>
          </div>

          {/* SVG Canvas Container */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-slate-950 rounded-xl border border-slate-800/90 overflow-hidden shadow-inner">
            <svg className="w-full h-full select-none" viewBox="0 0 100 80">
              <defs>
                {/* Architectural Grid pattern */}
                <pattern id="archGrid" width="5" height="5" patternUnits="userSpaceOnUse">
                  <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />
                </pattern>
                
                {/* Glowing neon path filter */}
                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="0.8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect width="100" height="80" fill="url(#archGrid)" />

              {/* Wing Labels */}
              <text x="30" y="10" textAnchor="middle" fill="#64748b" fontSize="2.2" fontWeight="bold" letterSpacing="0.2">
                WEST WING (TECH & ENGG)
              </text>
              <text x="70" y="10" textAnchor="middle" fill="#64748b" fontSize="2.2" fontWeight="bold" letterSpacing="0.2">
                EAST WING (SCIENCES & ARTS)
              </text>

              {/* Reading Zone (West side) */}
              <rect x="4" y="16" width="10" height="48" rx="1.5" fill="#0f172a" stroke="#1e293b" strokeWidth="0.5" />
              <text x="9" y="40" textAnchor="middle" fill="#475569" fontSize="1.8" fontWeight="bold" transform="rotate(-90 9 40)">
                STUDY & READING TABLES ZONE
              </text>

              {/* OPAC Kiosk Desk (Center) */}
              <rect x="44" y="62" width="12" height="5" rx="1" fill="#1e1b4b" stroke="#4338ca" strokeWidth="0.5" />
              <text x="50" y="65.2" textAnchor="middle" fill="#a5b4fc" fontSize="1.8" fontWeight="bold">
                OPAC SEARCH KIOSK
              </text>

              {/* Entrance Gate */}
              <rect x="40" y="73" width="20" height="6" rx="1.5" fill="#1e1b4b" stroke="#6366f1" strokeWidth="0.8" />
              <text x="50" y="77" textAnchor="middle" fill="#e0e7ff" fontSize="2.2" fontWeight="extrabold">
                ENTRANCE / QR GATE
              </text>

              {/* Help Desk (East side) */}
              <rect x="76" y="71" width="20" height="6" rx="1.5" fill="#0f172a" stroke="#1e293b" strokeWidth="0.5" />
              <text x="86" y="75" textAnchor="middle" fill="#64748b" fontSize="1.8" fontWeight="bold">
                HELP DESK & COUNTER
              </text>

              {/* Central Aisle Guide Line */}
              <line x1="50" y1="73" x2="50" y2="15" stroke="#334155" strokeWidth="0.5" strokeDasharray="1 1" />

              {/* Full Route Path line to Target Almari */}
              <path
                d={routePathD}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.2"
                strokeDasharray="2 1.5"
                filter="url(#neonGlow)"
              />

              {/* Step Segment Highlight Line */}
              {activeStep > 0 && (
                <line
                  x1={navigationSteps[activeStep - 1].coords.x}
                  y1={navigationSteps[activeStep - 1].coords.y}
                  x2={activeStepCoords.x}
                  y2={activeStepCoords.y}
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  filter="url(#neonGlow)"
                />
              )}

              {/* Animated Glowing Traveler Marker Dot */}
              <g transform={`translate(${activeStepCoords.x}, ${activeStepCoords.y})`}>
                <circle r="3.5" fill="#38bdf8" opacity="0.3" className="animate-ping" />
                <circle r="2.2" fill="#0284c7" stroke="#ffffff" strokeWidth="0.6" />
                <circle r="1" fill="#ffffff" />
              </g>

              {/* Almari Nodes (1 to 12) */}
              {almaris.map(a => {
                const isTarget = a.almariNum === targetAlmari.almariNum;
                const isInspected = a.almariNum === inspectedAlmari.almariNum;

                return (
                  <g
                    key={a.id}
                    onClick={() => setInspectedAlmari(a)}
                    className="cursor-pointer transition-transform hover:scale-105"
                  >
                    {/* Almari Box */}
                    <rect
                      x={a.x - 6}
                      y={a.y - 4.5}
                      width="12"
                      height="9"
                      rx="1.5"
                      fill={isTarget ? '#1e1b4b' : isInspected ? '#1e293b' : '#0f172a'}
                      stroke={isTarget ? '#f59e0b' : isInspected ? '#38bdf8' : '#334155'}
                      strokeWidth={isTarget ? '1.4' : isInspected ? '1.0' : '0.6'}
                      filter={isTarget ? 'url(#neonGlow)' : undefined}
                    />

                    {/* Shelf Compartment divider line */}
                    <line x1={a.x - 5} y1={a.y} x2={a.x + 5} y2={a.y} stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />

                    {/* Label Text */}
                    <text
                      x={a.x}
                      y={a.y - 0.8}
                      textAnchor="middle"
                      fill={isTarget ? '#fbbf24' : isInspected ? '#38bdf8' : '#cbd5e1'}
                      fontSize="2.4"
                      fontWeight={isTarget ? '900' : 'bold'}
                    >
                      A{a.almariNum}
                    </text>

                    {/* Sub Dept Code */}
                    <text
                      x={a.x}
                      y={a.y + 2.8}
                      textAnchor="middle"
                      fill={isTarget ? '#fef08a' : '#64748b'}
                      fontSize="1.5"
                      fontWeight="bold"
                    >
                      {a.department.split(' ')[0]}
                    </text>

                    {/* Glowing Target Pulsing Indicator */}
                    {isTarget && (
                      <circle cx={a.x + 4.5} cy={a.y - 3} r="1.5" fill="#f59e0b" className="animate-ping" />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Active Navigation Step Card */}
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{navigationSteps[activeStep].icon}</span>
              <div>
                <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Step {activeStep + 1} of 4 • Navigation Guide
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">
                  {navigationSteps[activeStep].title}
                </div>
                <div className="text-slate-400 text-[11px]">
                  {navigationSteps[activeStep].desc}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                disabled={activeStep === 0}
                onClick={() => { setIsPlaying(false); setActiveStep(p => Math.max(0, p - 1)); }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={activeStep === 3}
                onClick={() => { setIsPlaying(false); setActiveStep(p => Math.min(3, p + 1)); }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* INTERACTIVE GRID MATRIX VIEW */
        <div className="space-y-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Select any Almari card to view its department & rack details:</span>
            <span className="font-bold text-amber-500">Target Almari: A{targetAlmariNum}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {almaris.map(a => {
              const isTarget = a.almariNum === targetAlmari.almariNum;
              const isInspected = a.almariNum === inspectedAlmari.almariNum;

              return (
                <div
                  key={a.id}
                  onClick={() => setInspectedAlmari(a)}
                  className={`p-3.5 ${currentPreset.cardRadius} border cursor-pointer transition-all duration-300 space-y-2 relative overflow-hidden ${
                    isTarget
                      ? `${currentPreset.cardBg} border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/40 shadow-lg`
                      : isInspected
                      ? `${currentPreset.innerCardBg} border-indigo-500 dark:border-indigo-500`
                      : `bg-white/70 dark:bg-slate-900/70 ${currentPreset.borderColor} hover:border-slate-400`
                  }`}
                >
                  {isTarget && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>TARGET</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 ${currentPreset.buttonRadius} ${isTarget ? 'bg-amber-500 text-slate-950' : currentPreset.buttonBg} font-mono font-black text-xs flex items-center justify-center shrink-0`}>
                      A{a.almariNum}
                    </div>
                    <div className="truncate">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {a.department}
                      </h5>
                      <p className="text-[10px] text-slate-500 truncate">
                        {a.wing}
                      </p>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-tight">
                    {a.subjects}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[10px] border-t border-slate-200/50 dark:border-slate-800/50">
                    <span className="text-slate-400 font-mono">Row 1-4</span>
                    <span className={`font-bold ${isTarget ? 'text-amber-500' : currentPreset.accentText}`}>
                      {isTarget ? `Row ${location.rowNumber}` : '3 Shelves'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* INSPECTED ALMARI PHYSICAL RACK BREAKDOWN VISUALIZER */}
      <div className={`${currentPreset.cardBg} ${currentPreset.cardRadius} p-5 border ${currentPreset.cardBorder} shadow-lg space-y-4 transition-all duration-300`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className={`w-4 h-4 ${currentPreset.accentText}`} />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Almari {inspectedAlmari.almariNum} ({inspectedAlmari.department}) Rack Breakdown
            </h4>
          </div>

          <span className={`text-xs font-bold px-2.5 py-1 ${currentPreset.badgeRadius} ${currentPreset.badgeBg}`}>
            {inspectedAlmari.wing}
          </span>
        </div>

        {/* 3 Shelf Racks (Top, Middle, Bottom) */}
        <div className="space-y-2.5">
          {['Top', 'Middle', 'Bottom'].map((pos) => {
            const isTargetPos = inspectedAlmari.almariNum === targetAlmari.almariNum && location.shelfPosition === pos;

            return (
              <div
                key={pos}
                className={`p-3.5 ${currentPreset.buttonRadius} border transition-all flex items-center justify-between gap-3 ${
                  isTargetPos
                    ? 'bg-amber-500/15 border-amber-500 text-slate-900 dark:text-amber-200 ring-2 ring-amber-500/40 shadow-md'
                    : `${currentPreset.innerCardBg} ${currentPreset.borderColor} text-slate-600 dark:text-slate-400 opacity-75`
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${currentPreset.buttonRadius} ${isTargetPos ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'} flex items-center justify-center text-xs font-bold shrink-0`}>
                    {pos[0]}
                  </div>
                  <div>
                    <div className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{pos} Shelf</span>
                      <span className="text-[10px] font-mono font-normal text-slate-500">
                        Row {location.rowNumber.replace(/\D/g, '')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pos === 'Top' && 'Eye-level top rack (Subject references & monographs)'}
                      {pos === 'Middle' && 'Primary reach rack (Standard textbooks & handbooks)'}
                      {pos === 'Bottom' && 'Lower rack (Large volumes & bound periodicals)'}
                    </div>
                  </div>
                </div>

                {isTargetPos && (
                  <div className="px-3 py-1.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shrink-0 animate-pulse">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Target Book Here ({location.shelfCode})</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Textual Walking Directions Footnote */}
        <div className={`p-3 ${currentPreset.innerCardBg} ${currentPreset.inputRadius} border ${currentPreset.borderColor} text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5`}>
          <Navigation className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
          <div className="leading-relaxed">
            <strong className="text-slate-900 dark:text-white">Route Instructions: </strong>
            From Entrance Gate → Walk {estimatedDistance}m down Central Aisle → Turn {targetAlmari.x > 50 ? 'Right into East Wing' : 'Left into West Wing'} → Walk to <strong className="text-amber-500">Almari {targetAlmari.almariNum} ({targetAlmari.department})</strong> → Find Row {location.rowNumber.replace(/\D/g, '')} on <strong className="text-amber-500">{location.shelfPosition} Shelf</strong>.
          </div>
        </div>

      </div>

    </div>
  );
};
