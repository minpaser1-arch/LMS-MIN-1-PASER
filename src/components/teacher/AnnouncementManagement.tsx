import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Copy, 
  Pin, 
  Calendar, 
  X,
  Share2
} from 'lucide-react';
import { Announcement, SchoolIdentity } from '../../types/lms';
import { formatAnnouncementForWhatsApp, copyToClipboard } from '../../utils/formatter';
import { useToast } from '../common/Toast';

interface AnnouncementManagementProps {
  announcements: Announcement[];
  identity: SchoolIdentity;
  onUpdateAnnouncements: (newAnnouncements: Announcement[]) => void;
  onOpenCopasModal: (title: string, waText: string, docText?: string, category?: string) => void;
}

export const AnnouncementManagement: React.FC<AnnouncementManagementProps> = ({
  announcements,
  identity,
  onUpdateAnnouncements,
  onOpenCopasModal
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    isActive: true,
    isPinned: false,
    targetAudience: 'Semua' as Announcement['targetAudience']
  });

  const handleOpenAdd = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      isActive: true,
      isPinned: false,
      targetAudience: 'Semua'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (anc: Announcement) => {
    setEditingAnnouncement(anc);
    setFormData({
      title: anc.title,
      content: anc.content,
      date: anc.date,
      isActive: anc.isActive,
      isPinned: anc.isPinned,
      targetAudience: anc.targetAudience
    });
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Judul dan isi pengumuman wajib diisi!', 'error');
      return;
    }

    if (editingAnnouncement) {
      const updated = announcements.map((a) =>
        a.id === editingAnnouncement.id
          ? {
              ...a,
              title: formData.title,
              content: formData.content,
              date: formData.date,
              isActive: formData.isActive,
              isPinned: formData.isPinned,
              targetAudience: formData.targetAudience
            }
          : a
      );
      onUpdateAnnouncements(updated);
      showToast('Pengumuman berhasil diperbarui.', 'success');
    } else {
      const newAnc: Announcement = {
        id: `anc-${Date.now()}`,
        title: formData.title,
        content: formData.content,
        date: formData.date,
        isActive: formData.isActive,
        isPinned: formData.isPinned,
        targetAudience: formData.targetAudience
      };
      onUpdateAnnouncements([newAnc, ...announcements]);
      showToast('Pengumuman baru berhasil diterbitkan.', 'success');
    }

    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus pengumuman ini?')) {
      onUpdateAnnouncements(announcements.filter((a) => a.id !== id));
      showToast('Pengumuman telah dihapus.', 'info');
    }
  };

  const handleTogglePin = (anc: Announcement) => {
    const updated = announcements.map((a) =>
      a.id === anc.id ? { ...a, isPinned: !a.isPinned } : a
    );
    onUpdateAnnouncements(updated);
    showToast(anc.isPinned ? 'Pin dilepas.' : 'Pengumuman disematkan di atas.', 'info');
  };

  const handleInstantCopy = async (anc: Announcement) => {
    const waText = formatAnnouncementForWhatsApp(anc, identity);
    const success = await copyToClipboard(waText);
    if (success) {
      showToast('📋 Broadcast Pengumuman WhatsApp berhasil disalin!', 'copas');
    }
  };

  const filteredAnnouncements = announcements
    .filter((a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Papan Pengumuman & Informasi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Sebarkan info ujian, jadwal tatap muka, edaran madrasah, & broadcast cepat ke WA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Buat Pengumuman
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pengumuman..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 text-center py-12 px-4 space-y-3">
            <Bell className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Belum ada pengumuman.</p>
            <p className="text-xs text-slate-500">Klik "Buat Pengumuman" untuk menyiarkan informasi baru.</p>
          </div>
        ) : (
          filteredAnnouncements.map((anc) => (
            <div
              key={anc.id}
              className={`p-5 rounded-2xl border transition-all ${
                anc.isPinned
                  ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                  : 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {anc.isPinned && (
                      <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                        <Pin className="w-3 h-3" /> Disematkan
                      </span>
                    )}
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Untuk: {anc.targetAudience}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {anc.date}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{anc.title}</h3>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    onClick={() => handleInstantCopy(anc)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                    title="Salin pengumuman format WhatsApp"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    📋 COPAS WA
                  </button>
                  <button
                    onClick={() => handleTogglePin(anc)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      anc.isPinned
                        ? 'text-amber-600 bg-amber-100 hover:bg-amber-200'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                    title={anc.isPinned ? 'Lepas Pin' : 'Sematkan Pengumuman'}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(anc)}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(anc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 pt-3 leading-relaxed whitespace-pre-wrap">
                {anc.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Announcement Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                {editingAnnouncement ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Pengumuman *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Jadwal Praktikum Laboratorium & Penilaian Harian"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sasaran Penerima *
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Semua">Semua (Siswa & Wali Murid)</option>
                    <option value="Siswa">Khusus Siswa</option>
                    <option value="Wali Murid">Khusus Wali Murid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Terbit *
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
                  Isi Pesan / Pengumuman *
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Tuliskan isi pengumuman secara jelas dan lengkap..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Sematkan di Atas (Pin)
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Status Aktif Tayang
                </label>
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
                  Simpan Pengumuman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
