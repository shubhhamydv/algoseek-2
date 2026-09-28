import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
  BookOpen,
  FileText,
  Video,
} from "lucide-react";
import { Button } from "./ui/button";

export type QuizQuestion = {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  citation: {
    sourceType: "pdf" | "text" | "video";
    sourceId: string;
    title: string;
    page: number | null;
    timestamp: string | null;
    snippet: string;
  };
};

export type QuizData = {
  success: boolean;
  topicId?: string;
  topicTitle: string;
  scope: "uploads" | "playlist";
  questions: QuizQuestion[];
  totalGenerated: number;
  discardedCount: number;
  verifiedCount: number;
  message?: string;
};

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizData: QuizData | null;
  isLoading: boolean;
  onQuizCompleted?: (score: number, total: number) => void;
}

export function QuizModal({
  isOpen,
  onClose,
  quizData,
  isLoading,
  onQuizCompleted,
}: QuizModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const questions = quizData?.questions ?? [];
  const currentQ = questions[currentIndex];
  const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleSelectOption = (idx: number) => {
    if (isAnswerRevealed) return;
    setSelectedOption(idx);
    setIsAnswerRevealed(true);
    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
    } else {
      setIsFinished(true);
      const finalScore = score + (selectedOption === currentQ.correctIndex ? 0 : 0);
      onQuizCompleted?.(finalScore, questions.length);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1814]/40 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-[#FAF7F2]/95 border border-[rgba(212,175,55,0.45)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-xl text-[#1C1814]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(212,175,55,0.25)] bg-[#F8F3EA]/90">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#FBF2DE] text-[#B8860B] border border-[rgba(212,175,55,0.45)]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-regal font-bold text-[#1C1814] text-base leading-tight">
                  {quizData?.topicTitle || "Grounded Practice Quiz"}
                </h3>
                <p className="text-xs text-[#756858]">
                  {quizData?.scope === "uploads" ? "Verified from your uploaded study materials" : "Sourced from 126 DSA lecture series"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#756858] hover:text-[#1C1814] rounded-xl hover:bg-[#F3EBDD] transition-colors"
              aria-label="Close quiz"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 bg-[#FAF7F2]">
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-[rgba(212,175,55,0.3)] border-t-[#B8860B] animate-spin" />
                  <Sparkles className="h-5 w-5 text-[#B8860B] absolute inset-0 m-auto" />
                </div>
                <h4 className="font-regal text-base font-bold text-[#1C1814]">Synthesizing Verified Quiz...</h4>
                <p className="text-xs text-[#756858] max-w-sm">
                  Generating multiple-choice questions with mandatory fact verification against source excerpts.
                </p>
              </div>
            ) : !quizData?.success || questions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-3 rounded-full bg-[#FBF2DE] text-[#B8860B]">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h4 className="font-regal text-base font-bold text-[#1C1814]">Quiz Unavailable</h4>
                <p className="text-sm text-[#756858] max-w-md">
                  {quizData?.message || "Could not generate verified questions for this material. Try asking a question first or upload a richer study document."}
                </p>
                <Button onClick={onClose} variant="outline" className="mt-2 border-[rgba(212,175,55,0.45)] rounded-xl hover:bg-[#FAF1DF]">
                  Back to Chat
                </Button>
              </div>
            ) : isFinished ? (
              /* Quiz Summary Screen */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 flex flex-col items-center text-center space-y-5"
              >
                <div className="p-4 rounded-full bg-[#FBF2DE] border border-[rgba(212,175,55,0.45)] text-[#B8860B]">
                  <Trophy className="h-10 w-10" />
                </div>
                <div>
                  <span className="font-regal text-xs font-bold tracking-wider text-[#B8860B] uppercase">Quiz Complete</span>
                  <h3 className="font-regal text-2xl font-extrabold text-[#1C1814] mt-1">
                    You Scored {score} / {questions.length}
                  </h3>
                  <p className="text-sm text-[#756858] mt-1">
                    {score === questions.length
                      ? "Outstanding! Perfect mastery of the verified material."
                      : score >= Math.ceil(questions.length * 0.7)
                      ? "Great job! You have solid comprehension of the source excerpts."
                      : "Good practice! Review the grounded citations to strengthen your understanding."}
                  </p>
                </div>

                {/* Score breakdown badge */}
                <div className="flex items-center gap-4 py-3 px-6 rounded-2xl bg-[#F4ECE1] border border-[rgba(212,175,55,0.3)]">
                  <div className="text-center">
                    <div className="text-xl font-bold text-emerald-600">{score}</div>
                    <div className="text-[11px] text-[#756858] uppercase font-semibold">Correct</div>
                  </div>
                  <div className="w-px h-8 bg-[rgba(212,175,55,0.3)]" />
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-500">{questions.length - score}</div>
                    <div className="text-[11px] text-[#756858] uppercase font-semibold">Incorrect</div>
                  </div>
                  <div className="w-px h-8 bg-[rgba(212,175,55,0.3)]" />
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#B8860B]">
                      {Math.round((score / questions.length) * 100)}%
                    </div>
                    <div className="text-[11px] text-[#756858] uppercase font-semibold">Accuracy</div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2 w-full max-w-xs">
                  <Button
                    onClick={handleRestart}
                    variant="outline"
                    className="flex-1 border-[rgba(212,175,55,0.45)] hover:bg-[#FAF1DF] text-[#1C1814] rounded-xl gap-1.5"
                  >
                    <RotateCcw className="h-4 w-4" /> Retake
                  </Button>
                  <Button
                    onClick={onClose}
                    className="flex-1 bg-gradient-to-r from-[#B8860B] via-[#C59A3F] to-[#E2B855] text-[#1C1814] font-bold rounded-xl shadow-md"
                  >
                    Done
                  </Button>
                </div>
              </motion.div>
            ) : (
              /* Question View */
              <div className="space-y-5">
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#756858] font-semibold">
                    <span>Question {currentIndex + 1} of {questions.length}</span>
                    <span className="text-[#B8860B] font-bold">Score: {score}</span>
                  </div>
                  <div className="h-2 w-full bg-[#F4ECE1] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#B8860B] to-[#E2B855]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="pt-2">
                  <h4 className="text-lg font-bold text-[#1C1814] leading-relaxed font-serif">
                    {currentQ.question}
                  </h4>
                </div>

                {/* Options List */}
                <div className="grid gap-2.5">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQ.correctIndex;
                    let btnStyle = "border-[rgba(212,175,55,0.3)] bg-white/80 hover:border-[#B8860B] hover:bg-[#FBF4E6] text-[#1C1814] shadow-xs";

                    if (isAnswerRevealed) {
                      if (isCorrect) {
                        btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                      } else if (isSelected) {
                        btnStyle = "border-rose-400 bg-rose-50 text-rose-900";
                      } else {
                        btnStyle = "border-[#E8DFD3] bg-[#FAF7F2] text-[#8C7E72] opacity-60";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerRevealed}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 text-sm ${btnStyle}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isAnswerRevealed && isCorrect
                              ? "bg-emerald-600 text-white"
                              : isAnswerRevealed && isSelected
                              ? "bg-rose-500 text-white"
                              : "bg-[#FBF2DE] text-[#B8860B] border border-[#E2B855]/40"
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="leading-snug">{option}</span>
                        </div>
                        {isAnswerRevealed && isCorrect && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        {isAnswerRevealed && isSelected && !isCorrect && (
                          <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {isAnswerRevealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-[#FBF6EC] border border-[rgba(212,175,55,0.35)] space-y-2"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#B8860B]">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span className="tracking-wide">Explanation</span>
                      {currentQ.citation?.title && (
                        <>
                          <span className="text-[#8C7E72] font-normal">·</span>
                          <span className="text-[#1C1814] font-medium">
                            {currentQ.citation.title}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-[#2C251E] leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          {quizData?.success && !isLoading && !isFinished && isAnswerRevealed && (
            <div className="px-6 py-4 border-t border-[#E5D7C3] bg-[#FAF3E8]/90 flex justify-end">
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-[#B8860B] via-[#C59A3F] to-[#E2B855] hover:from-[#a07409] hover:to-[#cfa341] text-[#1C1814] font-bold rounded-xl shadow-md gap-1.5 border border-[rgba(212,175,55,0.4)]"
              >
                {currentIndex + 1 === questions.length ? "View Summary" : "Next Question"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
