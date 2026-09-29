import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Award, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Star,
  Flame,
  Calendar
} from 'lucide-react';
import { LmsDataState, Student } from '../../types/lms';

interface StudentDashboardProps {
  currentStudent: Student;
  data: LmsDataState;
  onNavigateTab: (tabId: string) => void;
  onStartQuiz: (quizId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentStudent,
  data,
  onNavigateTab,
  onStartQuiz
}) => {
  const { identity, materials, assignments, quizzes, announcements, studentCompletedMaterials } = data;

  const completedMatIds = studentCompletedMaterials[currentStudent.id] || [];
  const readMaterialCount = completedMatIds.length;
  const materialPercent = materials.length > 0 ? Math.round((readMaterialCount / materials.length) * 100) : 0;

  // Assignments submitted
  const submittedAssignments = assignments.filter((a) =>
    a.submissions.some((s) => s.studentId === currentStudent.id)
  );

  // Quizzes submitted
  const studentQuizzesDone = quizzes.filter((q) =>
    q.submissions.some((s) => s.studentId === currentStudent.id)
  );

  // Pending quizzes
  const pendingQuizzes = quizzes.filter(
    (q) => !q.submissions.some((s) => s.studentId === currentStudent.id)
  );

  // Average quiz score
  const studentScores: number[] = [];
  quizzes.forEach((q) => {
    const sub = q.submissions.find((s) => s.studentId === currentStudent.id);
    if (sub) studentScores.push(sub.score);
  });
  const avgQuiz = studentScores.length > 0
    ? Math.round(studentScores.reduce((a, b) => a + b, 0) / studentScores.length)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 sm:p-8 shadow-xl shadow-emerald-950/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ruang Belajar Mandiri · {identity.schoolName}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Halo, {currentStudent.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-emerald-50 max-w-xl leading-relaxed">
              Mata Pelajaran: <strong className="text-white">{identity.subject}</strong> · Kelas {identity.grade} · Guru: {identity.teacherName}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 shrink-0">
            <div className="text-center">
              <span className="text-[11px] text-emerald-100 font-medium block">Progres Materi</span>
              <span className="text-2xl font-black text-white tabular-nums">{materialPercent}%</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <span className="text-[11px] text-emerald-100 font-medium block">Skor Kuis</span>
              <span className="text-2xl font-black text-amber-300 tabular-nums">{avgQuiz > 0 ? avgQuiz : '-'}</span>
            </div>
          </div>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-6 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Quick Action Navigation Grid for Mobile-First usage */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => onNavigateTab('materials')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 w-fit group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm mt-3">Materi Belajar</h3>
          <p className="text-xs text-slate-500 mt-0.5">{materials.length} Modul Aktif</p>
        </div>

        <div
          onClick={() => onNavigateTab('assignments')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 w-fit group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm mt-3">Tugas & Praktik</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {submittedAssignments.length} / {assignments.length} Selesai
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('quizzes')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="p-2.5 rounded-xl bg-violet-50 text-violet-700 w-fit group-hover:scale-110 transition-transform">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm mt-3">Kuis Interaktif</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {pendingQuizzes.length > 0 ? `${pendingQuizzes.length} Belum Dikerjakan` : 'Semua Selesai! 🎉'}
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('progress')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 w-fit group-hover:scale-110 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm mt-3">Rapor & Progres</h3>
          <p className="text-xs text-slate-500 mt-0.5">Capaian Belajar</p>
        </div>
      </div>

      {/* Main Grid: Pending Tasks / Quizzes and Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Urgent Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Quizzes to Take */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-violet-600" />
                <h3 className="font-bold text-slate-900 text-sm">Kuis Interaktif Siap Dikerjakan</h3>
              </div>
              <button
                onClick={() => onNavigateTab('quizzes')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Buka Semua &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {quizzes.map((quiz) => {
                const sub = quiz.submissions.find((s) => s.studentId === currentStudent.id);

                return (
                  <div
                    key={quiz.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-800">
                        {quiz.topic}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{quiz.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span>⏱️ {quiz.timeLimitMinutes} Menit</span>
                        <span>·</span>
                        <span>{quiz.questions.length} Butir Soal</span>
                      </p>
                    </div>

                    <div className="shrink-0">
                      {sub ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                            Nilai: {sub.score} / 100
                          </span>
                          <button
                            onClick={() => onStartQuiz(quiz.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
                          >
                            Ulas Kuis
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onStartQuiz(quiz.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-600/20 transition-all active:scale-95"
                        >
                          Mulai Kuis Sekarang
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assignments Due */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Tugas & Praktik Saya</h3>
              </div>
              <button
                onClick={() => onNavigateTab('assignments')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Lihat Semua &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {assignments.map((asg) => {
                const sub = asg.submissions.find((s) => s.studentId === currentStudent.id);

                return (
                  <div
                    key={asg.id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          {asg.type}
                        </span>
                        <span className="text-xs text-rose-500 font-medium">
                          Batas: {new Date(asg.deadline).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{asg.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{asg.instructions}</p>
                    </div>

                    <div className="shrink-0">
                      {sub ? (
                        <div className="text-right">
                          <span className="text-[11px] font-bold text-emerald-700 block">
                            ✓ Sudah Dikumpulkan
                          </span>
                          {sub.score !== undefined && (
                            <span className="text-xs font-extrabold text-slate-800">
                              Nilai: {sub.score}
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => onNavigateTab('assignments')}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
                        >
                          Kerjakan Tugas
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Class Announcements */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              Pengumuman Guru
            </h3>

            <div className="space-y-3">
              {announcements
                .filter((a) => a.isActive)
                .slice(0, 3)
                .map((anc) => (
                  <div
                    key={anc.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                  >
                    <span className="text-[10px] font-semibold text-slate-400">{anc.date}</span>
                    <h4 className="text-xs font-bold text-slate-800">{anc.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {anc.content}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Student Profile Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white">
                {currentStudent.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold">{currentStudent.name}</h4>
                <p className="text-[11px] text-slate-400">NIS: {currentStudent.nis} · No. Absen {currentStudent.studentNo}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-1">
              <p>Kelas: <span className="font-semibold text-white">Kelas {identity.grade} ({identity.schoolName})</span></p>
              <p>Guru: <span className="font-semibold text-emerald-400">{identity.teacherName}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
