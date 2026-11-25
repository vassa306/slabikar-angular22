
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { ProblemWordsService } from './services/problem-words.service';

import type {
  Activity,
  LessonData,
  ReadingMethod
} from './models/lesson.model';

import type {
  Progress,
  ActivityProgress,
  AnswerRecord,
  TrackedActivity
} from './models/progress.model';

const EMPTY: LessonData = {
  letters: [],
  syllables: [],
  words: []
};

const KEY = 'slabikar-progress-v1';
const METHOD_KEY = 'slabikar-method-v1';
const STARRED_WORDS_KEY = 'slabikar-starred-words-v1';

const TRACKED_ACTIVITIES: TrackedActivity[] = [
  'words',
  'audio-dictation',
  'problem-words'
];

@Injectable({
  providedIn: 'root'
})
export class LearningService {
  private readonly http = inject(HttpClient);
  private readonly problemWords = inject(ProblemWordsService);

  readonly starredWords = signal<string[]>(this.readStarredWords());

  readonly data = toSignal(
    this.http.get<LessonData>('/lessons.json').pipe(
      catchError((error) => {
        console.error('Cannot load lesson data:', error);
        return of(EMPTY);
      })
    ),
    { initialValue: EMPTY }
  );

  readonly method = signal<ReadingMethod>(this.readMethod());
  readonly activity = signal<Activity>('home');
  readonly index = signal(0);
  readonly selected = signal('');

  readonly progress = signal<Progress>(this.readProgress());

  readonly accuracy = computed(() =>
    this.progress().attempted === 0
      ? 0
      : Math.round(
        (100 * this.progress().correct) /
        this.progress().attempted
      )
  );

  readonly stars = computed(() => this.starredWords().length);

  readonly currentLetter = computed(() => {
    const letters = this.data().letters;

    if (letters.length === 0) return undefined;

    return letters[this.index() % letters.length];
  });

  readonly currentSyllable = computed(() => {
    const syllables = this.data().syllables;

    if (syllables.length === 0) return '';

    return syllables[this.index() % syllables.length];
  });

  readonly currentWord = computed(() => {
    const words = this.data().words;

    if (words.length === 0) return undefined;

    return words[this.index() % words.length];
  });

  readonly options = computed(() => {
    const word = this.currentWord();

    if (!word) return [];

    const answer =
      this.method() === 'syllabic'
        ? word.syllables.join(' + ')
        : [...word.word].join(' – ');

    const alternatives =
      this.method() === 'syllabic'
        ? ['MA + MÁ', 'TA + TÁ', 'SO + VO', 'LE + S']
        : [
          'M – O – M – A',
          'P – A – S',
          'L – A – S',
          'S – O – V – O'
        ];

    const wrong = alternatives
      .filter((item) => item !== answer)
      .slice(0, 2);

    return [answer, ...wrong].sort(
      (a, b) =>
        this.hash(a + word.word) -
        this.hash(b + word.word)
    );
  });

  readonly correctAnswer = computed(() => {
    const word = this.currentWord();

    if (!word) return '';

    return this.method() === 'syllabic'
      ? word.syllables.join(' + ')
      : [...word.word].join(' – ');
  });

  setMethod(method: ReadingMethod): void {
    this.method.set(method);
    this.selected.set('');

    localStorage.setItem(METHOD_KEY, method);
  }

  navigate(activity: Activity): void {
    this.activity.set(activity);
    this.index.set(0);
    this.selected.set('');
  }

  next(): void {
    this.index.update((current) => current + 1);
    this.selected.set('');
  }

  previous(): void {
    this.index.update((current) => Math.max(0, current - 1));
    this.selected.set('');
  }

  answer(choice: string): void {
    if (this.selected()) return;

    const word = this.currentWord();

    if (!word) return;

    const isCorrect = choice === this.correctAnswer();

    this.selected.set(choice);

    // Record progress through the shared method.
    this.recordAnswer({
      activity: 'words',
      word: word.word,
      isCorrect: isCorrect
    });

    // Track problematic words separately.
    if (isCorrect) {
      this.problemWords.markCorrect(word.word);
    } else {
      this.problemWords.addMistake({
        word: word.word,
        syllables: word.syllables,
        mistakes: 1,
        correctStreak: 0
      });
    }
  }

  recordAnswer(result: AnswerRecord): void {
    // Destructuring alternative:
    // const { activity, word, isCorrect, usedHint = false } = result;

    // Update total and activity-specific statistics.
    this.progress.update((current) => ({
      correct:
        current.correct + Number(result.isCorrect),

      attempted:
        current.attempted + 1,

      activities: {
        ...current.activities,

        [result.activity]: {
          correct:
            current.activities[result.activity].correct +
            Number(result.isCorrect),

          attempted:
            current.activities[result.activity].attempted + 1
        }
      }
    }));

    // Award a star only for an independent correct answer.
    if (
      result.isCorrect &&
      !result.usedHint &&
      !this.starredWords().includes(result.word)
    ) {
      this.starredWords.update((current) => [
        ...current,
        result.word
      ]);

      localStorage.setItem(
        STARRED_WORDS_KEY,
        JSON.stringify(this.starredWords())
      );
    }

    // Persist updated progress.
    localStorage.setItem(
      KEY,
      JSON.stringify(this.progress())
    );
  }

