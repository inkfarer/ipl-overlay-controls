import axios from 'axios';
import { getSmashGGData, getSmashGGEvents } from '../smashggClient';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { SmashggEntrantsResponse } from 'types/smashgg';

describe('smashggClient', () => {
    jest.mock('axios');
    const mockPost = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();

        axios.post = mockPost;
    });

    describe('getSmashGGEvents', () => {
        it('fetches events from Smash.gg', async () => {
            mockPost.mockResolvedValue({
                data: {
                    data: {
                        tournament: {
                            events: [
                                {
                                    id: 123431423,
                                    name: 'Cool Event',
                                    videogame: {
                                        displayName: 'Splatoon 2'
                                    }
                                },
                                {
                                    id: 238470278,
                                    name: 'Cool Smash',
                                    videogame: {
                                        displayName: 'Ultimate'
                                    }
                                }
                            ]
                        }
                    }
                }
            });

            const result = await getSmashGGEvents('event', 'apdjwiadhjwio');

            expect(result).toEqual([
                {
                    id: 123431423,
                    name: 'Cool Event',
                    game: 'Splatoon 2'
                },
                {
                    id: 238470278,
                    name: 'Cool Smash',
                    game: 'Ultimate'
                }
            ]);
            expect(mockPost).toHaveBeenCalledWith(
                'https://api.smash.gg/gql/alpha',
                expect.any(String),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: 'Bearer apdjwiadhjwio'
                    }
                }
            );
            expect(cleanUpGraphqlQuery(mockPost.mock.calls[0][1])).toMatchSnapshot();
        });
    });

    describe('getSmashGGData', () => {
        it('fetches data from Smash.gg and turns it into our expected format', async () => {
            mockPost.mockResolvedValue({
                data: {
                    data: {
                        event: {
                            id: 1234567,
                            name: 'Splatoon Two',
                            videogame: {
                                displayName: 'Splatoon 2'
                            },
                            tournament: {
                                name: 'Cool Tournament',
                                id: 654423,
                                slug: 'ct'
                            },
                            entrants: {
                                pageInfo: {
                                    total: 10,
                                    totalPages: 1
                                },
                                nodes: [
                                    {
                                        id: 1111111,
                                        name: 'Team One',
                                        team: {
                                            images: [
                                                {
                                                    url: 'smashgg://img',
                                                    type: 'profile'
                                                }
                                            ]
                                        },
                                        participants: [
                                            {
                                                id: 12345,
                                                prefix: 'TO',
                                                gamerTag: 'Player One',
                                                user: {
                                                    genderPronoun: 'he/him'
                                                }
                                            },
                                            {
                                                id: 23456,
                                                gamerTag: 'Player Two',
                                                user: { }
                                            }
                                        ]
                                    },
                                    {
                                        id: 2222222,
                                        name: 'Team Two',
                                        participants: [
                                            {
                                                id: 45678,
                                                gamerTag: 'Player Three',
                                                user: { }
                                            },
                                            {
                                                id: 23456,
                                                prefix: 'TT',
                                                gamerTag: 'Player Four',
                                                user: {
                                                    genderPronoun: 'She/Her'
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                } as SmashggEntrantsResponse
            });

            const result = await getSmashGGData(123123, '149083257830574');

            expect(result).toEqual({
                meta: {
                    id: 'ct',
                    name: 'Cool Tournament',
                    source: TournamentDataSource.SMASHGG,
                    sourceSpecificData: {
                        smashgg: {
                            eventData: {
                                game: 'Splatoon 2',
                                id: 1234567,
                                name: 'Splatoon Two'
                            },
                            tournamentId: 654423
                        }
                    }
                },
                teams: [
                    {
                        id: '1111111',
                        name: 'Team One',
                        logoUrl: 'smashgg://img',
                        showLogo: true,
                        players: [
                            { name: 'TO Player One', pronouns: 'he/him' },
                            { name: 'Player Two', pronouns: undefined }
                        ]
                    },
                    {
                        id: '2222222',
                        name: 'Team Two',
                        showLogo: true,
                        logoUrl: undefined,
                        players: [
                            { name: 'Player Three', pronouns: undefined },
                            { name: 'TT Player Four', pronouns: 'she/her' }
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
            expect(cleanUpGraphqlQuery(mockPost.mock.calls[0][1])).toMatchSnapshot();
        });

        it('fetches data multiple times if more than one page is available', async () => {
            mockPost.mockResolvedValueOnce({
                data: {
                    data: {
                        event: {
                            id: 1234567,
                            name: 'Splatoon Two',
                            videogame: {
                                displayName: 'Splatoon 2'
                            },
                            tournament: {
                                name: 'Cool Tournament',
                                id: 654423,
                                slug: 'ct'
                            },
                            entrants: {
                                pageInfo: {
                                    total: 10,
                                    totalPages: 3
                                },
                                nodes: [
                                    {
                                        id: 1111111,
                                        name: 'Team One',
                                        team: {
                                            images: [
                                                {
                                                    url: 'smashgg://img',
                                                    type: 'profile'
                                                }
                                            ]
                                        },
                                        participants: [
                                            {
                                                id: 12345,
                                                prefix: 'TO',
                                                gamerTag: 'Player One',
                                                user: {
                                                    genderPronoun: 'he/him'
                                                }
                                            },
                                            {
                                                id: 23456,
                                                gamerTag: 'Player Two',
                                                user: { }
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                } as SmashggEntrantsResponse
            }).mockResolvedValueOnce({
                data: {
                    data: {
                        event: {
                            id: 1234567,
                            name: 'Splatoon Two',
                            videogame: {
                                displayName: 'Splatoon 2'
                            },
                            tournament: {
                                name: 'Cool Tournament',
                                id: 654423,
                                slug: 'ct'
                            },
                            entrants: {
                                pageInfo: {
                                    total: 10,
                                    totalPages: 3
                                },
                                nodes: [
                                    {
                                        id: 345345345,
                                        name: 'Cool Team',
                                        team: {
                                            images: [
                                                {
                                                    url: 'smashgg://img_cool',
                                                    type: 'profile'
                                                }
                                            ]
                                        },
                                        participants: [
                                            {
                                                id: 12345,
                                                prefix: 'CT',
                                                gamerTag: 'Player One',
                                                user: {
                                                    genderPronoun: 'he/him'
                                                }
                                            },
                                            {
                                                id: 23456,
                                                gamerTag: 'Player Two',
                                                user: { }
                                            }
                                        ]
                                    },
                                    {
                                        id: 56756757,
                                        name: 'Team Three',
                                        team: {
                                            images: []
                                        },
                                        participants: [
                                            {
                                                id: 45678,
                                                gamerTag: 'Player Three',
                                                user: { }
                                            },
                                            {
                                                id: 23456,
                                                prefix: 'TT',
                                                gamerTag: 'Player Four',
                                                user: {
                                                    genderPronoun: 'She/Her'
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                } as SmashggEntrantsResponse
            }).mockResolvedValueOnce({
                data: {
                    data: {
                        event: {
                            id: 1234567,
                            name: 'Splatoon Two',
                            videogame: {
                                displayName: 'Splatoon 2'
                            },
                            tournament: {
                                name: 'Cool Tournament',
                                id: 654423,
                                slug: 'ct'
                            },
                            entrants: {
                                pageInfo: {
                                    total: 10,
                                    totalPages: 3
                                },
                                nodes: [
                                    {
                                        id: 89089,
                                        name: 'Team Four',
                                        team: {
                                            images: []
                                        },
                                        participants: [
                                            {
                                                id: 45678,
                                                gamerTag: 'Player Three',
                                                user: { }
                                            },
                                            {
                                                id: 23456,
                                                prefix: 'TT',
                                                gamerTag: 'Player Four',
                                                user: {
                                                    genderPronoun: 'She/Her'
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                } as SmashggEntrantsResponse
            });

            const result = await getSmashGGData(1234, '149083257830574');

            expect(result).toEqual({
                meta: {
                    id: 'ct',
                    name: 'Cool Tournament',
                    source: TournamentDataSource.SMASHGG,
                    sourceSpecificData: {
                        smashgg: {
                            eventData: {
                                game: 'Splatoon 2',
                                id: 1234567,
                                name: 'Splatoon Two'
                            },
                            tournamentId: 654423
                        }
                    }
                },
                teams: [
                    {
                        id: '1111111',
                        name: 'Team One',
                        showLogo: true,
                        logoUrl: 'smashgg://img',
                        players: [
                            { name: 'TO Player One', pronouns: 'he/him' },
                            { name: 'Player Two', pronouns: undefined }
                        ]
                    },
                    {
                        id: '345345345',
                        name: 'Cool Team',
                        logoUrl: 'smashgg://img_cool',
                        showLogo: true,
                        players: [
                            { name: 'CT Player One', pronouns: 'he/him' },
                            { name: 'Player Two', pronouns: undefined }
                        ]
                    },
                    {
                        id: '56756757',
                        name: 'Team Three',
                        logoUrl: undefined,
                        showLogo: true,
                        players: [
                            { name: 'Player Three', pronouns: undefined },
                            { name: 'TT Player Four', pronouns: 'she/her' }
                        ]
                    },
                    {
                        id: '89089',
                        name: 'Team Four',
                        logoUrl: undefined,
                        showLogo: true,
                        players: [
                            { name: 'Player Three', pronouns: undefined },
                            { name: 'TT Player Four', pronouns: 'she/her' }
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
