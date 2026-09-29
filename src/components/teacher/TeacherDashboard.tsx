import React from 'react';
import { 
  Users, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Bell, 
  TrendingUp, 
  CheckCircle, 
  Copy, 
  Plus, 
  Calendar,
  Sparkles,
  School,
  Award
} from 'lucide-react';
import { LmsDataState } from '../../types/lms';
import { formatAttendanceForWhatsApp, copyToClipboard } from '../../utils/formatter';
import { useToast } from '../common/Toast';

interface TeacherDashboardProps {
  data: LmsDataState;
  onNavigateTab: (tabId: string) => void;
  onOpenCopasModal: (title: string, waText: string, docText?: string, category?: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  data,
  onNavigateTab,
  onOpenCopasModal
}) => {
  const { showToast } = useToast();
  const { identity, students, materials, assignments, quizzes, attendance, announcements } = data;

  // Calculate stats
  const totalStudents = students.length;
  const totalMaterials = materials.length;
  const totalAssignments = assignments.length;
  const totalQuizzes = quizzes.length;
  const activeAnnouncements = announcements.filter(a => a.isActive).length;

  // Latest attendance record
  const latestAttendance = attendance.length > 0 
    ? attendance[attendance.length - 1] 
    : null;
    
  let todayHadirCount = 0;
  if (latestAttendance) {
    Object.values(latestAttendance.records).forEach(status => {
      if (status === 'H') todayHadirCount++;
    });
  }
  const attendancePercentage = totalStudents > 0 && latestAttendance
    ? Math.round((todayHadirCount / totalStudents) * 100)
    : 100;

  // Average Quiz Score across all student submissions
  let totalScoreSum = 0;
  let totalSubmissionCount = 0;
  quizzes.forEach(q => {
    q.submissions.forEach(sub => {
      totalScoreSum += sub.score;
      totalSubmissionCount++;
    });
  });
  const avgQuizScore = totalSubmissionCount > 0 
    ? Math.round(totalScoreSum / totalSubmissionCount) 
    : 0;

  const handleCopasLatestAttendance = async () => {
    if (!latestAttendance) {
      showToast('Belum ada data presensi untuk disalin.', 'error');
      return;
    }
    const waText = formatAttendanceForWhatsApp(latestAttendance, students, identity);
    const success = await copyToClipboard(waText);
    if (success) {
      showToast('📋 Rekap Presensi berhasil disalin ke clipboard! Siap kirim ke WA.', 'copas');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-5 sm:p-7 shadow-xl shadow-emerald-950/10 border border-emerald-700/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold backdrop-blur-xs">
              <School className="w-3.5 h-3.5" />
              <span>{identity.schoolName} · {identity.level} ({identity.phase})</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Selamat Bertugas, {identity.teacherName}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Mata Pelajaran: <span className="font-semibold text-white">{identity.subject}</span> · Kelas {identity.grade} · Tahun Ajaran {identity.academicYear} ({identity.semester})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
            <button
              onClick={() => onNavigateTab('materials')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-emerald-900 hover:bg-emerald-50 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              Tambah Materi
            </button>
            <button
              onClick={() => onNavigateTab('quizzes')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600/90 text-white hover:bg-emerald-500 border border-emerald-400/30 shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Buat Kuis Baru
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-8 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Siswa */}
        <div 
          onClick={() => onNavigateTab('students')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Siswa Aktif</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{totalStudents}</span>
            <span className="text-xs text-slate-400">Anak</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">Kelas {identity.grade}</p>
        </div>

        {/* Materi */}
        <div 
          onClick={() => onNavigateTab('materials')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Materi</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{totalMaterials}</span>
            <span className="text-xs text-slate-400">Topik</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1 truncate">Siap Belajar</p>
        </div>

        {/* Tugas */}
        <div 
          onClick={() => onNavigateTab('assignments')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tugas Siswa</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{totalAssignments}</span>
            <span className="text-xs text-slate-400">Tugas</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">Praktik & Proyek</p>
        </div>

        {/* Kuis */}
        <div 
          onClick={() => onNavigateTab('quizzes')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kuis Online</span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600 group-hover:scale-105 transition-transform">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{totalQuizzes}</span>
            <span className="text-xs text-slate-400">Set</span>
          </div>
          <p className="text-[11px] text-violet-600 font-medium mt-1 truncate">Otomatis Dinilai</p>
        </div>

        {/* Presensi Hari Ini */}
        <div 
          onClick={() => onNavigateTab('attendance')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kehadiran</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 group-hover:scale-105 transition-transform">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{attendancePercentage}%</span>
          </div>
          <p className="text-[11px] text-teal-600 font-medium mt-1 truncate">{todayHadirCount} Hadir</p>
        </div>

        {/* Rata-rata Kuis */}
        <div 
          onClick={() => onNavigateTab('grades')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Rerata Kuis</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-105 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{avgQuizScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">KKM: {identity.kkm}</p>
        </div>
      </div>

      {/* Main Grid: Quick Action COPAS & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Broadcast & Presensi Widget */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Presensi & Broadcast Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Rekap Presensi Harian Siap Kirim</h3>
                  <p className="text-xs text-slate-500">
                    {latestAttendance ? `Tanggal: ${latestAttendance.date}` : 'Belum ada data'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopasLatestAttendance}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  📋 COPAS ke Grup WA
                </button>
                <button
                  onClick={() => onNavigateTab('attendance')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Kelola Presensi
                </button>
              </div>
            </div>

            {/* Quick Students Attendance Summary Badges */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-emerald-50/80 rounded-xl p-3 border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-800">Hadir (H)</span>
                <p className="text-xl font-bold text-emerald-700 mt-0.5 tabular-nums">{todayHadirCount}</p>
              </div>
              <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-100">
                <span className="text-xs font-semibold text-amber-800">Sakit (S)</span>
                <p className="text-xl font-bold text-amber-700 mt-0.5 tabular-nums">
                  {latestAttendance ? Object.values(latestAttendance.records).filter(s => s === 'S').length : 0}
                </p>
              </div>
              <div className="bg-sky-50/80 rounded-xl p-3 border border-sky-100">
                <span className="text-xs font-semibold text-sky-800">Izin (I)</span>
                <p className="text-xl font-bold text-sky-700 mt-0.5 tabular-nums">
                  {latestAttendance ? Object.values(latestAttendance.records).filter(s => s === 'I').length : 0}
                </p>
              </div>
              <div className="bg-rose-50/80 rounded-xl p-3 border border-rose-100">
                <span className="text-xs font-semibold text-rose-800">Alpa (A)</span>
                <p className="text-xl font-bold text-rose-700 mt-0.5 tabular-nums">
                  {latestAttendance ? Object.values(latestAttendance.records).filter(s => s === 'A').length : 0}
                </p>
              </div>
            </div>
          </div>

          {/* Quick List of Active Materials */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Materi Pembelajaran Tersedia</h3>
                <p className="text-xs text-slate-500">Klik tombol COPAS untuk langsung menyalin format pengumuman materi ke WA</p>
              </div>
              <button
                onClick={() => onNavigateTab('materials')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Lihat Semua &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {materials.map((mat) => (
                <div 
                  key={mat.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                      {mat.topic}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800">{mat.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{mat.learningObjectives}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenCopasModal(
                        mat.title,
                        `format_mat_${mat.id}`,
                        undefined,
                        'Materi'
                      )}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100/80 hover:bg-emerald-200 text-emerald-800 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      📋 COPAS WA
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Announcements & Information */}
        <div className="space-y-6">
          {/* Announcements Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">Pengumuman Aktif</h3>
              </div>
              <button
                onClick={() => onNavigateTab('announcements')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Kelola
              </button>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map((anc) => (
                <div 
                  key={anc.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {anc.targetAudience}
                    </span>
                    <span className="text-[11px] text-slate-400">{anc.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">{anc.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{anc.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Profile & Creator Info */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                DH
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{identity.teacherName}</h4>
                <p className="text-xs text-slate-400">NIP: {identity.teacherNip}</p>
                <p className="text-[11px] text-emerald-400 font-semibold">{identity.schoolName}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Jenjang:</span>
                <span className="font-semibold text-white">{identity.level} ({identity.phase})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Target KKM:</span>
                <span className="font-semibold text-emerald-400">{identity.kkm}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Aplikasi Dibuat Oleh:</span>
                <span className="font-bold text-amber-300">By : Dzakirul Husni</span>
              </div>
              <p className="text-[11px] text-slate-400 italic text-center pt-2">
                Guru MIN 1 Paser · Kalimantan Timur
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
