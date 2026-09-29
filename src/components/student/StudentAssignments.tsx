import React, { useState } from 'react';
import { 
  FileText, 
  Clock, 
  Send, 
  CheckCircle, 
  Copy, 
  MessageSquare, 
  ExternalLink,
  Award
} from 'lucide-react';
import { Assignment, AssignmentSubmission, SchoolIdentity, Student } from '../../types/lms';
import { formatAssignmentForWhatsApp, copyToClipboard } from '../../utils/formatter';
import { useToast } from '../common/Toast';

interface StudentAssignmentsProps {
  assignments: Assignment[];
  currentStudent: Student;
  identity: SchoolIdentity;
  onSubmitAssignment: (assignmentId: string, submission: AssignmentSubmission) => void;
}

export const StudentAssignments: React.FC<StudentAssignmentsProps> = ({
  assignments,
  currentStudent,
  identity,
  onSubmitAssignment
}) => {
  const { showToast } = useToast();
  const [activeSubmittingAsg, setActiveSubmittingAsg] = useState<Assignment | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [linkOrFile, setLinkOrFile] = useState('');

  const handleOpenSubmit = (asg: Assignment) => {
    setActiveSubmittingAsg(asg);
    const existing = asg.submissions.find((s) => s.studentId === currentStudent.id);
    if (existing) {
      setTextAnswer(existing.textAnswer);
      setLinkOrFile(existing.linkOrFile || '');
    } else {
      setTextAnswer('');
      setLinkOrFile('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmittingAsg) return;
    if (!textAnswer.trim() && !linkOrFile.trim()) {
      showToast('Tuliskan teks jawaban atau tautan pengumpulan tugas!', 'error');
      return;
    }

    const newSub: AssignmentSubmission = {
      id: `sub-${Date.now()}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      submittedAt: new Date().toISOString(),
      textAnswer: textAnswer,
      linkOrFile: linkOrFile,
      status: 'Belum Dinilai'
    };

    onSubmitAssignment(activeSubmittingAsg.id, newSub);
    showToast('Tugas berhasil dikirimkan kepada guru!', 'success');
    setActiveSubmittingAsg(null);
  };

  const handleInstantCopy = async (asg: Assignment) => {
    const waText = formatAssignmentForWhatsApp(asg, identity);
    const success = await copyToClipboard(waText);
    if (success) {
      showToast('📋 Format Tugas berhasil disalin ke clipboard!', 'copas');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Tugas & Lembar Kerja Siswa
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Kumpulkan jawaban tugas, unggah dokumentasi praktik mandiri, & lihat nilai guru
        </p>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 text-center py-12 px-4 space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Belum ada tugas dari guru.</p>
          </div>
        ) : (
          assignments.map((asg) => {
            const submission = asg.submissions.find((s) => s.studentId === currentStudent.id);
            const isSubmitted = !!submission;

            return (
              <div
                key={asg.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        {asg.type}
                      </span>
                      <span className="text-xs text-rose-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Batas: {new Date(asg.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      <span className="text-xs text-slate-500">Bobot: {asg.weight}%</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">{asg.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleInstantCopy(asg)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Salin rincian tugas ke WA"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      📋 Salin Tugas
                    </button>
                    <button
                      onClick={() => handleOpenSubmit(asg)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSubmitted
                          ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                          : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 active:scale-95'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isSubmitted ? 'Ubah Pengumpulan' : 'Kirim Jawaban'}
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs">
                  <h4 className="font-bold text-slate-700 mb-1">📝 Petunjuk Tugas:</h4>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                    {asg.instructions}
                  </p>
                </div>

                {/* Submission Status Box */}
                {submission && (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Status: {submission.status}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Diserahkan: {new Date(submission.submittedAt).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-emerald-100">
                      <strong>Jawaban Terkirim:</strong>
                      <p className="mt-1 whitespace-pre-line">{submission.textAnswer || '-'}</p>
                      {submission.linkOrFile && (
                        <a
                          href={submission.linkOrFile}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Lihat Tautan Karya / Dokumen
                        </a>
                      )}
                    </div>

                    {/* Teacher Feedback & Grade */}
                    {submission.score !== undefined && (
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-emerald-200/80">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-emerald-900 block">
                            Catatan & Ulasan Guru:
                          </span>
                          <p className="text-xs text-emerald-800 italic">
                            "{submission.teacherFeedback || 'Kerja bagus, terus dipertahankan!'}"
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[11px] text-slate-500 block">Nilai Tugas:</span>
                          <span className="text-2xl font-black text-emerald-700 tabular-nums">
                            {submission.score} <span className="text-xs text-slate-400">/ 100</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Submit Assignment Modal */}
      {activeSubmittingAsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Kumpulkan Tugas: {activeSubmittingAsg.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Jenis: {activeSubmittingAsg.type} · Batas: {new Date(activeSubmittingAsg.deadline).toLocaleDateString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => setActiveSubmittingAsg(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teks Jawaban / Laporan Praktik Siswa *
                </label>
                <textarea
                  rows={6}
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Tuliskan jawaban Anda di sini atau rangkuman hasil kerja..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tautan Lampiran / Foto Praktik (Google Drive / Canva / Dokumen)
                </label>
                <input
                  type="url"
                  value={linkOrFile}
                  onChange={(e) => setLinkOrFile(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Pastikan izin berbagi tautan sudah disetel ke "Siapa saja yang memiliki link".
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveSubmittingAsg(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors"
                >
                  Kirim Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
