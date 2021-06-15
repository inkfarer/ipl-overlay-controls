import { handleRoundData } from './roundImporter';
import * as nodecgContext from './util/nodecg';
import fileUpload, { UploadedFile } from 'express-fileupload';
import { handleRawData } from './tournamentImporter';
import * as express from 'express';
import { Rounds, TournamentData } from 'types/schemas';

const nodecg = nodecgContext.get();
const router = nodecg.Router();

(router as express.Router).post(
    '/upload-tournament-json',
    fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }),
    (req: express.Request, res: express.Response) => {
        if (
            !req.files ||
            !req.files.file ||
            !req.body.jsonType ||
            (req.files.file as UploadedFile).mimetype !== 'application/json'
        ) {
            return res.sendStatus(400);
        }

        const file = req.files.file as UploadedFile;
        const content = JSON.parse(file.data.toString());

        switch (req.body.jsonType) {
            case 'rounds': {
                const resolvedRounds = handleRoundData(content);
                const rounds = nodecg.Replicant<Rounds>('rounds');
                rounds.value = { ...rounds.value, ...resolvedRounds };
                break;
            }
            case 'teams': {
                const resolvedTeams = handleRawData(
                    content,
                    `Uploaded file: ${file.name}`
                );
                const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
                tournamentData.value = resolvedTeams;
                break;
            }
            default:
                return res.sendStatus(400);
        }

        res.sendStatus(200);
    }
);

nodecg.mount('/ipl-overlay-controls', router);
