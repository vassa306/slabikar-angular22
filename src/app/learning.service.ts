import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

export interface Letter { letter: string; word: string; emoji: string; }
export interface Word { word: string; syllables: string[]; emoji: string; }
export interface LessonData { letters: Letter[]; syllables: string[]; words: Word[]; }
export type ReadingMethod = 'syllabic' | 'genetic';
export type Activity = 'home' | 'letters' | 'syllables' | 'words' | 'progress';
interface Progress { correct: number; attempted: number; }
const EMPTY: LessonData = { letters: [], syllables: [], words: [] };
const KEY = 'slabikar-progress-v1';
const METHOD_KEY = 'slabikar-method-v1';

@Injectable({ providedIn: 'root' })
export class LearningService {
  private readonly http = inject(HttpClient);
  readonly data = toSignal(this.http.get<LessonData>('/lessons.json').pipe(
    catchError(error => { console.error('Lekce se nepodařilo načíst:', error); return of(EMPTY); })
  ), { initialValue: EMPTY });
  readonly method = signal<ReadingMethod>(this.readMethod());
  readonly activity = signal<Activity>('home');
  readonly index = signal(0);
  readonly selected = signal('');
  readonly progress = signal<Progress>(this.readProgress());
  readonly accuracy = computed(() => this.progress().attempted === 0 ? 0 : Math.round(100 * this.progress().correct / this.progress().attempted));
  readonly stars = computed(() => this.progress().correct);
  readonly currentLetter = computed(() => this.data().letters[this.index() % Math.max(this.data().letters.length, 1)]);
  readonly currentSyllable = computed(() => this.data().syllables[this.index() % Math.max(this.data().syllables.length, 1)] ?? '');
  readonly currentWord = computed(() => this.data().words[this.index() % Math.max(this.data().words.length, 1)]);
  readonly options = computed(() => {
    const word = this.currentWord();
    if (!word) return [];
    const answer = this.method() === 'syllabic' ? word.syllables.join(' + ') : [...word.word].join(' – ');
    const alternatives = this.method() === 'syllabic'
      ? ['MA + MÁ', 'TA + TÁ', 'SO + VO', 'LE + S']
      : ['M – O – M – A', 'P – A – S', 'L – A – S', 'S – O – V – O'];
    const wrong = alternatives.filter(x => x !== answer).slice(0, 2);
    return [answer, ...wrong].sort((a, b) => this.hash(a + word.word) - this.hash(b + word.word));
  });
  readonly correctAnswer = computed(() => {
    const word = this.currentWord();
    return word ? (this.method() === 'syllabic' ? word.syllables.join(' + ') : [...word.word].join(' – ')) : '';
  });

  setMethod(method: ReadingMethod): void {
    this.method.set(method);
    this.selected.set('');
    localStorage.setItem(METHOD_KEY, method);
  }
  navigate(activity: Activity): void { this.activity.set(activity); this.index.set(0); this.selected.set(''); }
  next(): void { this.index.update(i => i + 1); this.selected.set(''); }
  answer(choice: string): void {
    if (this.selected()) return;
    this.selected.set(choice);
    this.progress.update(p => ({ attempted: p.attempted + 1, correct: p.correct + Number(choice === this.correctAnswer()) }));
    localStorage.setItem(KEY, JSON.stringify(this.progress()));
  }
  resetProgress(): void { this.progress.set({ correct: 0, attempted: 0 }); localStorage.removeItem(KEY); }
  private readonly audioPlayer = new Audio();
  private readonly audioManifest = toSignal(
    this.http.get<Record<string, string>>('/audio/manifest.json').pipe(
      catchError(error => {
        console.error('Seznam českých nahrávek nelze načíst:', error);
        return of({} as Record<string, string>);
      })
    ), { initialValue: {} as Record<string, string> }
  );

  speak(value: string): void {
    const key = value.trim().toLocaleUpperCase('cs-CZ');
    const path = this.audioManifest()[key];
    if (!path) {
      console.warn(`Pro výraz "${key}" zatím nemáme českou nahrávku.`);
      return;
    }
    this.audioPlayer.pause();
    this.audioPlayer.currentTime = 0;
    this.audioPlayer.src = '/' + path;
    this.audioPlayer.load();
    void this.audioPlayer.play().catch(error => {
      console.error('Nahrávku se nepodařilo přehrát:', error);
    });
  }
  private readMethod(): ReadingMethod { return localStorage.getItem(METHOD_KEY) === 'genetic' ? 'genetic' : 'syllabic'; }
  private readProgress(): Progress {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null');
      if (parsed && typeof parsed === 'object' && 'correct' in parsed && 'attempted' in parsed &&
          typeof parsed.correct === 'number' && typeof parsed.attempted === 'number' &&
          Number.isFinite(parsed.correct) && Number.isFinite(parsed.attempted) &&
          parsed.correct >= 0 && parsed.attempted >= parsed.correct) {
        return { correct: parsed.correct, attempted: parsed.attempted };
      }
    } catch { /* Poškozený záznam ignorujeme. */ }
    return { correct: 0, attempted: 0 };
  }
  private hash(text: string): number { return [...text].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) | 0, 7); }
}
