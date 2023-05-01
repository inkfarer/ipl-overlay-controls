import express from 'express';
import { DateTime } from 'luxon';
import { mockMount, replicants, requestHandlers } from '../../__mocks__/mockNodecg';

describe('matchRoutes', () => {
    const mockNow = jest.fn();
    jest.mock('luxon', () => ({
        __esModule: true,
        DateTime: {
            now: mockNow
        }
    }));

    beforeEach(() => {
        mockNow.mockReturnValue(DateTime.fromISO('2022-02-02T20:33:54Z'));
    });

    it('mounts', () => {
        require('../matchRoutes');

        expect(mockMount).toHaveBeenCalledWith('/ipl-overlay-controls', expect.anything());
    });

    describe('GET /match-data', () => {
        it('responds with match store value as file', () => {
            const res = {} as express.Response;
            res.set = jest.fn().mockReturnValue(res);
            res.send = jest.fn().mockReturnValue(res);
            replicants.matchStore = { foo: 'bar', yee: 'haw' };

            requestHandlers['GET']['/match-data']({} as express.Request, res, null);

            expect(res.set).toHaveBeenCalledWith({
                'Content-Disposition': 'attachment; filename="iploc-match-data_2022-02-02T20:33.json"'
            });
            expect(res.send).toHaveBeenCalledWith(JSON.stringify(['bar', 'haw'], null, 4));
        });
    });
});
