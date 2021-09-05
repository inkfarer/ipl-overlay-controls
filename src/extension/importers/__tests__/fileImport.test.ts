import { MockNodecg } from '../../__mocks__/mockNodecg';
import express from 'express';

describe('fileImport', () => {
    const mockHandleRoundData = jest.fn();
    const mockUpdateTeamDataReplicants = jest.fn();
    const mockHandleRawData = jest.fn();
    let nodecg: MockNodecg;

    jest.mock('../roundDataHelper', () => ({
        __esModule: true,
        handleRoundData: mockHandleRoundData
    }));

    jest.mock('../tournamentDataHelper', () => ({
        __esModule: true,
        updateTeamDataReplicants: mockUpdateTeamDataReplicants,
        handleRawData: mockHandleRawData
    }));

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
        nodecg = new MockNodecg();
        nodecg.init();

        require('../fileImport');
    });

    it('mounts', () => {
        expect(nodecg.mount).toHaveBeenCalledWith('/ipl-overlay-controls', expect.anything());
    });

    describe('POST /upload-tournament-json', () => {
        it('responds with 400 if files are not given', () => {
            const mockSendStatus = jest.fn();

            nodecg.requestHandlers['POST']['/upload-tournament-json'](
                { body: { jsonType: 'rounds' } } as express.Request,
                { sendStatus: mockSendStatus } as unknown as express.Response,
                null);

            expect(mockSendStatus).toHaveBeenCalledWith(400);
        });

        it('responds with 400 if data type is not given', () => {
            const mockSendStatus = jest.fn();

            nodecg.requestHandlers['POST']['/upload-tournament-json'](
                { body: { }, files: { file: { mimetype: 'application/json' } } } as unknown as express.Request,
                { sendStatus: mockSendStatus } as unknown as express.Response,
                null);

            expect(mockSendStatus).toHaveBeenCalledWith(400);
        });

        it('responds with 400 if uploaded file is not json', () => {
            const mockSendStatus = jest.fn();

            nodecg.requestHandlers['POST']['/upload-tournament-json']({
                body: { jsonType: 'rounds' },
                files: { file: { mimetype: 'text/plain' } }
            } as unknown as express.Request,
            { sendStatus: mockSendStatus } as unknown as express.Response,
            null);

            expect(mockSendStatus).toHaveBeenCalledWith(400);
        });

        it('responds with 400 if data type is unknown', () => {
            const mockSendStatus = jest.fn();

            nodecg.requestHandlers['POST']['/upload-tournament-json']({
                body: { jsonType: 'something' },
                files: { file: { mimetype: 'application/json', data: '{ }' } }
            } as unknown as express.Request,
            { sendStatus: mockSendStatus } as unknown as express.Response,
            null);

            expect(mockSendStatus).toHaveBeenCalledWith(400);
        });

        it('imports round data', () => {
            const mockSendStatus = jest.fn();
            mockHandleRoundData.mockReturnValue({
                aaaaaa: { meta: { name: 'Cool Round' } }
            });
            nodecg.replicants.roundStore.value = {
                bbbbbb: { meta: { name: 'Rad Round' } }
            };

            nodecg.requestHandlers['POST']['/upload-tournament-json']({
                body: { jsonType: 'rounds' },
                files: { file: { mimetype: 'application/json', data: '{ }' } }
            } as unknown as express.Request,
            { sendStatus: mockSendStatus } as unknown as express.Response,
            null);

            expect(mockSendStatus).toHaveBeenCalledWith(200);
            expect(nodecg.replicants.roundStore.value).toEqual({
                aaaaaa: { meta: { name: 'Cool Round' } },
                bbbbbb: { meta: { name: 'Rad Round' } }
            });
        });

        it('imports team data', () => {
            const mockSendStatus = jest.fn();
            mockHandleRawData.mockReturnValue('TEAMS');

            nodecg.requestHandlers['POST']['/upload-tournament-json']({
                body: { jsonType: 'teams' },
                files: { file: { mimetype: 'application/json', data: '{ }' } }
            } as unknown as express.Request,
            { sendStatus: mockSendStatus } as unknown as express.Response,
            null);

            expect(mockSendStatus).toHaveBeenCalledWith(200);
            expect(mockUpdateTeamDataReplicants).toHaveBeenCalledWith('TEAMS');
        });
    });
});
