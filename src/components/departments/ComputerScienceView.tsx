import React, { useState } from 'react';
import { 
  Sparkles, 
  Terminal, 
  UserCheck, 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Send,
  Code2,
  Users,
  Search,
  Plus,
  RefreshCw,
  Award,
  GraduationCap,
  Volume2,
  Trash2,
  Check,
  X,
  PlusCircle,
  Clock,
  BookMarked
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Student {
  id: string;
  name: string;
  rollNo: string;
  batch: string;
  attendanceRate: number;
  presentToday: boolean;
  labSubmission: 'Submitted' | 'Pending' | 'Graded';
  grade?: string;
  submittedCode?: string;
}

const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Arun Kumar', rollNo: 'CS202601', batch: 'CS-A', attendanceRate: 85, presentToday: true, labSubmission: 'Graded', grade: 'A+' },
  { id: '2', name: 'Bhumika Sen', rollNo: 'CS202602', batch: 'CS-A', attendanceRate: 92, presentToday: true, labSubmission: 'Graded', grade: 'A' },
  { id: '3', name: 'Chaitanya Das', rollNo: 'CS202603', batch: 'CS-B', attendanceRate: 74, presentToday: false, labSubmission: 'Submitted', grade: 'B' },
  { id: '4', name: 'Deven Patil', rollNo: 'CS202604', batch: 'CS-B', attendanceRate: 88, presentToday: true, labSubmission: 'Pending' },
  { id: '5', name: 'Esha Reddy', rollNo: 'CS202605', batch: 'CS-A', attendanceRate: 95, presentToday: true, labSubmission: 'Graded', grade: 'O' },
  { id: '6', name: 'Farhan Sheikh', rollNo: 'CS202606', batch: 'CS-B', attendanceRate: 81, presentToday: true, labSubmission: 'Submitted' }
];

interface FacultyMember {
  id: string;
  name: string;
  role: string;
  subject: string;
  hours: number;
  status: 'Active' | 'On Leave';
}

interface Notice {
  id: string;
  title: string;
  content: string;
  publishedBy: string;
  date: string;
  important: boolean;
}

interface LabTask {
  id: string;
  name: string;
  code: string;
  status: 'Pending' | 'Submitted' | 'Graded';
  grade?: string;
  remarks?: string;
}

interface ComputerScienceViewProps {
  user?: {
    name: string;
    email: string;
    role: string;
    photoUrl?: string;
  } | null;
}

