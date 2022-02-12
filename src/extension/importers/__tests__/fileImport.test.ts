import express from 'express';
import { mockMount, requestHandlers } from '../../__mocks__/mockNodecg';

describe('fileImport', () => {
    const mockHandleRoundData = jest.fn();
    const mockUpdateTournamentDataReplicants = jest.fn();
    const mockParseUploadedTeamData = jest.fn();

    jest.mock('../roundDataHelper', () => ({
        __esModule: true,
        handleRoundData: mockHandleRoundData
    }));

    jest.mock('../tournamentDataHelper', () => ({
        __esModule: true,
        updateTournamentDataReplicants: mockUpdateTournamentDataReplicants,
        parseUploadedTeamData: mockParseUploadedTeamData
    }));

    const mockRoundImporter = {
        updateRounds: jest.fn()
    };
    jest.mock('../roundImporter', () => mockRoundImporter);

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('mounts', () => {
        require('../fileImport');

        expect(mockMount).toHaveBeenCalledWith('/ipl-overlay-controls', expect.anything());
    });

    describe('POST /upload-tournament-json', () => {
        it('responds with 400 if files are not given', () => {
            const mockSend = jest.fn();
            const mockStatus = jest.fn().mockReturnValue({ send: mockSend });

            requestHandlers['POST']['/upload-tournament-json'](
                { body: { jsonType: 'rounds' } } as express.Request,
                { status: mockStatus } as unknown as express.Response,
                null);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockSend).toHaveBeenCalledWith('Invalid attached file or jsonType property provided.');
        });

        it('responds with 400 if data type is not given', () => {
            const mockSend = jest.fn();
            const mockStatus = jest.fn().mockReturnValue({ send: mockSend });

            requestHandlers['POST']['/upload-tournament-json'](
                { body: { }, files: { file: { mimetype: 'application/json' } } } as unknown as express.Request,
                { status: mockStatus } as unknown as express.Response,
                null);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockSend).toHaveBeenCalledWith('Invalid attached file or jsonType property provided.');
        });

        it('responds with 400 if uploaded file is not json', () => {
            const mockSend = jest.fn();
            const mockStatus = jest.fn().mockReturnValue({ send: mockSend });

            requestHandlers['POST']['/upload-tournament-json']({
                body: { jsonType: 'rounds' },
                files: { file: { mimetype: 'text/plain' } }
            } as unknown as express.Request,
            { status: mockStatus } as unknown as express.Response,
            null);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockSend).toHaveBeenCalledWith('Invalid attached file or jsonType property provided.');
        });

        it('responds with 400 if data type is unknown', () => {
            const mockSend = jest.fn();
            const mockStatus = jest.fn().mockReturnValue({ send: mockSend });

            requestHandlers['POST']['/upload-tournament-json']({
                body: { jsonType: 'something' },
                files: { file: { mimetype: 'application/json', data: '{ }' } }
            } as unknown as express.Request,
            { status: mockStatus } as unknown as express.Response,
            null);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockSend).toHaveBeenCalledWith('Invalid value provided for jsonType.');
        });

        it('imports round data', () => {
            const mockSendStatus = jest.fn();
            mockHandleRoundData.mockReturnValue('round data');

            requestHandlers['POST']['/upload-tournament-json']({
                body: { jsonType: 'rounds' },
                files: { file: { mimetype: 'application/json', data: '{ "tournament": "data" }' } }
            } as unknown as express.Request,
            { sendStatus: mockSendStatus } as unknown as express.Response,
            null);

            expect(mockSendStatus).toHaveBeenCalledWith(200);
            expect(mockHandleRoundData).toHaveBeenCalledWith({ tournament: 'data' });
            expect(mockRoundImporter.updateRounds).toHaveBeenCalledWith('round data');
        });

        it('imports team data', async () => {
            const mockSendStatus = jest.fn();
            mockParseUploadedTeamData.mockReturnValue('TEAMS');

            await requestHandlers['POST']['/upload-tournament-json']({
                body: { jsonType: 'teams' },
                files: { file: { mimetype: 'application/json', data: '{ "team": "data" }', name: 'file.json' } }
            } as unknown as express.Request,
            { sendStatus: mockSendStatus } as unknown as express.Response,
            null);

            expect(mockParseUploadedTeamData).toHaveBeenCalledWith({ team: 'data' }, 'file.json');
            expect(mockSendStatus).toHaveBeenCalledWith(200);
            expect(mockUpdateTournamentDataReplicants).toHaveBeenCalledWith('TEAMS');
        });
    });
});
