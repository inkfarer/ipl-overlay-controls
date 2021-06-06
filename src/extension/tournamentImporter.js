// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios');

async function listen(nodecg) {
    const tournamentData = nodecg.Replicant('tournamentData');
    let smashGGKey;

    if (
        !nodecg.bundleConfig ||
        typeof nodecg.bundleConfig.smashgg === 'undefined'
    ) {
        nodecg.log.error(
            `"smashgg" is not defined in cfg/${nodecg.bundleName}.json! ` +
            'Importing tournament data from smash.gg will not be possible.'
        );
    } else {
        smashGGKey = nodecg.bundleConfig.smashgg.apiKey;
    }

    nodecg.listenFor('getTournamentData', async (data, ack) => {
        if (!data.id || !data.method) {
            ack(new Error('Missing arguments.'), null);
            return;
        }

        switch (data.method) {
            case 'battlefy':
                getBattlefyData(data.id)
                    .then(data => {
                        tournamentData.value = data;
                        ack(null, data.meta.id);
                    })
                    .catch(err => {
                        ack(err);
                    });
                break;
            case 'smashgg':
                if (!smashGGKey) {
                    ack(new Error('No smash.gg token provided.'));
                    break;
                }

                getSmashGGData(data.id, smashGGKey)
                    .then(data => {
                        tournamentData.value = data;
                        ack(null, data.meta.id);
                    })
                    .catch(err => {
                        ack(err);
                    });
                break;
            case 'raw':
                getRaw(data.id)
                    .then(data => {
                        tournamentData.value = data;
                        ack(null, data.id);
                    })
                    .catch(err => {
                        ack(err);
                    });
                break;
            default:
                ack(new Error('Invalid method given.'));
        }
    });
}

function generateId() {
    return String(Math.random()
        .toString(36)
        .substr(2, 9));
}

async function getBattlefyData(id) {
    const requestURL =
        'https://dtmwra1jsgyb0.cloudfront.net/tournaments/' + id + '/teams';
    return new Promise((resolve, reject) => {
        axios
            .get(requestURL)
            .then(response => {
                const { data } = response;
                // Console.log(response);
                if (data.error) {
                    reject(data.error);
                    return;
                }

                const teams = {
                    meta: {
                        id
                    },
                    data: []
                };
                for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    const teamInfo = {
                        id: generateId(),
                        name: element.name,
                        logoUrl: element.persistentTeam.logoUrl,
                        players: []
                    };
                    for (let j = 0; j < element.players.length; j++) {
                        const elementPlayer = element.players[j];
                        const playerInfo = {
                            name: elementPlayer.inGameName,
                            username: elementPlayer.username
                        };
                        teamInfo.players.push(playerInfo);
                    }

                    teams.data.push(teamInfo);
                }

                resolve(teams);
            })
            .catch(err => {
                reject(err);
            });
    });
}

async function getSmashGGData(slug, token) {
    return new Promise((resolve, reject) => {
        getSmashGGPage('1', slug, token, true)
            .then(async data => {
                // Var tourneyInfo = [{tourneyId: slug}].concat(data.pageInfo);
                const tourneyInfo = {
                    meta: {
                        id: slug
                    },
                    data: []
                };
                tourneyInfo.data = tourneyInfo.data.concat(data.pageInfo);

                // If there are more pages, add them to our data set
                if (data.raw.data.tournament.teams.pageInfo.totalPages > 1) {
                    const pagePromises = [];
                    for (let i = 2; i <= data.raw.data.tournament.teams.pageInfo.totalPages; i++) {
                        pagePromises.push(getSmashGGPage(i, slug, token));
                    }

                    Promise.all(pagePromises).then(pages => {
                        for (let i = 0; i < pages.length; i++) {
                            tourneyInfo.data = tourneyInfo.data.concat(pages[i].pageInfo);
                        }
                    });
                }

                // We did it
                resolve(tourneyInfo);
            })
            .catch(err => {
                reject(err);
            });
    });
}

async function getSmashGGPage(page, slug, token, getRaw = false) {
    const query = `query Entrants($slug: String!, $page: Int!, $perPage: Int!) {
		tournament(slug: $slug) {
		id
		name
		teams(query: {
			page: $page
			perPage: $perPage
		}) {
			pageInfo {
			total
			totalPages
			}
			nodes {
			id
			name
			entrant {
				id
				participants {
				id
				gamerTag
				}
			}
			}
		}
		}
	}`;
    const perPage = '50';

    return new Promise((resolve, reject) => {
        axios
            .post(
                'https://api.smash.gg/gql/alpha',
                JSON.stringify({
                    query,
                    variables: {
                        slug,
                        page,
                        perPage
                    }
                }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            .then(response => {
                const { data } = response;
                const pageInfo = [];
                for (
                    let i = 0;
                    i < data.data.tournament.teams.nodes.length;
                    i++
                ) {
                    const teamPlayers = [];
                    const element = data.data.tournament.teams.nodes[i];

                    if (!element.entrant) continue;

                    for (
                        let j = 0;
                        j < element.entrant.participants.length;
                        j++
                    ) {
                        const teamPlayer = element.entrant.participants[j];
                        const name = teamPlayer.gamerTag;
                        teamPlayers.push({
                            name
                        });
                    }

                    const teamName = element.name;
                    pageInfo.push({
                        id: generateId(),
                        name: teamName,
                        players: teamPlayers
                    });
                }

                if (getRaw) {
                    resolve({
                        pageInfo,
                        raw: data
                    });
                } else {
                    resolve({ pageInfo });
                }
            })
            .catch(e => {
                reject(e);
            });
    });
}

async function getRaw(url) {
    return new Promise((resolve, reject) => {
        axios
            .get(url)
            .then(response => {
                const finalResponse = handleRawData(response.data, url);

                resolve(finalResponse);
            })
            .catch(err => {
                reject(err);
            });
    });
}

function handleRawData(data, source) {
    for (let i = 0; i < data.length; i++) {
        const element = data[i];
        element.id = generateId();
    }

    return {
        meta: {
            id: source
        },
        data
    };
}

module.exports = {
    listen,
    handleRawData
};
