import { generateMatchNameForRound } from '../nextRound';
import { MatchStore } from '../../types/schemas';

describe('generateMatchNameForRound', () => {
    it('returns expected name when no matches exist with given round name', () => {
        expect(generateMatchNameForRound(
            { aaa: { meta: { name: 'rad round' } } } as unknown as MatchStore,
            'Round Name'))
            .toEqual('Round Name');
    });

    it('returns expected name when one match exists with given round name', () => {
        expect(generateMatchNameForRound(
            {
                aaa: { meta: { name: 'cool round' } },
                bbb: { meta: { name: 'rad round' } }
            } as unknown as MatchStore, 'cool round'))
            .toEqual('cool round (2)');
    });

    it('returns expected name when more than one match exists with given round name', () => {
        expect(generateMatchNameForRound(
            {
                aaa: { meta: { name: 'rad round' } },
                bbb: { meta: { name: 'cool round' } },
                ccc: { meta: { name: 'cool round' } },
                ddd: { meta: { name: 'cool round' } }
            } as unknown as MatchStore, 'cool round')).toEqual('cool round (4)');
    });
});