export const ComputerScienceView: React.FC<ComputerScienceViewProps> = ({ user }) => {
  const { currentPreset } = useTheme();
  
  // Detect current role in CS department (HOD, Teacher/Librarian, or Student)
  const isHOD = user?.role === 'HOD';
  const isTeacher = user?.role === 'Teacher' || user?.role === 'Librarian' || user?.role === 'Admin';
  const isStudent = !isHOD && !isTeacher;

  // Active Tab: varies depending on role
  const [activeTab, setActiveTab] = useState<'attendance' | 'labs' | 'ai_assistant' | 'sandbox' | 'hod_panel' | 'student_labs'>(
    isStudent ? 'student_labs' : isHOD ? 'hod_panel' : 'attendance'
  );

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [selectedBatch, setSelectedBatch] = useState<'All' | 'CS-A' | 'CS-B'>('All');
  
  // Notices state
  const [notices, setNotices] = useState<Notice[]>([
    { 
      id: '1', 
      title: 'Practical Lab Exam Timetable', 
      content: 'Lab exams for CS-A & CS-B batches are scheduled for next Tuesday, Aug 4th. Carry clean verified files.', 
      publishedBy: 'Dr. Ramesh Naik (HOD)', 
      date: 'Today', 
      important: true 
    },
    { 
      id: '2', 
      title: 'Final Major Project Submission', 
      content: 'All final year CS students must present progress reports to their assigned project guides by Friday.', 
      publishedBy: 'Dr. Ramesh Naik (HOD)', 
      date: 'Yesterday', 
      important: false 
    }
  ]);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeImportant, setNewNoticeImportant] = useState(false);

  // Faculty State (Exactly 4 members total, as described by the user)
  const [faculty, setFaculty] = useState<FacultyMember[]>([
    { id: '1', name: 'Dr. Ramesh Naik', role: 'Head of Department (HOD)', subject: 'Theory of Computation', hours: 8, status: 'Active' },
    { id: '2', name: 'Dr. Neha Patel', role: 'Sr. Assistant Professor', subject: 'Data Structures & Algorithms', hours: 14, status: 'Active' },
    { id: '3', name: 'Prof. Alok Ranjan', role: 'Assistant Professor', subject: 'Database Systems (DBMS)', hours: 12, status: 'Active' },
    { id: '4', name: 'Prof. Sanjay Sen', role: 'Lecturer', subject: 'Computer Networks', hours: 16, status: 'Active' }
  ]);
  const [editingFacultyId, setEditingFacultyId] = useState<string | null>(null);
  const [editingHours, setEditingHours] = useState<number>(0);
  const [editingSubject, setEditingSubject] = useState('');

  // Student perspective Practical Lab Tasks
  const [studentLabs, setStudentLabs] = useState<LabTask[]>([
    { id: 'CS202-P1', name: 'Lab 1: Stack Implementation using Array', status: 'Graded', grade: 'A+', remarks: 'Excellent code spacing and complexity consideration.', code: '// Stack implementation in JS\nclass Stack {\n  constructor() {\n    this.items = [];\n  }\n  push(element) { this.items.push(element); }\n  pop() { return this.items.pop(); }\n}' },
    { id: 'CS202-P2', name: 'Lab 2: Dynamic Quick Sort Algorithm', status: 'Submitted', code: '// Quick Sort implementation\nfunction quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  const pivot = arr[0];\n  const left = [], right = [];\n  for (let i = 1; i < arr.length; i++) {\n    if (arr[i] < pivot) left.push(arr[i]);\n    else right.push(arr[i]);\n  }\n  return [...quickSort(left), pivot, ...quickSort(right)];\n}' },
    { id: 'CS202-P3', name: 'Lab 3: Binary Search Tree Traversal', status: 'Pending', code: '' }
  ]);
  const [activeSubmittingLabId, setActiveSubmittingLabId] = useState<string | null>(null);
  const [submissionCodeInput, setSubmissionCodeInput] = useState('');

  // AI Sandbox states
  const [codeQuery, setCodeQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [sandboxLanguage, setSandboxLanguage] = useState('javascript');
  const [sandboxCode, setSandboxCode] = useState(`// Quick Sort Implementation in JavaScript
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  let pivot = arr[0];
  let left = [], right = [];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}

console.log(quickSort([5, 3, 8, 4, 1, 7, 2]));`);
  const [outputConsole, setOutputConsole] = useState('');

  // Grading approvals queue for HOD
  const [gradeApprovals, setGradeApprovals] = useState([
    { id: '1', studentName: 'Arun Kumar', subject: 'Lab 2: Quick Sort', grade: 'A+', preparedBy: 'Dr. Neha Patel', approved: false },
    { id: '2', studentName: 'Bhumika Sen', subject: 'Lab 2: Quick Sort', grade: 'A', preparedBy: 'Dr. Neha Patel', approved: false },
    { id: '3', studentName: 'Chaitanya Das', subject: 'Lab 1: Stack & Queue', grade: 'B', preparedBy: 'Prof. Alok Ranjan', approved: false }
  ]);

  // Attendance controls
  const handleToggleAttendance = (id: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const wasPresent = s.presentToday;
        const newRate = wasPresent 
          ? Math.max(0, s.attendanceRate - 2) 
          : Math.min(100, s.attendanceRate + 2);
        return { ...s, presentToday: !wasPresent, attendanceRate: Math.round(newRate) };
      }
      return s;
    }));
  };

  const handleMarkAllPresent = () => {
    setStudents(prev => prev.map(s => {
      if (selectedBatch === 'All' || s.batch === selectedBatch) {
        const newRate = s.presentToday ? s.attendanceRate : Math.min(100, s.attendanceRate + 2);
        return { ...s, presentToday: true, attendanceRate: Math.round(newRate) };
      }
      return s;
    }));
  };

  // Lab Submission Action
  const handleGradeLab = (id: string, grade: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, labSubmission: 'Graded', grade };
      }
      return s;
    }));
  };

  // Student Submits Lab Code
  const handleStudentSubmitLab = (labId: string) => {
    if (!submissionCodeInput.trim()) return;
    setStudentLabs(prev => prev.map(lab => {
      if (lab.id === labId) {
        return {
          ...lab,
          status: 'Submitted',
          code: submissionCodeInput
        };
      }
      return lab;
    }));
    // Add student submission to teacher's view dynamically
    const newStudentSub: Student = {
      id: String(students.length + 1),
      name: user?.name || 'You',
      rollNo: 'CS202607',
      batch: 'CS-A',
      attendanceRate: 90,
      presentToday: true,
      labSubmission: 'Submitted',
      submittedCode: submissionCodeInput
    };
    setStudents(prev => [...prev, newStudentSub]);
    setActiveSubmittingLabId(null);
    setSubmissionCodeInput('');
  };

  // Notice creation by HOD
  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;
    const newNotice: Notice = {
      id: String(notices.length + 1),
      title: newNoticeTitle,
      content: newNoticeContent,
      publishedBy: `${user?.name || 'Dr. Ramesh Naik'} (HOD)`,
      date: 'Today',
      important: newNoticeImportant
    };
    setNotices([newNotice, ...notices]);
    setNewNoticeTitle('');
    setNewNoticeContent('');
    setNewNoticeImportant(false);
  };

  // Notice deletion
  const handleDeleteNotice = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
  };

  // Faculty hour editing
  const handleSaveFacultyHours = (id: string) => {
    setFaculty(prev => prev.map(fac => {
      if (fac.id === id) {
        return { ...fac, hours: editingHours, subject: editingSubject };
      }
      return fac;
    }));
    setEditingFacultyId(null);
  };

  // HOD Grade Approvals
  const handleApproveGrade = (id: string) => {
    setGradeApprovals(prev => prev.map(app => {
      if (app.id === id) {
        return { ...app, approved: true };
      }
      return app;
    }));
  };

  // Run Sandbox Code Simulator
  const handleRunCode = () => {
    setOutputConsole('Compiling and executing in standard sandbox...\n');
    setTimeout(() => {
      if (sandboxLanguage === 'javascript') {
        try {
          setOutputConsole(prev => prev + 'Console Output:\n[ 1, 2, 3, 4, 5, 7, 8 ]\n\nExecution successful (took 42ms)');
        } catch (err: any) {
          setOutputConsole(prev => prev + `Error: ${err.message}`);
        }
      } else {
        setOutputConsole(prev => prev + 'Console Output:\nPython Environment Initialized successfully!\nHello CS Department!\nExecution successful (took 38ms)');
      }
    }, 600);
  };

  // Ask AI Assistant Handler
  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeQuery.trim()) return;

    setIsAiLoading(true);
    setAiResponse('');

    setTimeout(() => {
      const queryLower = codeQuery.toLowerCase();
      let answer = '';

      if (queryLower.includes('bubble') || queryLower.includes('sort')) {
        answer = `### Bubble Sort Algorithm Explanation 📊
Bubble Sort is a simple comparison-based sorting algorithm where adjacent elements are compared and swapped if they are in the wrong order. This process is repeated until the list is sorted.

**Complexity Analysis:**
- **Time Complexity:** O(N²) (Worst & Average case), O(N) (Best Case, if already sorted)
- **Space Complexity:** O(1) (In-place sorting)

**Code Blueprint (Python):**
\`\`\`python
def bubbleSort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr
\`\`\``;
      } else if (queryLower.includes('binary search') || queryLower.includes('search')) {
        answer = `### Binary Search Algorithm 🔍
Binary Search is a highly efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item.

**Complexity:**
- **Time Complexity:** O(log N)
- **Space Complexity:** O(1) (Iterative)

**Code Blueprint (JavaScript):**
\`\`\`javascript
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
\`\`\``;
      } else if (queryLower.includes('project') || queryLower.includes('idea')) {
        answer = `### Top 3 Computer Science Major Project Blueprints 🚀

1. **Smart Campus Navigation & Library Locator (Web App)**
   - **Tech Stack:** React, Tailwind CSS, Express, SQLite
   - **Key Feature:** QR-based search, responsive map, semantic AI search engine.

2. **Distributed File Sync with Cryptographic Verification**
   - **Tech Stack:** Go/Rust, SHA-256 Hashing, WebSockets
   - **Key Feature:** Peer-to-peer fast syncing of practical lab files.

3. **Autonomous Code Quality Reviewer & Linter**
   - **Tech Stack:** Node.js, Abstract Syntax Trees (AST), Gemini API
   - **Key Feature:** Automated code feedback and complexity metrics scorecard.`;
      } else {
        answer = `### Computer Science Assistant Response 💻
Here is a conceptual breakdown of your query about **"${codeQuery}"**:

1. **Core Concept:** Under modern software engineering and systems architecture, this topic addresses algorithmic complexity and resource management.
2. **Implementation Strategy:** Keep your logic modular, minimize memory footprints, and utilize proper data structures (such as HashMaps, Stacks, or Heaps) for optimal retrieval speeds.
3. **Best Practice:** Always handle edge cases (e.g., null pointers, empty arrays, division by zero) and document your functions cleanly.

**Quick Demo Snippet (JavaScript):**
\`\`\`javascript
// Standard robust execution wrapper
const runTask = (input) => {
  if (!input) return { status: 'empty' };
  console.log("Processing item:", input);
  return { status: 'processed', data: input };
};
\`\`\``;
      }

      setAiResponse(answer);
      setIsAiLoading(false);
    }, 800);
  };

  const filteredStudents = selectedBatch === 'All' 
    ? students 
    : students.filter(s => s.batch === selectedBatch);

  const presentCount = filteredStudents.filter(s => s.presentToday).length;
  const attendancePercentage = filteredStudents.length > 0 
    ? Math.round((presentCount / filteredStudents.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Title Header with user specific greeting and custom color accent */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm text-left">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
            <Terminal className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Computer Science Department</h2>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                isHOD 
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-300' 
                  : isTeacher 
                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-300'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300'
              }`}>
                {isHOD ? 'HOD View' : isTeacher ? 'Faculty View' : 'Student View'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Logged in: <strong className="text-slate-700 dark:text-slate-200">{user?.name || 'Demo User'}</strong> ({user?.email})
            </p>
          </div>
        </div>

        {/* Tab Selector adapted according to roles */}
        <div className="flex flex-wrap bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl border border-slate-200/40 dark:border-zinc-700/40">
          
          {/* HOD Specific Panel Tab */}
          {isHOD && (
            <button
              onClick={() => setActiveTab('hod_panel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'hod_panel'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>HOD Control Desk</span>
            </button>
          )}

          {/* Student Specific Lab Submission Tab */}
          {isStudent && (
            <button
              onClick={() => setActiveTab('student_labs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'student_labs'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              <span>My Practical Labs</span>
            </button>
          )}

          {/* Regular Faculty/Attendance Tab */}
          {(isHOD || isTeacher) && (
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'attendance'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Daily Attendance</span>
            </button>
          )}

          {/* Faculty/Admin view of Lab Records */}
          {(isHOD || isTeacher) && (
            <button
              onClick={() => setActiveTab('labs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'labs'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Student Submissions</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('ai_assistant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ai_assistant'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Helper</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sandbox'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Coding Sandbox</span>
          </button>
        </div>
      </div>

      {/* 1. HOD EXECUTIVE CONTROL DESK */}
      {activeTab === 'hod_panel' && isHOD && (
        <div className="space-y-6 text-left">
          
          {/* Main overview count stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-3xl border border-rose-200/50 dark:border-rose-900/30">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">Total Staff Members</span>
              <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">4 Academic Staff</div>
              <p className="text-[10px] text-slate-500 mt-1">HOD + 3 regular teachers assigned to CS subjects</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-3xl border border-purple-200/50 dark:border-purple-900/30">
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest block">Pending Notice Alerts</span>
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">{notices.length} Active Circulars</div>
              <p className="text-[10px] text-slate-500 mt-1">Displayed to all students & teachers of the department</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl border border-emerald-200/50 dark:border-emerald-900/30">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">Practical Grades Queue</span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {gradeApprovals.filter(g => !g.approved).length} Awaiting Approval
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Practical assessment sheets prepared by faculty members</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Faculty Workload Control Desk (Exactly 4 members total, satisfies HOD vs regular teacher rule) */}
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">CS Faculty Workload Allocations</h3>
                  <p className="text-[11px] text-slate-500">Manage lecturing subjects and class hours for the 4 department members.</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-lg font-bold">
                  Authorized
                </span>
              </div>

              <div className="space-y-3">
                {faculty.map((fac) => (
                  <div key={fac.id} className="p-3 bg-slate-50 dark:bg-zinc-850 rounded-2xl border border-slate-200/50 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">{fac.name}</h4>
                        <span className="text-[9px] px-1.5 py-0.2 bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-slate-300 rounded font-semibold">
                          {fac.id === '1' ? 'HOD' : 'Faculty'}
                        </span>
                      </div>
                      <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                        Subject: <span className="text-slate-600 dark:text-slate-300">{fac.subject}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Weekly Workload: {fac.hours} hours</span>
                      </p>
                    </div>

                    <div className="shrink-0">
                      {editingFacultyId === fac.id ? (
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="number"
                            value={editingHours}
                            onChange={(e) => setEditingHours(Number(e.target.value))}
                            className="w-12 p-1 text-xs bg-white dark:bg-zinc-950 border border-slate-300 rounded-lg text-slate-900 dark:text-white"
                          />
                          <input 
                            type="text"
                            value={editingSubject}
                            onChange={(e) => setEditingSubject(e.target.value)}
                            className="w-28 p-1 text-xs bg-white dark:bg-zinc-950 border border-slate-300 rounded-lg text-slate-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleSaveFacultyHours(fac.id)}
                            className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingFacultyId(fac.id);
                            setEditingHours(fac.hours);
                            setEditingSubject(fac.subject);
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-purple-500 text-slate-700 dark:text-slate-300"
                        >
                          Modify
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment Approvals Queue */}
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 space-y-4">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Practical Grade Ledger Approvals</h3>
                <p className="text-[11px] text-slate-500">Approve laboratory manual internal assessment reports submitted by CS faculty.</p>
              </div>

              <div className="space-y-3">
                {gradeApprovals.map((app) => (
                  <div key={app.id} className="p-3 bg-slate-50 dark:bg-zinc-850 rounded-2xl border border-slate-200/50 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Assessed by {app.preparedBy}</span>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{app.studentName}</h4>
                      <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">{app.subject}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-purple-600 bg-purple-100 dark:bg-purple-950 px-2.5 py-1 rounded-lg">
                        Grade {app.grade}
                      </span>
                      {app.approved ? (
                        <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Approved</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApproveGrade(app.id)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* HOD Notice Publisher Card */}
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 space-y-5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-600" />
                <span>Publish Official Department Circular / Notice</span>
              </h3>
              <p className="text-[11px] text-slate-500">Active notices are displayed on the bulletin board feed of both teachers and students instantly.</p>
            </div>

            <form onSubmit={handleAddNotice} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 space-y-2">
                <input 
                  type="text"
                  required
                  placeholder="Notice Title (e.g. Sessional Exam Prep)"
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white"
                />
                
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 select-none cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={newNoticeImportant}
                    onChange={(e) => setNewNoticeImportant(e.target.checked)}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-bold text-rose-500">Mark as Important / High Priority</span>
                </label>
              </div>

              <div className="md:col-span-2 flex gap-2">
                <textarea 
                  required
                  rows={2}
                  placeholder="Detailed circular notice message body context..."
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  className="flex-grow p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white"
                />
                
                <button
                  type="submit"
                  className="px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex flex-col justify-center items-center shrink-0 gap-1"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Publish</span>
                </button>
              </div>
            </form>

            {/* List of current notices with deletion control for HOD */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Currently Live Bulletin Board:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {notices.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-50 dark:bg-zinc-850 rounded-2xl border border-slate-200/50 dark:border-zinc-800/80 flex justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{n.title}</h4>
                        {n.important && (
                          <span className="text-[8px] bg-rose-100 text-rose-600 px-1.5 py-0.2 rounded font-black uppercase">
                            Crucial
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{n.content}</p>
                      <span className="text-[9px] text-slate-400 font-medium block">Published by {n.publishedBy} • {n.date}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteNotice(n.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50/50 dark:hover:bg-rose-950/20 shrink-0 self-start"
                      title="Delete notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. REGULAR STUDENT PERSPECTIVE: MY PRACTICAL LABS SUBMISSION BOARD */}
      {activeTab === 'student_labs' && isStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          
          {/* Left panel: notice feed and overview */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Student Personal Attendance Ledger Card */}
            <div className="p-5 bg-purple-50/50 dark:bg-purple-950/10 rounded-3xl border border-purple-200/60 dark:border-purple-900/40 space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                  Academic Roll Check
                </span>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">My Attendance Statistics</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Average</span>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">88%</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Min Criteria</span>
                  <div className="text-2xl font-black text-emerald-500 mt-1">75%</div>
                </div>
              </div>

              <div className="p-3 bg-white/60 dark:bg-zinc-900/40 rounded-xl border border-slate-100 dark:border-zinc-800 text-[10px] text-slate-500 leading-normal">
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block mb-0.5">Safe Zone Margin:</span>
                Your overall rate is excellent. You can safely skip up to 2 lectures without falling below the compulsory 75% bar.
              </div>
            </div>

            {/* Read-only circular notice board */}
            <div className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Official Department Circulars:</h4>
              <div className="space-y-3">
                {notices.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-50 dark:bg-zinc-850 rounded-xl border border-slate-200/30 dark:border-zinc-800 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-800 dark:text-slate-200">{n.title}</span>
                      {n.important && (
                        <span className="text-[8px] bg-rose-100 text-rose-600 px-1 py-0.2 rounded font-bold uppercase">Important</span>
                      )}
                    </div>
                    <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">{n.content}</p>
                    <span className="text-[9px] text-slate-400 block mt-1.5 font-semibold">By {n.publishedBy} • {n.date}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right panel: student lab tasks tracker */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 p-5 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Laboratory Practical Index</h3>
                <p className="text-xs text-slate-500">Track pending tasks, copy templates, paste and submit solutions directly for evaluations.</p>
              </div>

              <div className="space-y-3">
                {studentLabs.map((lab) => (
                  <div key={lab.id} className="p-4 bg-slate-50 dark:bg-zinc-850 rounded-2xl border border-slate-200/50 dark:border-zinc-800/80">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <code className="bg-slate-200 dark:bg-zinc-800 px-2 py-0.5 rounded font-mono text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                            {lab.id}
                          </code>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">{lab.name}</h4>
                        </div>
                        {lab.remarks && (
                          <p className="text-[10px] text-emerald-600 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                            <strong>Teacher Remarks:</strong> {lab.remarks}
                          </p>
                        )}
                      </div>

                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                        lab.status === 'Graded'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 border-emerald-300'
                          : lab.status === 'Submitted'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 border-blue-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-600 border-amber-300'
                      }`}>
                        {lab.status}
                      </span>
                    </div>

                    {/* Submitting Interface */}
                    {lab.status === 'Pending' && activeSubmittingLabId !== lab.id && (
                      <button
                        onClick={() => {
                          setActiveSubmittingLabId(lab.id);
                          setSubmissionCodeInput('');
                        }}
                        className="mt-4 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-sm"
                      >
                        Write & Submit Code
                      </button>
                    )}

                    {activeSubmittingLabId === lab.id && (
                      <div className="mt-4 space-y-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Paste Practical Solution (JS/Python):</span>
                        <textarea
                          rows={6}
                          placeholder="// Write or paste your laboratory execution solution here..."
                          value={submissionCodeInput}
                          onChange={(e) => setSubmissionCodeInput(e.target.value)}
                          className="w-full p-3 font-mono text-xs rounded-xl bg-slate-950 text-slate-100 border border-slate-800 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setActiveSubmittingLabId(null)}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleStudentSubmitLab(lab.id)}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm"
                          >
                            Submit Code
                          </button>
                        </div>
                      </div>
                    )}

                    {lab.status === 'Submitted' && (
                      <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-850">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">Your Submitted Code Block:</span>
                        <pre className="font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap">{lab.code.slice(0, 180)}...</pre>
                      </div>
                    )}

                    {lab.status === 'Graded' && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-bold">Graded by CSE Evaluator:</span>
                        <span className="text-xs font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg">
                          Grade: <strong className="text-sm">{lab.grade}</strong>
                        </span>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 3. TEACHER/ADMIN DAILY ATTENDANCE SYSTEM */}
      {activeTab === 'attendance' && (isHOD || isTeacher) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          
          {/* Left Summary Box */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-5 bg-purple-50/50 dark:bg-purple-950/10 rounded-3xl border border-purple-200/60 dark:border-purple-900/40">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">Daily Ledger Summary</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400 block font-semibold">Active Batch</span>
                  <div className="flex gap-2 mt-1">
                    {['All', 'CS-A', 'CS-B'].map((batch) => (
                      <button
                        key={batch}
                        onClick={() => setSelectedBatch(batch as any)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                          selectedBatch === batch
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {batch}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Present Today</span>
                    <div className="text-xl font-black text-emerald-500 mt-1">
                      {presentCount} / {filteredStudents.length}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Average Percentage</span>
                    <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
                      {attendancePercentage}%
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleMarkAllPresent}
                  className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-all flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Mark All Batch Present</span>
                </button>
              </div>
            </div>

            {/* General Notices list preview */}
            <div className="p-4 bg-slate-50/80 dark:bg-zinc-900/50 rounded-2xl border border-slate-200/50 dark:border-zinc-800/80">
              <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Official Bulletins ({notices.length})</h4>
              <div className="space-y-2">
                {notices.map(notice => (
                  <div key={notice.id} className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200/40 dark:border-zinc-700/40 text-[11px] leading-snug">
                    <span className="font-extrabold text-purple-600 block">{notice.title}</span>
                    <p className="text-slate-500 mt-0.5">{notice.content.slice(0, 80)}...</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Attendance Roster Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  Daily Attendance Tracker ({selectedBatch})
                </h3>
                <span className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-500 px-2.5 py-1 rounded-lg font-bold">
                  Roll Checked
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        student.presentToday 
                          ? 'bg-emerald-500/10 text-emerald-600' 
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {student.rollNo.slice(-2)}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">{student.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-400">{student.rollNo}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-[10px] font-semibold text-slate-500">Batch: {student.batch}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className={`text-[10px] font-bold ${student.attendanceRate >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            Avg: {student.attendanceRate}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleAttendance(student.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        student.presentToday
                          ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20'
                          : 'bg-rose-500/15 text-rose-500 hover:bg-rose-500/20'
                      }`}
                    >
                      {student.presentToday ? 'Present' : 'Absent'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 4. TEACHER/ADMIN STUDENT SUBMISSIONS AND GRADING PORTAL */}
      {activeTab === 'labs' && (isHOD || isTeacher) && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 p-6 space-y-6 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Practical & Lab Record Ledger</h3>
              <p className="text-xs text-slate-500">View and evaluate lab records and manual solution codes written by CS students.</p>
            </div>
            
            <span className="text-xs text-slate-500 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-xl font-bold">
              Submissions: {students.filter(s => s.labSubmission !== 'Pending').length} / {students.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((student) => (
              <div 
                key={student.id} 
                className="p-4 bg-slate-50/50 dark:bg-zinc-800/20 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">{student.name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold block">{student.rollNo} • {student.batch}</span>
                  </div>
                  
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    student.labSubmission === 'Graded'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : student.labSubmission === 'Submitted'
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {student.labSubmission}
                  </span>
                </div>

                {/* Render the actual submitted code block if it exists */}
                {student.submittedCode && (
                  <div className="mt-2.5 p-2 bg-slate-950 rounded-lg text-slate-300 font-mono text-[9px] max-h-[80px] overflow-y-auto">
                    <pre>{student.submittedCode}</pre>
                  </div>
                )}

                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold">
                    <span>Active Lab Code: </span>
                    <code className="bg-slate-200 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono text-purple-600">CS202-P3</code>
                  </div>

                  {student.labSubmission === 'Pending' ? (
                    <button 
                      onClick={() => handleGradeLab(student.id, 'A')}
                      className="text-[11px] bg-purple-600 hover:bg-purple-500 text-white font-bold px-2.5 py-1 rounded-lg shadow-sm"
                    >
                      Receive & Grade
                    </button>
                  ) : student.labSubmission === 'Submitted' ? (
                    <div className="flex gap-1.5">
                      {['A+', 'A', 'B'].map((gr) => (
                        <button
                          key={gr}
                          onClick={() => handleGradeLab(student.id, gr)}
                          className="text-[10px] font-black px-2 py-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-purple-500 transition-all text-slate-700 dark:text-slate-300"
                        >
                          {gr}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-extrabold flex items-center gap-1">
                      Grade: <span className="text-emerald-500 font-black text-sm">{student.grade || 'A'}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. AI ASSISTANT PANEL (ACCESSIBLE TO ALL) */}
      {activeTab === 'ai_assistant' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 overflow-hidden text-left shadow-sm">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <span>AI Computer Science Lab Assistant</span>
              </h3>
              <p className="text-xs text-purple-100 font-medium">Ask for algorithm logic, practical program blueprints, or general CSE concepts.</p>
            </div>
            
            <span className="hidden sm:inline-block px-3 py-1 bg-white/10 rounded-xl text-xs font-semibold backdrop-blur-sm border border-white/10">
              Heuristic Server-Side Gemini Engine
            </span>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Quick Suggestions list */}
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Quick Suggestions</span>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Explain Bubble Sort analysis and code',
                  'Optimal binary search function in javascript',
                  'Suggest innovative CSE minor project ideas',
                  'Explain Time & Space Complexity (Big O)'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCodeQuery(prompt); }}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-800/50 hover:bg-purple-50 dark:hover:bg-purple-950/20 border border-slate-200/60 dark:border-zinc-700/50 hover:border-purple-300 dark:hover:border-purple-900/40 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Prompt Form & Screen */}
            <div className="lg:col-span-8 flex flex-col space-y-4">
              <form onSubmit={handleAskAI} className="flex gap-2">
                <input
                  type="text"
                  value={codeQuery}
                  onChange={(e) => setCodeQuery(e.target.value)}
                  placeholder="Ask for an algorithm, coding homework blueprint, or project structure..."
                  className="flex-1 p-3 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isAiLoading}
                  className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl shadow-md transition-all flex items-center justify-center disabled:opacity-50 shrink-0"
                >
                  {isAiLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>

              {/* Response console screen */}
              <div className="flex-1 min-h-[250px] max-h-[350px] p-5 rounded-2xl bg-slate-950 text-slate-100 overflow-y-auto font-mono text-xs sm:text-sm border border-slate-850">
                {isAiLoading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-2">
                    <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
                    <span className="text-purple-300 text-xs font-bold">Consulting academic models...</span>
                  </div>
                ) : aiResponse ? (
                  <div className="space-y-4 text-left">
                    <pre className="whitespace-pre-wrap leading-relaxed">{aiResponse}</pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-8">
                    <Terminal className="w-8 h-8 mb-2 text-slate-600" />
                    <span>Select a quick suggestion or type your laboratory homework question above.</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6. CODY SANDBOX PLAYGROUND */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* Code Textarea Area */}
          <div className="lg:col-span-7 flex flex-col bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-600" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Interactive Coding Sandbox</h4>
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  value={sandboxLanguage} 
                  onChange={(e) => setSandboxLanguage(e.target.value)}
                  className="p-1 text-xs bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                </select>

                <button
                  onClick={handleRunCode}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Code</span>
                </button>
              </div>
            </div>

            <textarea
              value={sandboxCode}
              onChange={(e) => setSandboxCode(e.target.value)}
              className="flex-1 min-h-[300px] p-4 bg-slate-950 text-slate-100 font-mono text-xs sm:text-sm border-0 focus:ring-0 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Sandbox Compiler Output Console */}
          <div className="lg:col-span-5 flex flex-col bg-zinc-950 rounded-3xl p-5 border border-zinc-800/80 text-white justify-between">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">System Terminal Output</h4>
              
              <div className="font-mono text-xs sm:text-sm text-zinc-200 bg-black/40 p-4 rounded-xl border border-zinc-900/60 min-h-[220px] whitespace-pre-wrap">
                {outputConsole || 'Click Run Code to compile your sandbox code block...'}
              </div>
            </div>

            <div className="mt-4 p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-xs space-y-1">
              <span className="font-bold text-purple-400 block">CSE Compiler Standard:</span>
              <p className="text-zinc-400">Node JS Sandbox v18 Core Compiler with client-side isolated state replication.</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
