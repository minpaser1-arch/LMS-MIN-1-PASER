import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  RotateCcw, 
  Copy, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quiz, QuizSubmission, SchoolIdentity, Student } from '../../types/lms';
import { formatQuizForWhatsApp, copyToClipboard } from '../../utils/formatter';
import { useToast } from '../common/Toast';

interface StudentInteractiveQuizProps {
  quizzes: Quiz[];
  currentStudent: Student;
  identity: SchoolIdentity;
  selectedQuizId?: string;
  onFinishQuiz: (quizId: string, submission: QuizSubmission) => void;
  onBackToList: () => void;
}

export const StudentInteractiveQuiz: React.FC<StudentInteractiveQuizProps> = ({
  quizzes,
  currentStudent,
  identity,
  selectedQuizId,
  onFinishQuiz,
  onBackToList
}) => {
  const { showToast } = useToast();
  const [activeQuizId, setActiveQuizId] = useState<string | null>(selectedQuizId || (quizzes[0]?.id ?? null));

  // In-quiz states
  const [isTakingQuiz, setIsTakingQuiz] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);

  // Review mode state (showing score, correct answers, explanations)
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  const [lastSubmission, setLastSubmission] = useState<QuizSubmission | null>(null);

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId);
  const existingSubmission = activeQuiz?.submissions.find((s) => s.studentId === currentStudent.id);

  // Check if existing submission present on load
  useEffect(() => {
    if (selectedQuizId) {
      setActiveQuizId(selectedQuizId);
    }
  }, [selectedQuizId]);

  useEffect(() => {
    if (existingSubmission && !isTakingQuiz) {
      setLastSubmission(existingSubmission);
      setIsReviewMode(true);
    } else if (!isTakingQuiz) {
      setIsReviewMode(false);
      setLastSubmission(null);
    }
  }, [activeQuizId, existingSubmission, isTakingQuiz]);

  // Countdown Timer
  useEffect(() => {
    if (!isTakingQuiz || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTakingQuiz, timeLeftSeconds]);

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuizId(quiz.id);
    setStudentAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeftSeconds(quiz.timeLimitMinutes * 60);
    setQuizStartTime(Date.now());
    setIsReviewMode(false);
    setIsTakingQuiz(true);
  };

  const handleSelectOption = (questionId: string, optionLetter: string) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [questionId]: optionLetter
    }));
  };

  const handleAutoSubmit = () => {
    handleSubmitQuiz(true);
  };

  const handleSubmitQuiz = (isTimeOut: boolean = false) => {
    if (!activeQuiz) return;

    const timeSpent = Math.max(1, Math.round((Date.now() - quizStartTime) / 1000));

    // Calculate score
    let earnedPoints = 0;
    let totalMaxPoints = 0;

    activeQuiz.questions.forEach((q) => {
      totalMaxPoints += q.points;
      if (studentAnswers[q.id] === q.correctAnswer) {
        earnedPoints += q.points;
      }
    });

    const finalScore = totalMaxPoints > 0 ? Math.round((earnedPoints / totalMaxPoints) * 100) : 0;
    const isPassed = finalScore >= identity.kkm;

    const submission: QuizSubmission = {
      id: `qsub-${Date.now()}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      submittedAt: new Date().toISOString(),
      answers: studentAnswers,
      score: finalScore,
      totalPoints: earnedPoints,
      maxPoints: totalMaxPoints,
      isPassed: isPassed,
      timeSpentSeconds: timeSpent
    };

    onFinishQuiz(activeQuiz.id, submission);
    setLastSubmission(submission);
    setIsTakingQuiz(false);
    setIsReviewMode(true);

    if (isPassed) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast(`🎉 Hebat! Kamu tuntas dengan nilai ${finalScore}!`, 'success');
    } else {
      showToast(
        isTimeOut
          ? 'Waktu kuis habis! Hasil telah otomatis dikumpulkan.'
          : `Kuis selesai. Nilai kamu ${finalScore}. Silakan pelajari pembahasannya!`,
        'info'
      );
    }
  };

  const handleInstantCopy = async (quiz: Quiz) => {
    const waText = formatQuizForWhatsApp(quiz, identity, true);
    const success = await copyToClipboard(waText);
    if (success) {
      showToast('📋 Soal & Pembahasan berhasil disalin!', 'copas');
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // --- 1. Taking Quiz Screen ---
  if (isTakingQuiz && activeQuiz) {
    const currentQ = activeQuiz.questions[currentQuestionIndex];
    const totalQ = activeQuiz.questions.length;
    const answeredCount = Object.keys(studentAnswers).length;

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Sticky Quiz Header on Mobile */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 sticky top-3 z-30 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
              {activeQuiz.topic}
            </span>
            <h3 className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
              {activeQuiz.title}
            </h3>
          </div>

          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-extrabold tabular-nums shrink-0 ${
              timeLeftSeconds < 120
                ? 'bg-rose-100 text-rose-700 animate-pulse'
                : 'bg-slate-100 text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{formatTimer(timeLeftSeconds)}</span>
          </div>
        </div>

        {/* Question Palette Indicator */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">
              Soal {currentQuestionIndex + 1} dari {totalQ}
            </span>
            <span className="text-slate-400">
              Terjawab: {answeredCount} / {totalQ}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {activeQuiz.questions.map((q, idx) => {
              const isAnswered = !!studentAnswers[q.id];
              const isCurrent = idx === currentQuestionIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-violet-600 text-white shadow-md ring-2 ring-violet-300'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Card */}
        {currentQ && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-5">
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-violet-800 bg-violet-100 px-2.5 py-1 rounded-md">
                Nomor {currentQuestionIndex + 1} · {currentQ.points} Poin
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed pt-2">
                {currentQ.questionText}
              </h2>
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map((opt, oIdx) => {
                const optLetter = opt.charAt(0);
                const isSelected = studentAnswers[currentQ.id] === optLetter;

                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, optLetter)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-center gap-3 text-xs sm:text-sm font-medium ${
                      isSelected
                        ? 'bg-violet-50/80 border-violet-500 text-violet-950 shadow-xs ring-1 ring-violet-400 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {optLetter}
                    </span>
                    <span className="flex-1 leading-snug">{opt.replace(/^[A-D]\.\s*/, '')}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-2">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Sebelumnya
              </button>

              {currentQuestionIndex < totalQ - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQ - 1, prev + 1))}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-600/20 transition-all active:scale-95"
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (window.confirm('Yakin ingin menyelesaikan dan mengirim jawaban kuis sekarang?')) {
                      handleSubmitQuiz(false);
                    }
                  }}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  Kirim Jawaban Kuis
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- 2. Review Mode / Result Screen ---
  if (isReviewMode && activeQuiz && lastSubmission) {
    const isPassed = lastSubmission.score >= identity.kkm;

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Score Celebration Banner */}
        <div
          className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${
            isPassed
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 shadow-emerald-950/20'
              : 'bg-gradient-to-r from-amber-600 to-rose-700 shadow-rose-950/20'
          }`}
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>{isPassed ? 'TUNTAS MENCAPAI TUJUAN BELAJAR' : 'PERLU BELAJAR LAGI'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              {isPassed ? 'Selamat, Prestasi Bagus!' : 'Tetap Semangat, Terus Berlatih!'}
            </h2>
            <p className="text-xs sm:text-sm text-white/90">
              Kuis: <span className="font-semibold">{activeQuiz.title}</span> · Siswa: {currentStudent.name}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0 min-w-32">
            <span className="text-[11px] text-white/80 block uppercase tracking-wider font-semibold">
              Nilai Akhir
            </span>
            <span className="text-4xl font-black tabular-nums">{lastSubmission.score}</span>
            <span className="text-xs text-white/70 block mt-0.5">KKM: {identity.kkm}</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
          <button
            onClick={() => handleStartQuiz(activeQuiz)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Coba Ulang Kuis
          </button>

          <button
            onClick={() => handleInstantCopy(activeQuiz)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors ml-auto"
          >
            <Copy className="w-4 h-4" />
            📋 Salin Pembahasan ke WA
          </button>
        </div>

        {/* Questions and Detailed Explanations */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">
            💡 Kunci Jawaban & Pembahasan Lengkap:
          </h3>

          {activeQuiz.questions.map((q, idx) => {
            const studentAns = lastSubmission.answers[q.id];
            const isCorrect = studentAns === q.correctAnswer;

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  isCorrect
                    ? 'bg-emerald-50/20 border-emerald-200'
                    : 'bg-rose-50/20 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Soal No. {idx + 1} · {isCorrect ? '✓ Benar' : '✕ Salah'} (+{isCorrect ? q.points : 0} Poin)
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 pt-1 leading-relaxed">
                      {q.questionText}
                    </p>
                  </div>
                </div>

                {/* Options display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, oIdx) => {
                    const optLetter = opt.charAt(0);
                    const isKey = optLetter === q.correctAnswer;
                    const isUserChoice = optLetter === studentAns;

                    return (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between font-medium ${
                          isKey
                            ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950 font-bold'
                            : isUserChoice && !isCorrect
                            ? 'bg-rose-100/70 border-rose-300 text-rose-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <span>{opt}</span>
                        {isKey && (
                          <span className="text-[10px] text-emerald-700 font-extrabold ml-1">
                            ✓ Kunci
                          </span>
                        )}
                        {isUserChoice && !isKey && (
                          <span className="text-[10px] text-rose-700 font-extrabold ml-1">
                            ✕ Pilihanmu
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Explanation */}
                {q.explanation && (
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/80 text-xs text-amber-900 space-y-0.5">
                    <strong className="font-bold flex items-center gap-1">
                      💡 Pembahasan Guru:
                    </strong>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- 3. Default Quiz List View ---
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Kuis & Latihan Soal Interaktif
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Uji pemahamanmu secara langsung, nilai otomatis dihitung, dan pelajari pembahasan soalnya
        </p>
      </div>

      <div className="space-y-4">
        {quizzes.map((quiz) => {
          const sub = quiz.submissions.find((s) => s.studentId === currentStudent.id);

          return (
            <div
              key={quiz.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-violet-300 transition-all p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-violet-100 text-violet-800">
                      {quiz.topic}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {quiz.timeLimitMinutes} Menit
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {quiz.questions.length} Butir Soal
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">{quiz.title}</h3>
                  <p className="text-xs text-slate-500">{quiz.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleInstantCopy(quiz)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Salin soal kuis untuk belajar offline"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    📋 Salin Soal
                  </button>

                  {sub ? (
                    <button
                      onClick={() => {
                        setActiveQuizId(quiz.id);
                        setLastSubmission(sub);
                        setIsReviewMode(true);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                    >
                      Lihat Hasil ({sub.score}/100)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-600/20 transition-all active:scale-95"
                    >
                      Mulai Kerjakan
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
