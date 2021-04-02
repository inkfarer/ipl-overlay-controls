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

                for (let i = 0; i < data.length; i++) {
                    const round = data[i];
                    const games = [];
                    const roundGames =
                        round.games == null ? round.maps : round.games;

                    for (let j = 0; j < roundGames.length; j++) {
                        const game = roundGames[j];
                        const stageName =
                            game.stage == null ? game.map : game.stage;

                        games.push({
                            stage: normalizeStageName(stageName),
                            mode: normalizeModeName(game.mode),
                        });
                    }

                    rounds[generateId()] = {
                        meta: {
                            name: round.name,
                        },
                        games: games,
                    };
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

function normalizeStageName(name) {
    name = name.toLowerCase();

    if (!lowerCaseSplatStages.includes(name)) {
        return 'Unknown Stage';
    } else {
        return splatStages[lowerCaseSplatStages.indexOf(name)];
    }
}

function normalizeModeName(name) {
    name = name.toLowerCase();

    if (!lowerCaseSplatModes.includes(name)) {
        return 'Unknown Mode';
    } else {
        return splatModes[lowerCaseSplatModes.indexOf(name)];
    }
}
