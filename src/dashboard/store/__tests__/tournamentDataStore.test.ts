import { tournamentDataStore } from '../tournamentDataStore';
import { mockSendMessage } from '../../__mocks__/mockNodecg';

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
});
