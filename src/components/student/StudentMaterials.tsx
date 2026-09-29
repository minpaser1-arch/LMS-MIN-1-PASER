import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  CheckCircle, 
  Check, 
  Copy, 
  ExternalLink, 
  Video, 
  FileText 
} from 'lucide-react';
import { LearningMaterial, SchoolIdentity, Student } from '../../types/lms';
import { formatMaterialForWhatsApp, copyToClipboard } from '../../utils/formatter';
import { useToast } from '../common/Toast';

interface StudentMaterialsProps {
  materials: LearningMaterial[];
  currentStudent: Student;
  identity: SchoolIdentity;
  completedMaterialIds: string[];
  onToggleCompleteMaterial: (materialId: string) => void;
  onOpenCopasModal: (title: string, waText: string, docText?: string, category?: string) => void;
}

export const StudentMaterials: React.FC<StudentMaterialsProps> = ({
  materials,
  currentStudent,
  identity,
  completedMaterialIds,
  onToggleCompleteMaterial,
  onOpenCopasModal
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');

  const topics = Array.from(new Set(materials.map((m) => m.topic))).filter(Boolean);

  const handleInstantCopy = async (mat: LearningMaterial) => {
    const waText = formatMaterialForWhatsApp(mat, identity);
    const success = await copyToClipboard(waText);
    if (success) {
      showToast('📋 Catatan Materi berhasil disalin ke clipboard!', 'copas');
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.contentSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic === 'ALL' || m.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Materi Pembelajaran
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Pelajari modul ajar mandiri, tonton video, catat konsep penting, & tandai selesai
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari materi pembelajaran..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-500 font-medium shrink-0">Topik:</span>
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

      {/* Materials List */}
      <div className="space-y-4">
        {filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 text-center py-12 px-4 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada materi yang ditemukan.</p>
          </div>
        ) : (
          filteredMaterials.map((mat) => {
            const isCompleted = completedMaterialIds.includes(mat.id);

            return (
              <div
                key={mat.id}
                className={`bg-white rounded-2xl border transition-all p-5 sm:p-6 space-y-4 ${
                  isCompleted
                    ? 'border-emerald-200/90 bg-emerald-50/10'
                    : 'border-slate-200/90 shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {mat.topic}
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                          <Check className="w-3 h-3" /> Sudah Dipelajari
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">{mat.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleInstantCopy(mat)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Salin ringkasan materi ini ke WA/Catatan HP"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      📋 Salin Ringkasan
                    </button>
                    <button
                      onClick={() => onToggleCompleteMaterial(mat.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {isCompleted ? 'Selesai Belajar' : 'Tandai Selesai'}
                    </button>
                  </div>
                </div>

                {/* Objectives */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs">
                  <h4 className="font-bold text-slate-700 mb-1">🎯 Tujuan Pembelajaran:</h4>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                    {mat.learningObjectives}
                  </p>
                </div>

                {/* Content */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-1">📖 Isi Materi Pembelajaran:</h4>
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-slate-200/80">
                    {mat.contentSummary}
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-amber-50/70 rounded-xl p-3.5 border border-amber-100 text-xs">
                  <h4 className="font-bold text-amber-900 mb-1">📝 Petunjuk Belajar Mandiri:</h4>
                  <p className="text-amber-800 whitespace-pre-line leading-relaxed">
                    {mat.instructions}
                  </p>
                </div>

                {/* Media Links */}
                {(mat.referenceLink || mat.videoUrl) && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {mat.referenceLink && (
                      <a
                        href={mat.referenceLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Tautan Buku / Referensi
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
                        Tonton Video Pelajaran
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
