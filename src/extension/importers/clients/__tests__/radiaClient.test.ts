import { MockNodecg } from '../../../__mocks__/mockNodecg';
import { Module } from '../../../__mocks__/module';

describe('radiaClient', () => {
    const mockGet = jest.fn();
    const mockPatch = jest.fn();
    const mockPost = jest.fn();
    let client: Module;
    let nodecg: MockNodecg;

    jest.mock('axios', () => ({
        get: mockGet,
        patch: mockPatch,
        post: mockPost
    }));

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();

        nodecg = new MockNodecg({
            radia: {
                url: 'radia://api',
                authentication: 'radia_auth'
            }
        });
        nodecg.init();

        client = require('../radiaClient');
    });

    describe('hasPredictionSupport', () => {
        it('checks whether predictions are enabled', async () => {
            mockGet.mockResolvedValue({
                status: 200,
                data: { twitch: true }
            });

            const result = await client.hasPredictionSupport('02957532');

            expect(mockGet).toHaveBeenCalledWith(
                'radia://api/predictions/check/02957532',
                { headers: { Authorization: 'radia_auth' } }
            );
            expect(result).toEqual(true);
        });

        it('returns false if response does not have a "twitch" object', async () => {
            mockGet.mockResolvedValue({
                status: 200,
                data: { }
            });

            const result = await client.hasPredictionSupport('02957532');

            expect(result).toEqual(false);
        });

        it('returns false if the response status is not 200', async () => {
            mockGet.mockResolvedValue({
                status: 400,
                data: { }
            });

            const result = await client.hasPredictionSupport('02957532');

            expect(result).toEqual(false);
        });

        it('returns false if the guild check throws an error', async () => {
            mockGet.mockRejectedValue('err');

            const result = await client.hasPredictionSupport('02957532');

            expect(result).toEqual(false);
        });
    });

    describe('getPredictions', () => {
        it('returns the API response', async () => {
            const expectedResult = [ { id: 'COOL-PREDICTION-1' }, { id: 'COOL-PREDICTION-2' } ];
            mockGet.mockResolvedValue({ data: expectedResult });

            const result = await client.getPredictions('1705897320');

            expect(mockGet).toHaveBeenCalledWith(
                'radia://api/predictions/1705897320',
                { headers: { Authorization: 'radia_auth' } }
            );
            expect(result).toEqual(expectedResult);
        });

        it('handles errors', async () => {
            mockGet.mockRejectedValue('err');

            await expect(client.getPredictions('5208957')).rejects.toThrow('err');
        });
    });

    describe('updatePrediction', () => {
        it('returns the API response', async () => {
            const expectedResult = { id: 'COOL-PREDICTION-1' };
            mockPatch.mockResolvedValue({ data: expectedResult });

            const result = await client.updatePrediction('1705897320', { status: 'RESOLVED' });

            expect(mockPatch).toHaveBeenCalledWith(
                'radia://api/predictions/1705897320',
                { status: 'RESOLVED' },
                { headers: { Authorization: 'radia_auth' } }
            );
            expect(result).toEqual(expectedResult);
        });

        it('handles errors', async () => {
            mockPatch.mockRejectedValue('err');

            await expect(client.updatePrediction('5208957', { })).rejects.toThrow('err');
        });
    });

    describe('createPrediction', () => {
        it('returns the API response', async () => {
            const expectedResult = { id: 'COOL-PREDICTION-1' };
            mockPost.mockResolvedValue({ data: expectedResult });

            const result = await client.createPrediction('1705897320', { title: 'Who will win?' });

            expect(mockPost).toHaveBeenCalledWith(
                'radia://api/predictions/1705897320',
                { title: 'Who will win?' },
                { headers: { Authorization: 'radia_auth' } }
            );
            expect(result).toEqual(expectedResult);
        });

        it('handles errors', async () => {
            mockPost.mockRejectedValue('err');

            await expect(client.createPrediction('5208957', { })).rejects.toThrow('err');
        });
    });

    describe('handleAxiosError', () => {
        it('passes through error if it has no response object', () => {
            const expectedResult = new Error('aaaaa');
            expect(() => client.handleAxiosError(expectedResult)).toThrow(expectedResult);
        });

        it('sends a message with the response status if no detailed error is given', () => {
            expect(() => client.handleAxiosError({ response: { status: 400 } }))
                .toThrow('Radia API call failed with response 400');
        });

        it('sends a message with the detailed error if it is an object', () => {
            expect(() => client.handleAxiosError({
                response: {
                    status: 500,
                    data: {
                        detail: {
                            err: 'An error has occurred.',
                            additionalInformation: 'indeed'
                        }
                    }
                }
            })).toThrow('Radia API call failed with response 500: '
                + '{"err":"An error has occurred.","additionalInformation":"indeed"}');
        });

        it('sends a message with the detailed error if it contains a message', () => {
            expect(() => client.handleAxiosError({
                response: {
                    status: 500,
                    data: {
                        detail: {
                            message: 'An error has occurred.'
                        }
                    }
                }
            })).toThrow('Radia API call failed with response 500: An error has occurred.');
        });

        it('sends a message with the detailed error if it is not an object', () => {
            expect(() => client.handleAxiosError({
                response: {
                    status: 500,
                    data: {
                        detail: 'An error has occurred.'
                    }
                }
            })).toThrow('Radia API call failed with response 500: An error has occurred.');
        });
    });

    describe('getLiveCasters', () => {
        it('fetches casters from the API', async () => {
            const expectedResult = [{ name: 'Caster One' }, { name: 'Caster Two' }];
            mockGet.mockResolvedValue({ status: 200, data: expectedResult });

            const result = await client.getLiveCasters('19873590');

            expect(result).toEqual(expectedResult);
            expect(mockGet).toHaveBeenCalledWith(
                'radia://api/live/guild/19873590',
                { headers: { Authorization: 'radia_auth' } }
            );
        });

        it('throws an error if the status is not 200', () => {
            mockGet.mockResolvedValue({ status: 401 });

            expect(client.getLiveCasters('0259378')).rejects
                .toThrow('Radia API call failed with response 401');
        });
    });
});
