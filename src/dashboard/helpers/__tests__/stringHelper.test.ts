import { addDots, extractBattlefyTournamentId, padNumber, pluralize } from '../stringHelper';

describe('stringHelper', () => {
    describe('addDots', () => {
        it('cuts off long strings', () => {
            expect(addDots('abcdefghijklmn', 10)).toEqual('abcdefg...');
        });

        it('does not cut off short strings', () => {
            expect(addDots('A', 2)).toEqual('A');
        });
    });

    describe('pluralize', () => {
        it('gives singular form if required', () => {
            expect(pluralize('knife', 1, 'knives')).toEqual('1 knife');
            expect(pluralize('user', 1)).toEqual('1 user');
        });

        it('formats given amount', () => {
            expect(pluralize('knife', 1000, 'knives')).toEqual('1,000 knives');
            expect(pluralize('user', 999999)).toEqual('999,999 users');
        });

        it('gives plural form if required', () => {
            expect(pluralize('knife', 2, 'knives')).toEqual('2 knives');
            expect(pluralize('user', 0)).toEqual('0 users');
        });
    });

    describe('padNumber', () => {
        it('pads number with given amount of zeroes', () => {
            expect(padNumber(1235, 9)).toEqual('000001235');
            expect(padNumber('999', 5)).toEqual('00999');
        });

        it('does not pad number if not necessary', () => {
            expect(padNumber(504278, 5)).toEqual('504278');
            expect(padNumber('1234', 4)).toEqual('1234');
        });
    });

    describe('extractBattlefyTournamentId', () => {
        it('returns input if id is passed in', () => {
            expect(extractBattlefyTournamentId('1f0dbcd0d30bd5')).toEqual('1f0dbcd0d30bd5');
        });

        it('extracts id from tournament url', () => {
            expect(extractBattlefyTournamentId('https://battlefy.com/inkling-performance-labs/low-ink-november-2021/618176f1f0dbcd0d30bd5906/info?infoTab=details'))
                .toEqual('618176f1f0dbcd0d30bd5906');
            expect(extractBattlefyTournamentId('https://battlefy.com/inkling-performance-labs/swim-or-sink-42/612726ebbcd60d70650d5006/stage/6142520969009b6b814eaf36/bracket/'))
                .toEqual('612726ebbcd60d70650d5006');
            expect(extractBattlefyTournamentId('http://battlefy.com/inkling-performance-labs/low-ink-november-2021/618176f1f0dbcd0d30bd5906/info?infoTab=details'))
                .toEqual('618176f1f0dbcd0d30bd5906');
            expect(extractBattlefyTournamentId('battlefy.com/inkling-performance-labs/low-ink-november-2021/618176f1f0dbcd0d30bd5906/info?infoTab=details'))
                .toEqual('618176f1f0dbcd0d30bd5906');
        });
    });
});
