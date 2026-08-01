import React, { useState } from 'react';
import { 
  TrendingUp, 
  Search, 
  Plus, 
  Award, 
  Briefcase, 
  CheckCircle2, 
  HelpCircle, 
  TrendingDown, 
  Percent,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CompanyDrive {
  id: string;
  name: string;
  role: string;
  package: string; // e.g. "12 LPA"
  date: string;
  status: 'Open' | 'Closed' | 'Applied';
  eligibility: string;
}

const INITIAL_DRIVES: CompanyDrive[] = [
  { id: '1', name: 'Google India', role: 'Software Engineer (SWE-1)', package: '32 LPA', date: 'Aug 12, 2026', status: 'Open', eligibility: 'B.Tech CSE/ECE, CGPA >= 8.0' },
  { id: '2', name: 'Microsoft Research', role: 'Research Intern / AI Associate', package: '24 LPA', date: 'Aug 15, 2026', status: 'Open', eligibility: 'CSE / Math, CGPA >= 8.5' },
  { id: '3', name: 'TCS Digital', role: 'Systems Engineer', package: '7.5 LPA', date: 'Aug 20, 2026', status: 'Open', eligibility: 'All Streams, No Active Backlogs' },
  { id: '4', name: 'Infosys Power Programmer', role: 'Specialist Programmer', package: '9.5 LPA', date: 'Aug 22, 2026', status: 'Open', eligibility: 'CSE / IT / MCA, CGPA >= 6.5' }
];

export const PlacementView: React.FC = () => {
  const { currentPreset } = useTheme();
  const [activeTab, setActiveTab] = useState<'drives' | 'resume' | 'leaderboard'>('drives');
  const [drives, setDrives] = useState<CompanyDrive[]>(INITIAL_DRIVES);
  
  // Resume Evaluator States
  const [resumeText, setResumeText] = useState('');
  const [resumeResult, setResumeResult] = useState<{
    score: number;
    matched: string[];
    missing: string[];
    feedback: string[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Offers Leaders List
  const placedLeaders = [
    { name: 'Karan Sharma', company: 'Google India', package: '32 LPA', stream: 'B.Tech CSE' },
    { name: 'Esha Reddy', company: 'Microsoft Research', package: '24 LPA', stream: 'B.Tech CSE' },
    { name: 'Siddharth Sen', company: 'Deloitte US', package: '12 LPA', stream: 'B.Com Management' },
    { name: 'Rohit Kulkarni', company: 'Cognizant GenC', package: '6.5 LPA', stream: 'BCA IT' }
  ];

  // Action: Apply for a drive
  const handleApplyDrive = (id: string) => {
    setDrives(prev => prev.map(dr => {
      if (dr.id === id) {
        return { ...dr, status: 'Applied' };
      }
      return dr;
    }));
  };

  // Action: Evaluate Resume keywords dynamically
  const handleAnalyzeResume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setIsAnalyzing(true);
    setResumeResult(null);

    setTimeout(() => {
      const lowerText = resumeText.toLowerCase();
      
      const keywords = [
        { term: 'react', label: 'React.js Web Dev Framework' },
        { term: 'node', label: 'Node.js Backend Server' },
        { term: 'python', label: 'Python Programming' },
        { term: 'sql', label: 'Relational Database SQL Queries' },
        { term: 'data structures', label: 'Data Structures & Algorithms' },
        { term: 'oops', label: 'Object Oriented Programming' },
        { term: 'cloud', label: 'Cloud Deployment (AWS/GCP)' },
        { term: 'git', label: 'Git Version Control' }
      ];

      const matched: string[] = [];
      const missing: string[] = [];
      let calculatedScore = 40; // Base score

      keywords.forEach(kw => {
        if (lowerText.includes(kw.term)) {
          matched.push(kw.label);
          calculatedScore += 7.5;
        } else {
          missing.push(kw.label);
        }
      });

      // Bonus points for mentioning CGPA or Projects
      if (lowerText.includes('project') || lowerText.includes('portfolio')) calculatedScore += 5;
      if (lowerText.includes('internship')) calculatedScore += 5;

      calculatedScore = Math.min(100, Math.round(calculatedScore));

      // Construct customized actionable advice
      const feedback: string[] = [];
      if (calculatedScore < 60) {
        feedback.push('Action Required: Add critical Computer Science foundational subjects (OOPs, SQL).');
        feedback.push('Recommendation: Describe at least 2 complete full-stack project structures.');
      } else if (calculatedScore < 85) {
        feedback.push('Good Effort: Add technical keyword strings like "Git", "GCP Cloud" or "AWS" to pass initial screening.');
        feedback.push('Advice: Detail your role and contribution inside your academic capstones.');
      } else {
        feedback.push('Exceptional Score: Your resume is heavily optimized for technical ATS screening filters!');
        feedback.push('Pro-tip: Focus heavily on practicing whiteboard binary tree algorithms for Google/Microsoft boards.');
      }

      setResumeResult({
        score: calculatedScore,
        matched,
        missing,
        feedback
      });
      setIsAnalyzing(false);
    }, 900);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Training & Placement Cell</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Campus Drives, Automated Resume ATS Evaluators, Placement Statistics</p>
          </div>
        </div>

        {/* Tab Selectors */}
        <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl border border-slate-200/40 dark:border-zinc-700/40">
          {[
            { id: 'drives', label: 'Active Drives', icon: Briefcase },
            { id: 'resume', label: 'Resume Reviewer', icon: FileCheck2 },
            { id: 'leaderboard', label: 'Leaderboard', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white shadow-sm'
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

      {/* Drives Content */}
      {activeTab === 'drives' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 p-6 space-y-6 text-left shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Campus Recruitment Drives</h3>
            <p className="text-xs text-slate-500">Live eligibility guidelines and application counters for tier-1 companies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drives.map((drive) => (
              <div 
                key={drive.id} 
                className="p-5 bg-slate-50/60 dark:bg-zinc-800/20 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">{drive.name}</h4>
                      <span className="text-[11px] font-bold text-slate-400">{drive.role}</span>
                    </div>

                    <span className="text-xs font-black bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-lg">
                      {drive.package}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 text-[11px] space-y-1 text-slate-500">
                    <div><span className="font-bold text-slate-400">Eligibility:</span> {drive.eligibility}</div>
                    <div><span className="font-bold text-slate-400">Drive Date:</span> {drive.date}</div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Passcode Required</span>
                  
                  {drive.status === 'Applied' ? (
                    <span className="text-xs font-extrabold text-emerald-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Application Lodged</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApplyDrive(drive.id)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resume ATS Reviewer Content */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* Input Box */}
          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Dynamic ATS Keyword Scorer</h3>
              <p className="text-xs text-slate-500">Paste your technical skills or complete resume text to evaluate index score.</p>
            </div>

            <form onSubmit={handleAnalyzeResume} className="space-y-4">
              <textarea
                required
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste professional skills list, summary or coursework details here...&#10;e.g. React Developer with skills in Python, Git and SQL queries. Built active projects..."
                className="w-full min-h-[180px] p-4 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-mono"
              />

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    <span>Analyzing Syntax & Hashing Index...</span>
                  </>
                ) : (
                  <span>Evaluate Resume ATS Score</span>
                )}
              </button>
            </form>
          </div>

          {/* Results Analysis Box */}
          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200/60 dark:border-zinc-800/80 flex flex-col justify-between">
            {resumeResult ? (
              <div className="space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-zinc-800/80">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ATS MATCH RATE</span>
                    <h4 className="text-base font-black text-slate-800 dark:text-slate-200">Screening Scorecard</h4>
                  </div>
                  <div className="text-right">
                    <span className={`text-3xl font-black block ${
                      resumeResult.score >= 80 ? 'text-emerald-500' : resumeResult.score >= 60 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {resumeResult.score}%
                    </span>
                  </div>
                </div>

                {/* Matched / Missing pills */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Matched Terms Found</span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {resumeResult.matched.map((mat, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">
                          ✓ {mat.split(' ')[0]}
                        </span>
                      ))}
                      {resumeResult.matched.length === 0 && <span className="text-xs text-slate-400">None detected.</span>}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Critical Keywords Missing</span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {resumeResult.missing.map((mis, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 font-bold">
                          ✗ {mis.split(' ')[0]}
                        </span>
                      ))}
                      {resumeResult.missing.length === 0 && <span className="text-xs text-slate-400">Perfect keyword matching!</span>}
                    </div>
                  </div>
                </div>

                {/* Advice bullet points */}
                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 space-y-2 text-xs">
                  <span className="font-bold text-slate-500 block">Personalized Action Items:</span>
                  {resumeResult.feedback.map((bullet, i) => (
                    <p key={i} className="text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                      • {bullet}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-center text-slate-500">
                <Briefcase className="w-10 h-10 mb-2 text-slate-400" />
                <span className="text-xs font-bold">Ready to Scan</span>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">Submit your technical profile details on the left to verify corporate eligibility scores.</p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[10px] text-slate-400 leading-relaxed">
              * Note: ATS indexing replicates common corporate screeners like Taleo, Workday and iCIMS algorithm formulas.
            </div>
          </div>

        </div>
      )}

      {/* Leaderboard Content */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 overflow-hidden text-left shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Corporate Selection Hall of Fame</h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Top student offers achieved during the ongoing placement session.</p>
            </div>
            
            <span className="text-xs bg-amber-500/10 text-amber-600 px-3 py-1 rounded-xl font-bold flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span>Highest Package: 32 LPA</span>
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {placedLeaders.map((leader, index) => (
              <div key={index} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-zinc-800/10">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                    index === 0 
                      ? 'bg-amber-500 text-white shadow-md' 
                      : index === 1 
                      ? 'bg-slate-400 text-white' 
                      : 'bg-amber-700/10 text-amber-800'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">{leader.name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold block">{leader.stream}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 block">{leader.company}</span>
                  <span className="text-[10px] font-bold text-amber-500 block">Offer: {leader.package}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
