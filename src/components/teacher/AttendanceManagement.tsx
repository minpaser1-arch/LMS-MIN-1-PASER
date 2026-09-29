import React, { useState } from 'react';
import { 
  CheckCircle, 
  Calendar, 
  Copy, 
  Printer, 
  Check, 
  AlertCircle, 
  Clock, 
  UserCheck,
  Plus
} from 'lucide-react';
import { 
  AttendanceRecord, 
  AttendanceStatus, 
  SchoolIdentity, 
  Student 
} from '../../types/lms';
import { formatAttendanceForWhatsApp, copyToClipboard } from '../../utils/formatter';
import { useToast } from '../common/Toast';

interface AttendanceManagementProps {
  attendance: AttendanceRecord[];
  students: Student[];
  identity: SchoolIdentity;
  onUpdateAttendance: (newAttendance: AttendanceRecord[]) => void;
  onOpenCopasModal: (title: string, waText: string, docText?: string, category?: string) => void;
}

export const AttendanceManagement: React.FC<AttendanceManagementProps> = ({
  attendance,
  students,
  identity,
  onUpdateAttendance,
  onOpenCopasModal
}) => {
  const { showToast } = useToast();
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [noteInput, setNoteInput] = useState<string>('Pertemuan Tatap Muka di Kelas');

  // Find or create current date's record
  const currentRecord: AttendanceRecord = attendance.find((r) => r.date === selectedDate) || {
    id: `att-${selectedDate}`,
    date: selectedDate,
    note: noteInput,
    records: students.reduce<Record<string, AttendanceStatus>>((acc, s) => ({ ...acc, [s.id]: 'H' }), {})
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    const updatedRecords = {
      ...currentRecord.records,
      [studentId]: status
    };

    const newCurrentRecord: AttendanceRecord = {
      ...currentRecord,
      note: noteInput,
      records: updatedRecords
    };

    const existingIndex = attendance.findIndex((r) => r.date === selectedDate);
    let updatedAttendance: AttendanceRecord[] = [];
    if (existingIndex >= 0) {
      updatedAttendance = attendance.map((r, idx) => (idx === existingIndex ? newCurrentRecord : r));
    } else {
      updatedAttendance = [...attendance, newCurrentRecord];
    }

    onUpdateAttendance(updatedAttendance);
  };

  const handleSetAllPresent = () => {
    const allHadirRecords: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      allHadirRecords[s.id] = 'H';
    });

    const newCurrentRecord: AttendanceRecord = {
      ...currentRecord,
      note: noteInput,
      records: allHadirRecords
    };

    const existingIndex = attendance.findIndex((r) => r.date === selectedDate);
    let updatedAttendance: AttendanceRecord[] = [];
    if (existingIndex >= 0) {
      updatedAttendance = attendance.map((r, idx) => (idx === existingIndex ? newCurrentRecord : r));
    } else {
      updatedAttendance = [...attendance, newCurrentRecord];
    }

    onUpdateAttendance(updatedAttendance);
    showToast('Semua siswa ditandai HADIR.', 'success');
  };

  const handleInstantCopy = async () => {
    const waText = formatAttendanceForWhatsApp(currentRecord, students, identity);
    const success = await copyToClipboard(waText);
    if (success) {
      showToast('📋 Rekap Presensi berhasil disalin! Siap kirim ke WA.', 'copas');
    }
  };

  const handleOpenDetailModal = () => {
    const waText = formatAttendanceForWhatsApp(currentRecord, students, identity);
    onOpenCopasModal(`Rekap Presensi - ${selectedDate}`, waText, undefined, 'Presensi Harian');
  };

  // Calculations for current day
  let countH = 0;
  let countS = 0;
  let countI = 0;
  let countA = 0;

  students.forEach((s) => {
    const st = currentRecord.records[s.id] || 'H';
    if (st === 'H') countH++;
    if (st === 'S') countS++;
    if (st === 'I') countI++;
    if (st === 'A') countA++;
  });

  const percentHadir = students.length > 0 ? Math.round((countH / students.length) * 100) : 0;

  // Student cumulative stats across all recorded dates
  const studentRecap = students.map((s) => {
    let sH = 0;
    let sS = 0;
    let sI = 0;
    let sA = 0;
    const totalDays = attendance.length;

    attendance.forEach((att) => {
      const st = att.records[s.id] || 'H';
      if (st === 'H') sH++;
      if (st === 'S') sS++;
      if (st === 'I') sI++;
      if (st === 'A') sA++;
    });

    const rate = totalDays > 0 ? Math.round((sH / totalDays) * 100) : 100;
    return { student: s, H: sH, S: sS, I: sI, A: sA, rate };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Presensi & Kehadiran Siswa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pencatatan harian, rekapitulasi kehadiran, & COPAS cepat untuk Grup WhatsApp Wali Murid
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSetAllPresent}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors"
          >
            <UserCheck className="w-4 h-4 text-teal-700" />
            1-Klik: Semua Hadir
          </button>
          <button
            onClick={handleInstantCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition-all active:scale-95"
          >
            <Copy className="w-4 h-4" />
            📋 COPAS Rekap WA
          </button>
        </div>
      </div>

      {/* Date Selector & Day Summary Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                Pilih Tanggal Presensi:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Kegiatan:</span>
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Contoh: KBM Tatap Muka di Kelas..."
              className="px-3 py-1.5 rounded-xl text-xs border border-slate-200 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* 4 Status Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center pt-2 border-t border-slate-100">
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
            <span className="text-xs font-semibold text-emerald-800">Hadir (H)</span>
            <p className="text-xl font-extrabold text-emerald-700 mt-0.5 tabular-nums">{countH}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <span className="text-xs font-semibold text-amber-800">Sakit (S)</span>
            <p className="text-xl font-extrabold text-amber-700 mt-0.5 tabular-nums">{countS}</p>
          </div>
          <div className="bg-sky-50 rounded-xl p-3 border border-sky-100">
            <span className="text-xs font-semibold text-sky-800">Izin (I)</span>
            <p className="text-xl font-extrabold text-sky-700 mt-0.5 tabular-nums">{countI}</p>
          </div>
          <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
            <span className="text-xs font-semibold text-rose-800">Alpa (A)</span>
            <p className="text-xl font-extrabold text-rose-700 mt-0.5 tabular-nums">{countA}</p>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-slate-100 rounded-xl p-3 border border-slate-200 flex flex-col justify-center">
            <span className="text-xs font-semibold text-slate-700">% Kehadiran</span>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5 tabular-nums">{percentHadir}%</p>
          </div>
        </div>
      </div>

      {/* Daily Student Attendance Checklist Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">
            Presensi Siswa Tanggal: {selectedDate}
          </h3>
          <span className="text-xs text-slate-500">
            Klik tombol status untuk mengubah status kehadiran siswa
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4 text-center w-14">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4 text-center">Status Kehadiran</th>
                <th className="py-3 px-4 text-right">Rekap Semester</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students
                .sort((a, b) => a.studentNo - b.studentNo)
                .map((student) => {
                  const status = currentRecord.records[student.id] || 'H';
                  const cumulative = studentRecap.find((r) => r.student.id === student.id);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-slate-600 tabular-nums">
                        {student.studentNo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{student.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({student.gender})</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'H')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              status === 'H'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700'
                            }`}
                          >
                            H (Hadir)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'S')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              status === 'S'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-amber-700'
                            }`}
                          >
                            S (Sakit)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'I')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              status === 'I'
                                ? 'bg-sky-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-sky-700'
                            }`}
                          >
                            I (Izin)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'A')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              status === 'A'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-rose-700'
                            }`}
                          >
                            A (Alpa)
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-xs tabular-nums text-slate-600">
                        {cumulative ? (
                          <span>
                            {cumulative.rate}% ({cumulative.H}H / {cumulative.S}S / {cumulative.I}I / {cumulative.A}A)
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
