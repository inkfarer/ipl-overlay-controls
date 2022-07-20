import { mock } from 'jest-mock-extended';
import type * as PronounNormalizer from '../../../helpers/PronounNormalizer';
const mockPronounNormalizer = mock<typeof PronounNormalizer>();
jest.mock('../../../helpers/PronounNormalizer', () => mockPronounNormalizer);

import axios from 'axios';
import { getSmashGGData, getSmashGGEvents, getSmashGGStreamQueue } from '../smashggClient';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { SmashggEntrantsResponse } from 'types/smashgg';
import { PlayType } from '../../../../types/enums/playType';

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

        it('throws error if tournament is not found', async () => {
            mockPost.mockResolvedValue({
                data: {
                    data: {
                        tournament: null
                    }
                }
            });

            await expect(() => getSmashGGEvents('event', 'apdjwiadhjwio'))
                .rejects.toThrow(new Error('Could not find tournament with slug \'event\'.'));
        });

        it('throws error if tournament has no events', async () => {
            mockPost.mockResolvedValue({
                data: {
                    data: {
                        tournament: {
                            events: null
                        }
                    }
                }
            });

            await expect(() => getSmashGGEvents('eventte', 'apdjwiadhjwio'))
                .rejects.toThrow(new Error('Tournament \'eventte\' has no events.'));
        });
    });

    describe('getSmashGGData', () => {
        it('fetches data from Smash.gg and turns it into our expected format', async () => {
            mockPronounNormalizer.normalizePronouns.mockImplementation((input) => input);
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
                                slug: 'ct',
                                streams: [
                                    { id: 994422, streamName: 'Cool Stream' }
                                ]
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
                    shortName: 'Cool Tournament',
                    source: TournamentDataSource.SMASHGG,
                    sourceSpecificData: {
                        smashgg: {
                            eventData: {
                                game: 'Splatoon 2',
                                id: 1234567,
                                name: 'Splatoon Two'
                            },
                            streams: [
                                { id: 994422, streamName: 'Cool Stream' }
                            ],
                            tournamentId: 654423
                        }
                    },
                    url: 'https://smash.gg/ct/details'
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
                            { name: 'TT Player Four', pronouns: 'She/Her' }
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
            expect(mockPronounNormalizer.normalizePronouns).toHaveBeenCalledWith('She/Her');
            expect(mockPronounNormalizer.normalizePronouns).toHaveBeenCalledWith('he/him');
            expect(mockPronounNormalizer.normalizePronouns).toHaveBeenCalledWith(undefined);
        });

        it('fetches data multiple times if more than one page is available', async () => {
            mockPronounNormalizer.normalizePronouns.mockImplementation((input) => input);
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
                    shortName: 'Cool Tournament',
                    source: TournamentDataSource.SMASHGG,
                    sourceSpecificData: {
                        smashgg: {
                            eventData: {
                                game: 'Splatoon 2',
                                id: 1234567,
                                name: 'Splatoon Two'
                            },
                            streams: undefined,
                            tournamentId: 654423
                        }
                    },
                    url: 'https://smash.gg/ct/details'
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
                            { name: 'TT Player Four', pronouns: 'She/Her' }
                        ]
                    },
                    {
                        id: '89089',
                        name: 'Team Four',
                        logoUrl: undefined,
                        showLogo: true,
                        players: [
                            { name: 'Player Three', pronouns: undefined },
                            { name: 'TT Player Four', pronouns: 'She/Her' }
                        ]
                    }
                ]
            });
            expect(mockPost).toHaveBeenCalledTimes(3);
            expect(mockPronounNormalizer.normalizePronouns).toHaveBeenCalledWith('She/Her');
            expect(mockPronounNormalizer.normalizePronouns).toHaveBeenCalledWith('he/him');
            expect(mockPronounNormalizer.normalizePronouns).toHaveBeenCalledWith(undefined);
        });

        it('throws error if event is not found', async () => {
            mockPost.mockResolvedValueOnce({
                data: {
                    data: {
                        event: null
                    }
                }
            });

            await expect(() => getSmashGGData(12345, '149083257830574'))
                .rejects.toEqual(new Error('Could not find event with id \'12345\''));
        });
    });

    describe('getSmashGGStreamQueue', () => {
        it('returns empty array if no streams are requested', async () => {
            await expect(getSmashGGStreamQueue('slugslug', 'tokenboken', 111, [], false)).resolves.toEqual([]);
            expect(mockPost).not.toHaveBeenCalled();
        });

        it('returns empty array if smash.gg returns no stream queues', async () => {
            mockPost.mockResolvedValue({
                data: {
                    data: {
                        tournament: {
                            streamQueue: null
                        }
                    }
                }
            });

            const result = await getSmashGGStreamQueue('slugslug', 'tokenboken', 1234, [111, 222], false);

            expect(result).toEqual([]);
        });

        it('returns requested streams in the active event', async () => {
            mockPost.mockResolvedValue({
                data: {
                    data: {
                        tournament: {
                            streamQueue: [
                                {
                                    stream: {
                                        id: 111
                                    },
                                    sets: [
                                        {
                                            id: 999,
                                            round: '999',
                                            phaseGroup: {
                                                displayIdentifier: 'ID999',
                                                phase: {
                                                    name: 'Phase X'
                                                }
                                            },
                                            setGamesType: 1,
                                            identifier: 'Z',
                                            event: {
                                                id: 1234
                                            },
                                            slots: [
                                                {
                                                    entrant: {
                                                        id: 123456,
                                                        name: 'Entrant One',
                                                        participants: [
                                                            { prefix: 'EO', gamerTag: 'Player One' },
                                                            {
                                                                gamerTag: 'Player Two',
                                                                user: { genderPronoun: 'He/Him' }
                                                            }
                                                        ]
                                                    },
                                                    seed: {
                                                        groupSeedNum: 2
                                                    }
                                                },
                                                {
                                                    entrant: {
                                                        id: 234234,
                                                        name: 'Entrant Two',
                                                        participants: [
                                                            { prefix: 'ET', gamerTag: 'Player One' },
                                                            {
                                                                gamerTag: 'Player Two',
                                                                user: { genderPronoun: 'She/Her' }
                                                            }
                                                        ],
                                                        team: {
                                                            images: [
                                                                {
                                                                    type: 'profile',
                                                                    url: 'smashgg://img'
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    seed: {
                                                        groupSeedNum: 3
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            id: 919,
                                            round: '919',
                                            phaseGroup: {
                                                displayIdentifier: 'ID919',
                                                phase: {
                                                    name: 'Phase H'
                                                }
                                            },
                                            setGamesType: 2,
                                            identifier: 'G',
                                            event: {
                                                id: 12345
                                            },
                                            slots: [
                                                {
                                                    entrant: {
                                                        id: 123456,
                                                        name: 'Entrant One',
                                                        participants: [
                                                            { prefix: 'EO', gamerTag: 'Player One' },
                                                            {
                                                                gamerTag: 'Player Two',
                                                                user: { genderPronoun: 'He/Him' }
                                                            }
                                                        ]
                                                    },
                                                    seed: {
                                                        groupSeedNum: 2
                                                    }
                                                },
                                                {
                                                    entrant: {
                                                        id: 234234,
                                                        name: 'Entrant Two',
                                                        participants: [
                                                            { prefix: 'ET', gamerTag: 'Player One' },
                                                            {
                                                                gamerTag: 'Player Two',
                                                                user: { genderPronoun: 'She/Her' }
                                                            }
                                                        ],
                                                        team: {
                                                            images: [
                                                                {
                                                                    type: 'profile',
                                                                    url: 'smashgg://img'
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    seed: {
                                                        groupSeedNum: 3
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            slots: [{ }]
                                        }
                                    ]
                                },
                                {
                                    stream: {
                                        id: 222
                                    },
                                    sets: [
                                        {
                                            id: 988,
                                            round: '987',
                                            identifier: 'I',
                                            setGamesType: 2,
                                            phaseGroup: {
                                                displayIdentifier: 'ID988',
                                                phase: {
                                                    name: 'Phase R'
                                                }
                                            },
                                            event: {
                                                id: 1234
                                            },
                                            slots: [
                                                {
                                                    entrant: {
                                                        id: 567567,
                                                        name: 'Entrant One',
                                                        participants: [
                                                            { prefix: 'EO', gamerTag: 'Player One' },
                                                            {
                                                                gamerTag: 'Player Two',
                                                                user: { genderPronoun: 'He/Him' }
                                                            }
                                                        ]
                                                    },
                                                    seed: {
                                                        groupSeedNum: 2
                                                    }
                                                },
                                                {
                                                    entrant: {
                                                        id: 789789,
                                                        name: 'Entrant Two',
                                                        participants: [
                                                            { prefix: 'ET', gamerTag: 'Player One' },
                                                            {
                                                                gamerTag: 'Player Two',
                                                                user: { genderPronoun: 'She/Her' }
                                                            }
                                                        ],
                                                        team: {
                                                            images: [
                                                                {
                                                                    type: 'profile',
                                                                    url: 'smashgg://img'
                                                                }
                                                            ]
                                                        }
                                                    },
                                                    seed: {
                                                        groupSeedNum: 3
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            slots: [{ }]
                                        }
                                    ]
                                },
                                {
                                    stream: {
                                        id: 333
                                    }
                                }
                            ]
                        }
                    }
                }
            });

            const result = await getSmashGGStreamQueue('slugslug', 'tokenboken', 1234, [111, 222], false);

            expect(result).toEqual([{
                meta: {
                    id: '999',
                    match: 0,
                    playType: PlayType.BEST_OF,
                    name: 'Set Z - Round 999 - Pool ID999 - Phase X',
                    round: '999',
                    stageName: 'ID999'
                },
                teamA: {
                    id: '123456',
                    logoUrl: undefined,
                    name: 'Entrant One',
                    players: [
                        {
                            name: 'EO Player One',
                            pronouns: undefined
                        },
                        {
                            name: 'Player Two',
                            pronouns: 'he/him'
                        }
                    ],
                    seed: 2,
                    showLogo: true
                },
                teamB: {
                    id: '234234',
                    logoUrl: 'smashgg://img',
                    name: 'Entrant Two',
                    players: [
                        {
                            name: 'ET Player One',
                            pronouns: undefined
                        },
                        {
                            name: 'Player Two',
                            pronouns: 'she/her'
                        }
                    ],
                    seed: 3,
                    showLogo: true
                }
            }, {
                meta: {
                    id: '988',
                    match: 0,
                    playType: PlayType.PLAY_ALL,
                    name: 'Set I - Round 987 - Pool ID988 - Phase R',
                    round: '987',
                    stageName: 'ID988'
                },
                teamA: {
                    id: '567567',
                    logoUrl: undefined,
                    name: 'Entrant One',
                    players: [
                        {
                            name: 'EO Player One',
                            pronouns: undefined
                        },
                        {
                            name: 'Player Two',
                            pronouns: 'he/him'
                        }
                    ],
                    seed: 2,
                    showLogo: true
                },
                teamB: {
                    id: '789789',
                    logoUrl: 'smashgg://img',
                    name: 'Entrant Two',
                    players: [
                        {
                            name: 'ET Player One',
                            pronouns: undefined
                        },
                        {
                            name: 'Player Two',
                            pronouns: 'she/her'
                        }
                    ],
                    seed: 3,
                    showLogo: true
                }
            }]);
            expect(mockPost).toHaveBeenCalledWith(
                'https://api.smash.gg/gql/alpha',
                expect.any(String),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: 'Bearer tokenboken'
                    }
                }
            );
            expect(cleanUpGraphqlQuery(mockPost.mock.calls[0][1])).toMatchSnapshot();
        });
    });
});

function cleanUpGraphqlQuery(query: string): string {
    return query
        .replace(/\\n/g, '')
        .replace(/ {4,}/g, ' ');
}
