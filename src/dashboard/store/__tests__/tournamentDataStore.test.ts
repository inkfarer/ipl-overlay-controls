import { mockSendMessage, replicants } from '../../__mocks__/mockNodecg';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { TournamentData } from 'schemas';
import { createPinia, setActivePinia } from 'pinia';
import { useTournamentDataStore } from '../tournamentDataStore';

describe('tournamentDataStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('setTeamImageHidden', () => {
        it('sends message to extension', () => {
            const store = useTournamentDataStore();

            store.setTeamImageHidden({ teamId: '1234', isVisible: true });

            expect(mockSendMessage).toHaveBeenCalledWith('toggleTeamImage', { teamId: '1234', isVisible: true });
        });
    });

    describe('getTournamentData', () => {
        it('sends message to extension', async () => {
            const store = useTournamentDataStore();

            await store.getTournamentData({
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
            const store = useTournamentDataStore();

            await store.getSmashggEvent({
                eventId: 123123
            });

            expect(mockSendMessage).toHaveBeenCalledWith('getSmashggEvent', {
                eventId: 123123
            });
        });
    });

    describe('uploadTeamData', () => {
        it('sends file to local endpoint', async () => {
            const store = useTournamentDataStore();
            const file = new File([], 'new-file.json');
            const expectedFormData = new FormData();
            expectedFormData.append('file', file);
            expectedFormData.append('jsonType', 'teams');
            global.fetch = jest.fn().mockResolvedValue({ status: 200 });

            await store.uploadTeamData({ file });

            expect(fetch).toHaveBeenCalledWith('/ipl-overlay-controls/upload-tournament-json', {
                method: 'POST',
                body: expectedFormData
            });
        });

        it('throws error on bad status', async () => {
            expect.assertions(2);

            const store = useTournamentDataStore();
            const file = new File([], 'new-file.json');
            const expectedFormData = new FormData();
            expectedFormData.append('file', file);
            expectedFormData.append('jsonType', 'teams');
            global.fetch = jest.fn().mockResolvedValue({ status: 500, text: jest.fn().mockResolvedValue('Error!') });

            try {
                await store.uploadTeamData({ file });
            } catch (e) {
                expect(e.message).toEqual('common:tournamentDataStore.fileUploadError');
                expect(fetch).toHaveBeenCalledWith('/ipl-overlay-controls/upload-tournament-json', {
                    method: 'POST',
                    body: expectedFormData
                });
            }
        });
    });

    describe('uploadRoundData', () => {
        it('sends file to local endpoint', async () => {
            const store = useTournamentDataStore();
            const file = new File([], 'new-file.json');
            const expectedFormData = new FormData();
            expectedFormData.append('file', file);
            expectedFormData.append('jsonType', 'rounds');
            global.fetch = jest.fn().mockResolvedValue({ status: 200 });

            await store.uploadRoundData({ file });

            expect(fetch).toHaveBeenCalledWith('/ipl-overlay-controls/upload-tournament-json', {
                method: 'POST',
                body: expectedFormData
            });
        });

        it('throws error on bad status', async () => {
            expect.assertions(2);

            const store = useTournamentDataStore();
            const file = new File([], 'new-file.json');
            const expectedFormData = new FormData();
            expectedFormData.append('file', file);
            expectedFormData.append('jsonType', 'rounds');
            global.fetch = jest.fn().mockResolvedValue({ status: 401, text: jest.fn().mockResolvedValue('Error!!') });

            try {
                await store.uploadRoundData({ file });
            } catch (e) {
                expect(e.message).toEqual('common:tournamentDataStore.fileUploadError');
                expect(fetch).toHaveBeenCalledWith('/ipl-overlay-controls/upload-tournament-json', {
                    method: 'POST',
                    body: expectedFormData
                });
            }
        });
    });

    describe('fetchRoundData', () => {
        it('sends message to extension', () => {
            const store = useTournamentDataStore();

            store.fetchRoundData({ url: 'data://round-data' });

            expect(mockSendMessage).toHaveBeenCalledWith('getRounds', { url: 'data://round-data' });
        });
    });

    describe('removeRound', () => {
        it('sends message to extension', () => {
            const store = useTournamentDataStore();

            store.removeRound({ roundId: 'round123' });

            expect(mockSendMessage).toHaveBeenCalledWith('removeRound', { roundId: 'round123' });
        });
    });

    describe('updateRound', () => {
        it('sends message to extension', async () => {
            const store = useTournamentDataStore();
            mockSendMessage.mockResolvedValue({ id: 'round-round' });

            const result = await store.updateRound({
                id: 'round',
                roundName: 'Cool Round',
                games: [ { mode: 'Rainmaker', stage: 'Ancho-V Games' } ]
            });

            expect(result).toEqual({ id: 'round-round' });
            expect(mockSendMessage).toHaveBeenCalledWith('updateRound', {
                id: 'round',
                roundName: 'Cool Round',
                games: [ { mode: 'Rainmaker', stage: 'Ancho-V Games' } ]
            });
        });
    });

    describe('resetRoundStore', () => {
        it('sends message to extension', () => {
            const store = useTournamentDataStore();
            store.resetRoundStore();

            expect(mockSendMessage).toHaveBeenCalledWith('resetRoundStore');
        });
    });

    describe('setShortName', () => {
        it('updates tournament data', () => {
            const store = useTournamentDataStore();
            replicants.tournamentData = { meta: { shortName: 'Old Name' } };

            store.setShortName('New Name');

            expect((replicants.tournamentData as TournamentData).meta.shortName).toEqual('New Name');
        });
    });

    describe('refreshTournamentData', () => {
        it('sends message to extension', () => {
            const store = useTournamentDataStore();
            store.refreshTournamentData();

            expect(mockSendMessage).toHaveBeenCalledWith('refreshTournamentData');
        });
    });
});
