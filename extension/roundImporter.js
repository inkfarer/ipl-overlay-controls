const axios = require('axios').default;

module.exports = async function (nodecg) {
    const rounds = nodecg.Replicant('rounds');

    nodecg.listenFor('getRounds', async (data, ack) => {
        if (!data.url) {
            ack(new Error('Missing arguments.'), null);
            return;
        }

        getUrl(data.url)
            .then((data) => {
                rounds.value = { ...rounds.value, ...data.rounds };
                ack(null, data.url);
            })
            .catch((err) => {
                ack(err);
            });
        return;
    });
};

const splatStages = [
    'Ancho-V Games',
    'Arowana Mall',
    'Blackbelly Skatepark',
    'Camp Triggerfish',
    'Goby Arena',
    'Humpback Pump Track',
    'Inkblot Art Academy',
    'Kelp Dome',
    'MakoMart',
    'Manta Maria',
    'Moray Towers',
    'Musselforge Fitness',
    'New Albacore Hotel',
    'Piranha Pit',
    'Port Mackerel',
    'Shellendorf Institute',
    'Shifty Station',
    'Snapper Canal',
    'Starfish Mainstage',
    'Sturgeon Shipyard',
    'The Reef',
    'Wahoo World',
    'Walleye Warehouse',
    'Skipper Pavilion',
    'Unknown Stage',
];

const lowerCaseSplatStages = splatStages.map((stage) => stage.toLowerCase());

const splatModes = [
    'Clam Blitz',
    'Tower Control',
    'Rainmaker',
    'Splat Zones',
    'Turf War',
    'Unknown Mode',
];

const lowerCaseSplatModes = splatModes.map((mode) => mode.toLowerCase());

function generateId() {
    return '' + Math.random().toString(36).substr(2, 9);
}

async function getUrl(url) {
    return new Promise((resolve, reject) => {
        axios
            .get(url, {
                Accept: 'application/json',
            })
            .then((response) => {
                const data = response.data;
                let rounds = {};
                for (let a = 0; a < data.length; a++) {
                    for (let i = 0; i < data[a].length; i++) {
                        const games = [];
                        for (let j = 0; j < data[a][i].length; j++) {
                            const dataPoint = data[a][i][j];
                            const gameObject = {};

                            var stageName;
                            if (!dataPoint.stage && !dataPoint.map) {
                                gameObject.stage = 'Unknown Stage';
                            } else {
                                if (!dataPoint.stage) stageName = dataPoint.map;
                                else stageName = dataPoint.stage;

                                const lowerCaseStage = stageName.toLowerCase();
                                if (
                                    !lowerCaseSplatStages.includes(
                                        lowerCaseStage
                                    )
                                ) {
                                    gameObject.stage = 'Unknown Stage';
                                } else {
                                    gameObject.stage =
                                        splatStages[
                                            lowerCaseSplatStages.indexOf(
                                                lowerCaseStage
                                            )
                                        ];
                                }
                            }

                            if (!dataPoint.mode) {
                                gameObject.mode = 'Unknown Mode';
                            } else {
                                const lowerCaseMode = dataPoint.mode.toLowerCase();
                                if (
                                    !lowerCaseSplatModes.includes(lowerCaseMode)
                                ) {
                                    gameObject.mode = 'Unknown Mode';
                                } else {
                                    gameObject.mode =
                                        splatModes[
                                            lowerCaseSplatModes.indexOf(
                                                lowerCaseMode
                                            )
                                        ];
                                }
                            }

                            games.push(gameObject);
                        }

                        rounds[generateId()] = {
                            meta: {
                                name: `Bracket ${a + 1} round ${i + 1}`,
                            },
                            games: games,
                        };
                    }
                }

                resolve({
                    rounds: rounds,
                    url: url,
                });
            })
            .catch((err) => {
                reject(err);
            });
    });
}
