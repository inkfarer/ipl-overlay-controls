import { handleRoundData } from './roundDataHelper';
import * as nodecgContext from '../helpers/nodecg';
import fileUpload, { UploadedFile } from 'express-fileupload';
import * as express from 'express';
import { RoundStore } from 'schemas';
import { parseUploadedTeamData, updateTournamentDataReplicants } from './tournamentDataHelper';

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
            return res.status(400).send('Invalid attached file or jsonType property provided.');
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
                try {
                    const resolvedTeams = parseUploadedTeamData(content, file.name);
                    updateTournamentDataReplicants(resolvedTeams);
                } catch (e) {
                    nodecg.log.error(`Team data parsing error: ${e}`);
                    return res.status(400).send('Got an error while parsing team data.');
                }
                break;
            }
            default:
                return res.status(400).send('Invalid value provided for jsonType.');
        }

        res.sendStatus(200);
    }
);

nodecg.mount('/ipl-overlay-controls', router);
