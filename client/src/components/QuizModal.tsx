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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18324A]/40 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-white/95 border border-[#B4D7EE] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-xl text-[#18324A]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#D0E4F2] bg-[#F4F9FD]/90">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#E1F3FA] text-[#0878D1] border border-[#B8EAF6]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-[#18324A] text-base leading-tight">
                  {quizData?.topicTitle || "Grounded Practice Quiz"}
                </h3>
                <p className="text-xs text-[#64788A]">
                  {quizData?.scope === "uploads" ? "Verified from your uploaded study materials" : "Sourced from 126 DSA lecture series"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#64788A] hover:text-[#18324A] rounded-xl hover:bg-[#EBF5FC] transition-colors"
              aria-label="Close quiz"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 bg-white">
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-[#B4D7EE] border-t-[#0878D1] animate-spin" />
                  <Sparkles className="h-5 w-5 text-[#0878D1] absolute inset-0 m-auto" />
                </div>
                <h4 className="text-base font-bold text-[#18324A]">Synthesizing Verified Quiz...</h4>
                <p className="text-xs text-[#64788A] max-w-sm">
                  Generating multiple-choice questions with mandatory fact verification against source excerpts.
                </p>
              </div>
            ) : !quizData?.success || questions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-3 rounded-full bg-[#E1F3FA] text-[#0878D1]">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-[#18324A]">Quiz Unavailable</h4>
                <p className="text-sm text-[#64788A] max-w-md">
                  {quizData?.message || "Could not generate verified questions for this material. Try asking a question first or upload a richer study document."}
                </p>
                <Button onClick={onClose} variant="outline" className="mt-2 border-[#B4D7EE] rounded-xl">
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
                <div className="p-4 rounded-full bg-[#E1F3FA] border border-[#B8EAF6] text-[#0878D1]">
                  <Trophy className="h-10 w-10" />
                </div>
                <div>
                  <span className="text-xs font-bold tracking-wider text-[#0878D1] uppercase">Quiz Complete</span>
                  <h3 className="text-2xl font-extrabold text-[#18324A] mt-1">
                    You Scored {score} / {questions.length}
                  </h3>
                  <p className="text-sm text-[#64788A] mt-1">
                    {score === questions.length
                      ? "Outstanding! Perfect mastery of the verified material."
                      : score >= Math.ceil(questions.length * 0.7)
                      ? "Great job! You have solid comprehension of the source excerpts."
                      : "Good practice! Review the grounded citations to strengthen your understanding."}
                  </p>
                </div>

                {/* Score breakdown badge */}
                <div className="flex items-center gap-4 py-3 px-6 rounded-2xl bg-[#F4F9FD] border border-[#D0E4F2]">
                  <div className="text-center">
                    <div className="text-xl font-bold text-emerald-600">{score}</div>
                    <div className="text-[11px] text-[#64788A] uppercase font-semibold">Correct</div>
                  </div>
                  <div className="w-px h-8 bg-[#D0E4F2]" />
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-500">{questions.length - score}</div>
                    <div className="text-[11px] text-[#64788A] uppercase font-semibold">Incorrect</div>
                  </div>
                  <div className="w-px h-8 bg-[#D0E4F2]" />
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#0878D1]">
                      {Math.round((score / questions.length) * 100)}%
                    </div>
                    <div className="text-[11px] text-[#64788A] uppercase font-semibold">Accuracy</div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2 w-full max-w-xs">
                  <Button
                    onClick={handleRestart}
                    variant="outline"
                    className="flex-1 border-[#B4D7EE] hover:bg-[#EBF5FC] text-[#18324A] rounded-xl gap-1.5"
                  >
                    <RotateCcw className="h-4 w-4" /> Retake
                  </Button>
                  <Button
                    onClick={onClose}
                    className="flex-1 bg-gradient-to-r from-[#0878D1] to-[#168FE0] hover:from-[#076bc0] hover:to-[#147ec6] text-white font-bold rounded-xl shadow-md"
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
                  <div className="flex justify-between text-xs text-[#64788A] font-semibold">
                    <span>Question {currentIndex + 1} of {questions.length}</span>
                    <span className="text-[#0878D1]">Score: {score}</span>
                  </div>
                  <div className="h-2 w-full bg-[#EBF4FA] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#0878D1] to-[#3DB9E8]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="pt-2">
                  <h4 className="text-lg font-bold text-[#18324A] leading-relaxed">
                    {currentQ.question}
                  </h4>
                </div>

                {/* Options List */}
                <div className="grid gap-2.5">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQ.correctIndex;
                    let btnStyle = "border-[#D0E4F2] bg-[#F8FBFE] hover:border-[#0878D1] hover:bg-[#EBF5FC] text-[#18324A]";

                    if (isAnswerRevealed) {
                      if (isCorrect) {
                        btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                      } else if (isSelected) {
                        btnStyle = "border-red-400 bg-red-50 text-red-900";
                      } else {
                        btnStyle = "border-[#E2EDF4] bg-[#FAFCFD] text-[#64788A] opacity-60";
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
                              ? "bg-red-500 text-white"
                              : "bg-[#E1F3FA] text-[#0878D1]"
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="leading-snug">{option}</span>
                        </div>
                        {isAnswerRevealed && isCorrect && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        {isAnswerRevealed && isSelected && !isCorrect && (
                          <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Grounded Explanation & Citation Box */}
                {isAnswerRevealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-[#F3F8FC] border border-[#B4D7EE] space-y-2.5"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0878D1]">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Grounded Evidence</span>
                      <span className="text-[#64788A] font-normal">·</span>
                      <span className="text-[#18324A] font-medium flex items-center gap-1">
                        {currentQ.citation.sourceType === "pdf" ? (
                          <>
                            <FileText className="h-3 w-3 text-[#0878D1]" />
                            <span>Page {currentQ.citation.page ?? 1}</span>
                          </>
                        ) : currentQ.citation.sourceType === "video" ? (
                          <>
                            <Video className="h-3 w-3 text-[#0878D1]" />
                            <span>{currentQ.citation.title} @ {currentQ.citation.timestamp ?? "00:00"}</span>
                          </>
                        ) : (
                          <>
                            <FileText className="h-3 w-3 text-[#0878D1]" />
                            <span>Uploaded Notes</span>
                          </>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-[#18324A] leading-relaxed">
                      {currentQ.explanation}
                    </p>
                    {currentQ.citation.snippet && (
                      <div className="text-[11.5px] text-[#4A5D6E] bg-white p-2.5 rounded-xl border border-[#D0E4F2] italic font-mono">
                        "{currentQ.citation.snippet.slice(0, 240)}{currentQ.citation.snippet.length > 240 ? "…" : ""}"
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          {quizData?.success && !isLoading && !isFinished && isAnswerRevealed && (
            <div className="px-6 py-4 border-t border-[#D0E4F2] bg-[#F4F9FD]/90 flex justify-end">
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-[#0878D1] to-[#168FE0] hover:from-[#076bc0] hover:to-[#147ec6] text-white font-bold rounded-xl shadow-md gap-1.5"
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
