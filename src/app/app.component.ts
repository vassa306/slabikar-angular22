import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LearningService, ReadingMethod } from './learning.service';
import { ProblemWords } from './problem-words/problem-words';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ProblemWords],
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