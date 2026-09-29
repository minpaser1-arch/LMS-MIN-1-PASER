import React, { useState, useEffect } from 'react';
import { 
  School, 
  Users, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Calendar, 
  Award, 
  FolderGit2, 
  Bell, 
  Settings, 
  LogOut, 
  Smartphone, 
  Copy, 
  Menu, 
  X, 
  Sparkles,
  ChevronDown,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard
} from 'lucide-react';
import { 
  LmsDataState, 
  SchoolIdentity, 
  Student, 
  LearningMaterial, 
  Assignment, 
  Quiz, 
  AttendanceRecord, 
  GradeWeights, 
  PortfolioItem, 
  Announcement,
  QuizSubmission,
  AssignmentSubmission
} from './types/lms';
import { 
  loadLmsState, 
  saveLmsState, 
  resetLmsState, 
  INITIAL_DEFAULT_STATE 
} from './utils/storage';
import { 
  formatMaterialForWhatsApp, 
  formatMaterialForDoc,
  formatAssignmentForWhatsApp,
  formatQuizForWhatsApp,
  formatAttendanceForWhatsApp,
  formatAnnouncementForWhatsApp,
  formatGradesForWhatsApp
} from './utils/formatter';
import { ToastProvider, useToast } from './components/common/Toast';
import { CopasModal } from './components/common/CopasModal';

// Teacher components
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentManagement } from './components/teacher/StudentManagement';
import { MaterialManagement } from './components/teacher/MaterialManagement';
import { AssignmentManagement } from './components/teacher/AssignmentManagement';
import { QuizManagement } from './components/teacher/QuizManagement';
import { AttendanceManagement } from './components/teacher/AttendanceManagement';
import { GradebookManagement } from './components/teacher/GradebookManagement';
import { PortfolioManagement } from './components/teacher/PortfolioManagement';
import { AnnouncementManagement } from './components/teacher/AnnouncementManagement';
import { IdentitySettings } from './components/teacher/IdentitySettings';

// Student components
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentMaterials } from './components/student/StudentMaterials';
import { StudentAssignments } from './components/student/StudentAssignments';
import { StudentInteractiveQuiz } from './components/student/StudentInteractiveQuiz';
import { StudentProgress } from './components/student/StudentProgress';

