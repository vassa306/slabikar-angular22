
export interface Letter {
  letter: string;
  word: string;
  emoji: string;
}

export interface Word {
  word: string;
  syllables: string[];
  emoji: string;
}

export interface LessonData {
  letters: Letter[];
  syllables: string[];
  words: Word[];
}

export type ReadingMethod = 'syllabic' | 'genetic';

export type Activity =
  | 'home'
  | 'letters'
  | 'syllables'
  | 'words'
  | 'progress'
  | 'problem-words'
  | 'audio-dictation';
