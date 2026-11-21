import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProblemWords } from './problem-words';

describe('ProblemWords', () => {
  let component: ProblemWords;
  let fixture: ComponentFixture<ProblemWords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProblemWords]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProblemWords);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
