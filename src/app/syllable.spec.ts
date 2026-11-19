describe('Skládání slabik', () => {
  it('spojí M a A do MA', () => {
    const consonant = 'M';
    const vowel = 'A';

    const result = consonant + vowel;

    expect(result).toBe('MA');
  });

  it('rozpozná nesprávnou slabiku', () => {
    const result = 'ME';

    expect(result).not.toBe('MA');
  });
  it('spojí B a O do BO', () => {
    const consonant = 'B';
    const vowel = 'O';

    const result = consonant + vowel;

    expect(result).toBe('BO');
  });
});


