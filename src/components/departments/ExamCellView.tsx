import React, { useState, useRef } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  QrCode, 
  Printer, 
  CheckCircle2, 
  FileText, 
  FileSignature,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { QRCodeSVG } from 'qrcode.react';

interface SubjectGrade {
  id: string;
  name: string;
  credits: number;
  gradeValue: number; // 10 = O, 9 = A+, 8 = A, 7 = B+, 6 = B, 0 = F
  gradeChar: string;
}

export const ExamCellView: React.FC = () => {
  const { currentPreset } = useTheme();
  const [activeTab, setActiveTab] = useState<'calculator' | 'hallticket' | 'schedule'>('calculator');
  
  // CGPA Calculator States
  const [gradesList, setGradesList] = useState<SubjectGrade[]>([
    { id: '1', name: 'Design and Analysis of Algorithms', credits: 4, gradeValue: 9, gradeChar: 'A+' },
    { id: '2', name: 'Linear Algebra & Calculus', credits: 4, gradeValue: 10, gradeChar: 'O' },
    { id: '3', name: 'Software Engineering Capstone', credits: 3, gradeValue: 8, gradeChar: 'A' },
    { id: '4', name: 'Social Service Community Lab', credits: 2, gradeValue: 10, gradeChar: 'O' }
  ]);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCredits, setNewSubCredits] = useState(4);
  const [newSubGrade, setNewSubGrade] = useState('10');

  // Hall Ticket States
  const [studentName, setStudentName] = useState('Karan Sharma');
  const [rollNumber, setRollNumber] = useState('CSE-2026-089');
  const [branchName, setBranchName] = useState('Computer Science Department');
  const [semesterCode, setSemesterCode] = useState('Semester VI');
  const [hallTicketGenerated, setHallTicketGenerated] = useState(false);
  const hallTicketRef = useRef<HTMLDivElement>(null);

  // Grade mapping
  const getGradeChar = (val: string) => {
    switch (val) {
      case '10': return 'O';
      case '9': return 'A+';
      case '8': return 'A';
      case '7': return 'B+';
      case '6': return 'B';
      default: return 'F';
    }
  };

  // Add course grade
  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    const gVal = parseInt(newSubGrade);
    const newGrade: SubjectGrade = {
      id: Date.now().toString(),
      name: newSubName.trim(),
      credits: newSubCredits,
      gradeValue: gVal,
      gradeChar: getGradeChar(newSubGrade)
    };

    setGradesList(prev => [...prev, newGrade]);
    setNewSubName('');
  };

  // Remove grade
  const handleRemoveGrade = (id: string) => {
    setGradesList(prev => prev.filter(g => g.id !== id));
  };

  // Compute SGPA
  const totalCredits = gradesList.reduce((acc, curr) => acc + curr.credits, 0);
  const weightedSum = gradesList.reduce((acc, curr) => acc + (curr.credits * curr.gradeValue), 0);
  const calculatedSGPA = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : '0.00';

  // Print Hall Ticket trigger
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Examination Cell</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">CGPA Calculators, Hall Ticket Builders, University Official Timetables</p>
          </div>
        </div>

        {/* Tab Selectors */}
        <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl border border-slate-200/40 dark:border-zinc-700/40">
          {[
            { id: 'calculator', label: 'GPA Calculator', icon: FileText },
            { id: 'hallticket', label: 'Hall Ticket Creator', icon: FileSignature },
            { id: 'schedule', label: 'Exam Schedules', icon: Printer }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-rose-600 text-white shadow-sm'
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

      {/* Tabs Display */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* Left: Input Course Grades */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Continuous Grade Estimator</h3>
              <p className="text-xs text-slate-500">Add course modules and semester grades to evaluate GPA scores.</p>
            </div>

            <form onSubmit={handleAddGrade} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Course Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discrete Structures"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Credits</label>
                  <select
                    value={newSubCredits}
                    onChange={(e) => setNewSubCredits(parseInt(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="4">4 Credits</option>
                    <option value="3">3 Credits</option>
                    <option value="2">2 Credits</option>
                    <option value="1">1 Credit</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Grade Letter</label>
                  <select
                    value={newSubGrade}
                    onChange={(e) => setNewSubGrade(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="10">Outstanding (O)</option>
                    <option value="9">Excellent (A+)</option>
                    <option value="8">Very Good (A)</option>
                    <option value="7">Good (B+)</option>
                    <option value="6">Above Average (B)</option>
                    <option value="0">Fail (F)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subject Row</span>
              </button>
            </form>
          </div>

          {/* Right: Calculated Grades Table & Summary */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Registered Subjects Sheet</h3>
                <span className="text-xs font-mono font-bold text-rose-600">Total Credits: {totalCredits}</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 max-h-[180px] overflow-y-auto">
                {gradesList.map((g) => (
                  <div key={g.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-zinc-800/10">
                    <div className="max-w-[280px]">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{g.name}</h4>
                      <span className="text-[10px] text-slate-400 font-bold block">{g.credits} Credits • Point Factor: {g.gradeValue}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-rose-600">
                        {g.gradeChar}
                      </span>
                      <button
                        onClick={() => handleRemoveGrade(g.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final SGPA scoreboard card */}
            <div className="p-6 bg-gradient-to-tr from-slate-900 to-rose-950 rounded-3xl text-white border border-rose-900/40 flex justify-between items-center shadow-lg">
              <div>
                <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-widest block mb-1">CUMULATIVE METRIC</span>
                <h3 className="text-base sm:text-lg font-black">Estimated Semester GPA</h3>
                <p className="text-[11px] text-rose-200 mt-1">Based on UGC Choice Based Credit System (CBCS) scales.</p>
              </div>

              <div className="text-right">
                <span className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight block">
                  {calculatedSGPA}
                </span>
                <span className="text-xs text-rose-300 block font-bold">SGPA Score</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Hall Ticket Content */}
      {activeTab === 'hallticket' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* Left inputs */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Hall Ticket Generator</h3>
              <p className="text-xs text-slate-500">Fill student details to compile university examinations permission card.</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Student Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => { setStudentName(e.target.value); setHallTicketGenerated(false); }}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">University Roll Number</label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => { setRollNumber(e.target.value); setHallTicketGenerated(false); }}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Academic Branch</label>
                <select
                  value={branchName}
                  onChange={(e) => { setBranchName(e.target.value); setHallTicketGenerated(false); }}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="Computer Science Department">Computer Science (CSE)</option>
                  <option value="Mathematics Department">Mathematics Department</option>
                  <option value="Physics Department">Physics Department</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Semester Term</label>
                <select
                  value={semesterCode}
                  onChange={(e) => { setSemesterCode(e.target.value); setHallTicketGenerated(false); }}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="Semester I">Semester I</option>
                  <option value="Semester II">Semester II</option>
                  <option value="Semester IV">Semester IV</option>
                  <option value="Semester VI">Semester VI</option>
                  <option value="Semester VIII">Semester VIII</option>
                </select>
              </div>

              <button
                onClick={() => setHallTicketGenerated(true)}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md"
              >
                Generate Pass
              </button>
            </div>
          </div>

          {/* Right printable sheet preview */}
          <div className="lg:col-span-7 space-y-4">
            {hallTicketGenerated ? (
              <div className="space-y-4">
                <div 
                  ref={hallTicketRef}
                  className="p-6 bg-white border-2 border-slate-900 text-slate-950 rounded-2xl shadow-xl flex flex-col justify-between min-h-[300px]"
                >
                  {/* Official Header */}
                  <div className="text-center border-b border-slate-900 pb-4 space-y-1">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Official Exam Admission Gatepass</h2>
                    <h3 className="text-base font-black uppercase tracking-tight text-slate-900">Goa University & College Board</h3>
                    <p className="text-[10px] text-slate-400 font-bold">OFFICIAL CONTROLLER OF EXAMINATIONS COPY</p>
                  </div>

                  {/* Body grid */}
                  <div className="grid grid-cols-12 gap-4 py-4 items-center">
                    <div className="col-span-8 space-y-3 text-left">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Student Name</span>
                        <span className="text-sm font-black text-slate-950">{studentName}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Roll No</span>
                          <span className="text-xs font-black text-slate-950">{rollNumber}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Semester</span>
                          <span className="text-xs font-black text-slate-950">{semesterCode}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Authorizing Branch</span>
                        <span className="text-xs font-extrabold text-slate-850">{branchName}</span>
                      </div>
                    </div>

                    {/* Dynamic QR Code representation */}
                    <div className="col-span-4 flex flex-col items-center justify-center p-3 border border-slate-200 rounded-xl bg-slate-50">
                      <QRCodeSVG 
                        value={`exam-gatepass://student=${studentName}&roll=${rollNumber}&branch=${branchName}&sem=${semesterCode}`} 
                        size={80}
                      />
                      <span className="text-[8px] font-mono font-bold text-slate-500 mt-2">GATE_SCAN_PASS</span>
                    </div>
                  </div>

                  {/* Official signature block */}
                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-[10px] text-slate-400">
                    <div>
                      <span>Status: <span className="text-emerald-600 font-extrabold">APPROVED & SIGNED</span></span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[9px] block">GU-EC-CONTROLLER-SIGNED-HASH</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Hall Pass</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 rounded-3xl min-h-[280px] flex flex-col items-center justify-center text-slate-500 shadow-sm">
                <FileSignature className="w-12 h-12 mb-2 text-slate-400" />
                <span className="text-xs font-bold">Hall Ticket Pending Compile</span>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">Configure student identity details on the left, then click Generate Pass to view official admission ticket.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 p-6 text-left space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Official End-Semester Exam Schedule</h3>
            <p className="text-xs text-slate-500">Unified board timetables, exam room seat map lists and dates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: '1', paper: 'CS602: Analysis of Algorithms', date: 'Aug 17, 10:00 AM', room: 'Hall 302, Block B' },
              { id: '2', paper: 'MA601: Applied Probability', date: 'Aug 19, 10:00 AM', room: 'Auditorium Box 1' },
              { id: '3', paper: 'CS604: Operating Systems Core', date: 'Aug 21, 10:00 AM', room: 'Hall 404, Block C' }
            ].map((sched) => (
              <div key={sched.id} className="p-4 bg-slate-50/60 dark:bg-zinc-800/40 rounded-2xl border border-slate-200/60 dark:border-zinc-700/50 hover:border-rose-500 transition-all">
                <div className="space-y-1 mb-4">
                  <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-widest block">OFFICIAL PAPER</span>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">{sched.paper}</h4>
                </div>

                <div className="border-t border-slate-100 dark:border-zinc-700/60 pt-3 space-y-1 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Session:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{sched.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{sched.room}</span>
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
