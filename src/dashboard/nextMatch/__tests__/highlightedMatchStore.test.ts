import { mockSendMessage } from '../../__mocks__/mockNodecg';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { createPinia, setActivePinia } from 'pinia';
import { useHighlightedMatchStore } from '../highlightedMatchStore';

describe('highlightedMatchStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('setNextMatch', () => {
        it('sends message to extension', () => {
            const store = useHighlightedMatchStore();

            store.setNextMatch({ teamAId: 'teama123', teamBId: 'teamb3409587', name: 'test next round' });

            expect(mockSendMessage).toHaveBeenCalledWith('setNextRound', {
                teamAId: 'teama123',
                teamBId: 'teamb3409587',
                name: 'test next round'
            });
        });
    });

    describe('getHighlightedMatches', () => {
        it('fetches all matches if chosen', async () => {
            const store = useHighlightedMatchStore();

            // @ts-ignore
            await store.getHighlightedMatches({ options: [ { value: 'all' } ]});

            expect(mockSendMessage).toHaveBeenCalledWith('getHighlightedMatches', { getAllMatches: true });
        });

        it('fetches stages if tournament is imported from battlefy', async () => {
            const store = useHighlightedMatchStore();
            store.tournamentData = {
                meta: {
                    source: TournamentDataSource.BATTLEFY,
                    id: 'tournament123',
                    shortName: null
                },
                teams: []
            };

            await store.getHighlightedMatches({
                options: [
                    { value: 'bracket123', name: 'Bracket 123' },
                    { value: 'bracket456', name: 'Bracket 456' }
                ]
            });

            expect(mockSendMessage).toHaveBeenCalledWith('getHighlightedMatches', {
                getAllMatches: false,
                stages: [ 'bracket123', 'bracket456' ]
            });
        });

        it('fetches streams if tournament is imported from smash.gg', async () => {
            const store = useHighlightedMatchStore();
            store.tournamentData = {
                meta: {
                    source: TournamentDataSource.SMASHGG,
                    id: 'tournament123',
                    shortName: null
                },
                teams: []
            };

            await store.getHighlightedMatches({
                options: [
                    { value: '102938210598', name: 'Cool Stream' },
                    { value: '4059678', name: 'Cooler Stream' }
                ]
            });

            expect(mockSendMessage).toHaveBeenCalledWith('getHighlightedMatches', {
                getAllMatches: false,
                streamIDs: [ 102938210598, 4059678 ]
            });
        });

        it('throws error if tournament is imported from unsupported source', async () => {
            const store = useHighlightedMatchStore();
            store.tournamentData = {
                meta: {
                    source: TournamentDataSource.UPLOAD,
                    id: 'tournament123',
                    shortName: null
                },
                teams: []
            };

            await expect(() => store.getHighlightedMatches({
                options: [
                    { value: '102938210598', name: 'Cool Stream' },
                    { value: '4059678', name: 'Cooler Stream' }
                ]
            })).rejects.toThrow('Cannot import data from source \'UPLOAD\'');

            expect(mockSendMessage).not.toHaveBeenCalled();
        });
    });
});
