import { extractBattlefyTournamentId, pluralizeWithoutCount } from '../stringHelper';

describe('stringHelper', () => {
    describe('pluralizeWithoutCount', () => {
        it('gives singular form if required', () => {
            expect(pluralizeWithoutCount('knife', 1, 'knives')).toEqual('knife');
            expect(pluralizeWithoutCount('user', 1)).toEqual('user');
        });

        it('gives plural form if required', () => {
            expect(pluralizeWithoutCount('knife', 2, 'knives')).toEqual('knives');
            expect(pluralizeWithoutCount('user', 0)).toEqual('users');
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
