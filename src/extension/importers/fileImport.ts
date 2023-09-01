import { handleRoundData } from './roundDataHelper';
import * as nodecgContext from '../helpers/nodecg';
import fileUpload, { UploadedFile } from 'express-fileupload';
import { parseUploadedTeamData, updateTournamentDataReplicants } from './tournamentDataHelper';
import { updateRounds } from './roundImporter';
import { RuntimeConfig } from 'schemas';
import { GameVersion } from 'types/enums/gameVersion';

const nodecg = nodecgContext.get();
const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');
const router = nodecg.Router();

router.post(
    '/upload-tournament-json',
    fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }),
    async (req, res) => {
        if (
            !req.files
            || !req.files.file
            || !req.body.jsonType
            || Array.isArray(req.files.file)
            || req.files.file.mimetype !== 'application/json'
        ) {
            return res.status(400).send('Invalid attached file or jsonType property provided.');
        }

        const file = req.files.file as UploadedFile;
        const content = JSON.parse(file.data.toString());

        switch (req.body.jsonType) {
            case 'rounds': {
                try {
                    updateRounds(handleRoundData(content, runtimeConfig.value.gameVersion as GameVersion));
                } catch (e) {
                    nodecg.log.error('Failed to update round data:', e);
                    return res.status(400).send('Got an error while parsing round data.');
                }
                break;
            }
            case 'teams': {
                try {
                    const resolvedTeams = await parseUploadedTeamData(content, file.name);
                    updateTournamentDataReplicants(resolvedTeams);
                } catch (e) {
                    nodecg.log.error('Failed to parse team data:', e);
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
