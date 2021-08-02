import { Team } from 'types/team';
import axios, { AxiosResponse } from 'axios';
import { generateId } from '../../../helpers/generateId';
import { TournamentData } from 'schemas';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';

export async function getSmashGGData(slug: string, token: string): Promise<TournamentData> {
    const firstPageData = await getSmashGGPage(1, slug, token, true);

    const tourneyInfo: TournamentData = {
        meta: {
            id: slug,
            source: TournamentDataSource.SMASHGG,
            name: firstPageData.raw.data.tournament.name
        },
        teams: []
    };
    tourneyInfo.teams = tourneyInfo.teams.concat(firstPageData.pageInfo);

    // If there are more pages, add them to our data set
    if (firstPageData.raw.data.tournament.teams.pageInfo.totalPages > 1) {
        const pagePromises = [];
        for (let i = 2; i <= firstPageData.raw.data.tournament.teams.pageInfo.totalPages; i++) {
            pagePromises.push(getSmashGGPage(i, slug, token));
        }

        const pages = await Promise.all(pagePromises);

        for (let i = 0; i < pages.length; i++) {
            tourneyInfo.teams = tourneyInfo.teams.concat(pages[i].pageInfo);
        }
    }

    return tourneyInfo;
}

async function getSmashGGPage(
    page: number,
    slug: string,
    token: string,
    getRaw = false
): Promise<{ pageInfo: Team[], raw?: AxiosResponse }> {
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

    const response = await axios.post(
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
    );

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
        return { pageInfo, raw: data };
    } else {
        return { pageInfo };
    }
}
