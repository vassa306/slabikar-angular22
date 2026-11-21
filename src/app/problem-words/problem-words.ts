import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';
import { ProblemWordsService } from '../services/problem-words.service';




@Component({
  selector: 'app-problem-words',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './problem-words.html',
  styleUrl: './problem-words.css'
})
export class ProblemWords {
  readonly problemWords = inject(ProblemWordsService);
}