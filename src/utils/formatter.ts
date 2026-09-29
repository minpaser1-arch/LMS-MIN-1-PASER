import { 
  LearningMaterial, 
  Assignment, 
  Quiz, 
  Announcement, 
  SchoolIdentity, 
  Student, 
  AttendanceRecord,
  AttendanceStatus
} from '../types/lms';

/**
 * Format Materi Pembelajaran untuk WhatsApp
 */
export function formatMaterialForWhatsApp(material: LearningMaterial, identity: SchoolIdentity): string {
  return `📚 *[${identity.schoolName.toUpperCase()}]*
📖 *MATERI PEMBELAJARAN*
═════════════════════════════
*Mata Pelajaran:* ${identity.subject}
*Kelas / Jenjang:* Kelas ${identity.grade} (${identity.level} - ${identity.phase})
*Semester / TA:* ${identity.semester} - ${identity.academicYear}
═════════════════════════════

📌 *JUDUL:*
*${material.title}*

📂 *Bab / Topik:* ${material.topic}

🎯 *TUJUAN PEMBELAJARAN:*
${material.learningObjectives}

📖 *RINGKASAN MATERI:*
${material.contentSummary}

📝 *INSTRUKSI BELAJAR MANDIRI:*
${material.instructions}
${material.referenceLink ? `\n🔗 *Link Sumber Belajar:*\n${material.referenceLink}` : ''}
${material.videoUrl ? `\n🎥 *Video Pembelajaran:*\n${material.videoUrl}` : ''}
═════════════════════════════
👨‍🏫 *Guru Pengampu:* ${identity.teacherName}${identity.teacherNip ? ` (NIP: ${identity.teacherNip})` : ''}
_Dibuat via LMS Smart | By : Dzakirul Husni (Guru MIN 1 Paser)_`;
}

/**
 * Format Materi Pembelajaran Bersih untuk Word / Google Docs
 */
export function formatMaterialForDoc(material: LearningMaterial, identity: SchoolIdentity): string {
  return `${identity.schoolName.toUpperCase()}
MATERI PEMBELAJARAN
Mata Pelajaran: ${identity.subject}
Kelas / Fase: Kelas ${identity.grade} (${identity.phase})
Tahun Ajaran: ${identity.academicYear} (Semester ${identity.semester})

1. JUDUL MATERI
${material.title} (Topik: ${material.topic})

2. TUJUAN PEMBELAJARAN
${material.learningObjectives}

3. URAIAN MATERI
${material.contentSummary}

4. INSTRUKSI SISWA
${material.instructions}

${material.referenceLink ? `Tautan Pendukung: ${material.referenceLink}\n` : ''}
Guru Pengampu: ${identity.teacherName}`;
}

/**
 * Format Tugas untuk WhatsApp
 */
export function formatAssignmentForWhatsApp(assignment: Assignment, identity: SchoolIdentity): string {
  return `📝 *[${identity.schoolName.toUpperCase()}]*
📌 *LEMBAR PENUGASAN SISWA*
═════════════════════════════
*Mata Pelajaran:* ${identity.subject}
*Kelas:* Kelas ${identity.grade} (${identity.level})
*Jenis Tugas:* ${assignment.type} | *Bobot Nilai:* ${assignment.weight}%
*Batas Pengumpulan:* ⏳ *${new Date(assignment.deadline).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}*
═════════════════════════════

📌 *JUDUL TUGAS:*
*${assignment.title}*

📝 *PETUNJUK & INSTRUKSI PENGERJAAN:*
${assignment.instructions}

⚠️ *CATATAN:*
- Kerjakan tepat waktu sebelum batas akhir.
- Kumpulkan jawaban secara tertulis atau melalui LMS.
- Konsultasikan dengan guru jika mengalami kendala.
═════════════════════════════
👨‍🏫 *Guru Pengampu:* ${identity.teacherName}
_LMS By : Dzakirul Husni | Guru MIN 1 Paser_`;
}

/**
 * Format Soal Kuis & Pembahasan untuk WhatsApp / Cetak
 */
export function formatQuizForWhatsApp(quiz: Quiz, identity: SchoolIdentity, includeAnswerKey: boolean = false): string {
  const questionsText = quiz.questions.map((q, idx) => {
    const optionsText = q.options.length > 0 ? q.options.join('\n') : '';
    let text = `*Soal No. ${idx + 1}* (${q.points} Poin)\n${q.questionText}\n${optionsText ? `${optionsText}\n` : ''}`;
    if (includeAnswerKey) {
      text += `👉 *Kunci Jawaban:* ${q.correctAnswer}\n💡 *Pembahasan:* ${q.explanation}\n`;
    }
    return text;
  }).join('\n─────────────────────\n\n');

  return `🎯 *[${identity.schoolName.toUpperCase()}]*
📋 *KUIS & ASESMEN INTERAKTIF*
═════════════════════════════
*Mata Pelajaran:* ${identity.subject}
*Kelas:* Kelas ${identity.grade} (${identity.level})
*Topik Kuis:* ${quiz.title} (${quiz.topic})
*Waktu Pengerjaan:* ⏱️ ${quiz.timeLimitMinutes} Menit
*Jumlah Soal:* ${quiz.questions.length} Butir
═════════════════════════════
${quiz.description ? `*Petunjuk:* ${quiz.description}\n═════════════════════════════\n` : ''}
${questionsText}
═════════════════════════════
👨‍🏫 *Guru Pengampu:* ${identity.teacherName}
_LMS By : Dzakirul Husni | Guru MIN 1 Paser_`;
}

