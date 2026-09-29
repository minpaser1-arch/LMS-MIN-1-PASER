import React from 'react';
import { 
  Award, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Calendar, 
  Star, 
  CheckCircle, 
  Sparkles,
  Flame,
  Printer
} from 'lucide-react';
import { LmsDataState, Student } from '../../types/lms';

interface StudentProgressProps {
  currentStudent: Student;
  data: LmsDataState;
}

export const StudentProgress: React.FC<StudentProgressProps> = ({
  currentStudent,
  data
}) => {
  const { identity, materials, assignments, quizzes, attendance, studentCompletedMaterials, portfolios } = data;

  // 1. Material progress
  const completedMatIds = studentCompletedMaterials[currentStudent.id] || [];
  const matPercent = materials.length > 0 ? Math.round((completedMatIds.length / materials.length) * 100) : 0;

  // 2. Assignment progress
  const submittedAsgs = assignments.filter((a) =>
    a.submissions.some((s) => s.studentId === currentStudent.id)
  );
  const asgPercent = assignments.length > 0 ? Math.round((submittedAsgs.length / assignments.length) * 100) : 0;

  // 3. Quiz average
  const quizScores: number[] = [];
  quizzes.forEach((q) => {
    const sub = q.submissions.find((s) => s.studentId === currentStudent.id);
    if (sub) quizScores.push(sub.score);
  });
  const avgQuizScore = quizScores.length > 0
    ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
    : 0;

  // 4. Attendance
  let myH = 0;
  let myS = 0;
  let myI = 0;
  let myA = 0;
  attendance.forEach((att) => {
    const st = att.records[currentStudent.id] || 'H';
    if (st === 'H') myH++;
    if (st === 'S') myS++;
    if (st === 'I') myI++;
    if (st === 'A') myA++;
  });
  const totalDays = attendance.length;
  const attendanceRate = totalDays > 0 ? Math.round((myH / totalDays) * 100) : 100;

  // Portfolios
  const myPortfolios = portfolios.filter((p) => p.studentId === currentStudent.id);

  // Overall Score estimation
  const overallScore = Math.round((matPercent * 0.2) + (asgPercent * 0.3) + ((avgQuizScore || 75) * 0.3) + (attendanceRate * 0.2));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Rapor & Progres Belajar Siswa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pantau capaian materi, tugas terkirim, nilai kuis, dan tingkat kehadiran harian
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          Cetak Lembar Capaian
        </button>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Materi */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Materi Dibaca</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{matPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${matPercent}%` }} />
          </div>
          <span className="text-[11px] text-slate-400 block">{completedMatIds.length} dari {materials.length} topik</span>
        </div>

        {/* Tugas */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Tugas Diserahkan</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{asgPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${asgPercent}%` }} />
          </div>
          <span className="text-[11px] text-slate-400 block">{submittedAsgs.length} dari {assignments.length} tugas</span>
        </div>

        {/* Kuis */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Rerata Kuis</span>
            <HelpCircle className="w-4 h-4 text-violet-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{avgQuizScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-violet-500 h-full rounded-full transition-all" style={{ width: `${avgQuizScore}%` }} />
          </div>
          <span className="text-[11px] text-slate-400 block">KKM: {identity.kkm}</span>
        </div>

        {/* Kehadiran */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Kehadiran</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{attendanceRate}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full transition-all" style={{ width: `${attendanceRate}%` }} />
          </div>
          <span className="text-[11px] text-slate-400 block">{myH} Hari Hadir ({totalDays} Total Hari)</span>
        </div>
      </div>

      {/* Achievement Badges & Recognition */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Lencana & Apresiasi Prestasi Siswa
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Badge 1 */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-xs">
              🌟
            </div>
            <div>
              <h4 className="font-bold text-xs text-emerald-950">Penjelajah Materi</h4>
              <p className="text-[11px] text-emerald-800">
                {matPercent >= 50 ? 'Aktif menyelesaikan modul ajar mandiri' : 'Terus baca modul ajar untuk membuka'}
              </p>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="p-4 rounded-xl border border-violet-200 bg-violet-50/50 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-violet-500 text-white flex items-center justify-center font-black text-xl shadow-xs">
              🎯
            </div>
            <div>
              <h4 className="font-bold text-xs text-violet-950">Master Kuis Pintar</h4>
              <p className="text-[11px] text-violet-800">
                {avgQuizScore >= identity.kkm ? 'Mencapai target KKM pada evaluasi' : 'Tingkatkan latihan kuis harian'}
              </p>
            </div>
          </div>

          {/* Badge 3 */}
          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center font-black text-xl shadow-xs">
              🏆
            </div>
            <div>
              <h4 className="font-bold text-xs text-teal-950">Disiplin Hadir</h4>
              <p className="text-[11px] text-teal-800">
                {attendanceRate >= 80 ? 'Rajin mengikuti seluruh pertemuan KBM' : 'Jaga konsistensi kehadiran'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* My Portfolios */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          Karya & Portofolio yang Disetujui Guru ({myPortfolios.length})
        </h3>

        {myPortfolios.length === 0 ? (
          <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
            Belum ada portofolio yang didokumentasikan. Kumpulkan proyek atau praktik terbaikmu!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myPortfolios.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {item.category}
                  </span>
                  <div className="flex items-center text-amber-400 text-xs">
                    {[1, 2, 3, 4, 5].map((st) => (
                      <span key={st}>{st <= item.teacherRating ? '★' : '☆'}</span>
                    ))}
                  </div>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                {item.teacherNotes && (
                  <p className="text-[11px] text-emerald-800 italic bg-white p-2 rounded border border-emerald-100">
                    💬 Guru: "{item.teacherNotes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
