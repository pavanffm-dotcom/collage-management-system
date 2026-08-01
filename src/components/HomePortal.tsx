import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ChevronRight, 
  ArrowRight, 
  Layers, 
  Users, 
  UserCheck, 
  School,
  GraduationCap,
  LogIn,
  User,
  Mail,
  ShieldCheck,
  Palette,
  Sun,
  Moon,
  Check,
  X,
  UserPlus,
  Activity,
  Database,
  CheckCircle,
  Wifi,
  Terminal,
  Calculator,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useTheme, THEME_PRESETS, ColorTheme } from '../context/ThemeContext';

interface HomePortalProps {
  onSignInSuccess: (user: { name: string; email: string; photoUrl: string; role: string; selectedDept: string }) => void;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (open: boolean) => void;
}

export const HomePortal: React.FC<HomePortalProps> = ({ 
  onSignInSuccess,
  isThemeModalOpen,
  setIsThemeModalOpen
}) => {
  const { theme, toggleTheme, colorTheme, setColorTheme, currentPreset } = useTheme();
  const [step, setStep] = useState<'login' | 'select_dept'>('login');
  
  // Role Selector
  const [selectedRole, setSelectedRole] = useState<'Student' | 'Teacher' | 'Admin'>('Student');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  // Department choices
  const [chosenDept, setChosenDept] = useState('library');
  
  // Detailed Designations for Teachers & Admins
  const [teacherDesignation, setTeacherDesignation] = useState<'HOD' | 'Teacher'>('Teacher');
  const [adminDesignation, setAdminDesignation] = useState<'Lead' | 'Staff'>('Staff');
  
  // Google simulated login UI controls
  const [showGoogleAccounts, setShowGoogleAccounts] = useState(false);
  const [customGmail, setCustomGmail] = useState('');
  const [showCustomGmailInput, setShowCustomGmailInput] = useState(false);

  // Interactive Simulated Google Accounts matching roles
  const googleAccountsByRole = {
    Student: [
      { name: 'Karan Sharma', email: 'karan.sharma@gmail.com', pic: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120' },
      { name: 'Priya Sen', email: 'priya.sen@gmail.com', pic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120' }
    ],
    Teacher: [
      { name: 'Dr. Ramesh Naik', email: 'ramesh.naik@gmail.com', pic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120' },
      { name: 'Dr. Neha Patel', email: 'neha.patel@gmail.com', pic: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120' }
    ],
    Admin: [
      { name: 'Amit Verma', email: 'amit.verma@gmail.com', pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120' },
      { name: 'Sanjay Rao', email: 'sanjay.rao@gmail.com', pic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120' }
    ]
  };

  const handleGoogleAccountClick = (account: { name: string; email: string }) => {
    setUserName(account.name);
    setUserEmail(account.email);
    setStep('select_dept');
    setShowGoogleAccounts(false);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGmail.trim()) return;
    const namePart = customGmail.split('@')[0];
    const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/\d+/g, ' ').trim();
    setUserName(capitalizedName || 'Google User');
    setUserEmail(customGmail);
    setStep('select_dept');
    setShowCustomGmailInput(false);
  };

  const handleConfirmDepartment = () => {
    const finalPhoto = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName || 'User')}&radius=50`;
    
    // Determine exact role according to designations
    let finalRole: string = selectedRole;
    if (selectedRole === 'Teacher') {
      finalRole = teacherDesignation === 'HOD' ? 'HOD' : 'Teacher';
    } else if (selectedRole === 'Admin') {
      finalRole = adminDesignation === 'Lead' ? 'Admin' : 'Staff';
    }

    // Specialize role if they choose Library department to match previous setup
    if (finalRole === 'Teacher' && chosenDept === 'library') {
      finalRole = 'Librarian';
    }

    onSignInSuccess({
      name: userName || 'Google User',
      email: userEmail || 'user@gmail.com',
      photoUrl: finalPhoto,
      role: finalRole,
      selectedDept: chosenDept
    });
  };

  const departmentsList = [
    {
      id: 'library',
      name: 'Library Department',
      icon: BookOpen,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      tagline: 'Book Catalog, Shelf Locations, Issue Logs',
      features: ['QR Book Finder', 'Issue & Return Logs', 'Fine Records']
    },
    {
      id: 'cs',
      name: 'Computer Science Dept',
      icon: Terminal,
      color: 'from-purple-500 to-indigo-600',
      textColor: 'text-purple-600 dark:text-purple-400',
      tagline: 'Practical Labs, Attendance, AI Sandbox',
      features: ['Code Playground', 'Attendance logs', 'HOD approvals']
    },
    {
      id: 'math',
      name: 'Mathematics Dept',
      icon: Calculator,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600 dark:text-blue-400',
      tagline: 'Equation Plotter, Internal grading tools',
      features: ['Interactive Plotter', 'Marks Calculator', 'Formula Sheet']
    },
    {
      id: 'sports',
      name: 'Physical Ed. / Sports',
      icon: Users,
      color: 'from-orange-500 to-red-500',
      textColor: 'text-orange-600 dark:text-orange-400',
      tagline: 'Booking schedules, Inventory, Tournaments',
      features: ['Ground Booking', 'Equipment Ledger', 'Brackets Builder']
    },
    {
      id: 'placement',
      name: 'Training & Placement',
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-600 dark:text-amber-400',
      tagline: 'Campus drives, Resume analysis, Offers board',
      features: ['Resume Evaluator', 'Active Drives logs', 'Offers Leaderboard']
    },
    {
      id: 'exam',
      name: 'Examination Cell',
      icon: GraduationCap,
      color: 'from-rose-500 to-pink-600',
      textColor: 'text-rose-600 dark:text-rose-400',
      tagline: 'Hall tickets generation, GPA Calculator',
      features: ['Hall Ticket PDF', 'CGPA Calculator', 'Schedules']
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 w-full flex flex-col justify-center min-h-[75vh] py-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Rich branding & directory info so the portal never looks "Khali" (empty) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-8 py-2 text-left">
          
          <div className="space-y-6">
            {/* Elegant pill */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 ${currentPreset.badgeRadius} ${currentPreset.badgeBg} font-extrabold text-xs tracking-wider uppercase border border-indigo-500/10`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>CMS Portal Active • v2.4.0</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-tight">
                Academic Hub & <span className={`${currentPreset.accentText}`}>Unified CMS</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed font-medium">
                A seamless single-sign-on workspace connecting students, faculty, and administrative staff with essential college services. Navigate book catalogs, class sheets, and campus schedules effortlessly.
              </p>
            </div>

            {/* Quick stats board to feel complete and professional */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className={`${currentPreset.innerCardBg} p-4 ${currentPreset.cardRadius} border ${currentPreset.borderColor} flex flex-col justify-between shadow-sm transition-all hover:scale-[1.01]`}>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Modules</span>
                <span className={`text-xl font-black ${currentPreset.accentText} mt-1`}>06 Total</span>
              </div>
              <div className={`${currentPreset.innerCardBg} p-4 ${currentPreset.cardRadius} border ${currentPreset.borderColor} flex flex-col justify-between shadow-sm transition-all hover:scale-[1.01]`}>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">SSO Service</span>
                <span className={`text-xl font-black ${currentPreset.accentText} mt-1`}>Active</span>
              </div>
              <div className={`${currentPreset.innerCardBg} p-4 ${currentPreset.cardRadius} border ${currentPreset.borderColor} flex flex-col justify-between shadow-sm transition-all hover:scale-[1.01]`}>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">System Load</span>
                <span className={`text-xl font-black ${currentPreset.accentText} mt-1`}>Optimal</span>
              </div>
            </div>
          </div>

          {/* Department Directory Catalog Showcase (Static representation as requested) */}
          <div className="space-y-4 pt-6 border-t border-slate-250/20 dark:border-zinc-800/40">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                Academic Modules Catalog:
              </h3>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500">
                Live Directory
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {departmentsList.map((dept) => {
                const IconComp = dept.icon;
                const isLibrary = dept.id === 'library';
                return (
                  <div
                    key={dept.id}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/40 dark:bg-zinc-900/20 border border-slate-200/50 dark:border-zinc-800/30 shadow-xs"
                  >
                    <div className={`p-2 rounded-xl bg-gradient-to-tr ${dept.color} text-white shrink-0 shadow-xs`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate block">
                        {dept.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isLibrary ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500/70'}`} />
                        <span className={`text-[10px] font-extrabold ${isLibrary ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                          {isLibrary ? 'Fully Active' : 'Work in Progress'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-500/5 rounded-xl text-[11px] text-slate-450 dark:text-slate-500 border border-slate-200/10">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>To access any of the modules above, please authenticate your role via the Google SSO panel on the right.</span>
            </div>
          </div>

        </div>

        {/* Right Column: The interactive Role Selector and Google SSO Sign-in card */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          
          {step === 'login' ? (
            <div className="space-y-6">
              
              {/* Main Auth Card */}
              <div className={`${currentPreset.cardBg} ${currentPreset.cardBorder} p-6 sm:p-8 shadow-xl ${currentPreset.cardRadius} space-y-6 text-left`}>
                
                {/* Header info inside the card */}
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-slate-950 dark:text-white flex items-center gap-2">
                    <UserCheck className={`w-5 h-5 ${currentPreset.accentText}`} />
                    <span>Campus Google Sign-In</span>
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Sign up with your college role to automatically configure the department layouts.
                  </p>
                </div>

                {/* Role Selector with Preset Radiuses and Borders */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 block">
                    Select Portal Role:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Student', 'Teacher', 'Admin'] as const).map((role) => {
                      const isSelected = selectedRole === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role);
                            setShowGoogleAccounts(false);
                          }}
                          className={`py-3 text-xs sm:text-sm font-bold border transition-all flex flex-col items-center justify-center gap-1.5 ${currentPreset.badgeRadius} ${
                            isSelected
                              ? `${currentPreset.buttonBg} border-transparent`
                              : `bg-slate-50/60 dark:bg-zinc-900/40 text-slate-700 dark:text-slate-300 ${currentPreset.borderColor} hover:bg-slate-100/80`
                          }`}
                        >
                          {role === 'Student' && <User className="w-4.5 h-4.5" />}
                          {role === 'Teacher' && <GraduationCap className="w-4.5 h-4.5" />}
                          {role === 'Admin' && <ShieldCheck className="w-4.5 h-4.5" />}
                          <span>{role}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Google Sign-In Buttons */}
                {!showGoogleAccounts && !showCustomGmailInput ? (
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowGoogleAccounts(true)}
                      className={`w-full py-4 px-4 ${currentPreset.buttonRadius} ${currentPreset.buttonBg} font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99]`}
                    >
                      <LogIn className="w-5 h-5 text-white/90" />
                      <span>Authenticate Google Account</span>
                    </button>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1">
                      <span>Simulated SSO Credentials</span>
                      <button 
                        type="button" 
                        onClick={() => setShowCustomGmailInput(true)}
                        className={`hover:underline font-bold ${currentPreset.accentText}`}
                      >
                        Use Custom Email
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Google Accounts Selection list */}
                {showGoogleAccounts && (
                  <div className="space-y-3 pt-2 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                      <span className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">
                        Select Gmail Account ({selectedRole}):
                      </span>
                      <button 
                        onClick={() => setShowGoogleAccounts(false)} 
                        className={`text-[11px] hover:underline font-bold ${currentPreset.accentText}`}
                      >
                        Cancel
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {googleAccountsByRole[selectedRole].map((acc, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleGoogleAccountClick(acc)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50/60 dark:bg-zinc-900/40 border ${currentPreset.borderColor} hover:bg-indigo-50/50 dark:hover:bg-zinc-800/60 transition-all text-left group`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img 
                              src={acc.pic} 
                              alt={acc.name} 
                              className="w-8 h-8 rounded-full object-cover border border-slate-200/60 dark:border-zinc-700"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                {acc.name}
                                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/10 font-semibold text-emerald-600 dark:text-emerald-400 rounded">
                                  Verified
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500">
                                {acc.email}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Google Sign-In Form */}
                {showCustomGmailInput && (
                  <form onSubmit={handleCustomGoogleSubmit} className="space-y-4 pt-2 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                      <span className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">
                        Enter Custom Gmail:
                      </span>
                      <button 
                        type="button"
                        onClick={() => setShowCustomGmailInput(false)} 
                        className={`text-[11px] hover:underline font-bold ${currentPreset.accentText}`}
                      >
                        Go Back
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Google Email / Gmail Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          required
                          placeholder="username@gmail.com"
                          value={customGmail}
                          onChange={(e) => setCustomGmail(e.target.value)}
                          className={`w-full pl-10 pr-3 py-3 text-xs sm:text-sm ${currentPreset.inputRadius} ${currentPreset.inputBg} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`w-full py-3 ${currentPreset.buttonRadius} ${currentPreset.buttonBg} text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all`}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Authenticate Google Email</span>
                    </button>
                  </form>
                )}

              </div>
            </div>
          ) : (
            /* Step 2: Choose Department & Specific Designation (HOD vs Teacher etc.) */
            <div className="space-y-6 animate-fade-in">
              <div className={`${currentPreset.cardBg} ${currentPreset.cardBorder} p-6 sm:p-8 shadow-xl ${currentPreset.cardRadius} space-y-6 text-left`}>
                
                <div className="space-y-1 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <h2 className="text-lg font-black text-slate-950 dark:text-white flex items-center gap-2">
                    <School className={`w-5 h-5 ${currentPreset.accentText}`} />
                    <span>Assign Academic Workspace</span>
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Welcome, <strong className="text-slate-800 dark:text-slate-200">{userName}</strong>! Select your default department to complete sign-up.
                  </p>
                </div>

                {/* Department Selection List */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {departmentsList.map((dept) => {
                    const IconComp = dept.icon;
                    const isSelected = chosenDept === dept.id;
                    
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => setChosenDept(dept.id)}
                        className={`w-full relative flex items-center gap-3 text-left p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-indigo-500/10 border-indigo-500/50 ring-2 ring-indigo-500/10'
                            : `bg-slate-50/50 dark:bg-zinc-900/30 ${currentPreset.borderColor} hover:bg-slate-50 dark:hover:bg-zinc-900/60`
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${dept.color} flex items-center justify-center text-white shrink-0`}>
                          <IconComp className="w-4 h-4" />
                        </div>

                        <div className="flex-grow min-w-0 pr-6">
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                            {dept.name}
                          </h3>
                          <p className="text-[10px] text-slate-450 dark:text-slate-400 truncate">
                            {dept.tagline}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="absolute right-3.5 w-4.5 h-4.5 bg-indigo-600 rounded-full flex items-center justify-center">
                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Teacher sub-role specification (HOD vs Regular Faculty) */}
                {selectedRole === 'Teacher' && (
                  <div className="p-4 bg-purple-500/5 dark:bg-purple-950/10 rounded-2xl border border-purple-500/10 text-left space-y-3 animate-fade-in">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                      Academic Designation:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTeacherDesignation('HOD')}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                          teacherDesignation === 'HOD'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : `bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 ${currentPreset.borderColor}`
                        }`}
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>Head of Dept (HOD)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTeacherDesignation('Teacher')}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                          teacherDesignation === 'Teacher'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : `bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 ${currentPreset.borderColor}`
                        }`}
                      >
                        <User className="w-4 h-4" />
                        <span>Faculty / Teacher</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {teacherDesignation === 'HOD' 
                        ? '🛡️ HOD panel provides curriculum schedules, practical syllabus completion grids, and notices board editing.'
                        : '📝 General faculty manages student roll attendance logging and lab manual updates.'}
                    </p>
                  </div>
                )}

                {/* Admin sub-role specification */}
                {selectedRole === 'Admin' && (
                  <div className="p-4 bg-indigo-500/5 dark:bg-indigo-950/10 rounded-2xl border border-indigo-500/10 text-left space-y-3 animate-fade-in">
                    <span className="text-xs font-bold text-slate-550 dark:text-slate-400 block uppercase tracking-wider">
                      Admin Authority Level:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAdminDesignation('Lead')}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                          adminDesignation === 'Lead'
                            ? `${currentPreset.buttonBg} border-transparent`
                            : `bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 ${currentPreset.borderColor}`
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Lead Admin</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAdminDesignation('Staff')}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                          adminDesignation === 'Staff'
                            ? `${currentPreset.buttonBg} border-transparent`
                            : `bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 ${currentPreset.borderColor}`
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span>General Staff</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Buttons to navigate back or proceed */}
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setStep('login')}
                    className="px-4 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs sm:text-sm active:scale-95 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmDepartment}
                    className={`flex-grow py-3 ${currentPreset.buttonRadius} ${currentPreset.buttonBg} text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all`}
                  >
                    <span>Launch College Dashboard</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Modal: Select Theme Preset Popover directly managed via state */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-zinc-950 rounded-[32px] max-w-2xl w-full border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden p-6 sm:p-8 relative space-y-4 my-8 shrink-0 flex flex-col max-h-[90vh]">
            
            <button
              type="button"
              onClick={() => setIsThemeModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-900 pb-4 shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Global System Themes
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a tailored aesthetic to colorize the entire campus system.
                </p>
              </div>
            </div>

            {/* Quick theme toggles */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80 shrink-0">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Light / Dark Preference</span>
              <div className="flex gap-1 bg-white dark:bg-zinc-950 p-1 rounded-xl border border-slate-200/50 dark:border-zinc-800/60">
                <button
                  type="button"
                  onClick={() => theme === 'dark' && toggleTheme()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    theme === 'light'
                      ? 'bg-indigo-500 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => theme === 'light' && toggleTheme()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    theme === 'dark'
                      ? 'bg-indigo-500 text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="flex-grow overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                {THEME_PRESETS.map((preset) => {
                  const isSelected = colorTheme === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setColorTheme(preset.id)}
                      className={`w-full p-4 relative flex flex-col justify-between text-left rounded-[22px] border transition-all duration-300 select-none ${
                        isSelected
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/10'
                          : 'bg-slate-50 dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800/60 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {/* Selected Indicator Badge */}
                      {isSelected && (
                        <div className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shadow-md z-10">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}

                      <div className="flex items-start gap-3 pr-6 pb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm shrink-0 border border-white/20"
                          style={{
                            background: `linear-gradient(135deg, ${preset.previewColors[0]}, ${preset.previewColors[1]})`
                          }}
                        >
                          <span>{preset.emoji}</span>
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                            {preset.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                            {preset.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Color Palette Swatches */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 mt-auto w-full">
                        <div className="flex items-center gap-1.5">
                          {preset.previewColors.map((color, i) => (
                            <span
                              key={i}
                              className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-700 shadow-xs inline-block"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-slate-400">
                          {isSelected ? 'Active' : 'Apply'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer Action */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-zinc-900 shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Active Theme: <strong className="text-slate-900 dark:text-white capitalize">{currentPreset.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md transition-all hover:bg-indigo-500"
              >
                Close & Continue
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
