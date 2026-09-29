import React, { useState } from 'react';
import { 
  FolderGit2, 
  Plus, 
  Search, 
  Star, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  X,
  MessageSquare
} from 'lucide-react';
import { PortfolioItem, Student, SchoolIdentity } from '../../types/lms';
import { useToast } from '../common/Toast';

interface PortfolioManagementProps {
  portfolios: PortfolioItem[];
  students: Student[];
  identity: SchoolIdentity;
  onUpdatePortfolios: (newPortfolios: PortfolioItem[]) => void;
}

export const PortfolioManagement: React.FC<PortfolioManagementProps> = ({
  portfolios,
  students,
  identity,
  onUpdatePortfolios
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  const categories = [
    'Karya Tulis',
    'Praktik Sains/Ibadah',
    'Keterampilan/Vokasi',
    'Seni & P5',
    'Lainnya'
  ];

  const [formData, setFormData] = useState({
    studentId: students.length > 0 ? students[0].id : '',
    title: '',
    category: 'Praktik Sains/Ibadah' as PortfolioItem['category'],
    date: new Date().toISOString().split('T')[0],
    description: '',
    mediaUrl: '',
    teacherRating: 5,
    teacherNotes: ''
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      studentId: students.length > 0 ? students[0].id : '',
      title: '',
      category: 'Praktik Sains/Ibadah',
      date: new Date().toISOString().split('T')[0],
      description: '',
      mediaUrl: '',
      teacherRating: 5,
      teacherNotes: 'Karya sangat orisinal dan menunjukkan pemahaman konsep yang mendalam.'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      studentId: item.studentId,
      title: item.title,
      category: item.category,
      date: item.date,
      description: item.description,
      mediaUrl: item.mediaUrl || '',
      teacherRating: item.teacherRating,
      teacherNotes: item.teacherNotes || ''
    });
    setIsFormOpen(true);
  };

  const handleSavePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.studentId) {
      showToast('Judul karya dan peserta didik wajib diisi!', 'error');
      return;
    }

    const studentObj = students.find((s) => s.id === formData.studentId);
    const studentName = studentObj ? studentObj.name : 'Siswa';

    if (editingItem) {
      const updated = portfolios.map((p) =>
        p.id === editingItem.id
          ? {
              ...p,
              studentId: formData.studentId,
              studentName: studentName,
              title: formData.title,
              category: formData.category,
              date: formData.date,
              description: formData.description,
              mediaUrl: formData.mediaUrl,
              teacherRating: Number(formData.teacherRating),
              teacherNotes: formData.teacherNotes
            }
          : p
      );
      onUpdatePortfolios(updated);
      showToast('Karya portofolio berhasil diperbarui.', 'success');
    } else {
      const newItem: PortfolioItem = {
        id: `port-${Date.now()}`,
        studentId: formData.studentId,
        studentName: studentName,
        title: formData.title,
        category: formData.category,
        date: formData.date,
        description: formData.description,
        mediaUrl: formData.mediaUrl,
        teacherRating: Number(formData.teacherRating),
        teacherNotes: formData.teacherNotes
      };
      onUpdatePortfolios([...portfolios, newItem]);
      showToast(`Portofolio karya "${formData.title}" berhasil ditambahkan.`, 'success');
    }

    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus karya portofolio ini?')) {
      onUpdatePortfolios(portfolios.filter((p) => p.id !== id));
      showToast('Karya portofolio telah dihapus.', 'info');
    }
  };

  const filteredPortfolios = portfolios.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Portofolio & Dokumentasi Praktik Siswa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Karya, proyek, dokumentasi eksperimen, unjuk kerja praktik, & catatan perkembangan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Tambah Portofolio
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
            placeholder="Cari karya atau nama siswa..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-500 font-medium shrink-0">Kategori:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({portfolios.length})
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  categoryFilter === c
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      {filteredPortfolios.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-12 px-4 space-y-3">
          <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Belum ada karya portofolio.</p>
          <p className="text-xs text-slate-500">Klik "Tambah Portofolio" untuk mendokumentasikan hasil karya atau praktik peserta didik.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPortfolios.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all p-5 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {item.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600">
                      Oleh: <span className="text-emerald-700 font-bold">{item.studentName}</span> · {item.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-700 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {item.description}
                </p>

                {item.mediaUrl && (
                  <div className="pt-1">
                    <a
                      href={item.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Lihat Foto Karya / Dokumentasi Praktik
                    </a>
                  </div>
                )}
              </div>

              {/* Teacher Rating and Accolades */}
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">Apresiasi Guru:</span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= item.teacherRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {item.teacherNotes && (
                  <p className="text-xs text-emerald-800 italic bg-emerald-50/70 p-2 rounded-lg border border-emerald-100/60">
                    💬 "{item.teacherNotes}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Portfolio Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                {editingItem ? 'Edit Karya Portofolio' : 'Tambah Portofolio Siswa'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePortfolio} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Peserta Didik *
                </label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {String(s.studentNo).padStart(2, '0')}. {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Karya / Dokumentasi Praktik *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Pembuatan Alat Peraga Periskop Sederhana"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Karya *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Karya *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Refleksi Karya
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Uraikan proses pembuatan, keunikan karya, atau hasil eksperimen..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tautan Foto Dokumentasi / Video Karya (Google Drive / Web)
                </label>
                <input
                  type="url"
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rating Bintang (1-5)
                  </label>
                  <select
                    value={formData.teacherRating}
                    onChange={(e) => setFormData({ ...formData, teacherRating: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Luar Biasa)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - Sangat Bagus)</option>
                    <option value={3}>⭐⭐⭐ (3 - Cukup Baik)</option>
                    <option value={2}>⭐⭐ (2 - Perlu Ditingkatkan)</option>
                    <option value={1}>⭐ (1 - Belum Selesai)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan Apresiasi Guru
                  </label>
                  <input
                    type="text"
                    value={formData.teacherNotes}
                    onChange={(e) => setFormData({ ...formData, teacherNotes: e.target.value })}
                    placeholder="Kalimat pujian atau motivasi untuk siswa..."
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
                  Simpan Karya
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
