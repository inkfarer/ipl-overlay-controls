import { MockNodecg } from '../../__mocks__/mockNodecg';
import express from 'express';
import { DateTime } from 'luxon';

describe('matchRoutes', () => {
    let nodecg: MockNodecg;

    const now = DateTime.fromISO('2022-02-02T20:33:54Z');

    jest.mock('luxon', () => ({
        __esModule: true,
        DateTime: {
            now: jest.fn().mockReturnValue(now)
        }
    }));

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();

        nodecg = new MockNodecg();
        nodecg.init();

        require('../matchRoutes');
    });

    it('mounts', () => {
        expect(nodecg.mount).toHaveBeenCalledWith('/ipl-overlay-controls', expect.anything());
    });

    describe('GET /match-data', () => {
        it('responds with match store value as file', () => {
            const res = {} as express.Response;
            res.set = jest.fn().mockReturnValue(res);
            res.send = jest.fn().mockReturnValue(res);
            nodecg.replicants.matchStore.value = { foo: 'bar' };

            nodecg.requestHandlers['GET']['/match-data']({} as express.Request, res, null);

            expect(res.set).toHaveBeenCalledWith({
                'Content-Disposition': 'attachment; filename="iploc-match-data_2022-02-02T20:33.json"'
            });
            expect(res.send).toHaveBeenCalledWith(JSON.stringify({ foo: 'bar' }, null, 4));
        });
    });
});
