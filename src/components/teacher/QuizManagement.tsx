import React, { useState } from 'react';
import { 
  HelpCircle, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Copy, 
  Clock, 
  Award, 
  CheckCircle2, 
  X,
  Play,
  FileCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import { Quiz, QuizQuestion, SchoolIdentity, Student } from '../../types/lms';
import { formatQuizForWhatsApp, copyToClipboard } from '../../utils/formatter';
import { useToast } from '../common/Toast';

interface QuizManagementProps {
  quizzes: Quiz[];
  students: Student[];
  identity: SchoolIdentity;
  onUpdateQuizzes: (newQuizzes: Quiz[]) => void;
  onOpenCopasModal: (title: string, waText: string, docText?: string, category?: string) => void;
}

export const QuizManagement: React.FC<QuizManagementProps> = ({
  quizzes,
  students,
  identity,
  onUpdateQuizzes,
  onOpenCopasModal
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isQuizFormOpen, setIsQuizFormOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  // Question editing modal inside a quiz
  const [activeQuizForQuestions, setActiveQuizForQuestions] = useState<Quiz | null>(null);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  // Submissions review modal
  const [reviewingQuiz, setReviewingQuiz] = useState<Quiz | null>(null);

  // Quiz basic form state
  const [quizFormData, setQuizFormData] = useState({
    title: '',
    topic: '',
    description: '',
    timeLimitMinutes: 15
  });

  // Question form state
  const [questionFormData, setQuestionFormData] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    explanation: '',
    points: 20
  });

  // --- Quiz CRUD ---
  const handleOpenAddQuiz = () => {
    setEditingQuiz(null);
    setQuizFormData({
      title: '',
      topic: '',
      description: 'Pilihlah salah satu jawaban yang paling tepat. Nilai akan otomatis dikalkulasi setelah kuis selesai.',
      timeLimitMinutes: 15
    });
    setIsQuizFormOpen(true);
  };

  const handleOpenEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizFormData({
      title: quiz.title,
      topic: quiz.topic,
      description: quiz.description,
      timeLimitMinutes: quiz.timeLimitMinutes
    });
    setIsQuizFormOpen(true);
  };

  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizFormData.title.trim() || !quizFormData.topic.trim()) {
      showToast('Judul dan topik kuis wajib diisi!', 'error');
      return;
    }

    if (editingQuiz) {
      const updated = quizzes.map((q) =>
        q.id === editingQuiz.id
          ? {
              ...q,
              title: quizFormData.title,
              topic: quizFormData.topic,
              description: quizFormData.description,
              timeLimitMinutes: Number(quizFormData.timeLimitMinutes)
            }
          : q
      );
      onUpdateQuizzes(updated);
      showToast(`Kuis "${quizFormData.title}" berhasil diperbarui.`, 'success');
    } else {
      const newQuiz: Quiz = {
        id: `quiz-${Date.now()}`,
        title: quizFormData.title,
        topic: quizFormData.topic,
        description: quizFormData.description,
        timeLimitMinutes: Number(quizFormData.timeLimitMinutes),
        questions: [],
        submissions: [],
        createdAt: new Date().toISOString(),
        isActive: true
      };
      onUpdateQuizzes([...quizzes, newQuiz]);
      showToast(`Kuis baru "${quizFormData.title}" berhasil dibuat! Silakan tambahkan butir soal.`, 'success');
    }

    setIsQuizFormOpen(false);
  };

  const handleDeleteQuiz = (quiz: Quiz) => {
    if (window.confirm(`Yakin ingin menghapus kuis "${quiz.title}"?`)) {
      const filtered = quizzes.filter((q) => q.id !== quiz.id);
      onUpdateQuizzes(filtered);
      showToast(`Kuis "${quiz.title}" telah dihapus.`, 'info');
    }
  };

  // --- Question CRUD ---
  const handleOpenManageQuestions = (quiz: Quiz) => {
    setActiveQuizForQuestions(quiz);
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionFormData({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explanation: '',
      points: 20
    });
    setIsQuestionFormOpen(true);
  };

  const handleOpenEditQuestion = (q: QuizQuestion) => {
    setEditingQuestion(q);
    setQuestionFormData({
      questionText: q.questionText,
      optionA: q.options[0]?.replace(/^[A-D]\.\s*/, '') || '',
      optionB: q.options[1]?.replace(/^[A-D]\.\s*/, '') || '',
      optionC: q.options[2]?.replace(/^[A-D]\.\s*/, '') || '',
      optionD: q.options[3]?.replace(/^[A-D]\.\s*/, '') || '',
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      points: q.points
    });
    setIsQuestionFormOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuizForQuestions) return;

    if (!questionFormData.questionText.trim() || !questionFormData.optionA.trim() || !questionFormData.optionB.trim()) {
      showToast('Teks soal dan minimal opsi A & B wajib diisi!', 'error');
      return;
    }

    const options = [
      `A. ${questionFormData.optionA}`,
      `B. ${questionFormData.optionB}`,
      `C. ${questionFormData.optionC}`,
      `D. ${questionFormData.optionD}`
    ].filter(opt => opt.length > 3);

    let updatedQuestions: QuizQuestion[] = [];

    if (editingQuestion) {
      updatedQuestions = activeQuizForQuestions.questions.map((q) =>
        q.id === editingQuestion.id
          ? {
              ...q,
              questionText: questionFormData.questionText,
              options: options,
              correctAnswer: questionFormData.correctAnswer,
              explanation: questionFormData.explanation,
              points: Number(questionFormData.points)
            }
          : q
      );
    } else {
      const newQuestion: QuizQuestion = {
        id: `q-${Date.now()}`,
        questionText: questionFormData.questionText,
        type: 'multiple_choice',
        options: options,
        correctAnswer: questionFormData.correctAnswer,
        explanation: questionFormData.explanation,
        points: Number(questionFormData.points)
      };
      updatedQuestions = [...activeQuizForQuestions.questions, newQuestion];
    }

    const updatedQuizzes = quizzes.map((qz) =>
      qz.id === activeQuizForQuestions.id ? { ...qz, questions: updatedQuestions } : qz
    );

    onUpdateQuizzes(updatedQuizzes);
    setActiveQuizForQuestions({ ...activeQuizForQuestions, questions: updatedQuestions });
    showToast('Soal kuis berhasil disimpan!', 'success');
    setIsQuestionFormOpen(false);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!activeQuizForQuestions) return;
    if (window.confirm('Yakin ingin menghapus butir soal ini?')) {
      const updatedQuestions = activeQuizForQuestions.questions.filter((q) => q.id !== qId);
      const updatedQuizzes = quizzes.map((qz) =>
        qz.id === activeQuizForQuestions.id ? { ...qz, questions: updatedQuestions } : qz
      );
      onUpdateQuizzes(updatedQuizzes);
      setActiveQuizForQuestions({ ...activeQuizForQuestions, questions: updatedQuestions });
      showToast('Soal telah dihapus.', 'info');
    }
  };

  const handleInstantCopy = async (quiz: Quiz, withAnswers: boolean = true) => {
    const waText = formatQuizForWhatsApp(quiz, identity, withAnswers);
    const success = await copyToClipboard(waText);
    if (success) {
      showToast(
        withAnswers
          ? '📋 Soal Kuis & Pembahasan berhasil disalin!'
          : '📋 Soal Kuis (tanpa kunci) berhasil disalin!',
        'copas'
      );
    }
  };

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Kuis & Asesmen Interaktif
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pembuat soal pilihan ganda, kunci jawaban, auto-grading, pembahasan, & COPAS WA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddQuiz}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Buat Kuis Baru
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau topik kuis..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Quiz List */}
      <div className="space-y-4">
        {filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 text-center py-12 px-4 space-y-3">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Belum ada kuis yang dibuat.</p>
            <p className="text-xs text-slate-500">Klik "Buat Kuis Baru" untuk membuat asesmen interaktif otomatis.</p>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => {
            const totalQuestions = quiz.questions.length;
            const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
            const totalSubmissions = quiz.submissions.length;

            return (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-violet-100 text-violet-800">
                        {quiz.topic}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {quiz.timeLimitMinutes} Menit
                      </span>
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                        {totalQuestions} Soal ({totalPoints} Total Poin)
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-2xl">{quiz.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                    <button
                      onClick={() => handleInstantCopy(quiz, true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                      title="Salin soal beserta kunci & pembahasan"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      📋 COPAS WA
                    </button>
                    <button
                      onClick={() => handleOpenManageQuestions(quiz)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Kelola Soal ({totalQuestions})
                    </button>
                    <button
                      onClick={() => setReviewingQuiz(quiz)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                      Hasil Siswa ({totalSubmissions})
                    </button>
                    <button
                      onClick={() => handleOpenEditQuiz(quiz)}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Edit Kuis"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz)}
                      className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Kuis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Questions Preview Accordion */}
                {totalQuestions > 0 && (
                  <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Pratinjau Butir Soal Teratas:
                    </span>
                    <div className="space-y-2">
                      {quiz.questions.slice(0, 2).map((q, idx) => (
                        <div key={q.id} className="text-xs bg-white p-2.5 rounded-lg border border-slate-200/80">
                          <p className="font-semibold text-slate-800">
                            {idx + 1}. {q.questionText}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-600">
                            <span>Kunci: <strong className="text-emerald-700">{q.correctAnswer}</strong></span>
                            <span>·</span>
                            <span>Bobot: {q.points} Poin</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create / Edit Quiz Base Info */}
      {isQuizFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">
                {editingQuiz ? 'Edit Informasi Kuis' : 'Buat Kuis Baru'}
              </h3>
              <button
                onClick={() => setIsQuizFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Kuis *
                </label>
                <input
                  type="text"
                  required
                  value={quizFormData.title}
                  onChange={(e) => setQuizFormData({ ...quizFormData, title: e.target.value })}
                  placeholder="Contoh: Kuis Harian: Sifat-sifat Cahaya"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Topik / Bab *
                  </label>
                  <input
                    type="text"
                    required
                    value={quizFormData.topic}
                    onChange={(e) => setQuizFormData({ ...quizFormData, topic: e.target.value })}
                    placeholder="Contoh: Bab 1: Cahaya"
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Waktu Pengerjaan (Menit) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    required
                    value={quizFormData.timeLimitMinutes}
                    onChange={(e) => setQuizFormData({ ...quizFormData, timeLimitMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Petunjuk Pengerjaan untuk Siswa
                </label>
                <textarea
                  rows={3}
                  value={quizFormData.description}
                  onChange={(e) => setQuizFormData({ ...quizFormData, description: e.target.value })}
                  placeholder="Instruksi pengerjaan soal..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuizFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors"
                >
                  Simpan Kuis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manage Questions for Selected Quiz */}
      {activeQuizForQuestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Bank Soal: {activeQuizForQuestions.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeQuizForQuestions.questions.length} Butir Soal Terdaftar
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddQuestion}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Butir Soal
                </button>
                <button
                  onClick={() => setActiveQuizForQuestions(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {activeQuizForQuestions.questions.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <p className="text-xs text-slate-500 font-medium">Belum ada butir soal pada kuis ini.</p>
                  <button
                    onClick={handleOpenAddQuestion}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    + Klik di sini untuk membuat soal nomor 1
                  </button>
                </div>
              ) : (
                activeQuizForQuestions.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          Soal No. {idx + 1} ({q.points} Poin)
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 pt-1 leading-relaxed">
                          {q.questionText}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditQuestion(q)}
                          className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1 text-slate-400 hover:text-rose-700 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const optLetter = opt.charAt(0);
                        const isCorrect = optLetter === q.correctAnswer;
                        return (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-between ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{opt}</span>
                            {isCorrect && (
                              <span className="text-[10px] text-emerald-700 font-extrabold ml-1">
                                ✓ KUNCI
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="text-xs bg-amber-50/70 p-2.5 rounded-lg border border-amber-100 text-amber-900">
                        <strong className="font-bold">Pembahasan: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Total Poin: {activeQuizForQuestions.questions.reduce((sum, q) => sum + q.points, 0)}
              </span>
              <button
                onClick={() => setActiveQuizForQuestions(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Single Question */}
      {isQuestionFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingQuestion ? 'Edit Butir Soal' : 'Tambah Butir Soal Baru'}
              </h3>
              <button
                onClick={() => setIsQuestionFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teks Pertanyaan *
                </label>
                <textarea
                  rows={3}
                  required
                  value={questionFormData.questionText}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, questionText: e.target.value })}
                  placeholder="Tuliskan pertanyaan soal..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Options A, B, C, D */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Pilihan Jawaban (A, B, C, D) *
                </label>
                <div className="flex items-center gap-2">
                  <span className="w-6 font-bold text-xs text-slate-700">A.</span>
                  <input
                    type="text"
                    required
                    value={questionFormData.optionA}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, optionA: e.target.value })}
                    placeholder="Pilihan A..."
                    className="flex-1 px-3 py-1.5 rounded-xl text-xs border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 font-bold text-xs text-slate-700">B.</span>
                  <input
                    type="text"
                    required
                    value={questionFormData.optionB}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, optionB: e.target.value })}
                    placeholder="Pilihan B..."
                    className="flex-1 px-3 py-1.5 rounded-xl text-xs border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 font-bold text-xs text-slate-700">C.</span>
                  <input
                    type="text"
                    required
                    value={questionFormData.optionC}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, optionC: e.target.value })}
                    placeholder="Pilihan C..."
                    className="flex-1 px-3 py-1.5 rounded-xl text-xs border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 font-bold text-xs text-slate-700">D.</span>
                  <input
                    type="text"
                    required
                    value={questionFormData.optionD}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, optionD: e.target.value })}
                    placeholder="Pilihan D..."
                    className="flex-1 px-3 py-1.5 rounded-xl text-xs border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kunci Jawaban Benar *
                  </label>
                  <select
                    value={questionFormData.correctAnswer}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, correctAnswer: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-emerald-800"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bobot Poin Soal *
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    required
                    value={questionFormData.points}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, points: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pembahasan Soal (Akan ditampilkan ke siswa setelah kuis selesai)
                </label>
                <textarea
                  rows={2}
                  value={questionFormData.explanation}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, explanation: e.target.value })}
                  placeholder="Jelaskan alasan mengapa opsi tersebut benar..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuestionFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors"
                >
                  Simpan Butir Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Review Student Submissions */}
      {reviewingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Rekap Hasil Siswa: {reviewingQuiz.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {reviewingQuiz.submissions.length} Siswa Sudah Mengerjakan
                </p>
              </div>
              <button
                onClick={() => setReviewingQuiz(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {reviewingQuiz.submissions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">
                  Belum ada siswa yang mengerjakan kuis ini.
                </p>
              ) : (
                <div className="space-y-2">
                  {reviewingQuiz.submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900">{sub.studentName}</h4>
                        <p className="text-[11px] text-slate-400">
                          Selesai: {new Date(sub.submittedAt).toLocaleString('id-ID')} · Waktu: {Math.round(sub.timeSpentSeconds / 60)} Menit
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                            sub.score >= identity.kkm
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          Skor: {sub.score} / 100
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {sub.score >= identity.kkm ? 'Tuntas ✓' : 'Remedial ⚠️'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setReviewingQuiz(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
