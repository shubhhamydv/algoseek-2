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
  ExternalLink,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-[#14151a] border border-[#2a2c36] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#242630] bg-[#181a22]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base leading-tight">
                  {quizData?.topicTitle || "Grounded Practice Quiz"}
                </h3>
                <p className="text-xs text-zinc-400">
                  {quizData?.scope === "uploads" ? "Strictly verified from your upload" : "Sourced from DSA lecture series"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              aria-label="Close quiz"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
                  <Sparkles className="h-5 w-5 text-amber-400 absolute inset-0 m-auto" />
                </div>
                <h4 className="text-base font-medium text-white">Synthesizing Verified Quiz...</h4>
                <p className="text-xs text-zinc-400 max-w-sm">
                  Generating multiple-choice questions with mandatory fact verification against source excerpts.
                </p>
              </div>
            ) : !quizData?.success || questions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-3 rounded-full bg-zinc-800/80 text-zinc-400">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h4 className="text-base font-semibold text-white">Quiz Unavailable</h4>
                <p className="text-sm text-zinc-400 max-w-md">
                  {quizData?.message || "Could not generate verified questions for this material. Try asking a question first or upload a richer study document."}
                </p>
                <Button onClick={onClose} variant="outline" className="mt-2 border-zinc-700">
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
                <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Trophy className="h-10 w-10" />
                </div>
                <div>
                  <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">Quiz Complete</span>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    You Scored {score} / {questions.length}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    {score === questions.length
                      ? "Outstanding! Perfect mastery of the verified material."
                      : score >= Math.ceil(questions.length * 0.7)
                      ? "Great job! You have solid comprehension of the source excerpts."
                      : "Good practice! Review the grounded citations to strengthen your understanding."}
                  </p>
                </div>

                {/* Score breakdown badge */}
                <div className="flex items-center gap-4 py-3 px-6 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="text-center">
                    <div className="text-xl font-bold text-emerald-400">{score}</div>
                    <div className="text-[11px] text-zinc-500 uppercase">Correct</div>
                  </div>
                  <div className="w-px h-8 bg-zinc-800" />
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-400">{questions.length - score}</div>
                    <div className="text-[11px] text-zinc-500 uppercase">Incorrect</div>
                  </div>
                  <div className="w-px h-8 bg-zinc-800" />
                  <div className="text-center">
                    <div className="text-xl font-bold text-amber-400">
                      {Math.round((score / questions.length) * 100)}%
                    </div>
                    <div className="text-[11px] text-zinc-500 uppercase">Accuracy</div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2 w-full max-w-xs">
                  <Button
                    onClick={handleRestart}
                    variant="outline"
                    className="flex-1 border-zinc-700 hover:bg-zinc-800 gap-1.5"
                  >
                    <RotateCcw className="h-4 w-4" /> Retake
                  </Button>
                  <Button
                    onClick={onClose}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
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
                  <div className="flex justify-between text-xs text-zinc-400 font-medium">
                    <span>Question {currentIndex + 1} of {questions.length}</span>
                    <span className="text-amber-400">Score: {score}</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="pt-2">
                  <h4 className="text-lg font-semibold text-white leading-relaxed">
                    {currentQ.question}
                  </h4>
                </div>

                {/* Options List */}
                <div className="grid gap-2.5">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQ.correctIndex;
                    let btnStyle = "border-zinc-800 bg-[#191b24] hover:border-zinc-700 text-zinc-200";

                    if (isAnswerRevealed) {
                      if (isCorrect) {
                        btnStyle = "border-emerald-500/80 bg-emerald-950/40 text-emerald-200 font-medium";
                      } else if (isSelected) {
                        btnStyle = "border-red-500/80 bg-red-950/40 text-red-200";
                      } else {
                        btnStyle = "border-zinc-800/40 bg-zinc-900/30 text-zinc-500 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerRevealed}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 text-sm ${btnStyle}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${
                            isAnswerRevealed && isCorrect
                              ? "bg-emerald-500 text-black"
                              : isAnswerRevealed && isSelected
                              ? "bg-red-500 text-white"
                              : "bg-zinc-800 text-zinc-400"
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </div>
                        {isAnswerRevealed && isCorrect && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        {isAnswerRevealed && isSelected && !isCorrect && (
                          <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
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
                    className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2.5"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Grounded Evidence</span>
                      <span className="text-zinc-500 font-normal">·</span>
                      <span className="text-zinc-300 font-normal flex items-center gap-1">
                        {currentQ.citation.sourceType === "pdf" ? (
                          <>
                            <FileText className="h-3 w-3 text-amber-400" />
                            <span>Page {currentQ.citation.page ?? 1}</span>
                          </>
                        ) : currentQ.citation.sourceType === "video" ? (
                          <>
                            <Video className="h-3 w-3 text-amber-400" />
                            <span>{currentQ.citation.title} @ {currentQ.citation.timestamp ?? "00:00"}</span>
                          </>
                        ) : (
                          <>
                            <FileText className="h-3 w-3 text-amber-400" />
                            <span>Uploaded Notes</span>
                          </>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                    {currentQ.citation.snippet && (
                      <div className="text-[11px] text-zinc-400 bg-black/40 p-2.5 rounded-lg border border-zinc-800/80 italic font-mono">
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
            <div className="px-6 py-4 border-t border-[#242630] bg-[#181a22] flex justify-end">
              <Button
                onClick={handleNext}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-1.5"
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
