import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  Printer, 
  Download, 
  Upload, 
  Check, 
  X,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { Student, SchoolIdentity } from '../../types/lms';
import { useToast } from '../common/Toast';

interface StudentManagementProps {
  students: Student[];
  identity: SchoolIdentity;
  onUpdateStudents: (newStudents: Student[]) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  identity,
  onUpdateStudents
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'L' | 'P'>('ALL');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    studentNo: students.length + 1,
    nis: '',
    name: '',
    gender: 'L' as 'L' | 'P',
    grade: identity.grade,
    notes: ''
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      studentNo: students.length > 0 ? Math.max(...students.map(s => s.studentNo)) + 1 : 1,
      nis: `2105${String(students.length + 1).padStart(2, '0')}`,
      name: '',
      gender: 'L',
      grade: identity.grade,
      notes: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      studentNo: student.studentNo,
      nis: student.nis,
      name: student.name,
      gender: student.gender,
      grade: student.grade,
      notes: student.notes
    });
    setIsFormOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Nama peserta didik tidak boleh kosong!', 'error');
      return;
    }

    if (editingStudent) {
      const updated = students.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              studentNo: Number(formData.studentNo),
              nis: formData.nis,
              name: formData.name,
              gender: formData.gender,
              grade: formData.grade,
              notes: formData.notes
            }
          : s
      );
      onUpdateStudents(updated);
      showToast(`Data peserta didik "${formData.name}" berhasil diperbarui.`, 'success');
    } else {
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        studentNo: Number(formData.studentNo),
        nis: formData.nis,
        name: formData.name,
        gender: formData.gender,
        grade: formData.grade,
        notes: formData.notes,
        avatarSeed: formData.name.split(' ')[0]
      };
      onUpdateStudents([...students, newStudent]);
      showToast(`Peserta didik "${formData.name}" berhasil ditambahkan.`, 'success');
    }

    setIsFormOpen(false);
  };

  const handleDeleteStudent = (student: Student) => {
    if (window.confirm(`Yakin ingin menghapus data siswa "${student.name}"?`)) {
      const filtered = students.filter((s) => s.id !== student.id);
      onUpdateStudents(filtered);
      showToast(`Siswa "${student.name}" telah dihapus.`, 'info');
    }
  };

  const handleBulkImport = () => {
    if (!bulkInputText.trim()) {
      showToast('Masukkan baris nama peserta didik terlebih dahulu!', 'error');
      return;
    }

    const lines = bulkInputText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    let startNo = students.length > 0 ? Math.max(...students.map(s => s.studentNo)) + 1 : 1;
    const newStudents: Student[] = [];

    lines.forEach((line) => {
      // Check if format is "Nama" or "Nama, L/P"
      const parts = line.split(',');
      const name = parts[0].replace(/^\d+[\.\)]\s*/, '').trim(); // Remove leading numbering like "1. " if present
      const genderRaw = parts[1]?.trim().toUpperCase();
      const gender: 'L' | 'P' = genderRaw === 'P' || genderRaw === 'PEREMPUAN' ? 'P' : 'L';

      if (name) {
        newStudents.push({
          id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          studentNo: startNo++,
          nis: `2105${String(startNo).padStart(2, '0')}`,
          name: name,
          gender: gender,
          grade: identity.grade,
          notes: 'Diimpor secara massal',
          avatarSeed: name.split(' ')[0]
        });
      }
    });

    if (newStudents.length > 0) {
      onUpdateStudents([...students, ...newStudents]);
      showToast(`Berhasil mengimpor ${newStudents.length} peserta didik baru!`, 'success');
      setBulkInputText('');
      setIsBulkImportOpen(false);
    } else {
      showToast('Format teks tidak valid.', 'error');
    }
  };

  // Filter students
  const filteredStudents = students
    .filter((s) => {
      const matchesSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(s.studentNo).includes(searchQuery);
      const matchesGender = genderFilter === 'ALL' || s.gender === genderFilter;
      return matchesSearch && matchesGender;
    })
    .sort((a, b) => a.studentNo - b.studentNo);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Data Peserta Didik
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Daftar siswa Kelas {identity.grade} · {identity.schoolName} ({identity.level})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            Impor Cepat (Paste)
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Cetak Daftar
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NISN, atau no absen..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Jenis Kelamin:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setGenderFilter('ALL')}
              className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                genderFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({students.length})
            </button>
            <button
              onClick={() => setGenderFilter('L')}
              className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                genderFilter === 'L'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Laki-laki ({students.filter(s => s.gender === 'L').length})
            </button>
            <button
              onClick={() => setGenderFilter('P')}
              className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                genderFilter === 'P'
                  ? 'bg-white text-pink-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Perempuan ({students.filter(s => s.gender === 'P').length})
            </button>
          </div>
        </div>
      </div>

      {/* Student Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada peserta didik yang sesuai.</p>
            <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau tambahkan siswa baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 text-center w-14">No</th>
                  <th className="py-3.5 px-4">NIS / NISN</th>
                  <th className="py-3.5 px-4">Nama Lengkap</th>
                  <th className="py-3.5 px-4 text-center">L/P</th>
                  <th className="py-3.5 px-4">Kelas</th>
                  <th className="py-3.5 px-4">Catatan Perkembangan</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-600 tabular-nums">
                      {student.studentNo}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-xs">
                      {student.nis}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          student.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                        }`}>
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        student.gender === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                      }`}>
                        {student.gender === 'L' ? 'L' : 'P'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      Kelas {student.grade}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {student.notes || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Siswa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student)}
                          className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">
                {editingStudent ? 'Edit Data Peserta Didik' : 'Tambah Peserta Didik Baru'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. Absen *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.studentNo}
                    onChange={(e) => setFormData({ ...formData, studentNo: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIS / NISN
                  </label>
                  <input
                    type="text"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Contoh: 210501"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Masukkan nama lengkap siswa..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Guru / Keterangan Karakter
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Catatan keaktifan, potensi, atau kebutuhan khusus siswa..."
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
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-base">
                  Impor Cepat Banyak Siswa Sekaligus
                </h3>
              </div>
              <button
                onClick={() => setIsBulkImportOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Salin dan tempel daftar nama siswa dari Excel, Word, atau WhatsApp. Satu baris per siswa. Anda juga bisa menambahkan koma dan gender (L/P), contoh:
              </p>
              <div className="p-3 bg-slate-100 rounded-xl font-mono text-[11px] text-slate-700 space-y-0.5">
                <p>Ahmad Faiz Al-Faruq, L</p>
                <p>Aisyah Nur Rahmadhani, P</p>
                <p>Bagas Rizky Ramadhan, L</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempel Daftar Nama di Sini:
                </label>
                <textarea
                  rows={7}
                  value={bulkInputText}
                  onChange={(e) => setBulkInputText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Paste daftar nama siswa di sini..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBulkImportOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleBulkImport}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors"
                >
                  Impor Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
