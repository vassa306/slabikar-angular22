import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LearningService } from './learning.service';
import type { ReadingMethod } from './models/lesson.model';
import { ProblemWords } from './problem-words/problem-words';
import { AudioDictation } from './audio-dictation/audio-dictation';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ProblemWords, AudioDictation],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly app = inject(LearningService);

  changeMethod(method: ReadingMethod): void {
    this.app.setMethod(method);
  }

  reset(): void {
    if (window.confirm('Opravdu vymazat všechny výsledky?')) {
      this.app.resetProgress();
    }
  }
}