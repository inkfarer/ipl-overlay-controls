import { handleRoundData } from './roundDataHelper';
import * as nodecgContext from '../helpers/nodecg';
import fileUpload, { UploadedFile } from 'express-fileupload';
import { parseUploadedTeamData, updateTournamentDataReplicants } from './tournamentDataHelper';
import { updateRounds } from './roundImporter';
import { RuntimeConfig } from 'schemas';
import { GameVersion } from 'types/enums/gameVersion';
import i18next from 'i18next';

const nodecg = nodecgContext.get();
const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');
const router = nodecg.Router();

// Note that the following is a TypeScript *nightmare* as TS chooses to prefer the types from Multer (a dependency of
// @types/nodecg) instead of express-fileupload, which is actually in use here. Therefore, we have to force TS to use
// the correct types for req.files every step of the way here.

router.post(
    '/upload-tournament-json',
    fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }),
    async (req, res) => {
        if (
            !req.files
            || !(req.files as unknown as fileUpload.FileArray).file
            || !req.body.jsonType
            || Array.isArray((req.files as unknown as fileUpload.FileArray).file)
            || ((req.files as unknown as fileUpload.FileArray).file as UploadedFile).mimetype !== 'application/json'
        ) {
            return res.status(400).send(i18next.t('fileImport.invalidFileOrJsonType'));
        }

        const file = (req.files as unknown as fileUpload.FileArray).file as UploadedFile;
        const content = JSON.parse(file.data.toString());

        switch (req.body.jsonType) {
            case 'rounds': {
                try {
                    updateRounds(handleRoundData(content, runtimeConfig.value.gameVersion as GameVersion));
                } catch (e) {
                    nodecg.log.error(i18next.t('fileImport.roundDataUpdateFailed.console', { message: e }));
                    return res.status(400).send(i18next.t('fileImport.roundDataUpdateFailed.response'));
                }
                break;
            }
            case 'teams': {
                try {
                    const resolvedTeams = await parseUploadedTeamData(content, file.name);
                    updateTournamentDataReplicants(resolvedTeams);
                } catch (e) {
                    nodecg.log.error(i18next.t('fileImport.teamDataUpdateFailed.console', { message: e }));
                    return res.status(400).send(i18next.t('fileImport.teamDataUpdateFailed.response'));
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
