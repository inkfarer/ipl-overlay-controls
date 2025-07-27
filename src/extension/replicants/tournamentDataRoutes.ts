import * as nodecgContext from '../helpers/nodecg';
import { TournamentData } from '../../types/schemas';
import express from 'express';
import { DateTime } from 'luxon';

const nodecg = nodecgContext.get();
const router = nodecg.Router();

const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');

function formatTournamentName(tournamentName?: string): string {
    if (tournamentName == null) {
        return 'unknown-tournament';
    }

    const splitName = tournamentName.toLowerCase().split(' ');
    return splitName.filter(segment => segment.length > 0 && segment !== '-').join('-');
}

(router as express.Router).get(
    '/tournament-data',
    (req: express.Request, res: express.Response) => {
        res.set({ 'Content-Disposition': `attachment; filename="iploc-tournament-data_${formatTournamentName(tournamentData.value.meta.name)}_${DateTime.now().setZone('utc').toFormat('yyyy-LL-dd\'T\'T')}.json"` });
        res.send(JSON.stringify(tournamentData.value, null, 4));
    }
);

nodecg.mount(`/${nodecg.bundleName}`, router);
