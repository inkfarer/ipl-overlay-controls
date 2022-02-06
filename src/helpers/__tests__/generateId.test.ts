import { generateId } from '../generateId';

describe('generateId', () => {
    it('returns an ID based on the given random number', () => {
        jest.spyOn(global.Math, 'random')
            .mockReturnValueOnce(0.042788)
            .mockReturnValueOnce(0.589375);

        expect(generateId()).toBe('1jgbeqlc8');
        expect(generateId()).toBe('l7tvoha2v');
    });
});
