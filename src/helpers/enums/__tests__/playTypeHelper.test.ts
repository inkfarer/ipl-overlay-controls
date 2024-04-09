import { PlayTypeHelper } from '../playTypeHelper';
import { PlayType } from '../../../types/enums/playType';

describe('PlayTypeHelper', () => {
    describe('fromBattlefySeriesStyle', () => {
        it('returns expected value on style gamesPerMatch', () => {
            expect(PlayTypeHelper.fromBattlefySeriesStyle('gamesPerMatch')).toEqual(PlayType.PLAY_ALL);
            expect(PlayTypeHelper.fromBattlefySeriesStyle('gamespermatch')).toEqual(PlayType.PLAY_ALL);
        });

        it('returns expected value on style bestOf', () => {
            expect(PlayTypeHelper.fromBattlefySeriesStyle('bestOf')).toEqual(PlayType.BEST_OF);
            expect(PlayTypeHelper.fromBattlefySeriesStyle('bestof')).toEqual(PlayType.BEST_OF);
        });

        it('returns null on unknown values', () => {
            expect(PlayTypeHelper.fromBattlefySeriesStyle('aaaaa')).toEqual(undefined);
            expect(PlayTypeHelper.fromBattlefySeriesStyle(null)).toEqual(undefined);
            expect(PlayTypeHelper.fromBattlefySeriesStyle(undefined)).toEqual(undefined);
            expect(PlayTypeHelper.fromBattlefySeriesStyle('  ')).toEqual(undefined);
        });
    });

    describe('fromSmashggSetGamesType', () => {
        it('returns expected play types', () => {
            expect(PlayTypeHelper.fromSmashggSetGamesType(1)).toEqual(PlayType.BEST_OF);
            expect(PlayTypeHelper.fromSmashggSetGamesType(2)).toEqual(PlayType.PLAY_ALL);
            expect(PlayTypeHelper.fromSmashggSetGamesType(3)).toEqual(undefined);
            expect(PlayTypeHelper.fromSmashggSetGamesType(null)).toEqual(undefined);
            expect(PlayTypeHelper.fromSmashggSetGamesType(undefined)).toEqual(undefined);
        });
    });
});
