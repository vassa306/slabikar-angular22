import { Component, computed, inject, signal } from "@angular/core";
import { LearningService } from "../learning.service";
import { ProblemWordsService } from "../services/problem-words.service";


type DictationMode = "syllables" | "words";
type AnswerResult = "correct" | "incorrect" | null;

@Component({
  imports: [],
  selector: "app-audio-dictation",
  styleUrl: "./audio-dictation.css",
  templateUrl: "./audio-dictation.html",
})
export class AudioDictation {
  readonly app = inject(LearningService);

  private readonly problemWords = inject(ProblemWordsService);

  readonly mode = signal<DictationMode>("words");
  readonly index = signal(0);
  readonly typedAnswer = signal("");
  readonly showHint = signal(false);
  readonly answerResult = signal<AnswerResult>(null);
  readonly mistakeRecorded = signal(false);

  // Select the exercise items according to the active mode.
  readonly items = computed(() =>
    this.mode() === "words"
      ? this.app.data().words.map((item) => item.word)
      : this.app.data().syllables,
  );

  // Get the currently selected word or syllable.
  readonly currentItem = computed(() => this.items()[this.index()] ?? "");

  // Check whether another exercise exists.
  readonly hasNext = computed(() => this.index() + 1 < this.items().length);

  // Change mode and start from the first exercise.
  setMode(mode: DictationMode): void {
    this.mode.set(mode);
    this.index.set(0);
    this.resetExercise();
  }

  // Play the current MP3 using the existing service.
  playAudio(): void {
    const value = this.currentItem();

    if (!value) return;

    this.app.speak(value);
  }

  // Update the answer typed by the child.
  updateAnswer(value: string): void {
    if (this.answerResult() !== null) return;

    this.typedAnswer.set(value);
  }

  // Reveal the answer and record a mistake only once.
  revealHint(): void {
    if (!this.currentItem()) return;
    if (this.answerResult() !== null) return;
    if (this.showHint()) return;

    this.recordMistake();
    this.showHint.set(true);
  }

  // Evaluate the typed answer.
  checkAnswer(): void {
    if (!this.currentItem()) return;
    if (this.answerResult() !== null) return;

    const answer = this.normalize(this.typedAnswer());
    if (!answer) return;

    const expected = this.normalize(this.currentItem());

    console.log("Typed answer:", answer);
    console.log("Expected answer:", expected);

    const isCorrect = answer === expected;

    this.app.recordAnswer({
      activity: "audio-dictation",
      word: this.currentItem(),
      isCorrect: isCorrect,
      usedHint: this.showHint(),
    });

    console.log("Is correct:", isCorrect);

    if (isCorrect) {
      if (!this.showHint()) {
        this.problemWords.markCorrect(this.currentItem());
      }

      this.answerResult.set("correct");
    } else {
      this.recordMistake();
      this.answerResult.set("incorrect");
    }
  }

  // Move to the next exercise.
  next(): void {
    if (!this.hasNext()) return;

    this.index.update((current) => current + 1);
    this.resetExercise();
  }

  // Move to the previous exercise.
  previous(): void {
    if (this.index() === 0) return;

    this.index.update((current) => current - 1);
    this.resetExercise();
  }

  // Record no more than one mistake per exercise attempt.
  private recordMistake(): void {
    if (this.mistakeRecorded()) return;

    const value = this.currentItem();
    if (!value) return;

    const syllables =
      this.mode() === "words"
        ? (this.app.data().words.find((item) => item.word === value)
            ?.syllables ?? [value])
        : [value];

    this.problemWords.addMistake({
      word: value,
      syllables,
      mistakes: 1,
      correctStreak: 0,
    });

    this.mistakeRecorded.set(true);
  }

  // Reset the state for a new exercise attempt.
  private resetExercise(): void {
    this.typedAnswer.set("");
    this.showHint.set(false);
    this.answerResult.set(null);
    this.mistakeRecorded.set(false);
  }

  // Compare Czech text without ignoring diacritics.
  private normalize(value: string): string {
    return value.trim().normalize("NFC").toLocaleUpperCase("cs-CZ");
  }
}
