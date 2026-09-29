import React, { useState } from 'react';
import { 
  Settings, 
  School, 
  User, 
  BookOpen, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Award,
  Sparkles,
  Info
} from 'lucide-react';
import { SchoolIdentity, EducationLevel, MerdekaPhase, Semester, LmsDataState } from '../../types/lms';
import { useToast } from '../common/Toast';

interface IdentitySettingsProps {
  identity: SchoolIdentity;
  fullDataState: LmsDataState;
  onUpdateIdentity: (newIdentity: SchoolIdentity) => void;
  onRestoreState: (state: LmsDataState) => void;
  onResetDefault: () => void;
}

export const IdentitySettings: React.FC<IdentitySettingsProps> = ({
  identity,
  fullDataState,
  onUpdateIdentity,
  onRestoreState,
  onResetDefault
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<SchoolIdentity>({ ...identity });

  const educationLevels: EducationLevel[] = ['SD/MI', 'SMP/MTs', 'SMA', 'MA/MAN', 'SMK'];
  const phases: MerdekaPhase[] = ['Fase A', 'Fase B', 'Fase C', 'Fase D', 'Fase E', 'Fase F'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateIdentity(formData);
    showToast('Identitas madrasah/sekolah dan pengampu berhasil disimpan!', 'success');
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullDataState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Cadangan_LMS_${formData.schoolName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Cadangan data JSON berhasil diunduh.', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.identity && parsed.students) {
            onRestoreState(parsed);
            setFormData(parsed.identity);
            showToast('Data LMS berhasil dipulihkan dari file JSON!', 'success');
          } else {
            showToast('Format file JSON tidak sesuai struktur LMS.', 'error');
          }
        } catch (err) {
          showToast('Gagal membaca file cadangan JSON.', 'error');
        }
      };
    }
  };

  // Helper description of current level adaptation
  const getLevelAdaptationInfo = (lvl: EducationLevel) => {
    switch (lvl) {
      case 'SD/MI':
        return {
          title: 'Adaptasi SD / Madrasah Ibtidaiyah (Fase A, B, C)',
          desc: 'Antarmuka ramah anak dengan tipografi jelas, apresiasi visual bintang ceria, bahasa instruksi memotivasi, dan fokus pada eksplorasi sains, keagamaan, serta karakter.'
        };
      case 'SMP/MTs':
        return {
          title: 'Adaptasi SMP / Madrasah Tsanawiyah (Fase D)',
          desc: 'Keseimbangan pemahaman konsep, kuis interaktif berbatas waktu, proyek kelompok terarah, dan penguatan literasi digital.'
        };
      case 'SMA':
      case 'MA/MAN':
        return {
          title: 'Adaptasi SMA / Madrasah Aliyah (Fase E, F)',
          desc: 'Materi terstruktur komprehensif, persiapan asesmen sumatif / UTBK / KSM, bobot nilai analitis, dan pembahasan soal mendalam.'
        };
      case 'SMK':
        return {
          title: 'Adaptasi SMK (Kejuruan / Vokasi)',
          desc: 'Penekanan pada Lembar Kerja Praktik Laboratorium / Bengkel, Proyek Kejuruan, Portofolio Karya Nyata, dan Dokumentasi Praktik Kerja Lapangan.'
        };
    }
  };

  const levelInfo = getLevelAdaptationInfo(formData.level);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Pengaturan Identitas & Sistem
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Sesuaikan identitas madrasah/sekolah, kurikulum merdeka, jenjang, bobot KKM, dan pencadangan data
        </p>
      </div>

      {/* Level Adaptation Highlight Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
            {levelInfo.title}
          </h4>
          <p className="text-xs text-emerald-800/90 leading-relaxed">
            {levelInfo.desc}
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
          <School className="w-5 h-5 text-emerald-700" />
          <h3 className="text-base font-bold text-slate-900">Identitas Sekolah / Madrasah</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Sekolah / Madrasah *
            </label>
            <input
              type="text"
              required
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Contoh: MIN 1 Paser"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jenjang Pendidikan *
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as EducationLevel })}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-emerald-800"
            >
              {educationLevels.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fase Kurikulum Merdeka *
            </label>
            <select
              value={formData.phase}
              onChange={(e) => setFormData({ ...formData, phase: e.target.value as MerdekaPhase })}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
            >
              {phases.map((ph) => (
                <option key={ph} value={ph}>{ph}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tingkat Kelas *
            </label>
            <input
              type="text"
              required
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Contoh: 5, 7, 10, atau X-TKJ"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mata Pelajaran Pengampu *
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Contoh: IPAS, Akidah Akhlak, Matematika, dll."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target KKM / KKTP *
            </label>
            <input
              type="number"
              min="50"
              max="95"
              required
              value={formData.kkm}
              onChange={(e) => setFormData({ ...formData, kkm: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-emerald-700 border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tahun Ajaran *
            </label>
            <input
              type="text"
              required
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Contoh: 2025/2026"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Semester *
            </label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value as Semester })}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>
        </div>

        {/* Guru & Kepala Sekolah */}
        <div className="border-b border-slate-100 pb-3 pt-3 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-700" />
          <h3 className="text-base font-bold text-slate-900">Data Pendidik & Pimpinan</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Guru Pengampu *
            </label>
            <input
              type="text"
              required
              value={formData.teacherName}
              onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NIP Guru (Opsional)
            </label>
            <input
              type="text"
              value={formData.teacherNip}
              onChange={(e) => setFormData({ ...formData, teacherNip: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Kepala Sekolah / Madrasah
            </label>
            <input
              type="text"
              value={formData.headmasterName}
              onChange={(e) => setFormData({ ...formData, headmasterName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NIP Kepala Sekolah (Opsional)
            </label>
            <input
              type="text"
              value={formData.headmasterNip}
              onChange={(e) => setFormData({ ...formData, headmasterNip: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            Simpan Perubahan Identitas
          </button>
        </div>
      </form>

      {/* Data Backup & Reset Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Download className="w-5 h-5 text-slate-700" />
          Cadangan & Pemulihan Data (Backup / Restore)
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Semua data Anda tersimpan aman di browser (LocalStorage). Anda dapat mengunduh salinan cadangan lengkap berkas JSON atau memulihkannya ke komputer/perangkat lain kapan saja.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            Unduh Cadangan JSON
          </button>

          <label className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Pulihkan dari File JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (window.confirm('Yakin ingin mereset data LMS ke data contoh bawaan MIN 1 Paser? Semua perubahan terbaru akan ditimpa.')) {
                onResetDefault();
                showToast('Data LMS telah direset ke data contoh bawaan.', 'info');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Reset ke Data Default
          </button>
        </div>
      </div>

      {/* Creator Info Box (Mandatory User Requirement) */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-900/50 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-extrabold text-xl shadow-inner">
            DH
          </div>
          <div>
            <h4 className="text-base font-extrabold text-white">
              Aplikasi LMS Madrasah & Sekolah Pintar
            </h4>
            <p className="text-xs text-amber-300 font-bold">
              Pembuat Aplikasi : By : Dzakirul Husni | Guru MIN 1 Paser
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Dirancang dan dikembangkan secara khusus untuk membantu para guru di Indonesia dari jenjang SD/MI, SMP/MTs, SMA, MA/MAN, hingga SMK dalam mengelola pembelajaran interaktif, asesmen mandiri, presensi digital, serta komunikasi materi dan tugas secara instan melalui integrasi WhatsApp (COPAS Format Siap Kirim).
        </p>

        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <span>MIN 1 Paser · Tanah Grogot · Kabupaten Paser, Kalimantan Timur</span>
          <span className="text-emerald-400 font-semibold">Versi 1.0 (Interaktif & Responsif)</span>
        </div>
      </div>
    </div>
  );
};
