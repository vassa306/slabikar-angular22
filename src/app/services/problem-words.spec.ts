import { TestBed } from "@angular/core/testing";
import { ProblemWords } from "./problem-words.service";

describe('ProblemWordsService', () => {
    let service: ProblemWords;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProblemWords);
    });

    it('should add a problem word', () => {
        service.addMistake({
            word: 'MÁMA',
            syllables: ['MÁ', 'MA'],
            mistakes: 1,
            correctStreak: 0
        });
        expect(service.words().length).toBe(1);
        expect(service.words()[0]).toEqual({
            word: 'MÁMA',
            syllables: ['MÁ', 'MA'],
            mistakes: 1,
            correctStreak: 0
        });
        expect(service.words()[0].word).toBe("MÁMA");
    });

    it('should update an existing problem word', () => {
        
    });
});

