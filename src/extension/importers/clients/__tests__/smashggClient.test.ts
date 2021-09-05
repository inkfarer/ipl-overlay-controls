import axios from 'axios';
import { getSmashGGData } from '../smashggClient';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import * as generateId from '../../../../helpers/generateId';

describe('smashggClient', () => {
    jest.mock('axios');
    const mockPost = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();

        axios.post = mockPost;
    });

    describe('getSmashGGData', () => {
        it('fetches data from Smash.gg and turns it into our expected format', async () => {
            jest.spyOn(generateId, 'generateId')
                .mockReturnValueOnce('111111')
                .mockReturnValueOnce('222222');

            mockPost.mockResolvedValue({
                data: {
                    data: {
                        tournament: {
                            name: 'Cool Tournament',
                            teams: {
                                pageInfo: {
                                    totalPages: 1
                                },
                                nodes: [
                                    {
                                        name: 'Team One',
                                        entrant: {
                                            participants: [
                                                { gamerTag: 'Player One' },
                                                { gamerTag: 'Player Two' }
                                            ]
                                        }
                                    },
                                    {
                                        name: 'Team ???',
                                        entrant: undefined
                                    },
                                    {
                                        name: 'Team Two',
                                        entrant: {
                                            participants: [
                                                { gamerTag: 'Player Three' },
                                                { gamerTag: 'Player Four' }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            });

            const result = await getSmashGGData('ggtourney', '149083257830574');

            expect(result).toEqual({
                meta: {
                    id: 'ggtourney',
                    name: 'Cool Tournament',
                    source: TournamentDataSource.SMASHGG
                },
                teams: [
                    {
                        id: '111111',
                        name: 'Team One',
                        showLogo: true,
                        players: [
                            { name: 'Player One' },
                            { name: 'Player Two' }
                        ]
                    },
                    {
                        id: '222222',
                        name: 'Team Two',
                        showLogo: true,
                        players: [
                            { name: 'Player Three' },
                            { name: 'Player Four' }
                        ]
                    }
                ]
            });
            expect(mockPost).toHaveBeenCalledWith(
                'https://api.smash.gg/gql/alpha',
                expect.any(String),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: 'Bearer 149083257830574'
                    }
                }
            );
            expect(cleanUpGraphqlQuery(mockPost.mock.calls[0][1]))
                .toEqual('{"query":"query Entrants($slug: String!, $page: Int!, $perPage: Int!) '
                    + '{ tournament(slug: $slug) { id name teams(query: { page: $page perPage: $perPage })'
                    + ' { pageInfo { total totalPages } nodes { id name entrant { id participants { id gam'
                    + 'erTag } } } } } }","variables":{"slug":"ggtourney","page":1,"perPage":"50"}}');
        });

        it('fetches data multiple times if more than one page is available', async () => {
            jest.spyOn(generateId, 'generateId')
                .mockReturnValueOnce('111111')
                .mockReturnValueOnce('222222')
                .mockReturnValueOnce('333333');

            mockPost.mockResolvedValueOnce({
                data: {
                    data: {
                        tournament: {
                            name: 'Cool Tournament',
                            teams: {
                                pageInfo: {
                                    totalPages: 3
                                },
                                nodes: [
                                    {
                                        name: 'Team One',
                                        entrant: {
                                            participants: [
                                                { gamerTag: 'Player One' },
                                                { gamerTag: 'Player Two' }
                                            ]
                                        }
                                    },
                                ]
                            }
                        }
                    }
                }
            }).mockResolvedValueOnce({
                data: {
                    data: {
                        tournament: {
                            name: 'Cool Tournament',
                            teams: {
                                pageInfo: {
                                    totalPages: 3
                                },
                                nodes: [
                                    {
                                        name: 'Team ???',
                                        entrant: undefined
                                    },
                                    {
                                        name: 'Cool Team',
                                        entrant: {
                                            participants: [
                                                { gamerTag: 'Player One' },
                                                { gamerTag: 'Player Two' }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }).mockResolvedValueOnce({
                data: {
                    data: {
                        tournament: {
                            name: 'Cool Tournament',
                            teams: {
                                pageInfo: {
                                    totalPages: 3
                                },
                                nodes: [
                                    {
                                        name: 'Team Two',
                                        entrant: {
                                            participants: [
                                                { gamerTag: 'Player Three' },
                                                { gamerTag: 'Player Four' }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            });

            const result = await getSmashGGData('ggtourney', '149083257830574');

            expect(result).toEqual({
                meta: {
                    id: 'ggtourney',
                    name: 'Cool Tournament',
                    source: TournamentDataSource.SMASHGG
                },
                teams: [
                    {
                        id: '111111',
                        name: 'Team One',
                        showLogo: true,
                        players: [
                            { name: 'Player One' },
                            { name: 'Player Two' }
                        ]
                    },
                    {
                        id: '222222',
                        name: 'Cool Team',
                        showLogo: true,
                        players: [
                            { name: 'Player One' },
                            { name: 'Player Two' }
                        ]
                    },
                    {
                        id: '333333',
                        name: 'Team Two',
                        showLogo: true,
                        players: [
                            { name: 'Player Three' },
                            { name: 'Player Four' }
                        ]
                    }
                ]
            });
            expect(mockPost).toHaveBeenCalledTimes(3);
        });
    });
});

function cleanUpGraphqlQuery(query: string): string {
    return query
        .replace(/\\n/g, '')
        .replace(/ {4,}/g, ' ');
}
