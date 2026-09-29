export type EducationLevel = 'SD/MI' | 'SMP/MTs' | 'SMA' | 'MA/MAN' | 'SMK';

export type MerdekaPhase = 'Fase A' | 'Fase B' | 'Fase C' | 'Fase D' | 'Fase E' | 'Fase F';

export type Semester = 'Ganjil' | 'Genap';

export interface SchoolIdentity {
  schoolName: string;
  teacherName: string;
  teacherNip: string;
  level: EducationLevel;
  grade: string;
  phase: MerdekaPhase;
  subject: string;
  academicYear: string;
  semester: Semester;
  kkm: number; // Kriteria Ketercapaian Tujuan Pembelajaran (default: 75)
  headmasterName: string;
  headmasterNip: string;
}

export interface Student {
  id: string;
  studentNo: number; // Nomor Absen
  nis: string;
  name: string;
  gender: 'L' | 'P';
  grade: string;
  notes: string;
  avatarSeed?: string;
}

export interface LearningMaterial {
  id: string;
  title: string;
  topic: string; // Bab / Topik
  learningObjectives: string; // Tujuan Pembelajaran
  contentSummary: string; // Ringkasan Materi Lengkap
  instructions: string; // Instruksi Belajar Mandiri
  referenceLink?: string;
  videoUrl?: string;
  imageUrl?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export type AssignmentType = 
  | 'Pilihan Ganda'
  | 'Isian Singkat'
  | 'Uraian'
  | 'Proyek'
  | 'Praktik'
  | 'Portofolio';

export interface AssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  textAnswer: string;
  linkOrFile?: string;
  status: 'Belum Dinilai' | 'Sudah Dinilai';
  score?: number;
  teacherFeedback?: string;
}

export interface Assignment {
  id: string;
  title: string;
  instructions: string;
  relatedMaterialId?: string;
  deadline: string;
  type: AssignmentType;
  weight: number; // Persentase Bobot (misal 15%)
  submissions: AssignmentSubmission[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  type: 'multiple_choice' | 'short_answer';
  options: string[]; // [ 'A. ...', 'B. ...', 'C. ...', 'D. ...' ]
  correctAnswer: string; // Misal "A" atau teks isian
  explanation: string; // Pembahasan Soal
  points: number;
}

export interface QuizSubmission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  answers: Record<string, string>; // questionId -> answer
  score: number; // 0 - 100
  totalPoints: number;
  maxPoints: number;
  isPassed: boolean;
  timeSpentSeconds: number;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  description: string;
  timeLimitMinutes: number;
  questions: QuizQuestion[];
  submissions: QuizSubmission[];
  createdAt: string;
  isActive: boolean;
}

export type AttendanceStatus = 'H' | 'S' | 'I' | 'A'; // Hadir, Sakit, Izin, Alpa

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  note?: string;
  records: Record<string, AttendanceStatus>; // studentId -> status
}

export interface GradeWeights {
  assignment: number; // Default 20%
  quiz: number;       // Default 20%
  project: number;    // Default 20%
  practice: number;   // Default 15%
  exam: number;       // Default 25%
}

export interface PortfolioItem {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  category: 'Karya Tulis' | 'Praktik Sains/Ibadah' | 'Keterampilan/Vokasi' | 'Seni & P5' | 'Lainnya';
  date: string;
  description: string;
  mediaUrl?: string;
  teacherRating: number; // 1-5 bintang
  teacherNotes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  isActive: boolean;
  isPinned: boolean;
  targetAudience: 'Semua' | 'Siswa' | 'Wali Murid';
}

export interface StudentProgressItem {
  studentId: string;
  readMaterialsCount: number;
  submittedAssignmentsCount: number;
  completedQuizzesCount: number;
  averageQuizScore: number;
  attendanceRate: number;
}

export interface LmsDataState {
  identity: SchoolIdentity;
  students: Student[];
  materials: LearningMaterial[];
  assignments: Assignment[];
  quizzes: Quiz[];
  attendance: AttendanceRecord[];
  gradeWeights: GradeWeights;
  portfolios: PortfolioItem[];
  announcements: Announcement[];
  studentCompletedMaterials: Record<string, string[]>; // studentId -> materialId[]
}
