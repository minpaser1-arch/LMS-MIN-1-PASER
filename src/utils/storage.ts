import { LmsDataState, SchoolIdentity } from '../types/lms';

const STORAGE_KEY = 'lms_madrasah_paser_state_v1';

export const INITIAL_DEFAULT_STATE: LmsDataState = {
  identity: {
    schoolName: 'MIN 1 Paser',
    teacherName: 'Dzakirul Husni, S.Pd.',
    teacherNip: '19870512 201101 1 008',
    level: 'SD/MI',
    grade: '5',
    phase: 'Fase C',
    subject: 'Ilmu Pengetahuan Alam & Sosial (IPAS)',
    academicYear: '2025/2026',
    semester: 'Ganjil',
    kkm: 75,
    headmasterName: 'H. Ahmad Syarif, M.Pd.',
    headmasterNip: '19750314 200212 1 002'
  },
  students: [
    { id: 'std-1', studentNo: 1, nis: '210501', name: 'Ahmad Faiz Al-Faruq', gender: 'L', grade: '5', notes: 'Aktif bertanya, antusias dalam eksperimen sains.', avatarSeed: 'Faiz' },
    { id: 'std-2', studentNo: 2, nis: '210502', name: 'Aisyah Nur Rahmadhani', gender: 'P', grade: '5', notes: 'Teliti, tulisan rapi, selalu mengumpulkan tugas tepat waktu.', avatarSeed: 'Aisyah' },
    { id: 'std-3', studentNo: 3, nis: '210503', name: 'Bagas Rizky Ramadhan', gender: 'L', grade: '5', notes: 'Bakat kepemimpinan dalam diskusi kelompok proyek.', avatarSeed: 'Bagas' },
    { id: 'std-4', studentNo: 4, nis: '210504', name: 'Dhiya Khansa Salsabila', gender: 'P', grade: '5', notes: 'Senang menggambar diagram dan peta konsep.', avatarSeed: 'Dhiya' },
    { id: 'std-5', studentNo: 5, nis: '210505', name: 'Fatihul Ihsan', gender: 'L', grade: '5', notes: 'Perlu pendampingan khusus pada materi perhitungan skala.', avatarSeed: 'Fatih' },
    { id: 'std-6', studentNo: 6, nis: '210506', name: 'Ghaida Zahra Al-Munawwarah', gender: 'P', grade: '5', notes: 'Kritis, artikulatif saat presentasi di depan kelas.', avatarSeed: 'Ghaida' },
    { id: 'std-7', studentNo: 7, nis: '210507', name: 'Hafiz Muhammad Rifai', gender: 'L', grade: '5', notes: 'Disiplin dan rajin menjaga kebersihan ruang praktik.', avatarSeed: 'Hafiz' },
    { id: 'std-8', studentNo: 8, nis: '210508', name: 'Indah Permata Sari', gender: 'P', grade: '5', notes: 'Kemampuan analisis teks bacaan sains sangat kuat.', avatarSeed: 'Indah' },
    { id: 'std-9', studentNo: 9, nis: '210509', name: 'Jibril Maulana Rahman', gender: 'L', grade: '5', notes: 'Kreatif dalam membuat alat peraga sederhana dari barang bekas.', avatarSeed: 'Jibril' },
    { id: 'std-10', studentNo: 10, nis: '210510', name: 'Khadijah Amalia Husna', gender: 'P', grade: '5', notes: 'Hafalan kosa kata ilmiah sangat baik.', avatarSeed: 'Khadijah' }
  ],
  materials: [
    {
      id: 'mat-1',
      title: 'Melihat karena Cahaya, Mendengar karena Bunyi',
      topic: 'Bab 1: Cahaya dan Sifat-sifatnya',
      learningObjectives: '1. Peserta didik memahami sifat-sifat cahaya (merambat lurus, menembus benda bening, dapat dipantulkan, dan dapat dibiaskan).\n2. Peserta didik dapat mendemonstrasikan pembiasan cahaya menggunakan medium air dan pensil.',
      contentSummary: 'Cahaya adalah gelombang elektromagnetik kasat mata. Sifat-sifat utama cahaya meliputi:\n1. Merambat lurus: Terbukti saat cahaya senter diarahkan ke celah kecil.\n2. Menembus benda bening: Seperti kaca jendela dan plastik transparan.\n3. Dapat dipantulkan: Terjadi saat cahaya mengenai cermin datar, cekung, atau cembung.\n4. Dapat dibiaskan: Terlihat saat pensil dimasukkan ke dalam gelas berisi air, pensil tampak patah karena perbedaan kerapatan medium udara dan air.\n5. Mengalami penguraian (dispersi): Menghasilkan spektrum warna pelangi (me-ji-ku-hi-bi-ni-u).',
      instructions: '1. Bacalah rangkuman materi di atas dengan seksama.\n2. Ambil sebuah pensil dan masukkan ke dalam gelas kaca berisi air jernih, amati fenomena pembiasan.\n3. Catat hasil pengamatanmu pada buku catatan IPAS.\n4. Kerjakan kuis interaktif Bab 1 untuk menguji pemahaman.',
      referenceLink: 'https://buku.kemdikbud.go.id',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop',
      attachments: ['Lembar_Kerja_Eksperimen_Cahaya.pdf'],
      createdAt: '2026-09-20T08:00:00.000Z',
      updatedAt: '2026-09-20T08:00:00.000Z'
    },
    {
      id: 'mat-2',
      title: 'Harmoni dalam Ekosistem dan Jaring-jaring Makanan',
      topic: 'Bab 2: Ekosistem',
      learningObjectives: '1. Menganalisis hubungan antar makhluk hidup pada suatu ekosistem dalam bentuk rantai dan jaring-jaring makanan.\n2. Mengidentifikasi peran produsen, konsumen (I, II, III), dan pengurai (dekomposer).',
      contentSummary: 'Rantai makanan adalah proses perpindahan energi makanan melalui seri organisme: Produsen (tumbuhan hijau) -> Konsumen Tingkat 1 (herbivora seperti belalang/kelinci) -> Konsumen Tingkat 2 (karnivora/omnivora seperti katak/ayam) -> Konsumen Puncak (elang/singa) -> Pengurai (bakteri/jamur). Keseimbangan ekosistem sangat dipengaruhi oleh kelestarian seluruh komponen.',
      instructions: '1. Pelajari bagan rantai makanan sawah dan hutan tropis.\n2. Buatlah bagan jaring-jaring makanan di lingkungan sekitar rumah atau madrasah.\n3. Unggah foto bagan buatanmu pada menu Portofolio Siswa.',
      referenceLink: 'https://pusatkurikulum.kemdikbud.go.id',
      videoUrl: '',
      imageUrl: '',
      attachments: ['Modul_Ajar_Ekosistem_FaseC.pdf'],
      createdAt: '2026-09-22T09:30:00.000Z',
      updatedAt: '2026-09-22T09:30:00.000Z'
    }
  ],
  assignments: [
    {
      id: 'asg-1',
      title: 'Praktik Pembiasan Cahaya dengan Pensil dan Air',
      instructions: 'Lakukan percobaan sederhana di rumah/laboratorium:\n1. Siapkan 1 buah gelas bening, air secukupnya, dan 1 batang pensil.\n2. Tuangkan air hingga 3/4 bagian gelas.\n3. Masukkan pensil dengan posisi miring.\n4. Ambil foto dari samping dan jelaskan mengapa pensil terlihat patah atau lebih besar.\n5. Tuliskan jawaban atau unggah tautan foto dokumentasimu di bawah ini.',
      relatedMaterialId: 'mat-1',
      deadline: '2026-10-05T23:59:00.000Z',
      type: 'Praktik',
      weight: 20,
      submissions: [
        {
          id: 'sub-1',
          studentId: 'std-1',
          studentName: 'Ahmad Faiz Al-Faruq',
          submittedAt: '2026-09-24T14:20:00.000Z',
          textAnswer: 'Pensil tampak patah karena cahaya merambat dari medium air yang lebih rapat ke medium udara yang kurang rapat, sehingga arah rambat cahaya dibelokkan (dibiaskan) menjauhi garis normal.',
          linkOrFile: 'https://drive.google.com/open?id=foto-faiz-pembiasan',
          status: 'Sudah Dinilai',
          score: 95,
          teacherFeedback: 'Penjelasan sangat tepat dan ilmiah! Foto dokumentasi juga sangat jelas. Pertahankan prestasimu, Faiz!'
        },
        {
          id: 'sub-2',
          studentId: 'std-2',
          studentName: 'Aisyah Nur Rahmadhani',
          submittedAt: '2026-09-25T10:15:00.000Z',
          textAnswer: 'Hasil percobaan: saat pensil dilihat dari sisi samping gelas air, terlihat seperti bengkok/patah. Ini membuktikan salah satu sifat cahaya yaitu dapat dibiaskan ketika melewati dua zat yang berbeda kerapatannya.',
          linkOrFile: 'https://drive.google.com/open?id=foto-aisyah-praktik',
          status: 'Sudah Dinilai',
          score: 92,
          teacherFeedback: 'Bagus sekali Aisyah! Deskripsi pengamatan sangat runtut dan sistematis.'
        }
      ],
      createdAt: '2026-09-21T08:00:00.000Z'
    },
    {
      id: 'asg-2',
      title: 'Proyek Pembuatan Poster Jaring-Jaring Makanan Sawah',
      instructions: 'Buatlah karya poster jaring-jaring makanan ekosistem sawah pada kertas gambar A4/karton:\n- Cantumkan minimal 6 organisme (padi, tikus, belalang, katak, ular, elang, jamur).\n- Beri tanda panah arah aliran energi makanan.\n- Warnai poster semenarik mungkin.',
      relatedMaterialId: 'mat-2',
      deadline: '2026-10-12T17:00:00.000Z',
      type: 'Proyek',
      weight: 25,
      submissions: [],
      createdAt: '2026-09-23T11:00:00.000Z'
    }
  ],
  quizzes: [
    {
      id: 'quiz-1',
      title: 'Kuis Harian: Sifat-Sifat Cahaya dan Penglihatannya',
      topic: 'Bab 1: Cahaya',
      description: 'Jawablah 5 butir soal pilihan ganda di bawah ini dengan teliti. Nilai akan dihitung otomatis setelah Anda menekan tombol Kirim Jawaban.',
      timeLimitMinutes: 15,
      questions: [
        {
          id: 'q-1',
          questionText: 'Pensil yang dimasukkan ke dalam gelas bening berisi air tampak patah atau membengkok. Peristiwa ini membuktikan bahwa cahaya...',
          type: 'multiple_choice',
          options: [
            'A. Merambat lurus',
            'B. Dapat dibiaskan',
            'C. Menembus benda bening',
            'D. Mengalami pemantulan baur'
          ],
          correctAnswer: 'B',
          explanation: 'Pembiasan (refraksi) cahaya terjadi saat cahaya merambat melalui dua medium yang berbeda kerapatan optiknya (udara dan air), sehingga laju dan arah rambat cahaya berbelok.',
          points: 20
        },
        {
          id: 'q-2',
          questionText: 'Benda yang tidak dapat ditembus oleh cahaya sama sekali disebut sebagai benda...',
          type: 'multiple_choice',
          options: [
            'A. Benda bening (transparan)',
            'B. Benda tembus pandang (transluden)',
            'C. Benda gelap (opak)',
            'D. Benda bercahaya'
          ],
          correctAnswer: 'C',
          explanation: 'Benda gelap (opak) adalah benda yang tidak dapat ditembus cahaya sama sekali, sehingga di belakangnya akan terbentuk bayangan gelap.',
          points: 20
        },
        {
          id: 'q-3',
          questionText: 'Cermin yang sering dipasang di sudut jalan atau tikungan berbahaya untuk memperluas bidang pandang pengendara adalah cermin...',
          type: 'multiple_choice',
          options: [
            'A. Cermin datar',
            'B. Cermin cekung',
            'C. Cermin cembung',
            'D. Cermin ganda'
          ],
          correctAnswer: 'C',
          explanation: 'Cermin cembung memiliki sifat menyebarkan cahaya dan bayangan yang dihasilkan selalu tegak, diperkecil, serta memiliki jangkauan pandang yang sangat luas.',
          points: 20
        },
        {
          id: 'q-4',
          questionText: 'Fenomena terbentuknya pelangi di langit setelah turun hujan terjadi karena proses...',
          type: 'multiple_choice',
          options: [
            'A. Penguraian cahaya putih (dispersi) oleh tetes air hujan',
            'B. Pemantulan cahaya oleh lapisan awan tebal',
            'C. Penyerapan seluruh warna cahaya matahari oleh tanah',
            'D. Pembelokan cahaya oleh gas ozon di atmosfer'
          ],
          correctAnswer: 'A',
          explanation: 'Tetes-tetes air hujan di udara berfungsi sebagai prisma alami yang membiaskan dan menguraikan cahaya matahari polikromatik menjadi warna-warna monokromatik (spektrum pelangi).',
          points: 20
        },
        {
          id: 'q-5',
          questionText: 'Bagian mata manusia yang berfungsi sebagai lubang tempat masuknya cahaya ke dalam bola mata dan dapat membesar atau mengecil adalah...',
          type: 'multiple_choice',
          options: [
            'A. Kornea',
            'B. Pupil',
            'C. Retina',
            'D. Iris'
          ],
          correctAnswer: 'B',
          explanation: 'Pupil adalah celah/lubang bundar di tengah iris yang mengatur intensitas jumlah cahaya yang masuk ke mata dengan cara melebar di tempat gelap dan menyempit di tempat terang.',
          points: 20
        }
      ],
      submissions: [
        {
          id: 'qsub-1',
          studentId: 'std-1',
          studentName: 'Ahmad Faiz Al-Faruq',
          submittedAt: '2026-09-24T15:10:00.000Z',
          answers: { 'q-1': 'B', 'q-2': 'C', 'q-3': 'C', 'q-4': 'A', 'q-5': 'B' },
          score: 100,
          totalPoints: 100,
          maxPoints: 100,
          isPassed: true,
          timeSpentSeconds: 420
        },
        {
          id: 'qsub-2',
          studentId: 'std-2',
          studentName: 'Aisyah Nur Rahmadhani',
          submittedAt: '2026-09-24T15:25:00.000Z',
          answers: { 'q-1': 'B', 'q-2': 'C', 'q-3': 'A', 'q-4': 'A', 'q-5': 'B' },
          score: 80,
          totalPoints: 80,
          maxPoints: 100,
          isPassed: true,
          timeSpentSeconds: 510
        }
      ],
      createdAt: '2026-09-21T09:00:00.000Z',
      isActive: true
    }
  ],
  attendance: [
    {
      id: 'att-1',
      date: new Date().toISOString().split('T')[0],
      note: 'Pertemuan Tatap Muka - Praktik Sains Laboratorium Madrasah',
      records: {
        'std-1': 'H',
        'std-2': 'H',
        'std-3': 'H',
        'std-4': 'H',
        'std-5': 'S',
        'std-6': 'H',
        'std-7': 'H',
        'std-8': 'H',
        'std-9': 'I',
        'std-10': 'H'
      }
    }
  ],
  gradeWeights: {
    assignment: 20,
    quiz: 20,
    project: 20,
    practice: 15,
    exam: 25
  },
  portfolios: [
    {
      id: 'port-1',
      studentId: 'std-1',
      studentName: 'Ahmad Faiz Al-Faruq',
      title: 'Model Periskop Sederhana dari Kardus Bekas dan Cermin Datar',
      category: 'Keterampilan/Vokasi',
      date: '2026-09-22',
      description: 'Membuat alat optik periskop sederhana dengan sudut cermin 45 derajat untuk mengamati objek di atas penghalang. Terbukti sudut datang sama dengan sudut pantul.',
      mediaUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop',
      teacherRating: 5,
      teacherNotes: 'Karya sangat inovatif, bahan kardus kokoh dan fungsional 100%. Sangat membanggakan!'
    },
    {
      id: 'port-2',
      studentId: 'std-2',
      studentName: 'Aisyah Nur Rahmadhani',
      title: 'Infografis Hand-Drawn: 7 Warna Spektrum Cahaya Pelangi',
      category: 'Seni & P5',
      date: '2026-09-23',
      description: 'Gambar ilustrasi warna spektrum pelangi lengkap dengan penjelasan frekuensi dan panjang gelombang dalam bentuk poster estetik.',
      mediaUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop',
      teacherRating: 5,
      teacherNotes: 'Perpaduan sains dan seni yang sangat indah, layak dipajang di mading madrasah!'
    }
  ],
  announcements: [
    {
      id: 'anc-1',
      title: 'Jadwal Asesmen Sumatif & Praktikum Sains Terpadu',
      content: 'Diberitahukan kepada seluruh peserta didik kelas 5 MIN 1 Paser bahwa pada hari Kamis mendatang akan dilaksanakan Praktikum Sains Terpadu di laboratorium madrasah. Harap membawa pensil warna, penggaris, dan buku catatan praktikum masing-masing.',
      date: new Date().toISOString().split('T')[0],
      isActive: true,
      isPinned: true,
      targetAudience: 'Semua'
    },
    {
      id: 'anc-2',
      title: 'Pekan Literasi Sains & Kreativitas Madrasah',
      content: 'Setiap siswa diharapkan mengumpulkan satu karya portofolio (karya tulis, poster digital, atau alat peraga daur ulang) sebelum akhir bulan untuk seleksi Pameran Karya Madrasah.',
      date: '2026-09-22',
      isActive: true,
      isPinned: false,
      targetAudience: 'Siswa'
    }
  ],
  studentCompletedMaterials: {
    'std-1': ['mat-1'],
    'std-2': ['mat-1']
  }
};

export function loadLmsState(): LmsDataState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_DEFAULT_STATE,
      ...parsed,
      identity: { ...INITIAL_DEFAULT_STATE.identity, ...parsed.identity },
      gradeWeights: { ...INITIAL_DEFAULT_STATE.gradeWeights, ...parsed.gradeWeights }
    };
  } catch (e) {
    console.error('Failed to load LMS state from localStorage:', e);
    return INITIAL_DEFAULT_STATE;
  }
}

export function saveLmsState(state: LmsDataState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save LMS state to localStorage:', e);
  }
}

export function resetLmsState(): LmsDataState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to reset LMS state:', e);
  }
  return INITIAL_DEFAULT_STATE;
}
