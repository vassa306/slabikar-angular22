import { ComponentFixture, TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";

import { AudioDictation } from "./audio-dictation";
import { LearningService } from "../learning.service";
import { ProblemWordsService } from "../services/problem-words.service";

describe("AudioDictation", () => {
  let component: AudioDictation;
  let fixture: ComponentFixture<AudioDictation>;

  let learningServiceMock: jasmine.SpyObj<LearningService>;
  let problemWordsMock: jasmine.SpyObj<ProblemWordsService>;

  beforeEach(async () => {
    // Create a mock for the learning service.
    learningServiceMock = jasmine.createSpyObj<LearningService>(
      "LearningService",
      ["speak"],
    );

    // Provide test lesson data through an Angular signal.
    Object.defineProperty(learningServiceMock, "data", {
      value: signal({
        letters: [],
        syllables: ["MA", "SO"],
        words: [
          {
            word: "MASO",
            syllables: ["MA", "SO"],
            emoji: "🥩",
          },
        ],
      }),
    });

    // Create a mock for the problem words service.
    problemWordsMock = jasmine.createSpyObj<ProblemWordsService>(
      "ProblemWordsService",
      ["addMistake", "markCorrect"],
    );

    await TestBed.configureTestingModule({
      imports: [AudioDictation],
      providers: [
        {
          provide: LearningService,
          useValue: learningServiceMock,
        },
        {
          provide: ProblemWordsService,
          useValue: problemWordsMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AudioDictation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should accept a correct answer", () => {
    component.updateAnswer("MASO");
    component.checkAnswer();

    expect(component.answerResult()).toBe("correct");
    expect(problemWordsMock.markCorrect).toHaveBeenCalledOnceWith("MASO");
    expect(problemWordsMock.addMistake).not.toHaveBeenCalled();
  });
  it("should accept an incorrect answer", () => {
    component.updateAnswer("MÁS");
    component.checkAnswer();
    expect(component.answerResult()).toBe("incorrect");
    expect(problemWordsMock.addMistake).toHaveBeenCalledTimes(1);
    expect(problemWordsMock.addMistake).toHaveBeenCalledOnceWith({
      word: "MASO",
      syllables: ["MA", "SO"],
      mistakes: 1,
      correctStreak: 0,
    });
    expect(problemWordsMock.markCorrect).not.toHaveBeenCalled();
  });
  it("should not record a mistake twice after using a hint", () => {
    // Arrange
    component.revealHint();
    expect(problemWordsMock.addMistake).toHaveBeenCalledTimes(1);
    component.updateAnswer("MÁS");

    // Act
    component.checkAnswer();
    expect(problemWordsMock.addMistake).toHaveBeenCalledTimes(1);

    // Assert
    expect(component.answerResult()).toBe("incorrect");

    expect(problemWordsMock.addMistake).toHaveBeenCalledOnceWith({
      word: "MASO",
      syllables: ["MA", "SO"],
      mistakes: 1,
      correctStreak: 0,
    });

    expect(problemWordsMock.markCorrect).not.toHaveBeenCalled();
  });
  it("verification of empty answer in the audio dictation component", () => {
    component.updateAnswer("");
    component.checkAnswer();
    expect(component.answerResult()).toBeNull();
    expect(problemWordsMock.addMistake).not.toHaveBeenCalled();
    expect(problemWordsMock.markCorrect).not.toHaveBeenCalled();
  });

  it("should reject a numeric answer", () => {
    // Arrange
    component.updateAnswer("123");

    // Act
    component.checkAnswer();

    // Assert
    expect(component.answerResult()).toBe("incorrect");
    expect(problemWordsMock.addMistake).toHaveBeenCalledTimes(1);
    expect(problemWordsMock.markCorrect).not.toHaveBeenCalled();
  });
});
