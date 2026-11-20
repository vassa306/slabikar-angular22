import { Injectable, signal } from '@angular/core';
import { ProblemWord } from '../models/problem-word.model';

@Injectable({
  providedIn: 'root'
})
export class ProblemWords {
  private readonly _words = signal<ProblemWord[]>([]);
  readonly words = this._words.asReadonly();

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
      return [...current, word];
    });
  }
}

