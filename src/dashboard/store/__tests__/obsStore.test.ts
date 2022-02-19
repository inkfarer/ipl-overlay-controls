import { obsStore } from '../obsStore';
import { mockSendMessage } from '../../__mocks__/mockNodecg';

describe('obsStore', () => {
    describe('setState', () => {
        it('updates state', () => {
            obsStore.commit('setState', { name: 'obsData', val: { foo: 'bar' } });

            expect(obsStore.state.obsData).toEqual({ foo: 'bar' });
        });
    });

    describe('connect', () => {
        it('sends message to connect to OBS', () => {
            obsStore.dispatch('connect', { address: 'localhost', password: 'pwd' });

            expect(mockSendMessage).toHaveBeenCalledWith('connectToObs', { address: 'localhost', password: 'pwd' });
        });
    });

    describe('setData', () => {
        it('sends message to extension', () => {
            obsStore.dispatch('setData', { address: '192.168.1.2' });

            expect(mockSendMessage).toHaveBeenCalledWith('setObsData', { address: '192.168.1.2' });
        });
    });

    describe('startGame', () => {
        it('sends message to extension', () => {
            obsStore.dispatch('startGame');

            expect(mockSendMessage).toHaveBeenCalledWith('startGame');
        });
    });

    describe('endGame', () => {
        it('sends message to extension', () => {
            obsStore.dispatch('endGame');

            expect(mockSendMessage).toHaveBeenCalledWith('endGame');
        });
    });
});
