import React, { useState } from 'react';
import { 
  Terminal, 
  Calculator, 
  Users, 
  TrendingUp, 
  GraduationCap, 
  Construction, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  Bell,
  Sparkles,
  RefreshCw,
  Send,
  Wrench,
  Cpu
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface WorkInProgressViewProps {
  selectedDept: string;
  onBackToLibrary: () => void;
}

export const WorkInProgressView: React.FC<WorkInProgressViewProps> = ({
  selectedDept,
  onBackToLibrary
}) => {
  const { currentPreset, theme } = useTheme();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulatedLog, setSimulatedLog] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);

  // Department metadata
  const deptDetails: Record<string, {
    name: string;
    icon: React.ComponentType<any>;
    color: string;
    tagline: string;
    plannedFeatures: string[];
    technicalStack: string[];
    progress: number;
    phase: string;
  }> = {
    cs: {
      name: 'Computer Science Dept',
      icon: Terminal,
      color: 'from-purple-500 to-indigo-600',
      tagline: 'Practical Lab Sheets, Student Attendance Ledgers, and AI Code Playground Sandbox.',
      plannedFeatures: [
        'Web-based Live Code Playground with multi-language compiler simulation',
        'Automatic biometric/QR Student attendance logging with real-time analytics',
        'Head of Department (HOD) approval panels for credit transfers and syllabus checks',
        'Lab Assignment tracking & auto-evaluation logs'
      ],
      technicalStack: ['Vite + React TS', 'Tailwind Utility grid', 'Monaco Code Editor', 'Mock Sandbox API'],
      progress: 35,
      phase: 'Core Layout & UI Design'
    },
    math: {
      name: 'Mathematics Dept',
      icon: Calculator,
      color: 'from-blue-500 to-indigo-600',
      tagline: 'Equation Plotting Canvas, Scientific Utility Calculators, and Internal grading sheets.',
      plannedFeatures: [
        'Interactive Equation Plotter using 2D Canvas/SVG rendering',
        'Comprehensive CGPA/SGPA grade calculator and projection builder',
        'Dynamic Formula sheet reference search engine',
        'Class assignment and continuous internal evaluation sheets'
      ],
      technicalStack: ['Vite + React TS', 'D3.js / SVG Renderer', 'Math.js Parser', 'Local Storage Engine'],
      progress: 20,
      phase: 'Requirements Gathering'
    },
    sports: {
      name: 'Physical Ed. / Sports',
      icon: Users,
      color: 'from-orange-500 to-red-500',
      tagline: 'Ground Booking calendars, Sports equipment inventory ledgers, and tournament brackets.',
      plannedFeatures: [
        'Ground & Court slot booking scheduler with real-time clash protection',
        'Equipment inventory logs, fine tracking, and sign-out records',
        'Tournament Bracket Generator for inter-college leagues',
        'Physical fitness metrics charts and athlete databases'
      ],
      technicalStack: ['Vite + React TS', 'Calendar Scheduler component', 'Drizzle ORM Specs', 'Local DB state'],
      progress: 15,
      phase: 'Architectural Blueprinting'
    },
    placement: {
      name: 'Training & Placement',
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-600',
      tagline: 'Active campus hiring drives, interactive resume metrics feedback, and offer trackers.',
      plannedFeatures: [
        'Interactive Resume Scoring feedback and keyword analyzer',
        'Active campus drive notification schedules & company registries',
        'Offers leaderboard and salary analytics dashboard',
        'Alumni interview preparation logs & cheat sheets'
      ],
      technicalStack: ['Vite + React TS', 'Gemini AI Prompt Engine', 'Recharts Graphics', 'Database schemas'],
      progress: 40,
      phase: 'AI Prototype Integration'
    },
    exam: {
      name: 'Examination Cell',
      icon: GraduationCap,
      color: 'from-rose-500 to-pink-600',
      tagline: 'Secure hall tickets generation, semester schedule timelines, and consolidated results.',
      plannedFeatures: [
        'Printable PDF Hall tickets with verified security QR stamps',
        'Consolidated Semester GPA transcripts & digital grade sheets',
        'Clash-free exam date-sheet schedules and notifications',
        'Admissions roll validation logs'
      ],
      technicalStack: ['Vite + React TS', 'PDF-Kit Client Simulator', 'QR Code Generator', 'AES Encryption specs'],
      progress: 25,
      phase: 'Security Schema Design'
    }
  };

  const currentDept = deptDetails[selectedDept] || {
    name: 'Academic Department',
    icon: Cpu,
    color: 'from-slate-500 to-slate-600',
    tagline: 'This academic module is scheduled for our upcoming deployment roll.',
    plannedFeatures: [
      'Interactive modules and role-specific views',
      'Dynamic charts, schedules, and spreadsheet sheets',
      'Unified login and session logging'
    ],
    technicalStack: ['React TS', 'Tailwind CSS'],
    progress: 10,
    phase: 'Conceptual Planning'
  };

  const IconComponent = currentDept.icon;

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubscribed(true);
      setIsSubmitting(false);
    }, 800);
  };

  const runBuildSimulation = () => {
    if (isCompiling) return;
    setIsCompiling(true);
    setSimulatedLog([]);
    const lines = [
      'Initializing Vite builder...',
      `Target: /src/components/departments/${selectedDept === 'cs' ? 'ComputerScienceView' : selectedDept.charAt(0).toUpperCase() + selectedDept.slice(1) + 'View'}.tsx`,
      'Loading schema blueprint configs...',
      'Compiling component TSX trees...',
      'Integrating system Tailwind classes...',
      'Building responsive layout state trees...',
      'Verification check: PASS ✔',
      'Awaiting full deployment triggers...'
    ];
    let index = 0;
    const interval = setInterval(() => {
      if (index < lines.length) {
        setSimulatedLog(prev => [...prev, `[system] ${lines[index]}`]);
        index++;
      } else {
        clearInterval(interval);
        setIsCompiling(false);
      }
    }, 300);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 animate-fade-in space-y-6">
      
      {/* Upper Navigation Card */}
      <div className={`${currentPreset.innerCardBg} p-4 ${currentPreset.cardRadius} border ${currentPreset.borderColor} flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl bg-gradient-to-tr ${currentDept.color} text-white shrink-0 shadow-sm`}>
            <IconComponent className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{currentDept.name}</span>
              <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold rounded-full animate-pulse border border-indigo-500/20">
                Work In Progress
              </span>
            </h2>
            <p className="text-xs text-slate-450 dark:text-slate-500">
              Module slated for incremental feature roll.
            </p>
          </div>
        </div>

        <button
          onClick={onBackToLibrary}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs border border-slate-200 dark:border-zinc-800 transition-all shadow-xs shrink-0 group active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Go Back to Library Hub</span>
        </button>
      </div>

      {/* Main Feature Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Interactive Progress Tracker Panel (7 Cols) */}
        <div className="md:col-span-7 flex flex-col space-y-6">
          <div className={`${currentPreset.cardBg} ${currentPreset.cardBorder} p-6 sm:p-8 ${currentPreset.cardRadius} space-y-6 text-left relative overflow-hidden flex-grow`}>
            
            {/* Top design visual element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase rounded-full border border-amber-500/10">
                <Construction className="w-3.5 h-3.5" />
                <span>Next Module on Roadmap</span>
              </div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white">
                Under Active Crafting
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {currentDept.tagline} We are building this section incrementally to keep the workspace highly refined and feature-complete.
              </p>
            </div>

            {/* Development Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                  <span>Module Status: {currentDept.phase}</span>
                </span>
                <span className={currentPreset.accentText}>{currentDept.progress}% Complete</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-slate-200/40 dark:border-zinc-800/60 p-0.5">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${currentDept.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${currentDept.progress}%` }}
                />
              </div>
            </div>

            {/* Interactive Beta Subscription Form */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200/50 dark:border-zinc-800/40 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Subscribe for Module Beta Launches</span>
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                Get notified on your campus Google account the second this department dashboard goes live for testing.
              </p>

              {isSubscribed ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10 animate-fade-in">
                  <CheckCircle className="w-4 h-4" />
                  <span>✓ Success! You are subscribed to updates for {currentDept.name}.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribeSubmit} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`flex-grow px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-800 dark:text-slate-100`}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 transition-all shadow-sm shrink-0`}
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Notify Me</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>

        {/* Right Feature Checklist & Sandbox Compiler simulation (5 Cols) */}
        <div className="md:col-span-5 flex flex-col space-y-6">
          
          {/* Planned Features list */}
          <div className={`${currentPreset.cardBg} ${currentPreset.cardBorder} p-5 sm:p-6 ${currentPreset.cardRadius} text-left flex flex-col justify-between space-y-4`}>
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Planned Features Blueprint:
              </h3>
              <div className="space-y-2.5">
                {currentDept.plannedFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/5 text-indigo-500 shrink-0 flex items-center justify-center text-xs font-extrabold">
                      {idx + 1}
                    </span>
                    <p className="text-[11px] sm:text-xs text-slate-650 dark:text-slate-300 font-medium leading-relaxed">
                      {feat}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick specifications tag row */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-900 mt-auto">
              <span className="text-[10px] font-bold text-slate-400 block mb-1.5">Proposed Tech Stack:</span>
              <div className="flex flex-wrap gap-1">
                {currentDept.technicalStack.map((tech, idx) => (
                  <span key={idx} className="text-[9px] px-2 py-0.5 bg-slate-100 dark:bg-zinc-900 text-slate-650 dark:text-slate-400 font-bold rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Simulated Build Sandbox for high fidelity interactive engagement */}
          <div className={`${currentPreset.cardBg} ${currentPreset.cardBorder} p-5 sm:p-6 ${currentPreset.cardRadius} text-left flex-grow flex flex-col justify-between`}>
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>Vite Compiler Sandbox</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              </h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-snug">
                Simulate building this department module to inspect output tree structures.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-zinc-800 font-mono text-[10px] text-zinc-300 min-h-[110px] max-h-[130px] overflow-y-auto space-y-1 mt-3">
              {simulatedLog.length === 0 ? (
                <span className="text-zinc-600 block italic">// Compiler idle. Click "Simulate Build" below to compile.</span>
              ) : (
                simulatedLog.map((log, i) => (
                  <div key={i} className="leading-snug truncate">
                    {log}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={runBuildSimulation}
              disabled={isCompiling}
              className={`w-full mt-3 py-2 px-3 rounded-xl border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-all`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{isCompiling ? 'Compiling Components...' : 'Simulate Component Build'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
