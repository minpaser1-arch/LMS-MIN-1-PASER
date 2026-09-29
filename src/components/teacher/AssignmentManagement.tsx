import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Copy, 
  Calendar, 
  Clock, 
  CheckCircle, 
  X,
  ExternalLink,
  MessageSquare,
  Award
} from 'lucide-react';
import { Assignment, AssignmentType, AssignmentSubmission, SchoolIdentity, Student, LearningMaterial } from '../../types/lms';
import { formatAssignmentForWhatsApp, copyToClipboard } from '../../utils/formatter';
import { useToast } from '../common/Toast';

interface AssignmentManagementProps {
  assignments: Assignment[];
  materials: LearningMaterial[];
  students: Student[];
  identity: SchoolIdentity;
  onUpdateAssignments: (newAssignments: Assignment[]) => void;
  onOpenCopasModal: (title: string, waText: string, docText?: string, category?: string) => void;
}

export const AssignmentManagement: React.FC<AssignmentManagementProps> = ({
  assignments,
  materials,
  students,
  identity,
  onUpdateAssignments,
  onOpenCopasModal
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  
  // Grading modal states
  const [activeGradingAssignment, setActiveGradingAssignment] = useState<Assignment | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<AssignmentSubmission | null>(null);
  const [gradingScore, setGradingScore] = useState<number>(85);
  const [gradingFeedback, setGradingFeedback] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    relatedMaterialId: '',
    deadlineDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    deadlineTime: '23:59',
    type: 'Praktik' as AssignmentType,
    weight: 20
  });

  const assignmentTypes: AssignmentType[] = [
    'Pilihan Ganda',
    'Isian Singkat',
    'Uraian',
    'Proyek',
    'Praktik',
    'Portofolio'
  ];

  const handleOpenAdd = () => {
    setEditingAssignment(null);
    setFormData({
      title: '',
      instructions: '1. Bacalah petunjuk pengerjaan dengan cermat.\n2. Tuliskan jawaban atau dokumentasikan praktik/proyek.\n3. Kumpulkan sebelum tenggat waktu berakhir.',
      relatedMaterialId: materials.length > 0 ? materials[0].id : '',
      deadlineDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      deadlineTime: '23:59',
      type: 'Praktik',
      weight: 20
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (asg: Assignment) => {
    setEditingAssignment(asg);
    const d = new Date(asg.deadline);
    const dateStr = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
    const timeStr = !isNaN(d.getTime()) ? d.toTimeString().slice(0, 5) : '23:59';
    
    setFormData({
      title: asg.title,
      instructions: asg.instructions,
      relatedMaterialId: asg.relatedMaterialId || '',
      deadlineDate: dateStr,
      deadlineTime: timeStr,
      type: asg.type,
      weight: asg.weight
    });
    setIsFormOpen(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.instructions.trim()) {
      showToast('Judul dan instruksi tugas wajib diisi!', 'error');
      return;
    }

    const fullDeadline = new Date(`${formData.deadlineDate}T${formData.deadlineTime}:00`).toISOString();

    if (editingAssignment) {
      const updated = assignments.map((a) =>
        a.id === editingAssignment.id
          ? {
              ...a,
              title: formData.title,
              instructions: formData.instructions,
              relatedMaterialId: formData.relatedMaterialId,
              deadline: fullDeadline,
              type: formData.type,
              weight: Number(formData.weight)
            }
          : a
      );
      onUpdateAssignments(updated);
      showToast(`Tugas "${formData.title}" berhasil diperbarui.`, 'success');
    } else {
      const newAssignment: Assignment = {
        id: `asg-${Date.now()}`,
        title: formData.title,
        instructions: formData.instructions,
        relatedMaterialId: formData.relatedMaterialId,
        deadline: fullDeadline,
        type: formData.type,
        weight: Number(formData.weight),
        submissions: [],
        createdAt: new Date().toISOString()
      };
      onUpdateAssignments([...assignments, newAssignment]);
      showToast(`Tugas baru "${formData.title}" berhasil dibuat.`, 'success');
    }

    setIsFormOpen(false);
  };

  const handleDeleteAssignment = (asg: Assignment) => {
    if (window.confirm(`Yakin ingin menghapus tugas "${asg.title}"?`)) {
      const filtered = assignments.filter((a) => a.id !== asg.id);
      onUpdateAssignments(filtered);
      showToast(`Tugas "${asg.title}" telah dihapus.`, 'info');
    }
  };

  const handleInstantCopy = async (asg: Assignment) => {
    const waText = formatAssignmentForWhatsApp(asg, identity);
    const success = await copyToClipboard(waText);
    if (success) {
      showToast('📋 Format Tugas WhatsApp Berhasil disalin!', 'copas');
    }
  };

  const handleOpenGradingDialog = (asg: Assignment, sub: AssignmentSubmission) => {
    setActiveGradingAssignment(asg);
    setActiveSubmission(sub);
    setGradingScore(sub.score || 85);
    setGradingFeedback(sub.teacherFeedback || 'Bagus sekali, terus tingkatkan ketelitian!');
  };

  const handleSaveGrade = () => {
    if (!activeGradingAssignment || !activeSubmission) return;

    const updatedAssignments = assignments.map((a) => {
      if (a.id === activeGradingAssignment.id) {
        const updatedSubs = a.submissions.map((sub) => {
          if (sub.id === activeSubmission.id) {
            return {
              ...sub,
              status: 'Sudah Dinilai' as const,
              score: Number(gradingScore),
              teacherFeedback: gradingFeedback
            };
          }
          return sub;
        });
        return { ...a, submissions: updatedSubs };
      }
      return a;
    });

    onUpdateAssignments(updatedAssignments);
    showToast(`Nilai untuk ${activeSubmission.studentName} berhasil disimpan.`, 'success');
    setActiveSubmission(null);
  };

  // Filter assignments
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.instructions.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Penugasan & Praktik Siswa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pilihan Ganda, Isian, Proyek, Praktik, Portofolio, Penilaian, & COPAS WA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Buat Tugas Baru
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul tugas..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-500 font-medium shrink-0">Jenis:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                typeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({assignments.length})
            </button>
            {assignmentTypes.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  typeFilter === t
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 text-center py-12 px-4 space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Belum ada tugas yang dibuat.</p>
            <p className="text-xs text-slate-500">Klik "Buat Tugas Baru" untuk menambahkan lembar tugas untuk siswa.</p>
          </div>
        ) : (
          filteredAssignments.map((asg) => {
            const relatedMat = materials.find((m) => m.id === asg.relatedMaterialId);
            const totalSubmissions = asg.submissions.length;
            const gradedSubmissions = asg.submissions.filter((s) => s.status === 'Sudah Dinilai').length;

            return (
              <div
                key={asg.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all p-5 space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        {asg.type}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Bobot: <strong className="text-slate-800 tabular-nums">{asg.weight}%</strong>
                      </span>
                      {relatedMat && (
                        <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Materi: {relatedMat.title}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {asg.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>
                        Batas Waktu: <strong className="text-rose-600 font-semibold">{new Date(asg.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                    <button
                      onClick={() => handleInstantCopy(asg)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                      title="Salin langsung format broadcast WhatsApp"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      📋 COPAS WA
                    </button>
                    <button
                      onClick={() => handleOpenEdit(asg)}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Edit Tugas"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(asg)}
                      className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Tugas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 mb-1">📝 Instruksi Pengerjaan:</h4>
                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {asg.instructions}
                  </p>
                </div>

                {/* Submissions Section */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Pengumpulan Siswa ({totalSubmissions} / {students.length}) · {gradedSubmissions} Sudah Dinilai
                    </h4>
                  </div>

                  {totalSubmissions === 0 ? (
                    <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      Belum ada siswa yang mengumpulkan tugas ini.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {asg.submissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{sub.studentName}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(sub.submittedAt).toLocaleString('id-ID')}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  sub.status === 'Sudah Dinilai'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {sub.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-1 italic">
                              "{sub.textAnswer || 'Jawaban via file/tautan'}"
                            </p>
                            {sub.teacherFeedback && (
                              <p className="text-[11px] text-emerald-700 font-medium">
                                Catatan Guru: {sub.teacherFeedback}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {sub.score !== undefined && (
                              <div className="text-right">
                                <span className="text-xs text-slate-400">Nilai: </span>
                                <span className="text-base font-extrabold text-emerald-700 tabular-nums">
                                  {sub.score}
                                </span>
                              </div>
                            )}
                            <button
                              onClick={() => handleOpenGradingDialog(asg, sub)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 transition-colors"
                            >
                              {sub.status === 'Sudah Dinilai' ? 'Ubah Nilai' : 'Beri Nilai'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Assignment Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">
                {editingAssignment ? 'Edit Tugas Siswa' : 'Buat Tugas Baru'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Tugas *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Praktik Pembiasan Cahaya di Rumah"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Tugas *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AssignmentType })}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {assignmentTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bobot Penilaian (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Batas Waktu *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.deadlineDate}
                    onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jam Tenggat Waktu *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.deadlineTime}
                    onChange={(e) => setFormData({ ...formData, deadlineTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Materi Terkait (Opsional)
                </label>
                <select
                  value={formData.relatedMaterialId}
                  onChange={(e) => setFormData({ ...formData, relatedMaterialId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">-- Tanpa Kaitan Materi --</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Petunjuk & Instruksi Pengerjaan *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Langkah-langkah yang harus dilakukan siswa untuk menyelesaikan tugas ini..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grading Dialog Modal */}
      {activeSubmission && activeGradingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  Penilaian Jawaban: {activeSubmission.studentName}
                </h3>
                <p className="text-xs text-slate-500">{activeGradingAssignment.title}</p>
              </div>
              <button
                onClick={() => setActiveSubmission(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 mb-1">Jawaban Siswa:</h4>
                <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {activeSubmission.textAnswer || '(Tidak ada teks jawaban)'}
                </p>
                {activeSubmission.linkOrFile && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <a
                      href={activeSubmission.linkOrFile}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Buka Tautan Lampiran / Foto Praktik Siswa
                    </a>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nilai Skor (0 - 100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradingScore}
                  onChange={(e) => setGradingScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-base font-bold text-emerald-700 border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Apresiasi & Feedback Guru
                </label>
                <textarea
                  rows={3}
                  value={gradingFeedback}
                  onChange={(e) => setGradingFeedback(e.target.value)}
                  placeholder="Beri motivasi dan catatan perbaikan..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveSubmission(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveGrade}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors"
                >
                  Simpan Nilai & Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
