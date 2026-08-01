import React, { useState } from 'react';
import { 
  Calculator, 
  Layers, 
  HelpCircle, 
  TrendingUp, 
  Plus, 
  BookOpen, 
  Check, 
  Sparkles,
  FunctionSquare
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Teacher {
  id: string;
  name: string;
  specialization: string;
  email: string;
  availableHours: string;
}

const MATHEMATICS_TEACHERS: Teacher[] = [
  { id: '1', name: 'Dr. Neha Patel', specialization: 'Linear Algebra & Calculus', email: 'neha.math@university.edu', availableHours: '10:00 AM - 12:00 PM' },
  { id: '2', name: 'Prof. Rajesh Kulkarni', specialization: 'Probability & Stochastic Models', email: 'rajesh.k@university.edu', availableHours: '02:00 PM - 04:00 PM' },
  { id: '3', name: 'Dr. Maria Fernandes', specialization: 'Discrete Structures & Topology', email: 'maria.f@university.edu', availableHours: '11:00 AM - 01:00 PM' }
];

export const MathematicsView: React.FC = () => {
  const { currentPreset } = useTheme();
  const [activeTab, setActiveTab] = useState<'plotter' | 'grades' | 'teachers'>('plotter');
  
  // Graph Plotter States
  const [equationPreset, setEquationPreset] = useState<'quadratic' | 'sine' | 'cubic' | 'linear'>('quadratic');
  const [equationFactor, setEquationFactor] = useState<number>(1); // slider factor to watch SVG respond!

  // Internal Marks States
  const [assignmentScore, setAssignmentScore] = useState<number>(85);
  const [midtermScore, setMidtermScore] = useState<number>(78);
  const [endtermScore, setEndtermScore] = useState<number>(88);

  // SVG Plotter Calculations
  const getCoordinatesPath = () => {
    const points: string[] = [];
    const width = 300;
    const height = 180;
    const centerX = width / 2;
    const centerY = height / 2;

    for (let xPixel = 0; xPixel <= width; xPixel += 2) {
      // Scale x coordinate from pixel to graph units (-5 to 5)
      const graphX = ((xPixel - centerX) / width) * 10;
      let graphY = 0;

      switch (equationPreset) {
        case 'quadratic':
          // y = factor * x^2
          graphY = equationFactor * 0.1 * Math.pow(graphX, 2);
          break;
        case 'sine':
          // y = factor * sin(x)
          graphY = equationFactor * 2 * Math.sin(graphX);
          break;
        case 'cubic':
          // y = factor * x^3
          graphY = equationFactor * 0.02 * Math.pow(graphX, 3);
          break;
        case 'linear':
          // y = factor * x
          graphY = equationFactor * 0.5 * graphX;
          break;
      }

      // Convert graph y back to pixel coordinates
      const yPixel = centerY - (graphY * (height / 10));
      
      // Keep inside bounds
      if (yPixel >= 0 && yPixel <= height) {
        points.push(`${xPixel},${yPixel}`);
      }
    }

    return points.length > 0 ? `M ${points.join(' L ')}` : '';
  };

  // Marks Grade Logic
  const weightedTotal = Math.round(
    (assignmentScore * 0.2) + 
    (midtermScore * 0.3) + 
    (endtermScore * 0.5)
  );

  const getCalculatedGrade = (total: number) => {
    if (total >= 90) return { char: 'O', label: 'Outstanding', color: 'text-emerald-500' };
    if (total >= 80) return { char: 'A+', label: 'Excellent', color: 'text-emerald-600' };
    if (total >= 70) return { char: 'A', label: 'Very Good', color: 'text-indigo-500' };
    if (total >= 60) return { char: 'B', label: 'Above Average', color: 'text-blue-500' };
    if (total >= 50) return { char: 'C', label: 'Average', color: 'text-amber-500' };
    return { char: 'F', label: 'Fails', color: 'text-red-500' };
  };

  const currentGrade = getCalculatedGrade(weightedTotal);

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mathematics Department</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Equation Solver, Function Plotters, Weighted Grade sheets</p>
          </div>
        </div>

        {/* Tab Selectors */}
        <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl border border-slate-200/40 dark:border-zinc-700/40">
          {[
            { id: 'plotter', label: 'Equation Grapher', icon: FunctionSquare },
            { id: 'grades', label: 'Marks Sheet', icon: TrendingUp },
            { id: 'teachers', label: 'Faculty', icon: BookOpen }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs Content */}
      {activeTab === 'plotter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* SVG Canvas Area */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">SVG Vector Coordinate Plotter</h3>
                <p className="text-xs text-slate-500">Responsive coordinates mathematically generated based on parameters.</p>
              </div>
              
              <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500">
                Range: X [-5, 5], Y [-5, 5]
              </span>
            </div>

            {/* Render Graph Paper & Vector Line via SVG */}
            <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden h-[240px] flex items-center justify-center">
              <svg width="300" height="180" className="overflow-visible select-none">
                {/* Horizontal Axis (X) */}
                <line x1="0" y1="90" x2="300" y2="90" stroke="#334155" strokeWidth="1.5" />
                {/* Vertical Axis (Y) */}
                <line x1="150" y1="0" x2="150" y2="180" stroke="#334155" strokeWidth="1.5" />

                {/* Subgrid Tick Markers */}
                {[30, 60, 90, 120, 150, 180, 210, 240, 270].map((tick) => (
                  <line key={`x-${tick}`} x1={tick} y1="87" x2={tick} y2="93" stroke="#475569" strokeWidth="1" />
                ))}
                {[20, 40, 60, 80, 100, 120, 140, 160].map((tick) => (
                  <line key={`y-${tick}`} x1="147" y1={tick} x2="153" y2={tick} stroke="#475569" strokeWidth="1" />
                ))}

                {/* Plot Line */}
                <path
                  d={getCoordinatesPath()}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />
              </svg>

              {/* Display Math Equation Formula */}
              <div className="absolute bottom-3 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-mono text-blue-400 border border-white/10">
                {equationPreset === 'quadratic' && `y = ${equationFactor.toFixed(1)} * 0.1 * x²`}
                {equationPreset === 'sine' && `y = ${equationFactor.toFixed(1)} * 2 * sin(x)`}
                {equationPreset === 'cubic' && `y = ${equationFactor.toFixed(1)} * 0.02 * x³`}
                {equationPreset === 'linear' && `y = ${equationFactor.toFixed(1)} * 0.5 * x`}
              </div>
            </div>
          </div>

          {/* Slider Controllers & Presets */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Curve Formulas & Presets</h3>
              <p className="text-xs text-slate-500">Pick any core function to instantly recalculate coordinates.</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'quadratic', label: 'Quadratic Parabola', desc: 'y = a * x²' },
                { id: 'sine', label: 'Sine Wave', desc: 'y = a * sin(x)' },
                { id: 'cubic', label: 'Cubic Spline', desc: 'y = a * x³' },
                { id: 'linear', label: 'Linear Gradient', desc: 'y = a * x' }
              ].map((pres) => (
                <button
                  key={pres.id}
                  onClick={() => setEquationPreset(pres.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    equationPreset === pres.id
                      ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-500 ring-2 ring-blue-500/10'
                      : 'bg-slate-50/50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">{pres.label}</span>
                  <span className="text-[10px] text-blue-500 font-mono mt-0.5 block">{pres.desc}</span>
                </button>
              ))}
            </div>

            {/* Live Slider Coefficient */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">Equation Factor (a)</span>
                <span className="font-mono font-extrabold text-blue-600 bg-blue-100/60 dark:bg-blue-950 px-2 py-0.5 rounded-lg">
                  {equationFactor.toFixed(1)}
                </span>
              </div>
              
              <input
                type="range"
                min="-5"
                max="5"
                step="0.5"
                value={equationFactor}
                onChange={(e) => setEquationFactor(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-[10px] text-slate-400 block text-center">Slide to dynamically transform coordinates & watch vector transform!</span>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'grades' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* Scores input cards */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 space-y-5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Internal Weighted Marks Calculator</h3>
              <p className="text-xs text-slate-500">Calculate grade estimates by typing assignments and test values.</p>
            </div>

            <div className="space-y-4">
              {/* Assignment Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Continuous Evaluation (Weight: 20%)</label>
                  <span className="font-mono text-slate-500">{assignmentScore} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={assignmentScore}
                  onChange={(e) => setAssignmentScore(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Midterm Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Mid-Semester Exam (Weight: 30%)</label>
                  <span className="font-mono text-slate-500">{midtermScore} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={midtermScore}
                  onChange={(e) => setMidtermScore(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Endterm Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300">End-Semester Exam (Weight: 50%)</label>
                  <span className="font-mono text-slate-500">{endtermScore} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={endtermScore}
                  onChange={(e) => setEndtermScore(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Calculated Output Card */}
          <div className="lg:col-span-5 bg-gradient-to-tr from-slate-900 to-indigo-950 rounded-3xl p-6 text-white flex flex-col justify-between border border-indigo-900/60 shadow-xl">
            <div>
              <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block mb-2">Math Grading Output</span>
              <h3 className="text-base sm:text-lg font-bold">Estimated Internal Grade</h3>
            </div>

            <div className="py-6 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-3xl sm:text-4xl font-black block tracking-tight">
                  {weightedTotal}%
                </span>
                <span className="text-xs text-indigo-300 block font-medium">Weighted Course Score</span>
              </div>

              <div className="text-right">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20 ml-auto">
                  <span className="text-2xl font-black text-amber-400">{currentGrade.char}</span>
                </div>
                <span className={`text-[11px] font-bold mt-1.5 block ${currentGrade.color}`}>{currentGrade.label}</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 text-xs text-indigo-200 leading-relaxed">
              Based on the standard Indian higher education framework (UGC Guidelines) for Continuous Assessment (CA) modules.
            </div>
          </div>

        </div>
      )}

      {activeTab === 'teachers' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 p-6 text-left space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Mathematics Faculty & Office Hours</h3>
            <p className="text-xs text-slate-500">Contact professors directly for academic counsel or doubt resolution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MATHEMATICS_TEACHERS.map((teacher) => (
              <div key={teacher.id} className="p-4 bg-slate-50/60 dark:bg-zinc-800/40 rounded-2xl border border-slate-200/60 dark:border-zinc-700/50 hover:border-blue-400 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm">
                    {teacher.name.split(' ').pop()?.[0]}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">{teacher.name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold block">{teacher.specialization}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-zinc-700/60 pt-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Office Hours:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{teacher.availableHours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-bold text-blue-500 truncate max-w-[120px]">{teacher.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
