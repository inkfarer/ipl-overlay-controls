import axios, { AxiosResponse } from 'axios';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import * as nodecgContext from './util/nodecg';
import { TournamentData, ScoreboardData, NextTeams } from 'schemas';
import { generateId } from '../helpers/generateId';
import { Team } from 'types/team';
import { BattlefyTournamentData } from './types/tournamentData';
import clone from 'clone';

const nodecg = nodecgContext.get();

const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');
const nextTeams = nodecg.Replicant<NextTeams>('nextTeams');
let smashGGKey: string;

if (!nodecg.bundleConfig || typeof nodecg.bundleConfig.smashgg === 'undefined') {
    nodecg.log.warn(
        `"smashgg" is not defined in cfg/${nodecg.bundleName}.json! ` +
        'Importing tournament data from smash.gg will not be possible.'
    );
} else {
    smashGGKey = nodecg.bundleConfig.smashgg.apiKey;
}

nodecg.listenFor('getTournamentData', async (data, ack: UnhandledListenForCb) => {
    if (!data.id || !data.method) {
        ack(new Error('Missing arguments.'), null);
        return;
    }

    switch (data.method) {
        case 'battlefy':
            getBattlefyData(data.id)
                .then(data => {
                    updateTeamDataReplicants(data);
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
                    updateTeamDataReplicants(data);
                    ack(null, data.meta.id);
                })
                .catch(err => {
                    ack(err);
                });
            break;
        case 'raw':
            getRaw(data.id)
                .then(data => {
                    updateTeamDataReplicants(data);
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

export function updateTeamDataReplicants(data: TournamentData): void {
    if (data.data.length <= 0) {
        throw new Error('Tournament has no teams.');
    }

    tournamentData.value = data;

    const firstTeam = data.data[0];
    const secondTeam = data.data[1] || data.data[0];

    scoreboardData.value.teamAInfo = clone(firstTeam);
    scoreboardData.value.teamBInfo = clone(secondTeam);

    nextTeams.value.teamAInfo = clone(data.data[2] || firstTeam);
    nextTeams.value.teamBInfo = clone(data.data[3] || secondTeam);
}

async function getBattlefyData(id: string): Promise<TournamentData> {
    const tournamentInfo = await getBattlefyTournamentInfo(id);

    const requestURL =
        'https://dtmwra1jsgyb0.cloudfront.net/tournaments/' + id + '/teams';
    return new Promise((resolve, reject) => {
        axios
            .get(requestURL)
            .then(response => {
                const { data } = response;
                if (data.error) {
                    reject(data.error);
                    return;
                }

                const teams: TournamentData = {
                    meta: {
                        id,
                        source: 'Battlefy',
                        name: tournamentInfo.name,
                        stages: tournamentInfo.stageIDs
                    },
                    data: []
                };
                for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    const teamInfo: Team = {
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

async function getBattlefyTournamentInfo(id: string): Promise<BattlefyTournamentData> {
    const url = `https://api.battlefy.com/tournaments/${id}`;
    const response = await axios.get(url);
    return response.data;
}

async function getSmashGGData(slug: string, token: string): Promise<TournamentData> {
    return new Promise((resolve, reject) => {
        getSmashGGPage(1, slug, token, true)
            .then(async data => {
                const tourneyInfo: TournamentData = {
                    meta: {
                        id: slug,
                        source: 'Smash.gg',
                        name: data.raw.data.tournament.name
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

                    const pages = await Promise.all(pagePromises);

                    for (let i = 0; i < pages.length; i++) {
                        tourneyInfo.data = tourneyInfo.data.concat(pages[i].pageInfo);
                    }
                }

                resolve(tourneyInfo);
            })
            .catch(err => {
                reject(err);
            });
    });
}

async function getSmashGGPage(
    page: number,
    slug: string,
    token: string,
    getRaw = false): Promise<{ pageInfo: Team[], raw?: AxiosResponse }> {

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
                const pageInfo: Team[] = [];
                for (let i = 0; i < data.data.tournament.teams.nodes.length; i++) {
                    const teamPlayers = [];
                    const element = data.data.tournament.teams.nodes[i];

                    if (!element.entrant) continue;

                    for (let j = 0; j < element.entrant.participants.length; j++) {
                        const teamPlayer = element.entrant.participants[j];
                        const name = teamPlayer.gamerTag;
                        teamPlayers.push({ name });
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

async function getRaw(url: string): Promise<TournamentData> {
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

export function handleRawData(data: Team[], dataUrl: string): TournamentData {
    for (let i = 0; i < data.length; i++) {
        const element = data[i];
        element.id = generateId();
    }

    return {
        meta: {
            id: dataUrl,
            source: 'Uploaded file'
        },
        data
    };
}
