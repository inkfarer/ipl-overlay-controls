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
            tournamentDataStore.dispatch('setTeamImageHidden', { teamId: '1234', isVisible: true });

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

    describe('uploadTeamData', () => {
        it('sends file to local endpoint', async () => {
            const file = new File([], 'new-file.json');
            const expectedFormData = new FormData();
            expectedFormData.append('file', file);
            expectedFormData.append('jsonType', 'teams');
            global.fetch = jest.fn().mockResolvedValue({ status: 200 });

            await tournamentDataStore.dispatch('uploadTeamData', { file });

            expect(fetch).toHaveBeenCalledWith('/ipl-overlay-controls/upload-tournament-json', {
                method: 'POST',
                body: expectedFormData
            });
        });

        it('throws error on bad status', async () => {
            expect.assertions(2);

            const file = new File([], 'new-file.json');
            const expectedFormData = new FormData();
            expectedFormData.append('file', file);
            expectedFormData.append('jsonType', 'teams');
            global.fetch = jest.fn().mockResolvedValue({ status: 500, text: jest.fn().mockResolvedValue('Error!') });

            try {
                await tournamentDataStore.dispatch('uploadTeamData', { file });
            } catch (e) {
                expect(e.message).toEqual('Import failed with status 500: Error!');
                expect(fetch).toHaveBeenCalledWith('/ipl-overlay-controls/upload-tournament-json', {
                    method: 'POST',
                    body: expectedFormData
                });
            }
        });
    });

    describe('uploadRoundData', () => {
        it('sends file to local endpoint', async () => {
            const file = new File([], 'new-file.json');
            const expectedFormData = new FormData();
            expectedFormData.append('file', file);
            expectedFormData.append('jsonType', 'rounds');
            global.fetch = jest.fn().mockResolvedValue({ status: 200 });

            await tournamentDataStore.dispatch('uploadRoundData', { file });

            expect(fetch).toHaveBeenCalledWith('/ipl-overlay-controls/upload-tournament-json', {
                method: 'POST',
                body: expectedFormData
            });
        });

        it('throws error on bad status', async () => {
            expect.assertions(2);

            const file = new File([], 'new-file.json');
            const expectedFormData = new FormData();
            expectedFormData.append('file', file);
            expectedFormData.append('jsonType', 'rounds');
            global.fetch = jest.fn().mockResolvedValue({ status: 401, text: jest.fn().mockResolvedValue('Error!!') });

            try {
                await tournamentDataStore.dispatch('uploadRoundData', { file });
            } catch (e) {
                expect(e.message).toEqual('Import failed with status 401: Error!!');
                expect(fetch).toHaveBeenCalledWith('/ipl-overlay-controls/upload-tournament-json', {
                    method: 'POST',
                    body: expectedFormData
                });
            }
        });
    });

    describe('fetchRoundData', () => {
        it('sends message to extension', () => {
            tournamentDataStore.dispatch('fetchRoundData', { url: 'data://round-data' });

            expect(mockSendMessage).toHaveBeenCalledWith('getRounds', { url: 'data://round-data' });
        });
    });

    describe('removeRound', () => {
        it('sends message to extension', () => {
            tournamentDataStore.dispatch('removeRound', { roundId: 'round123' });

            expect(mockSendMessage).toHaveBeenCalledWith('removeRound', { roundId: 'round123' });
        });
    });

    describe('updateRound', () => {
        it('sends message to extension', async () => {
            mockSendMessage.mockResolvedValue({ id: 'round-round' });

            const result = await tournamentDataStore.dispatch('updateRound', {
                id: 'round',
                roundName: 'Cool Round',
                games: [ { mode: 'Rainmaker', stage: 'Ancho-V Games' } ]
            });

            expect(result).toEqual({ id: 'round-round' });
            expect(mockSendMessage).toHaveBeenCalledWith('updateRoundStore', {
                id: 'round',
                roundName: 'Cool Round',
                games: [ { mode: 'Rainmaker', stage: 'Ancho-V Games' } ]
            });
        });
    });

    describe('resetRoundStore', () => {
        it('sends message to extension', () => {
            tournamentDataStore.dispatch('resetRoundStore');

            expect(mockSendMessage).toHaveBeenCalledWith('resetRoundStore');
        });
    });
});
