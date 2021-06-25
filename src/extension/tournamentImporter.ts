import axios, { AxiosResponse } from 'axios';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import * as nodecgContext from './util/nodecg';
import { TournamentData, ScoreboardData, NextTeams, HighlightedMatch } from 'schemas';
import { generateId } from '../helpers/generateId';
import { Team } from 'types/team';
import { BattlefyTournamentData } from './types/battlefyTournamentData';
import clone from 'clone';

const nodecg = nodecgContext.get();

const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');
const nextTeams = nodecg.Replicant<NextTeams>('nextTeams');
const highlightedMatchData = nodecg.Replicant<HighlightedMatch>('highlightedMatches');
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

    data.data.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();

        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    });

    tournamentData.value = data;

    highlightedMatchData.value = []; // Clear highlighted matches as tournament data has changed

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

                // Process the stages in a tournament for rep
                const tournamentStages: { name: string; id: string; bracketType: string}[] = [];
                tournamentInfo.stages.forEach(function (value){
                    tournamentStages.push({
                        name: value.name,
                        id: value._id,
                        bracketType: value.bracket.type
                    });
                });

                const teams: TournamentData = {
                    meta: {
                        id,
                        source: 'Battlefy',
                        name: tournamentInfo.name,
                        stages: tournamentStages
                    },
                    data: []
                };
                for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    const teamInfo: Team = {
                        id: element._id,
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
    // API link gets all the details on a battlefy tournament
    // eslint-disable-next-line max-len
    const url = `https://api.battlefy.com/tournaments/${id}?extend%5Bcampaign%5D%5Bsponsor%5D=true&extend%5Bstages%5D%5B%24query%5D%5BdeletedAt%5D%5B%24exists%5D=false&extend%5Bstages%5D%5B%24opts%5D%5Bname%5D=1&extend%5Bstages%5D%5B%24opts%5D%5Bbracket%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BstartTime%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BendTime%5D=1&extend%5Bstages%5D%5B%24opts%5D%5Bschedule%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BmatchCheckinDuration%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BhasCheckinTimer%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BhasStarted%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BhasMatchCheckin%5D=1&extend%5Borganization%5D%5Bowner%5D%5B%24opts%5D%5Btimezone%5D=1&extend%5Borganization%5D%5B%24opts%5D%5Bname%5D=1&extend%5Borganization%5D%5B%24opts%5D%5Bslug%5D=1&extend%5Borganization%5D%5B%24opts%5D%5BownerID%5D=1&extend%5Borganization%5D%5B%24opts%5D%5BlogoUrl%5D=1&extend%5Borganization%5D%5B%24opts%5D%5BbannerUrl%5D=1&extend%5Borganization%5D%5B%24opts%5D%5Bfeatures%5D=1&extend%5Borganization%5D%5B%24opts%5D%5Bfollowers%5D=1&extend%5Bgame%5D=true&extend%5Bstreams%5D%5B%24query%5D%5BdeletedAt%5D%5B%24exists%5D=false`;
    const response = await axios.get(url);
    return response.data[0];  // This URL provides each tournament as an array of objects
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
