import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  Printer, 
  X,
  Share2
} from 'lucide-react';
import { LearningMaterial, SchoolIdentity } from '../../types/lms';
import { 
  formatMaterialForWhatsApp, 
  formatMaterialForDoc, 
  copyToClipboard 
} from '../../utils/formatter';
import { useToast } from '../common/Toast';

interface MaterialManagementProps {
  materials: LearningMaterial[];
  identity: SchoolIdentity;
  onUpdateMaterials: (newMaterials: LearningMaterial[]) => void;
  onOpenCopasModal: (title: string, waText: string, docText?: string, category?: string) => void;
}

export const MaterialManagement: React.FC<MaterialManagementProps> = ({
  materials,
  identity,
  onUpdateMaterials,
  onOpenCopasModal
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<LearningMaterial | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    learningObjectives: '',
    contentSummary: '',
    instructions: '',
    referenceLink: '',
    videoUrl: '',
    imageUrl: '',
    attachmentInput: ''
  });

  // Extract unique topics
  const topics = Array.from(new Set(materials.map((m) => m.topic))).filter(Boolean);

  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setFormData({
      title: '',
      topic: topics.length > 0 ? topics[0] : 'Bab 1',
      learningObjectives: '',
      contentSummary: '',
      instructions: '1. Pelajari rangkuman materi dengan teliti.\n2. Catat konsep-konsep kunci pada buku tulis.\n3. Diskusikan dengan teman kelompok jika ada hal yang belum dipahami.',
      referenceLink: '',
      videoUrl: '',
      imageUrl: '',
      attachmentInput: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (material: LearningMaterial) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      topic: material.topic,
      learningObjectives: material.learningObjectives,
      contentSummary: material.contentSummary,
      instructions: material.instructions,
      referenceLink: material.referenceLink || '',
      videoUrl: material.videoUrl || '',
      imageUrl: material.imageUrl || '',
      attachmentInput: material.attachments ? material.attachments.join(', ') : ''
    });
    setIsFormOpen(true);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.contentSummary.trim()) {
      showToast('Judul dan ringkasan materi wajib diisi!', 'error');
      return;
    }

    const attachmentsList = formData.attachmentInput
      ? formData.attachmentInput.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    if (editingMaterial) {
      const updated = materials.map((m) =>
        m.id === editingMaterial.id
          ? {
              ...m,
              title: formData.title,
              topic: formData.topic,
              learningObjectives: formData.learningObjectives,
              contentSummary: formData.contentSummary,
              instructions: formData.instructions,
              referenceLink: formData.referenceLink,
              videoUrl: formData.videoUrl,
              imageUrl: formData.imageUrl,
              attachments: attachmentsList,
              updatedAt: new Date().toISOString()
            }
          : m
      );
      onUpdateMaterials(updated);
      showToast(`Materi "${formData.title}" berhasil diperbarui.`, 'success');
    } else {
      const newMaterial: LearningMaterial = {
        id: `mat-${Date.now()}`,
        title: formData.title,
        topic: formData.topic,
        learningObjectives: formData.learningObjectives,
        contentSummary: formData.contentSummary,
        instructions: formData.instructions,
        referenceLink: formData.referenceLink,
        videoUrl: formData.videoUrl,
        imageUrl: formData.imageUrl,
        attachments: attachmentsList,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onUpdateMaterials([...materials, newMaterial]);
      showToast(`Materi "${formData.title}" berhasil ditambahkan.`, 'success');
    }

    setIsFormOpen(false);
  };

  const handleDeleteMaterial = (material: LearningMaterial) => {
    if (window.confirm(`Yakin ingin menghapus materi "${material.title}"?`)) {
      const filtered = materials.filter((m) => m.id !== material.id);
      onUpdateMaterials(filtered);
      showToast(`Materi "${material.title}" telah dihapus.`, 'info');
    }
  };

  const handleInstantCopy = async (material: LearningMaterial) => {
    const waText = formatMaterialForWhatsApp(material, identity);
    const success = await copyToClipboard(waText);
    if (success) {
      showToast('📋 Format WhatsApp Berhasil disalin!', 'copas');
    }
  };

  const handleOpenDetailModal = (material: LearningMaterial) => {
    const waText = formatMaterialForWhatsApp(material, identity);
    const docText = formatMaterialForDoc(material, identity);
    onOpenCopasModal(material.title, waText, docText, 'Materi Pembelajaran');
  };

  // Filter materials
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.learningObjectives.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.contentSummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic === 'ALL' || m.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Materi Pembelajaran
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola modul, rangkuman, instruksi, dan COPAS cepat untuk WhatsApp & Word
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Tambah Materi Baru
          </button>
        </div>
      </div>

      {/* Search and Topic Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul, topik, atau kata kunci..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-500 font-medium shrink-0">Topik / Bab:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setSelectedTopic('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTopic === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({materials.length})
            </button>
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTopic(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedTopic === t
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

      {/* Material Cards List */}
      <div className="space-y-4">
        {filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 text-center py-12 px-4 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Belum ada materi yang sesuai.</p>
            <p className="text-xs text-slate-500">Klik tombol "Tambah Materi Baru" untuk membuat materi pertama Anda.</p>
          </div>
        ) : (
          filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all overflow-hidden p-5 space-y-4"
            >
              {/* Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {mat.topic}
                    </span>
                    <span className="text-xs text-slate-400">
                      Diperbarui: {new Date(mat.updatedAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {mat.title}
                  </h3>
                </div>

                {/* Action Buttons: Instant COPAS, Modal Preview, Edit, Delete */}
                <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                  <button
                    onClick={() => handleInstantCopy(mat)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                    title="Salin langsung format WhatsApp"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    📋 COPAS WA
                  </button>
                  <button
                    onClick={() => handleOpenDetailModal(mat)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Lihat format Word / Preview"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Format Word
                  </button>
                  <button
                    onClick={() => handleOpenEdit(mat)}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Edit Materi"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMaterial(mat)}
                    className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Materi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Learning Objectives */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  🎯 Tujuan Pembelajaran:
                </h4>
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                  {mat.learningObjectives}
                </p>
              </div>

              {/* Content Summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  📖 Ringkasan Materi:
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                  {mat.contentSummary}
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-100/80">
                <h4 className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                  📝 Instruksi Belajar Mandiri:
                </h4>
                <p className="text-xs text-amber-800 whitespace-pre-line leading-relaxed">
                  {mat.instructions}
                </p>
              </div>

              {/* Links & Attachments */}
              {(mat.referenceLink || mat.videoUrl || mat.imageUrl || (mat.attachments && mat.attachments.length > 0)) && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  {mat.referenceLink && (
                    <a
                      href={mat.referenceLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Sumber Bacaan
                    </a>
                  )}
                  {mat.videoUrl && (
                    <a
                      href={mat.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Video Pembelajaran
                    </a>
                  )}
                  {mat.attachments?.map((att, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      {att}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Material Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">
                {editingMaterial ? 'Edit Materi Pembelajaran' : 'Tambah Materi Baru'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Judul Materi Pembelajaran *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Sifat-sifat Cahaya dan Penglihatannya"
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bab / Topik *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="Contoh: Bab 1: Cahaya"
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tujuan Pembelajaran *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.learningObjectives}
                  onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
                  placeholder="Peserta didik dapat memahami sifat-sifat cahaya dan mendemonstrasikannya..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uraian / Ringkasan Materi Lengkap *
                </label>
                <textarea
                  rows={6}
                  required
                  value={formData.contentSummary}
                  onChange={(e) => setFormData({ ...formData, contentSummary: e.target.value })}
                  placeholder="Tuliskan materi pelajaran secara terstruktur dengan poin-poin jelas..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-sans border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instruksi Belajar Mandiri untuk Siswa
                </label>
                <textarea
                  rows={3}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Langkah-langkah yang harus dilakukan siswa setelah membaca..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Link Referensi Tambahan (Web)
                  </label>
                  <input
                    type="url"
                    value={formData.referenceLink}
                    onChange={(e) => setFormData({ ...formData, referenceLink: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Link Video Pembelajaran (YouTube)
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama File Lampiran (pisahkan dengan koma jika lebih dari satu)
                </label>
                <input
                  type="text"
                  value={formData.attachmentInput}
                  onChange={(e) => setFormData({ ...formData, attachmentInput: e.target.value })}
                  placeholder="Contoh: Modul_Ajar.pdf, Lembar_Kerja_Praktik.pdf"
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
                  Simpan Materi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