function LmsApp() {
  const [data, setData] = useState<LmsDataState>(() => loadLmsState());
  const [userRole, setUserRole] = useState<'teacher' | 'student'>('teacher');
  const [teacherTab, setTeacherTab] = useState<string>('dashboard');
  const [studentTab, setStudentTab] = useState<string>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    data.students[0]?.id || 'std-1'
  );

  // Active quiz to open directly for student
  const [studentQuizToTake, setStudentQuizToTake] = useState<string | undefined>(undefined);

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // COPAS Universal Modal state
  const [copasModal, setCopasModal] = useState<{
    isOpen: boolean;
    title: string;
    waText: string;
    docText?: string;
    category?: string;
  }>({
    isOpen: false,
    title: '',
    waText: '',
    docText: undefined,
    category: ''
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveLmsState(data);
  }, [data]);

  const currentStudent = data.students.find((s) => s.id === selectedStudentId) || data.students[0];

  // Helper for opening COPAS Modal
  const handleOpenCopasModal = (title: string, waText: string, docText?: string, category?: string) => {
    // If waText starts with formatting placeholder, resolve it
    if (waText.startsWith('format_mat_')) {
      const matId = waText.replace('format_mat_', '');
      const mat = data.materials.find((m) => m.id === matId);
      if (mat) {
        setCopasModal({
          isOpen: true,
          title: mat.title,
          waText: formatMaterialForWhatsApp(mat, data.identity),
          docText: formatMaterialForDoc(mat, data.identity),
          category: 'Materi Pembelajaran'
        });
        return;
      }
    }

    setCopasModal({
      isOpen: true,
      title,
      waText,
      docText,
      category: category || 'Konten LMS'
    });
  };

  // State update handlers
  const handleUpdateIdentity = (newIdentity: SchoolIdentity) => {
    setData((prev) => ({ ...prev, identity: newIdentity }));
  };

  const handleUpdateStudents = (newStudents: Student[]) => {
    setData((prev) => ({ ...prev, students: newStudents }));
  };

  const handleUpdateMaterials = (newMaterials: LearningMaterial[]) => {
    setData((prev) => ({ ...prev, materials: newMaterials }));
  };

  const handleUpdateAssignments = (newAssignments: Assignment[]) => {
    setData((prev) => ({ ...prev, assignments: newAssignments }));
  };

  const handleUpdateQuizzes = (newQuizzes: Quiz[]) => {
    setData((prev) => ({ ...prev, quizzes: newQuizzes }));
  };

  const handleUpdateAttendance = (newAttendance: AttendanceRecord[]) => {
    setData((prev) => ({ ...prev, attendance: newAttendance }));
  };

  const handleUpdateWeights = (newWeights: GradeWeights) => {
    setData((prev) => ({ ...prev, gradeWeights: newWeights }));
  };

  const handleUpdatePortfolios = (newPortfolios: PortfolioItem[]) => {
    setData((prev) => ({ ...prev, portfolios: newPortfolios }));
  };

  const handleUpdateAnnouncements = (newAnnouncements: Announcement[]) => {
    setData((prev) => ({ ...prev, announcements: newAnnouncements }));
  };

  const handleToggleCompleteMaterial = (materialId: string) => {
    if (!currentStudent) return;
    const studentId = currentStudent.id;
    const existing = data.studentCompletedMaterials[studentId] || [];
    const isCompleted = existing.includes(materialId);

    const updatedList = isCompleted
      ? existing.filter((id) => id !== materialId)
      : [...existing, materialId];

    setData((prev) => ({
      ...prev,
      studentCompletedMaterials: {
        ...prev.studentCompletedMaterials,
        [studentId]: updatedList
      }
    }));
  };

  const handleSubmitAssignment = (assignmentId: string, submission: AssignmentSubmission) => {
    const updatedAssignments = data.assignments.map((asg) => {
      if (asg.id === assignmentId) {
        const otherSubs = asg.submissions.filter((s) => s.studentId !== submission.studentId);
        return {
          ...asg,
          submissions: [...otherSubs, submission]
        };
      }
      return asg;
    });
    handleUpdateAssignments(updatedAssignments);
  };

  const handleFinishQuiz = (quizId: string, submission: QuizSubmission) => {
    const updatedQuizzes = data.quizzes.map((quiz) => {
      if (quiz.id === quizId) {
        const otherSubs = quiz.submissions.filter((s) => s.studentId !== submission.studentId);
        return {
          ...quiz,
          submissions: [...otherSubs, submission]
        };
      }
      return quiz;
    });
    handleUpdateQuizzes(updatedQuizzes);
  };

  const handleResetDefault = () => {
    const defaultData = resetLmsState();
    setData(defaultData);
  };

  const handleRestoreState = (restored: LmsDataState) => {
    setData(restored);
  };

  // Nav items for teacher
  const teacherNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Peserta Didik', icon: Users },
    { id: 'materials', label: 'Materi Belajar', icon: BookOpen },
    { id: 'assignments', label: 'Tugas Siswa', icon: FileText },
    { id: 'quizzes', label: 'Kuis Interaktif', icon: HelpCircle },
    { id: 'attendance', label: 'Presensi Harian', icon: Calendar },
    { id: 'grades', label: 'Daftar Nilai', icon: Award },
    { id: 'portfolios', label: 'Portofolio', icon: FolderGit2 },
    { id: 'announcements', label: 'Pengumuman', icon: Bell },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  // Nav items for student
  const studentNavItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'materials', label: 'Materi Belajar', icon: BookOpen },
    { id: 'assignments', label: 'Tugas Saya', icon: FileText },
    { id: 'quizzes', label: 'Kuis Online', icon: HelpCircle },
    { id: 'progress', label: 'Progres & Rapor', icon: Award },
    { id: 'announcements', label: 'Pengumuman', icon: Bell },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-20 sm:pb-8">
      {/* Universal COPAS Modal */}
      <CopasModal
        isOpen={copasModal.isOpen}
        onClose={() => setCopasModal((prev) => ({ ...prev, isOpen: false }))}
        title={copasModal.title}
        waText={copasModal.waText}
        docText={copasModal.docText}
        categoryName={copasModal.category}
      />

      {/* Top Navigation Bar: Strict Zone Contract & Clean Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Zone 1: Brand & Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Buka Menu Navigasi"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => userRole === 'teacher' ? setTeacherTab('dashboard') : setStudentTab('dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-emerald-700/20">
                <School className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 leading-tight">
                  LMS Pintar Madrasah
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold truncate max-w-44 sm:max-w-xs">
                  {data.identity.schoolName} · {data.identity.level}
                </span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Teacher Desktop) */}
          {userRole === 'teacher' && (
            <nav className="hidden xl:flex items-center gap-1">
              {teacherNavItems.slice(0, 6).map((tab) => {
                const Icon = tab.icon;
                const isActive = teacherTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setTeacherTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Zone 3: Mode Switcher & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student Mode Selector (When in Student Mode) */}
            {userRole === 'student' && currentStudent && (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                <span className="text-[11px] text-slate-500 pl-1.5 hidden sm:inline">Siswa:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none pr-2 py-0.5 cursor-pointer max-w-32 sm:max-w-44 truncate"
                >
                  {data.students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.studentNo}. {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Role Switcher Button */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setUserRole('teacher')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  userRole === 'teacher'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👨‍🏫 Guru
              </button>
              <button
                onClick={() => setUserRole('student')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  userRole === 'student'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎒 Siswa
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer / Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-5 z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <School className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{data.identity.schoolName}</h3>
                    <p className="text-[10px] text-emerald-700 font-semibold">{data.identity.level}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode switch in drawer */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setUserRole('teacher');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold text-center rounded-lg ${
                    userRole === 'teacher' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Mode Guru 👨‍🏫
                </button>
                <button
                  onClick={() => {
                    setUserRole('student');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold text-center rounded-lg ${
                    userRole === 'student' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Mode Siswa 🎒
                </button>
              </div>

              {/* Nav list */}
              <nav className="space-y-1 overflow-y-auto max-h-[60vh]">
                {(userRole === 'teacher' ? teacherNavItems : studentNavItems).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = (userRole === 'teacher' ? teacherTab : studentTab) === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (userRole === 'teacher') setTeacherTab(tab.id);
                        else setStudentTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-900 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer with Mandatory Creator Credit */}
            <div className="pt-4 border-t border-slate-100 space-y-1 text-center">
              <p className="text-[11px] font-bold text-emerald-800">
                By : Dzakirul Husni
              </p>
              <p className="text-[10px] text-slate-500">
                Guru MIN 1 Paser · Kaltim
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sub-navigation for Teacher Mode */}
      {userRole === 'teacher' && (
        <div className="hidden lg:block bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto py-2">
              {teacherNavItems.map((tab) => {
                const Icon = tab.icon;
                const isActive = teacherTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setTeacherTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sub-navigation for Student Mode */}
      {userRole === 'student' && (
        <div className="hidden lg:block bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto py-2">
              {studentNavItems.map((tab) => {
                const Icon = tab.icon;
                const isActive = studentTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setStudentTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        {/* TEACHER MODE ROUTING */}
        {userRole === 'teacher' && (
          <>
            {teacherTab === 'dashboard' && (
              <TeacherDashboard
                data={data}
                onNavigateTab={(tab) => setTeacherTab(tab)}
                onOpenCopasModal={handleOpenCopasModal}
              />
            )}
            {teacherTab === 'students' && (
              <StudentManagement
                students={data.students}
                identity={data.identity}
                onUpdateStudents={handleUpdateStudents}
              />
            )}
            {teacherTab === 'materials' && (
              <MaterialManagement
                materials={data.materials}
                identity={data.identity}
                onUpdateMaterials={handleUpdateMaterials}
                onOpenCopasModal={handleOpenCopasModal}
              />
            )}
            {teacherTab === 'assignments' && (
              <AssignmentManagement
                assignments={data.assignments}
                materials={data.materials}
                students={data.students}
                identity={data.identity}
                onUpdateAssignments={handleUpdateAssignments}
                onOpenCopasModal={handleOpenCopasModal}
              />
            )}
            {teacherTab === 'quizzes' && (
              <QuizManagement
                quizzes={data.quizzes}
                students={data.students}
                identity={data.identity}
                onUpdateQuizzes={handleUpdateQuizzes}
                onOpenCopasModal={handleOpenCopasModal}
              />
            )}
            {teacherTab === 'attendance' && (
              <AttendanceManagement
                attendance={data.attendance}
                students={data.students}
                identity={data.identity}
                onUpdateAttendance={handleUpdateAttendance}
                onOpenCopasModal={handleOpenCopasModal}
              />
            )}
            {teacherTab === 'grades' && (
              <GradebookManagement
                students={data.students}
                assignments={data.assignments}
                quizzes={data.quizzes}
                gradeWeights={data.gradeWeights}
                identity={data.identity}
                onUpdateWeights={handleUpdateWeights}
                onOpenCopasModal={handleOpenCopasModal}
              />
            )}
            {teacherTab === 'portfolios' && (
              <PortfolioManagement
                portfolios={data.portfolios}
                students={data.students}
                identity={data.identity}
                onUpdatePortfolios={handleUpdatePortfolios}
              />
            )}
            {teacherTab === 'announcements' && (
              <AnnouncementManagement
                announcements={data.announcements}
                identity={data.identity}
                onUpdateAnnouncements={handleUpdateAnnouncements}
                onOpenCopasModal={handleOpenCopasModal}
              />
            )}
            {teacherTab === 'settings' && (
              <IdentitySettings
                identity={data.identity}
                fullDataState={data}
                onUpdateIdentity={handleUpdateIdentity}
                onRestoreState={handleRestoreState}
                onResetDefault={handleResetDefault}
              />
            )}
          </>
        )}

        {/* STUDENT MODE ROUTING */}
        {userRole === 'student' && currentStudent && (
          <>
            {studentTab === 'dashboard' && (
              <StudentDashboard
                currentStudent={currentStudent}
                data={data}
                onNavigateTab={(tab) => setStudentTab(tab)}
                onStartQuiz={(quizId) => {
                  setStudentQuizToTake(quizId);
                  setStudentTab('quizzes');
                }}
              />
            )}
            {studentTab === 'materials' && (
              <StudentMaterials
                materials={data.materials}
                currentStudent={currentStudent}
                identity={data.identity}
                completedMaterialIds={data.studentCompletedMaterials[currentStudent.id] || []}
                onToggleCompleteMaterial={handleToggleCompleteMaterial}
                onOpenCopasModal={handleOpenCopasModal}
              />
            )}
            {studentTab === 'assignments' && (
              <StudentAssignments
                assignments={data.assignments}
                currentStudent={currentStudent}
                identity={data.identity}
                onSubmitAssignment={handleSubmitAssignment}
              />
            )}
            {studentTab === 'quizzes' && (
              <StudentInteractiveQuiz
                quizzes={data.quizzes}
                currentStudent={currentStudent}
                identity={data.identity}
                selectedQuizId={studentQuizToTake}
                onFinishQuiz={handleFinishQuiz}
                onBackToList={() => setStudentQuizToTake(undefined)}
              />
            )}
            {studentTab === 'progress' && (
              <StudentProgress
                currentStudent={currentStudent}
                data={data}
              />
            )}
            {studentTab === 'announcements' && (
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Pengumuman & Surat Edaran
                </h2>
                <div className="space-y-3">
                  {data.announcements
                    .filter((a) => a.isActive && (a.targetAudience === 'Semua' || a.targetAudience === 'Siswa'))
                    .map((anc) => (
                      <div key={anc.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">{anc.date}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {anc.targetAudience}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{anc.title}</h3>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {anc.content}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Thumb-Zone Ergonomics) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden shadow-lg">
        <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
          {(userRole === 'teacher' 
            ? [
                { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
                { id: 'materials', label: 'Materi', icon: BookOpen },
                { id: 'assignments', label: 'Tugas', icon: FileText },
                { id: 'quizzes', label: 'Kuis', icon: HelpCircle },
                { id: 'attendance', label: 'Presensi', icon: Calendar },
              ]
            : [
                { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
                { id: 'materials', label: 'Materi', icon: BookOpen },
                { id: 'assignments', label: 'Tugas', icon: FileText },
                { id: 'quizzes', label: 'Kuis', icon: HelpCircle },
                { id: 'progress', label: 'Rapor', icon: Award },
              ]
          ).map((item) => {
            const Icon = item.icon;
            const currentTab = userRole === 'teacher' ? teacherTab : studentTab;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (userRole === 'teacher') setTeacherTab(item.id);
                  else setStudentTab(item.id);
                }}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                  isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[10px] mt-1 tracking-tight truncate max-w-[56px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Clean Footer */}
      <footer className="hidden lg:block border-t border-slate-200/90 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">{data.identity.schoolName}</span>
            <span>·</span>
            <span>{data.identity.subject} ({data.identity.academicYear})</span>
          </div>

          <div className="text-center sm:text-right font-medium text-slate-700">
            Pembuat Aplikasi : <strong className="text-emerald-800">By : Dzakirul Husni | Guru MIN 1 Paser</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <LmsApp />
    </ToastProvider>
  );
}
