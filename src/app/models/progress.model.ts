
export type TrackedActivity =
  | 'words'
  | 'audio-dictation'
  | 'problem-words';

export interface ActivityProgress {
  correct: number;
  attempted: number;
}

export interface Progress extends ActivityProgress {
  activities: Record<TrackedActivity, ActivityProgress>;
}

export interface AnswerRecord {
  activity: TrackedActivity;
  word: string;
  isCorrect: boolean;
  usedHint?: boolean;
}
