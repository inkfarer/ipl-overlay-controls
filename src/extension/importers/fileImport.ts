import { handleRoundData } from './roundDataHelper';
import * as nodecgContext from '../helpers/nodecg';
import fileUpload, { UploadedFile } from 'express-fileupload';
import * as express from 'express';
import { RoundStore } from 'schemas';
import { handleRawData, updateTeamDataReplicants } from './tournamentDataHelper';

const nodecg = nodecgContext.get();
const router = nodecg.Router();

const rounds = nodecg.Replicant<RoundStore>('roundStore');

(router as express.Router).post(
    '/upload-tournament-json',
    fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }),
    (req: express.Request, res: express.Response) => {
        if (
            !req.files
            || !req.files.file
            || !req.body.jsonType
            || (req.files.file as UploadedFile).mimetype !== 'application/json'
        ) {
            return res.sendStatus(400);
        }

        const file = req.files.file as UploadedFile;
        const content = JSON.parse(file.data.toString());

        switch (req.body.jsonType) {
            case 'rounds': {
                const resolvedRounds = handleRoundData(content);
                rounds.value = { ...rounds.value, ...resolvedRounds };
                break;
            }
            case 'teams': {
                const resolvedTeams = handleRawData(content, file.name);
                updateTeamDataReplicants(resolvedTeams);
                break;
            }
            default:
                return res.sendStatus(400);
        }

        res.sendStatus(200);
    }
);

nodecg.mount('/ipl-overlay-controls', router);
