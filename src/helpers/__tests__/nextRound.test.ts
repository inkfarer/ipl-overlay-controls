import { generateMatchNameForRound } from '../nextRound';
import { MatchStore } from '../../types/schemas';

describe('generateMatchNameForRound', () => {
    it('returns expected name when no matches exist with given round id', () => {
        expect(generateMatchNameForRound(
            { aaa: { meta: { relatedRoundId: '1234567' } } } as unknown as MatchStore,
            '1234',
            'Round Name')).toEqual('Round Name');
    });

    it('returns expected name when one match exists with given round name', () => {
        expect(generateMatchNameForRound(
            {
                aaa: { meta: { relatedRoundId: '1234567' } },
                bbb: { meta: { relatedRoundId: '1234' } }
            } as unknown as MatchStore,
            '1234',
            'cool round')).toEqual('cool round (2)');
    });

    it('returns expected name when more than one match exists with given round name', () => {
        expect(generateMatchNameForRound(
            {
                aaa: { meta: { relatedRoundId: '1234567' } },
                bbb: { meta: { relatedRoundId: '1234' } },
                ccc: { meta: { relatedRoundId: '1234' } },
                ddd: { meta: { relatedRoundId: '1234' } }
            } as unknown as MatchStore,
            '1234',
            'cool round')).toEqual('cool round (4)');
    });
});
