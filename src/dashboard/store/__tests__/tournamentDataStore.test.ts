import { tournamentDataStore } from '../tournamentDataStore';
import { mockSendMessage } from '../../__mocks__/mockNodecg';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';

describe('tournamentDataStore', () => {
    describe('setState', () => {
        it('updates state', () => {
            tournamentDataStore.commit('setState', { name: 'roundStore', val: { foo: 'bar' } });

            expect(tournamentDataStore.state.roundStore).toEqual({ foo: 'bar' });
        });
    });

    describe('setTeamImageHidden', () => {
        it('sends message to extension', () => {
            tournamentDataStore.commit('setTeamImageHidden', { teamId: '1234', isVisible: true });

            expect(mockSendMessage).toHaveBeenCalledWith('toggleTeamImage', { teamId: '1234', isVisible: true });
        });
    });

    describe('getTournamentData', () => {
        it('sends message to extension', async () => {
            await tournamentDataStore.dispatch('getTournamentData', {
                method: TournamentDataSource.UPLOAD,
                id: 'tournament___'
            });

            expect(mockSendMessage).toHaveBeenCalledWith('getTournamentData', {
                method: TournamentDataSource.UPLOAD,
                id: 'tournament___'
            });
        });
    });

    describe('getSmashggEvent', () => {
        it('sends message to extension', async () => {
            await tournamentDataStore.dispatch('getSmashggEvent', {
                eventId: 123123
            });

            expect(mockSendMessage).toHaveBeenCalledWith('getSmashggEvent', {
                eventId: 123123
            });
        });
    });
});
