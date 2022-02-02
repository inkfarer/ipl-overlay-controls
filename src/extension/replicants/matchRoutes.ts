import * as nodecgContext from '../helpers/nodecg';
import { MatchStore } from '../../types/schemas';
import express from 'express';
import { DateTime } from 'luxon';

const nodecg = nodecgContext.get();
const router = nodecg.Router();

const matchStore = nodecg.Replicant<MatchStore>('matchStore');

(router as express.Router).get(
    '/match-data',
    (req: express.Request, res: express.Response) => {
        res.set({ 'Content-Disposition': `attachment; filename="iploc-match-data_${DateTime.now().setZone('utc').toFormat('yyyy-LL-dd\'T\'T')}.json"` });
        res.json(matchStore.value);
    }
);

nodecg.mount(`/${nodecg.bundleName}`, router);
