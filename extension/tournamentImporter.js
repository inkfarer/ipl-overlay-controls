const axios = require('axios');

module.exports = async function (nodecg) {
    const tournamentData = nodecg.Replicant('tournamentData');
    var smashGGKey;

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
                    .then((data) => {
                        tournamentData.value = data;
                        ack(null, data.meta.id);
                    })
                    .catch((err) => {
                        ack(err);
                    });
                return;
            case 'smashgg':
                if (!smashGGKey) {
                    ack(new Error('No smash.gg token provided.'));
                    return;
                }

                getSmashGGData(data.id, smashGGKey)
                    .then((data) => {
                        tournamentData.value = data;
                        ack(null, data.meta.id);
                    })
                    .catch((err) => {
                        ack(err);
                    });
                return;
            case 'raw':
                getRaw(data.id)
                    .then((data) => {
                        tournamentData.value = data;
                        ack(null, data.id);
                    })
                    .catch((err) => {
                        ack(err);
                    });
                return;
        }
    });
};

function generateId() {
    return '' + Math.random().toString(36).substr(2, 9);
}

async function getBattlefyData(id) {
    const requestURL =
        'https://dtmwra1jsgyb0.cloudfront.net/tournaments/' + id + '/teams';
    return new Promise((resolve, reject) => {
        axios
            .get(requestURL)
            .then((response) => {
                const data = response.data;
                //console.log(response);
                if (data.error) {
                    reject(data.error);
                    return;
                }
                let teams = {
                    meta: {
                        id: id,
                    },
                    data: [],
                };
                for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    var teamInfo = {
                        id: generateId(),
                        name: element.name,
                        logoUrl: element.persistentTeam.logoUrl,
                        players: [],
                    };
                    for (let j = 0; j < element.players.length; j++) {
                        const elementPlayer = element.players[j];
                        let playerInfo = {
                            name: elementPlayer.inGameName,
                            username: elementPlayer.username,
                        };
                        teamInfo.players.push(playerInfo);
                    }
                    teams.data.push(teamInfo);
                }
                resolve(teams);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

async function getSmashGGData(slug, token) {
    return new Promise(async (resolve, reject) => {
        getSmashGGPage('1', slug, token, true)
            .then(async (data) => {
                //var tourneyInfo = [{tourneyId: slug}].concat(data.pageInfo);
                var tourneyInfo = {
                    meta: {
                        id: slug,
                    },
                    data: [],
                };
                tourneyInfo.data = tourneyInfo.data.concat(data.pageInfo);

                // if there are more pages, add them to our data set
                if (data.raw.data.tournament.teams.pageInfo.totalPages > 1) {
                    for (
                        let i = 2;
                        i <= data.raw.data.tournament.teams.pageInfo.totalPages;
                        i++
                    ) {
                        let pageInfo = await getSmashGGPage(i, slug, token);
                        tourneyInfo.data = tourneyInfo.data.concat(
                            pageInfo.pageInfo
                        );
                    }
                }

                // we did it
                resolve(tourneyInfo);
            })
            .catch((err) => {
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
                    variables: { slug, page, perPage },
                }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then((response) => {
                const data = response.data;
                let pageInfo = [];
                for (
                    let i = 0;
                    i < data.data.tournament.teams.nodes.length;
                    i++
                ) {
                    let teamPlayers = [];
                    const element = data.data.tournament.teams.nodes[i];

                    if (!element.entrant) continue;

                    for (
                        let j = 0;
                        j < element.entrant.participants.length;
                        j++
                    ) {
                        const teamPlayer = element.entrant.participants[j];
                        let name = teamPlayer.gamerTag;
                        teamPlayers.push({
                            name: name,
                        });
                    }
                    let teamName = element.name;
                    pageInfo.push({
                        id: generateId(),
                        name: teamName,
                        players: teamPlayers,
                    });
                }
                if (getRaw) {
                    resolve({ pageInfo: pageInfo, raw: data });
                } else {
                    resolve({ pageInfo: pageInfo });
                }
            })
            .catch((e) => {
                reject(e);
            });
    });
}

async function getRaw(url) {
    return new Promise((resolve, reject) => {
        axios
            .get(url)
            .then((response) => {
                // make an id for every team
                for (let i = 0; i < response.data.length; i++) {
                    const element = response.data[i];
                    element.id = generateId();
                }

                var finalResponse = {
                    meta: {
                        id: url,
                    },
                    data: response.data,
                };
                resolve(finalResponse);
            })
            .catch((err) => {
                reject(err);
            });
    });
}
