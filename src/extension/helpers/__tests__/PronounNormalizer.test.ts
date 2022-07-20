import { normalizePronouns } from '../PronounNormalizer';

describe('normalizePronouns', () => {
    it('returns input with undefined values', () => {
        expect(normalizePronouns(undefined)).toBeUndefined();
        expect(normalizePronouns(null)).toBeNull();
    });

    it('handles empty strings', () => {
        expect(normalizePronouns('')).toBe('');
        expect(normalizePronouns('     ')).toBe('     ');
    });

    it.each([
        'any pronouns',
        'i want you to use any pronouns to refer to me',
        'any pronouns except f18 attack helicopter',
        'AnY pRoNoUnS',
        'i want you to use AnY pRoNoUnS to refer to me',
        'i want you to use any pronouns to refer to me (but i must assure you i prefer they/them)',
        'AnY pRoNoUnS except f18 attack helicopter',
    ])('returns expected result if input contains "any pronouns" ("%s")', input => {
        expect(normalizePronouns(input)).toBe('any pronouns');
    });

    it.each(([
        ['She/Her, They/Them', 'she/her, they/them'],
        ['She/Her, He/Him, They/Them', 'she/her, he/him, they/them'],
        ['xe/xem they/them', 'xe/xem, they/them'],
        ['He/Him or they/it, I don\'t care', 'he/him, they/it'],
        ['They/Them/He/Him (in order of preference)', 'they/them/he/him'],
        ['They / Them', 'they/them'],
        ['HE    /       HIM', 'he/him'],
        ['hmm, maybe something like he /  him would be good?', 'he/him'],
        ['i will be ready to kill if you use anything but they/them to refer to me', 'they/them']
    ]))('formats multiple sets of pronouns consistently ("%s" -> "%s")', (input, expectedResult) => {
        expect(normalizePronouns(input)).toBe(expectedResult);
    });
});
