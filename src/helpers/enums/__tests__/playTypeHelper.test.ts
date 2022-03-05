import { PlayTypeHelper } from '../playTypeHelper';
import { PlayType } from '../../../types/enums/playType';

describe('PlayTypeHelper', () => {
    describe('toPrettyString', () => {
        it('formats PLAY_ALL types', () => {
            expect(PlayTypeHelper.toPrettyString(PlayType.PLAY_ALL, 5)).toEqual('Play all 5');
            expect(PlayTypeHelper.toPrettyString(PlayType.PLAY_ALL, 20)).toEqual('Play all 20');
            expect(PlayTypeHelper.toPrettyString(PlayType.PLAY_ALL, undefined)).toEqual('Play all');
        });

        it('formats BEST_OF types', () => {
            expect(PlayTypeHelper.toPrettyString(PlayType.BEST_OF, 5)).toEqual('Best of 5');
            expect(PlayTypeHelper.toPrettyString(PlayType.BEST_OF, 20)).toEqual('Best of 20');
            expect(PlayTypeHelper.toPrettyString(PlayType.BEST_OF, undefined)).toEqual('Best of');
        });
    });

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
});
