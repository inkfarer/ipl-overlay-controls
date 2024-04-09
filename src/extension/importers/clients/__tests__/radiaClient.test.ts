import { mock } from 'jest-mock-extended';
import axios from 'axios';

const mockAxios = mock<typeof axios>();
jest.mock('axios', () => ({ __esModule: true, default: mockAxios }));

import {
    createPrediction,
    getGuildInfo,
    getPredictions,
    handleAxiosError,
    hasPredictionSupport,
    updatePrediction,
    updateTournamentData
} from '../radiaClient';
import { mockBundleConfig } from '../../../__mocks__/mockNodecg';

describe('radiaClient', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('getGuildInfo', () => {
        it('throws an error if the guild ID is missing', async () => {
            await expect(getGuildInfo('')).rejects.toThrow('translation:radiaClient.missingGuildId');
        });

        it('returns the API response', async () => {
            const expectedResult = { twitch_channel: 'iplsplatoon' };
            mockAxios.get.mockResolvedValue({ data: expectedResult });

            const result = await getGuildInfo('1705897320');

            expect(mockAxios.get).toHaveBeenCalledWith(
                'radia://url/organisation/guild/1705897320',
                { headers: { Authorization: 'radia-auth-12345' } }
            );
            expect(result).toEqual(expectedResult);
        });

        it('handles errors', async () => {
            mockAxios.get.mockRejectedValue('err');

            await expect(getGuildInfo('5208957')).rejects.toThrow('err');
        });
    });

    describe('hasPredictionSupport', () => {
        it('returns false if bundle config does not have an auth key', async () => {
            mockBundleConfig.radia.authentication = '';

            const result = await hasPredictionSupport('aaaa');

            expect(result).toEqual(false);
            expect(mockAxios.get).not.toHaveBeenCalled();
        });

        it('checks whether predictions are enabled', async () => {
            mockAxios.get.mockResolvedValue({
                status: 200,
                data: { twitch: true }
            });

            const result = await hasPredictionSupport('02957532');

            expect(mockAxios.get).toHaveBeenCalledWith(
                'radia://url/predictions/check/02957532',
                { headers: { Authorization: 'radia-auth-12345' } }
            );
            expect(result).toEqual(true);
        });

        it('returns false if response does not have a "twitch" object', async () => {
            mockAxios.get.mockResolvedValue({
                status: 200,
                data: { }
            });

            const result = await hasPredictionSupport('02957532');

            expect(result).toEqual(false);
        });

        it('returns false if the response status is not 200', async () => {
            mockAxios.get.mockResolvedValue({
                status: 400,
                data: { }
            });

            const result = await hasPredictionSupport('02957532');

            expect(result).toEqual(false);
        });

        it('returns false if the guild check throws an error', async () => {
            mockAxios.get.mockRejectedValue('err');

            const result = await hasPredictionSupport('02957532');

            expect(result).toEqual(false);
        });
    });

    describe('getPredictions', () => {
        it('throws an error if the guild ID is missing', async () => {
            await expect(getPredictions('')).rejects.toThrow('translation:radiaClient.missingGuildId');
        });

        it('returns the API response', async () => {
            const expectedResult = [ { id: 'COOL-PREDICTION-1' }, { id: 'COOL-PREDICTION-2' } ];
            mockAxios.get.mockResolvedValue({ data: expectedResult });

            const result = await getPredictions('1705897320');

            expect(mockAxios.get).toHaveBeenCalledWith(
                'radia://url/predictions/1705897320',
                { headers: { Authorization: 'radia-auth-12345' } }
            );
            expect(result).toEqual(expectedResult);
        });

        it('handles errors', async () => {
            mockAxios.get.mockRejectedValue('err');

            await expect(getPredictions('5208957')).rejects.toThrow('err');
        });
    });

    describe('updatePrediction', () => {
        it('throws an error if the guild ID is missing', async () => {
            await expect(updatePrediction('', { id: 'test-id', status: 'RESOLVED' })).rejects.toThrow('translation:radiaClient.missingGuildId');
        });

        it('returns the API response', async () => {
            const expectedResult = { id: 'COOL-PREDICTION-1' };
            mockAxios.patch.mockResolvedValue({ data: expectedResult });

            // @ts-ignore
            const result = await updatePrediction('1705897320', { status: 'RESOLVED' });

            expect(mockAxios.patch).toHaveBeenCalledWith(
                'radia://url/predictions/1705897320',
                { status: 'RESOLVED' },
                { headers: { Authorization: 'radia-auth-12345' } }
            );
            expect(result).toEqual(expectedResult);
        });

        it('handles errors', async () => {
            mockAxios.patch.mockRejectedValue('err');

            // @ts-ignore
            await expect(updatePrediction('5208957', { })).rejects.toThrow('err');
        });
    });

    describe('createPrediction', () => {
        it('throws an error if the guild ID is missing', async () => {
            // @ts-ignore
            await expect(createPrediction('', { title: 'Who will win?' })).rejects.toThrow('translation:radiaClient.missingGuildId');
        });

        it('returns the API response', async () => {
            const expectedResult = { id: 'COOL-PREDICTION-1' };
            mockAxios.post.mockResolvedValue({ data: expectedResult });

            // @ts-ignore
            const result = await createPrediction('1705897320', { title: 'Who will win?' });

            expect(mockAxios.post).toHaveBeenCalledWith(
                'radia://url/predictions/1705897320',
                { title: 'Who will win?' },
                { headers: { Authorization: 'radia-auth-12345' } }
            );
            expect(result).toEqual(expectedResult);
        });

        it('handles errors', async () => {
            mockAxios.post.mockRejectedValue('err');

            // @ts-ignore
            await expect(createPrediction('5208957', { })).rejects.toThrow('err');
        });
    });

    describe('handleAxiosError', () => {
        it('passes through error if it has no response object', () => {
            const expectedResult = new Error('aaaaa');
            expect(() => handleAxiosError(expectedResult)).toThrow(expectedResult);
        });

        it('sends a message with the detailed error', () => {
            expect(() => handleAxiosError({
                // @ts-ignore
                response: {
                    status: 500,
                    data: {
                        detail: 'An error has occurred.'
                    }
                }
            })).toThrow('translation:radiaClient.requestFailed');
        });
    });

    describe('updateTournamentData', () => {
        it('throws an error if the guild ID is missing', async () => {
            await expect(updateTournamentData('', 'bracket://link', 'Cool Tournament')).rejects.toThrow('translation:radiaClient.missingGuildId');
        });

        it('POSTs new tournament data', async () => {
            mockAxios.post.mockResolvedValueOnce({ status: 200 });

            await updateTournamentData('123123345', 'bracket://link', 'Cool Tournament');

            expect(mockAxios.post).toHaveBeenCalledWith(
                'radia://url/organisation/guild/123123345',
                { bracket_link: 'bracket://link', tournament_name: 'Cool Tournament' },
                { headers: { Authorization: 'radia-auth-12345' } });
        });

        it('throws an error if the status is not 200', async () => {
            mockAxios.post.mockResolvedValue({ status: 400 });

            await expect(updateTournamentData('456', 'bracket://link', 'Rad Tournament'))
                .rejects.toThrow('translation:radiaClient.requestFailed');
        });
    });
});
