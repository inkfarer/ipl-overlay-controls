import axios, { AxiosResponse } from 'axios';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import * as nodecgContext from '../helpers/nodecg';
import { TournamentData, HighlightedMatches } from 'schemas';
import { generateId } from '../../helpers/generateId';
import { Team } from 'types/team';
import { BattlefyTournamentData } from '../types/battlefyTournamentData';
import { BracketType, BracketTypeHelper } from 'types/enums/bracketType';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { setNextRoundTeams } from '../replicants/nextRoundHelper';
import { setActiveRoundTeams } from '../replicants/activeRoundHelper';

const nodecg = nodecgContext.get();

const tournamentData = nodecg.Replicant<TournamentData>('tournamentData');
const highlightedMatchData = nodecg.Replicant<HighlightedMatches>('highlightedMatches');
let smashGGKey: string;

if (!nodecg.bundleConfig || typeof nodecg.bundleConfig.smashgg === 'undefined') {
    nodecg.log.warn(
        `"smashgg" is not defined in cfg/${nodecg.bundleName}.json! `
        + 'Importing tournament data from smash.gg will not be possible.'
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
        case TournamentDataSource.BATTLEFY:
            getBattlefyData(data.id)
                .then(data => {
                    updateTeamDataReplicants(data);
                    ack(null, data.meta.id);
                })
                .catch(err => {
                    ack(err);
                });
            break;
        case TournamentDataSource.SMASHGG:
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
        case TournamentDataSource.UPLOAD:
            getRaw(data.id)
                .then(data => {
                    updateTeamDataReplicants(data);
                    ack(null, data.meta.id);
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
    if (data.teams.length <= 0) {
        throw new Error('Tournament has no teams.');
    }

    data.teams.sort((a, b) => {
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

    const firstTeam = data.teams[0];
    const secondTeam = data.teams[1] || data.teams[0];

    setActiveRoundTeams(firstTeam.id, secondTeam.id);
    setNextRoundTeams((data.teams[2].id || firstTeam.id), (data.teams[3].id || secondTeam.id));
}

async function getBattlefyData(id: string): Promise<TournamentData> {
    const tournamentInfo = await getBattlefyTournamentInfo(id);

    const requestURL = 'https://dtmwra1jsgyb0.cloudfront.net/tournaments/' + id + '/teams';
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
                const tournamentStages: { name: string; id: string; type: BracketType}[] = [];
                tournamentInfo.stages.forEach(value => {
                    tournamentStages.push({
                        name: value.name,
                        id: value._id,
                        type: BracketTypeHelper.fromBattlefy(value.bracket.type, value.bracket.style)
                    });
                });

                const teams: TournamentData = {
                    meta: {
                        id,
                        source: 'BATTLEFY',
                        name: tournamentInfo.name
                    },
                    teams: [],
                    stages: tournamentStages
                };
                for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    const teamInfo: Team = {
                        id: element._id,
                        name: element.name,
                        logoUrl: element.persistentTeam.logoUrl,
                        showLogo: true,
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

                    teams.teams.push(teamInfo);
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
                        source: TournamentDataSource.SMASHGG,
                        name: data.raw.data.tournament.name
                    },
                    teams: []
                };
                tourneyInfo.teams = tourneyInfo.teams.concat(data.pageInfo);

                // If there are more pages, add them to our data set
                if (data.raw.data.tournament.teams.pageInfo.totalPages > 1) {
                    const pagePromises = [];
                    for (let i = 2; i <= data.raw.data.tournament.teams.pageInfo.totalPages; i++) {
                        pagePromises.push(getSmashGGPage(i, slug, token));
                    }

                    const pages = await Promise.all(pagePromises);

                    for (let i = 0; i < pages.length; i++) {
                        tourneyInfo.teams = tourneyInfo.teams.concat(pages[i].pageInfo);
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
                        players: teamPlayers,
                        showLogo: true
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

export function handleRawData(teams: Team[], dataUrl: string): TournamentData {
    for (let i = 0; i < teams.length; i++) {
        const element = teams[i];
        if (element.id == null) {
            element.id = generateId();
        }
        if (element.showLogo == null) {
            element.showLogo = true;
        }
    }

    return {
        meta: {
            id: dataUrl,
            source: TournamentDataSource.UPLOAD
        },
        teams
    };
}
