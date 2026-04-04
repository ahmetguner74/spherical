"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "selim-progress";

export interface QuizResult {
  quizId: string;
  score: number;
  total: number;
  date: string;
}

export interface Progress {
  totalXP: number;
  quizResults: QuizResult[];
}

const DEFAULT_PROGRESS: Progress = {
  totalXP: 0,
  quizResults: [],
};

function loadProgress(): Progress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function saveProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(DEFAULT_PROGRESS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setLoaded(true);
  }, []);

  const addQuizResult = useCallback(
    (quizId: string, score: number, total: number) => {
      setProgress((prev) => {
        const updated: Progress = {
          totalXP: prev.totalXP + score,
          quizResults: [
            ...prev.quizResults,
            {
              quizId,
              score,
              total,
              date: new Date().toISOString(),
            },
          ],
        };
        saveProgress(updated);
        return updated;
      });
    },
    []
  );

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    saveProgress(DEFAULT_PROGRESS);
  }, []);

  return { progress, loaded, addQuizResult, resetProgress };
}
