const axios = require('axios').default;

module.exports = async function (nodecg) {
    const rounds = nodecg.Replicant('rounds');

    nodecg.listenFor('getMaps', async (data, ack) => {
        if (!data.url) {
            ack(new Error('Missing arguments.'), null);
            return;
        }

        getUrl(data.url)
            .then((data) => {
                rounds.value = rounds.value.concat(data.maps);
                ack(null, data.url);
            })
            .catch((err) => {
                ack(err);
            });
        return;
    });
};

const splatMaps = [
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
    'Unknown Map',
];

const splatModes = [
    'Clam Blitz',
    'Tower Control',
    'Rainmaker',
    'Splat Zones',
    'Turf War',
    'Unknown Mode',
];

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
                let maps = [];
                for (let a = 0; a < data.length; a++) {
                    for (let i = 0; i < data[a].length; i++) {
                        for (let j = 0; j < data[a][i].length; j++) {
                            // do these maps or modes actually exist?
                            if (!splatMaps.includes(data[a][i][j].map)) {
                                data[a][i][j].map = 'Unknown Map';
                            }

                            if (!splatModes.includes(data[a][i][j].mode)) {
                                data[a][i][j].mode = 'Unknown Mode';
                            }
                        }

                        // prepend meta info (name, id)
                        data[a][i].unshift({
                            id: generateId(),
                            name: `Bracket ${a + 1} Round ${i + 1}`,
                        });
                    }
                    maps = maps.concat(data[a]);
                }

                resolve({
                    maps: maps,
                    url: url,
                });
            })
            .catch((err) => {
                reject(err);
            });
    });
}
