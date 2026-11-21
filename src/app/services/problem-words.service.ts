import { Injectable, signal, effect } from '@angular/core';
import { ProblemWord } from '../models/problem-word.model';

const STORAGE_KEY = 'slabikar-problem-words-v1';

@Injectable({
  providedIn: 'root'
})
export class ProblemWordsService {
  //load promblem words from local storage and save them to a signal
  private readonly _words = signal<ProblemWord[]>(this.readWords());
  readonly words = this._words.asReadonly();

  private readonly saveEffect = effect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this._words())
    );
  });

  addMistake(word: ProblemWord): void {
    this._words.update(current => {
      const existing = current.find(
        item => item.word === word.word
      );

      if (existing) {
        return current.map(item =>
          item.word === word.word
            ? {
              ...item,
              mistakes: item.mistakes + 1,
              correctStreak: 0
            }
            : item
        );
      }
      return [...current, { ...word, mistakes: 1, correctStreak: 0 }];
    });
  }

  markCorrect(word: string): void {
    this._words.update(current => {

      const updatedWords = current.map(item => {
        if (item.word === word) {
          return {
            ...item,
            correctStreak: item.correctStreak + 1
          };
        }

        return item;
      });

      return updatedWords.filter(
        item => item.correctStreak < 3
      );
    });
  }

  private readWords(): ProblemWord[] {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is ProblemWord =>
            item !== null &&
            typeof item === 'object' &&
            typeof item.word === 'string' &&
            Array.isArray(item.syllables) &&
            item.syllables.every(
              (syllable: unknown) => typeof syllable === 'string'
            ) &&
            typeof item.mistakes === 'number' &&
            Number.isInteger(item.mistakes) &&
            item.mistakes >= 0 &&
            typeof item.correctStreak === 'number' &&
            Number.isInteger(item.correctStreak) &&
            item.correctStreak >= 0
        );
      }
    } catch {
      console.warn('Uložená problematická slovíčka mají neplatný JSON.');
    }

    return [];
  }
}