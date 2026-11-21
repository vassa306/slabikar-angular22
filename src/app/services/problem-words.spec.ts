import { TestBed } from "@angular/core/testing";
import { ProblemWordsService } from "./problem-words.service";
import { ProblemWord } from "../models/problem-word.model";

describe('ProblemWordsService', () => {
    let service: ProblemWordsService;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProblemWordsService);
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
        const word: ProblemWord = {
            word: 'MÁMA',
            syllables: ['MÁ', 'MA'],
            mistakes: 1,
            correctStreak: 0
        };

        service.addMistake(word);
        service.addMistake(word);
        expect(service.words().length).toBe(1);
        expect(service.words()[0].mistakes).toBe(2);
        expect(service.words()[0].correctStreak).toBe(0);
    });

    it('Mistake after CorrectStreak is 2', () => {
        const word: ProblemWord = {
            word: 'MÁMA',
            syllables: ['MÁ', 'MA'],
            mistakes: 0,
            correctStreak: 2
        };

        service.addMistake(word);
        service.markCorrect(word.word);
        service.markCorrect(word.word);
        service.addMistake(word);
        expect(service.words().length).toBe(1);
        expect(service.words()[0].mistakes).toBe(2);
        expect(service.words()[0].correctStreak).toBe(0);
        expect(service.words()[0].syllables).toEqual(['MÁ', 'MA']);
    });
    it('should increment correctStreak after correct answer', () => {
        const word: ProblemWord = {
            word: 'MÁMA',
            syllables: ['MÁ', 'MA'],
            mistakes: 1,
            correctStreak: 0
        };

        service.addMistake(word);
        service.markCorrect(word.word);
        expect(service.words().length).toBe(1);
        expect(service.words()[0].mistakes).toBe(1);
        expect(service.words()[0].correctStreak).toBe(1);
    })

    it('Word should remove word after 3 correct answers', () => {
        const word: ProblemWord = {
            word: 'MÁMA',
            syllables: ['MÁ', 'MA'],
            mistakes: 1,
            correctStreak: 0
        };

        const word1: ProblemWord = {
            word: 'LASO',
            syllables: ['LA', 'SO'],
            mistakes: 1,
            correctStreak: 0
        };

        service.addMistake(word);
        service.addMistake(word1);

        // Mark the word as correct 3 times
        for (let i = 0; i < 3; i++) {
            service.markCorrect(word.word);
        }
        expect(service.words().length).toBe(1);
        expect(service.words()[0].word).toBe("LASO");
        //check that the word has been removed from the list
        expect(service.words()[0].word).not.toBe("MÁMA");
    });

    it('should persist words in localStorage', () => {
        const word: ProblemWord = {
            word: 'MÁMA',
            syllables: ['MÁ', 'MA'],
            mistakes: 1,
            correctStreak: 0
        };

        // Prevent actual writes to localStorage.
        const setItemSpy = spyOn(localStorage, 'setItem');

        service.addMistake(word);

        // Run pending Angular effects.
        TestBed.tick();

        expect(setItemSpy).toHaveBeenCalledWith(
            'slabikar-problem-words-v1',
            JSON.stringify([word])
        );
    });
})