  resetProgress(): void {
    this.progress.set(this.createEmptyProgress());
    this.starredWords.set([]);

    localStorage.removeItem(KEY);
    localStorage.removeItem(STARRED_WORDS_KEY);
  }

  private readonly audioPlayer = new Audio();

  private readonly audioManifest = toSignal(
    this.http.get<Record<string, string>>('/audio/manifest.json').pipe(
      catchError((error) => {
        console.error('Cannot load list of Czech audio files:', error);
        return of({} as Record<string, string>);
      })
    ),
    {
      initialValue: {} as Record<string, string>
    }
  );

  speak(value: string): void {
    const key = value.trim().toLocaleUpperCase('cs-CZ');
    const audioPath = this.audioManifest()[key];

    if (!audioPath) {
      console.warn(`Missing Czech audio for "${key}"`);
      return;
    }

    this.audioPlayer.pause();
    this.audioPlayer.currentTime = 0;
    this.audioPlayer.src = '/' + audioPath;
    this.audioPlayer.load();

    void this.audioPlayer.play().catch((error) => {
      console.error('Cannot play audio:', error);
    });
  }

  private readMethod(): ReadingMethod {
    return localStorage.getItem(METHOD_KEY) === 'genetic'
      ? 'genetic'
      : 'syllabic';
  }


  private readProgress(): Progress {
    try {
      // Read and parse saved progress from localStorage.
      const parsed: unknown = JSON.parse(
        localStorage.getItem(KEY) ?? 'null'
      );

      // Validate the main progress structure.
      if (
        parsed === null ||
        typeof parsed !== 'object' ||
        Array.isArray(parsed) ||
        !('correct' in parsed) ||
        !('attempted' in parsed) ||
        !this.isValidProgressCount(parsed.correct) ||
        !this.isValidProgressCount(parsed.attempted) ||
        parsed.correct > parsed.attempted
      ) {
        return this.createEmptyProgress();
      }

      // Create a fresh progress object.
      const progress = this.createEmptyProgress();

      // Preserve previously saved total statistics.
      progress.correct = parsed.correct;
      progress.attempted = parsed.attempted;

      // Support the previous storage format without activities.
      if (!('activities' in parsed)) {
        return progress;
      }

      const activities = parsed.activities;

      // Validate the activities container.
      if (
        activities === null ||
        typeof activities !== 'object' ||
        Array.isArray(activities)
      ) {
        return progress;
      }

      // Validate each tracked activity independently.
      for (const activity of TRACKED_ACTIVITIES) {
        // Skip activities missing from saved data.
        if (!(activity in activities)) {
          continue;
        }

        // Read the property without assuming its data type.
        const item: unknown = Reflect.get(activities, activity);

        // Validate the activity statistics.
        if (
          item !== null &&
          typeof item === 'object' &&
          !Array.isArray(item) &&
          'correct' in item &&
          'attempted' in item &&
          this.isValidProgressCount(item.correct) &&
          this.isValidProgressCount(item.attempted) &&
          item.correct <= item.attempted
        ) {
          progress.activities[activity] = {
            correct: item.correct,
            attempted: item.attempted
          };
        }
      }

      return progress;
    } catch {
      // Handle invalid JSON without crashing the application.
      console.warn('Cannot parse progress from localStorage.');

      return this.createEmptyProgress();
    }
  }


  private isValidProgressCount(value: unknown): value is number {
    return (
      typeof value === 'number' &&
      Number.isSafeInteger(value) &&
      value >= 0
    );
  }

  private createEmptyProgress(): Progress {
    const activities = {} as Record<
      TrackedActivity,
      ActivityProgress
    >;

    // Create independent statistics for each activity.
    for (const activity of TRACKED_ACTIVITIES) {
      activities[activity] = {
        correct: 0,
        attempted: 0
      };
    }

    return {
      correct: 0,
      attempted: 0,
      activities: activities
    };
  }

  private hash(text: string): number {
    return [...text].reduce(
      (number, character) =>
        (number * 31 + character.charCodeAt(0)) | 0,
      7
    );
  }

  private readStarredWords(): string[] {
    try {
      const saved = localStorage.getItem(STARRED_WORDS_KEY);

      if (!saved) return [];

      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return [
          ...new Set(
            parsed.filter(
              (item): item is string =>
                typeof item === 'string'
            )
          )
        ];
      }
    } catch {
      console.warn('Cannot parse starred words from local storage.');
    }

    return [];
  }
}
