import { highlightedMatchStore } from '../highlightedMatchStore';
import { mockSendMessage } from '../../__mocks__/mockNodecg';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';

describe('highlightedMatchStore', () => {
    describe('setState', () => {
        it('updates state', () => {
            highlightedMatchStore.commit('setState', { name: 'tournamentData', val: { foo: 'bar' } });

            expect(highlightedMatchStore.state.tournamentData).toEqual({ foo: 'bar' });
        });
    });

    describe('setNextMatch', () => {
        it('sends message to extension', () => {
            highlightedMatchStore.dispatch('setNextMatch', { teamAId: 'teama123', teamBId: 'teamb3409587' });

            expect(mockSendMessage).toHaveBeenCalledWith('setNextRound', {
                teamAId: 'teama123',
                teamBId: 'teamb3409587'
            });
        });
    });

    describe('getHighlightedMatches', () => {
        it('fetches all matches if chosen', async () => {
            await highlightedMatchStore.dispatch('getHighlightedMatches', { options: [ { value: 'all' } ]});

            expect(mockSendMessage).toHaveBeenCalledWith('getHighlightedMatches', { getAllMatches: true });
        });

        it('fetches stages if tournament is imported from battlefy', async () => {
            highlightedMatchStore.state.tournamentData = {
                meta: {
                    source: TournamentDataSource.BATTLEFY,
                    id: 'tournament123'
                },
                teams: []
            };
            await highlightedMatchStore.dispatch('getHighlightedMatches', {
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
            highlightedMatchStore.state.tournamentData = {
                meta: {
                    source: TournamentDataSource.SMASHGG,
                    id: 'tournament123'
                },
                teams: []
            };
            await highlightedMatchStore.dispatch('getHighlightedMatches', {
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
            highlightedMatchStore.state.tournamentData = {
                meta: {
                    source: TournamentDataSource.UPLOAD,
                    id: 'tournament123'
                },
                teams: []
            };

            await expect(() => highlightedMatchStore.dispatch('getHighlightedMatches', {
                options: [
                    { value: '102938210598', name: 'Cool Stream' },
                    { value: '4059678', name: 'Cooler Stream' }
                ]
            })).rejects.toThrow('Cannot import data from source \'UPLOAD\'');

            expect(mockSendMessage).not.toHaveBeenCalled();
        });
    });
});
