import { Team } from 'types/team';
import axios from 'axios';
import { TournamentData } from 'schemas';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { SmashggEntrantsResponse, SmashggEvent, SmashggEventsResponse } from 'types/smashgg';
import isEmpty from 'lodash/isEmpty';

export async function getSmashGGEvents(slug: string, token: string): Promise<SmashggEvent[]> {
    const query = `query Events($slug: String!) {
      tournament(slug: $slug) {
        id
        events {
          id
          name
          videogame {
            displayName
          }
        }
      }
    }`;

    const response = await axios.post<SmashggEventsResponse>(
        'https://api.smash.gg/gql/alpha',
        JSON.stringify({
            query,
            variables: {
                slug
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

    return response.data.data.tournament.events.map(event => ({
        id: event.id,
        name: event.name,
        game: event.videogame.displayName
    }));
}

export async function getSmashGGData(eventId: number, token: string): Promise<TournamentData> {
    const firstPageData = await getSmashGGPage(1, eventId, token, true);
    const slug = firstPageData.raw.data.event.tournament.slug;

    const tourneyInfo: TournamentData = {
        meta: {
            id: slug.substring(slug.indexOf('/') + 1),
            source: TournamentDataSource.SMASHGG,
            name: firstPageData.raw.data.event.tournament.name,
            sourceSpecificData: {
                smashgg: {
                    tournamentId: firstPageData.raw.data.event.tournament.id,
                    eventData: {
                        id: firstPageData.raw.data.event.id,
                        name: firstPageData.raw.data.event.name,
                        game: firstPageData.raw.data.event.videogame.displayName
                    }
                }
            }
        },
        teams: firstPageData.pageInfo
    };

    // If there are more pages, add them to our data set
    if (firstPageData.raw.data.event.entrants.pageInfo.totalPages > 1) {
        const pagePromises = [];
        for (let i = 2; i <= firstPageData.raw.data.event.entrants.pageInfo.totalPages; i++) {
            pagePromises.push(getSmashGGPage(i, eventId, token));
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
    eventId: number,
    token: string,
    getRaw = false
): Promise<{ pageInfo: Team[], raw?: SmashggEntrantsResponse }> {
    const query = `query EventEntrants($eventId: ID!, $page: Int!, $perPage: Int!) {
      event(id: $eventId) {
        id
        videogame {
          displayName
        }
        tournament {
          id
          name
          slug
        }
        name
        entrants(query: {
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
            team {
              images {
                type
                url
              }
            }
            participants {
              id
              prefix
              gamerTag
              user{
                genderPronoun
              }
            }
          }
        }
      }
    }`;
    const perPage = '50';

    const response = await axios.post<SmashggEntrantsResponse>(
        'https://api.smash.gg/gql/alpha',
        JSON.stringify({
            query,
            variables: {
                eventId,
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
    data.data.event.entrants.nodes.forEach(entrant => {
        pageInfo.push({
            id: entrant.id.toString(10),
            name: entrant.name,
            showLogo: true,
            logoUrl: entrant.team?.images.find(image => image.type === 'profile')?.url,
            players: entrant.participants.map(participant => ({
                name: isEmpty(participant.prefix)
                    ? participant.gamerTag : `${participant.prefix} ${participant.gamerTag}`,
                pronouns: participant.user?.genderPronoun?.toLowerCase()
            }))
        });
    });

    if (getRaw) {
        return { pageInfo, raw: data };
    } else {
        return { pageInfo };
    }
}
