import React, { useState } from 'react';
import { 
  BookOpen, 
  UserCheck, 
  Wrench, 
  Clock, 
  Sparkles, 
  FileText, 
  ShieldAlert, 
  HelpCircle,
  Database,
  RefreshCw,
  Printer,
  Coins,
  Smile,
  Info
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

interface LibraryStaffRole {
  id: string;
  category: string;
  roleTitle: string;
  count: string;
  responsibilities: string[];
  toolsUsed: string[];
  accessLevel: 'Admin/Librarian' | 'Staff/Counter' | 'Support';
  details: string;
}

export const LibraryStaffDirectory: React.FC = () => {
  const { currentPreset } = useTheme();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([
    'System ready. Select a staff workflow above to simulate live operations.'
  ]);
  const [isSimulating, setIsSimulating] = useState<string | null>(null);

  const staffRoles: LibraryStaffRole[] = [
    {
      id: 'managerial',
      category: '1. Head / Managerial Role',
      roleTitle: 'College Librarian',
      count: '1 Person (HOD level)',
      responsibilities: [
        'Formulates library rules and guidelines',
        'Approves purchase orders for new book additions',
        'Manages digital subscription access (INFLIBNET N-LIST)',
        'Prepares statutory reports for College Management & NAAC audits'
      ],
      toolsUsed: ['INFLIBNET Admin panel', 'Budget spreadsheet', 'NAAC portal API'],
      accessLevel: 'Admin/Librarian',
      details: 'Acts as the HOD of the Library department. Ensures overall governance, policy implementation, and manages external alignments.'
    },
    {
      id: 'technical',
      category: '2. Technical Staff',
      roleTitle: 'Assistant Librarian / Technical Assistants',
      count: '2-3 Persons',
      responsibilities: [
        'Backend book classification using Dewey Decimal Classification (DDC)',
        'Data-entry into library management system database',
        'Barcodes generation, printing, and spine labeling',
        'Maintains online journals, database indexing, and e-catalogs'
      ],
      toolsUsed: ['DDC Classifier Tool', 'Barcode Generator API', 'OPAC indexing engine'],
      accessLevel: 'Admin/Librarian',
      details: 'Handles backend library science tasks. Organizes incoming books, manages metadata, and ensures proper technical indexing before shelving.'
    },
    {
      id: 'circulation',
      category: '3. Circulation & Desk Staff',
      roleTitle: 'Library Attendants / Counter Staff',
      count: '2-4 Persons',
      responsibilities: [
        'Daily student-facing help desk operations',
        'Registers student profiles & processes book issue/checkouts',
        'Processes book returns and log entries',
        'Calculates and collects late-return fines',
        'Ensures shelving of returned books back to correct racks'
      ],
      toolsUsed: ['Counter Issue-Return Dashboard', 'Student barcode reader', 'Fine ledger'],
      accessLevel: 'Staff/Counter',
      details: 'Directly interfaces with students and faculty. Manages high-traffic counter desks, keeps track of outstanding checkouts, and maintains shelf order.'
    },
    {
      id: 'supporting',
      category: '4. Supporting Staff',
      roleTitle: 'Multitasking Staff (MTS) / Library Peons',
      count: '2-3 Persons',
      responsibilities: [
        'Manages the student property counter (bag drop storage)',
        'Reading hall decorum & seating space monitoring',
        'Maintains rack layout order and general cleanliness',
        'Assists with photocopier / high-speed xerox and scanner service'
      ],
      toolsUsed: ['Property counter token key', 'Xerox/Scanner console', 'Cleanliness checklist'],
      accessLevel: 'Support',
      details: 'Essential field-level operators who maintain physical hygiene, asset security, and auxiliary services like high-speed photocopying.'
    }
  ];

  const runSimulation = (roleId: string, roleTitle: string) => {
    setIsSimulating(roleId);
    let steps: string[] = [];
    if (roleId === 'managerial') {
      steps = [
        `[Librarian] Initiated quarterly library budget audit...`,
        `[Librarian] Verification successful: INFLIBNET N-LIST student registration tokens renewed.`,
        `[Librarian] Received 14 book requisitions from Computer Science HOD.`,
        `[Librarian] Approved procurement request for 8 reference copies of 'Database Systems v5'.`,
        `[Librarian] Generated NAAC Criterion IV Library report. Syncing to main server... done.`
      ];
    } else if (roleId === 'technical') {
      steps = [
        `[Technical Staff] Received box of 12 new arrivals from Springer Publishers.`,
        `[Technical Staff] Assigned DDC classification index [005.133 - Python Programming] to incoming titles.`,
        `[Technical Staff] Inserted metadata & synopsis details into central e-catalog database.`,
        `[Technical Staff] Generated barcode block range GEC-LIB-91820 to 91831.`,
        `[Technical Staff] Printed barcode stickers and spine tags. Applied to book physical jackets.`
      ];
    } else if (roleId === 'circulation') {
      steps = [
        `[Circulation Desk] Counter operational. Waiting for student checkouts...`,
        `[Circulation Desk] Scanned student ID [GEC-CS-2024-093]. Profile: Priya Sen.`,
        `[Circulation Desk] Scanned book barcode [GEC-LIB-1024]. Book: 'Introduction to Algorithms'.`,
        `[Circulation Desk] Book successfully checked out! Due Date: ${new Date(Date.now() + 14*24*60*60*1000).toLocaleDateString()}.`,
        `[Circulation Desk] Processed check-in return for student [Karan Sharma]. Delay: 3 days.`,
        `[Circulation Desk] Fine calculated: Rs 6.00 collected. Balance cleared. Book sent to shelving.`
      ];
    } else if (roleId === 'supporting') {
      steps = [
        `[MTS Support] Inspected Reading Room 1. Seating alignment verified.`,
        `[MTS Support] Issued property counter storage key Token #42 to incoming student.`,
        `[MTS Support] Cleaned computer terminal tables and re-arranged CS department bookshelves.`,
        `[MTS Support] Fulfilled scanner requests: Digitized 4 journal pages for Mathematics faculty.`
      ];
    }

    setSimulationLogs([]);
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setSimulationLogs(prev => [...prev, steps[i]]);
        i++;
      } else {
        clearInterval(interval);
        setIsSimulating(null);
      }
    }, 450);
  };

  return (
    <div className="space-y-6">
      
      {/* Directory Introduction Banner */}
      <div className={`${currentPreset.cardBg} rounded-[28px] p-6 sm:p-8 border ${currentPreset.cardBorder} shadow-xl relative overflow-hidden transition-all duration-500`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase rounded-full border border-emerald-500/10">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Staff Roles & Responsibilities Matrix</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Library Organizational Directory</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            The Central Library operates using structured, division-of-labor categories. Click on any profile card to view detailed roles, access levels, and tools, or run live process simulations below.
          </p>
        </div>
      </div>

      {/* Grid of the 4 Key Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staffRoles.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <div
              key={role.id}
              onClick={() => setSelectedRole(isSelected ? null : role.id)}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between text-left relative overflow-hidden ${
                isSelected
                  ? `border-emerald-500 dark:border-emerald-400 ${currentPreset.cardBg} ring-2 ring-emerald-500/10 shadow-md scale-[1.01]`
                  : `border-slate-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/30 hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-zinc-900/50 shadow-xs`
              }`}
            >
              <div>
                {/* Top Role Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-200/40 dark:border-zinc-850 pb-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      {role.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {role.roleTitle}
                    </h3>
                  </div>
                  
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    role.accessLevel === 'Admin/Librarian'
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      : role.accessLevel === 'Staff/Counter'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                  }`}>
                    {role.accessLevel}
                  </span>
                </div>

                {/* Info Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400">
                    Strength: <strong className="font-extrabold">{role.count}</strong>
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                    Tools: {role.toolsUsed.slice(0, 2).join(', ')}...
                  </span>
                </div>

                {/* Key Responsibilities */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block tracking-wider">
                    Core Tasks:
                  </span>
                  <ul className="space-y-1">
                    {role.responsibilities.slice(0, isSelected ? 6 : 2).map((task, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-350">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Additional Detail shown on select */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-3 mt-3 border-t border-slate-200/40 dark:border-zinc-850 space-y-2 text-xs"
                    >
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed italic bg-slate-100/50 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-slate-200/10">
                        {role.details}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block mb-1">
                            Software Access:
                          </span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {role.accessLevel === 'Admin/Librarian' 
                              ? 'Catalog entry, settings, CSV import, full analytics reports'
                              : role.accessLevel === 'Staff/Counter'
                              ? 'Restricted: book checkout issue, book return logs, student lookup, fine records'
                              : 'No digital system access credentials required'}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block mb-1">
                            Key Systems Used:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {role.toolsUsed.map((tool, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-850 text-slate-600 dark:text-slate-400 border border-slate-200/10">
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Card Footer toggle help info */}
              <div className="pt-2 text-right border-t border-slate-100 dark:border-zinc-800/40 mt-3 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {isSelected ? 'Click to collapse ↑' : 'Click to expand detail ↓'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Operational Sandbox Simulator */}
      <div className={`${currentPreset.cardBg} rounded-[24px] p-5 border ${currentPreset.cardBorder} shadow-lg space-y-4 text-left relative overflow-hidden transition-all duration-500`}>
        <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-zinc-850 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Live Operations Workflow Simulator
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Run simulated process executions for each staff tier to see system logs in action.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span>Interactive Terminal</span>
          </span>
        </div>

        {/* Action buttons for simulation triggers */}
        <div className="flex flex-wrap items-center gap-2">
          {staffRoles.map((role) => (
            <button
              key={role.id}
              onClick={() => runSimulation(role.id, role.roleTitle)}
              disabled={isSimulating !== null}
              className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all select-none active:scale-95 ${
                isSimulating === role.id
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-zinc-800'
              }`}
            >
              {isSimulating === role.id ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span>Simulate: {role.roleTitle.split(' / ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Output Console Log Screen */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-left space-y-1 max-h-[160px] overflow-y-auto">
          {simulationLogs.map((log, idx) => (
            <div key={idx} className="text-[11px] text-emerald-400/90 leading-tight">
              <span className="text-slate-600 select-none mr-2">[{new Date().toLocaleTimeString()}]</span>
              <span>{log}</span>
            </div>
          ))}
          {isSimulating && (
            <div className="text-[11px] text-indigo-400 animate-pulse font-bold">
              ⚡ Executing real-time system logs simulation...
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
