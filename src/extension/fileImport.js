/* eslint-disable @typescript-eslint/no-var-requires */
const fileUpload = require('express-fileupload');
const { handleRoundData } = require('./roundImporter');
const { handleRawData } = require('./tournamentImporter');

module.exports = function (nodecg) {
    // eslint-disable-next-line new-cap
    const router = nodecg.Router();

    router.post(
        '/upload-tournament-json',
        fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }),
        (req, res) => {
            if (
                !req.files ||
                !req.files.file ||
                !req.body.jsonType ||
                req.files.file.mimetype !== 'application/json'
            ) {
                return res.sendStatus(400);
            }

            const content = JSON.parse(req.files.file.data.toString());

            switch (req.body.jsonType) {
                case 'rounds': {
                    const resolvedRounds = handleRoundData(content);
                    const rounds = nodecg.Replicant('rounds');
                    rounds.value = { ...rounds.value, ...resolvedRounds };
                    break;
                }
                case 'teams': {
                    const resolvedTeams = handleRawData(
                        content,
                        `Uploaded file: ${req.files.file.name}`
                    );
                    const tournamentData = nodecg.Replicant('tournamentData');
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
};