/**
 * Format Rekap Presensi Harian ke Grup WhatsApp Wali Murid
 */
export function formatAttendanceForWhatsApp(
  record: AttendanceRecord, 
  students: Student[], 
  identity: SchoolIdentity
): string {
  const dateFormatted = new Date(record.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const sortedStudents = [...students].sort((a, b) => a.studentNo - b.studentNo);
  
  let hadirCount = 0;
  let sakitCount = 0;
  let izinCount = 0;
  let alpaCount = 0;

  const listText = sortedStudents.map((s) => {
    const status: AttendanceStatus = record.records[s.id] || 'H';
    let icon = '✅';
    let label = 'Hadir';
    if (status === 'H') hadirCount++;
    if (status === 'S') { sakitCount++; icon = '🤒'; label = 'Sakit'; }
    if (status === 'I') { izinCount++; icon = '✉️'; label = 'Izin'; }
    if (status === 'A') { alpaCount++; icon = '❌'; label = 'Alpa (Tanpa Keterangan)'; }

    return `${String(s.studentNo).padStart(2, '0')}. ${s.name} : ${icon} ${label}`;
  }).join('\n');

  const total = sortedStudents.length;
  const persentase = total > 0 ? Math.round((hadirCount / total) * 100) : 0;

  return `📢 *LAPORAN KEHADIRAN SISWA*
🏫 *${identity.schoolName.toUpperCase()}*
═════════════════════════════
*Mata Pelajaran:* ${identity.subject}
*Kelas / Jenjang:* Kelas ${identity.grade} (${identity.level})
*Hari / Tanggal:* ${dateFormatted}
═════════════════════════════
📊 *RINGKASAN PRESENSI:*
• Hadir (H): ${hadirCount} Siswa
• Sakit (S): ${sakitCount} Siswa
• Izin (I): ${izinCount} Siswa
• Alpa (A): ${alpaCount} Siswa
• Total Siswa: ${total}
• Persentase Hadir: *${persentase}%*
═════════════════════════════
📋 *DAFTAR RINCIAN SISWA:*
${listText}
═════════════════════════════
Terima kasih atas kerja sama Bapak/Ibu Wali Murid.
Wassalamu'alaikum Wr. Wb.

👨‍🏫 *Guru Pengampu:* ${identity.teacherName}
_LMS By : Dzakirul Husni | Guru MIN 1 Paser_`;
}

/**
 * Format Pengumuman untuk WhatsApp
 */
export function formatAnnouncementForWhatsApp(announcement: Announcement, identity: SchoolIdentity): string {
  const dateFormatted = new Date(announcement.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `📢 *PENGUMUMAN PENTING*
🏫 *${identity.schoolName.toUpperCase()}*
═════════════════════════════
*Tanggal:* ${dateFormatted}
*Ditujukan:* ${announcement.targetAudience}
*Kelas / Mapel:* Kelas ${identity.grade} / ${identity.subject}
═════════════════════════════

📌 *${announcement.title.toUpperCase()}*

${announcement.content}

═════════════════════════════
Mohon diperhatikan dan ditaati bersama.
Terima kasih.

Wassalamu'alaikum Wr. Wb.
👨‍🏫 *${identity.teacherName}*
_LMS By : Dzakirul Husni | Guru MIN 1 Paser_`;
}

/**
 * Format Rekap Nilai untuk WhatsApp / Salin Teks
 */
export function formatGradesForWhatsApp(
  students: Student[],
  gradesSummary: { studentId: string; finalScore: number; predicate: string; isPassed: boolean }[],
  identity: SchoolIdentity
): string {
  const sorted = [...students].sort((a, b) => a.studentNo - b.studentNo);
  
  const rows = sorted.map((s) => {
    const g = gradesSummary.find(item => item.studentId === s.id);
    const score = g ? g.finalScore : 0;
    const pred = g ? g.predicate : '-';
    const status = (g?.isPassed) ? 'TUNTAS' : 'REMEDIAL';
    return `${String(s.studentNo).padStart(2, '0')}. ${s.name} : ${score} (${pred}) [${status}]`;
  }).join('\n');

  return `📊 *REKAP NILAI SISWA (LEGER)*
🏫 *${identity.schoolName.toUpperCase()}*
═════════════════════════════
*Mata Pelajaran:* ${identity.subject}
*Kelas / Jenjang:* Kelas ${identity.grade} (${identity.level})
*Tahun Ajaran / Sem:* ${identity.academicYear} - ${identity.semester}
*Target KKM / KKTP:* ${identity.kkm}
═════════════════════════════
${rows}
═════════════════════════════
👨‍🏫 *Guru Pengampu:* ${identity.teacherName}
_LMS By : Dzakirul Husni | Guru MIN 1 Paser_`;
}

/**
 * Clipboard Copy with Fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
}
