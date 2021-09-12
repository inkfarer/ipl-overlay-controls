import { getBattlefyMatches, getBattlefyTournamentData } from '../battlefyClient';
import axios from 'axios';
import { BracketType } from 'types/enums/bracketType';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';

describe('battlefyClient', () => {
    jest.mock('axios');
    const mockGet = jest.fn();

    beforeEach(() => {
        axios.get = mockGet;
    });

    describe('getBattlefyMatches', () => {
        const mockBattlefyResponse = {
            data: [
                {
                    stages: [
                        {
                            _id: 'swiswsiswis',
                            name: 'Swiss Stage',
                            bracket: { type: 'swiss' },
                            matches: [
                                {
                                    _id: '354364141',
                                    isMarkedLive: true,
                                    matchNumber: 50,
                                    roundNumber: 1,
                                    completedAt: '2020-05-30',
                                    top: {
                                        team: {
                                            _id: '123123123',
                                            name: 'Cool Team',
                                            persistentTeam: {
                                                logoUrl: 'logo://url'
                                            },
                                            players: [
                                                { inGameName: 'P1' },
                                                { inGameName: 'P2' }
                                            ]
                                        }
                                    },
                                    bottom: {
                                        team: {
                                            _id: '234234234',
                                            name: 'Cool Team the Second',
                                            persistentTeam: {
                                                logoUrl: 'logo://url/2'
                                            },
                                            players: [
                                                { inGameName: 'P3' },
                                                { inGameName: 'P4' }
                                            ]
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            _id: 'elimliemleieml',
                            name: 'Elimination Stage',
                            bracket: { type: 'elimination' },
                            matches: [
                                {
                                    _id: '354364141',
                                    isMarkedLive: true,
                                    matchNumber: 23,
                                    roundNumber: 3,
                                    matchType: 'winner',
                                    top: {
                                        team: {
                                            _id: '123123123',
                                            name: 'Cool Team',
                                            persistentTeam: {
                                                logoUrl: 'logo://url'
                                            },
                                            players: [
                                                { inGameName: 'P5' },
                                                { inGameName: 'P6' }
                                            ]
                                        }
                                    },
                                    bottom: {
                                        team: {
                                            _id: '234234234',
                                            name: 'Cool Team the Second',
                                            persistentTeam: {
                                                logoUrl: 'logo://url/2'
                                            },
                                            players: [
                                                { inGameName: 'P7' },
                                                { inGameName: 'P8' }
                                            ]
                                        }
                                    }
                                },
                                { isMarkedLive: false },
                                { isMarkedLive: false }
                            ]
                        },
                        { bracket: { type: 'unknown' } }
                    ]
                }
            ]
        };

        it('fetches highlighted matches', async () => {
            mockGet.mockResolvedValue(mockBattlefyResponse);

            const result = await getBattlefyMatches('aaaa', undefined, true);

            expect(mockGet).toHaveBeenCalledWith('https://api.battlefy.com/tournaments/aaaa'
                + '?extend[stages][$query][deletedAt][$exists]=false'
                + '&extend[stages][matches]=1'
                + '&extend[stages][$opts][name]=1'
                + '&extend[stages][$opts][matches][$elemMatch][isMarkedLive]=true'
                + '&extend[stages.matches.top.team]=1'
                + '&extend[stages.matches.bottom.team]=1'
                + '&extend[stages][$opts][bracket]=1'
                + '&extend[stages.matches.top.team.persistentTeam]=1'
                + '&extend[stages.matches.bottom.team.persistentTeam]=1'
                + '&extend[stages.matches.top.team.players]=1'
                + '&extend[stages.matches.bottom.team.players]=1');
            expect(result).toEqual([
                {
                    meta: {
                        completionTime: '2020-05-30',
                        id: '354364141',
                        match: 50,
                        name: 'Round 1 Match 50',
                        round: 1,
                        stageName: 'Swiss Stage'
                    },
                    teamA: {
                        id: '123123123',
                        logoUrl: 'logo://url',
                        name: 'Cool Team',
                        players: [
                            { name: 'P1' },
                            { name: 'P2' }
                        ],
                        showLogo: true
                    },
                    teamB: {
                        id: '234234234',
                        logoUrl: 'logo://url/2',
                        name: 'Cool Team the Second',
                        players: [
                            { name: 'P3' },
                            { name: 'P4' }
                        ],
                        showLogo: true
                    }
                },
                {
                    meta: {
                        id: '354364141',
                        match: 23,
                        name: 'Round 3 Match C23',
                        round: 3,
                        stageName: 'Elimination Stage'
                    },
                    teamA: {
                        id: '123123123',
                        logoUrl: 'logo://url',
                        name: 'Cool Team',
                        players: [
                            { name: 'P5' },
                            { name: 'P6' }
                        ],
                        showLogo: true
                    },
                    teamB: {
                        id: '234234234',
                        logoUrl: 'logo://url/2',
                        name: 'Cool Team the Second',
                        players: [
                            { name: 'P7' },
                            { name: 'P8' }
                        ],
                        showLogo: true
                    }
                }
            ]);
        });

        it('fetches specified highlighted matches', async () => {
            mockGet.mockResolvedValue(mockBattlefyResponse);

            const result = await getBattlefyMatches('aaaa', ['swiswsiswis']);

            expect(mockGet).toHaveBeenCalledWith('https://api.battlefy.com/tournaments/aaaa'
                + '?extend[stages][$query][deletedAt][$exists]=false'
                + '&extend[stages][matches]=1'
                + '&extend[stages][$opts][name]=1'
                + '&extend[stages][$opts][matches][$elemMatch][isMarkedLive]=true'
                + '&extend[stages.matches.top.team]=1'
                + '&extend[stages.matches.bottom.team]=1'
                + '&extend[stages][$opts][bracket]=1'
                + '&extend[stages.matches.top.team.persistentTeam]=1'
                + '&extend[stages.matches.bottom.team.persistentTeam]=1'
                + '&extend[stages.matches.top.team.players]=1'
                + '&extend[stages.matches.bottom.team.players]=1');
            expect(result).toEqual([
                {
                    meta: {
                        completionTime: '2020-05-30',
                        id: '354364141',
                        match: 50,
                        name: 'Round 1 Match 50',
                        round: 1,
                        stageName: 'Swiss Stage'
                    },
                    teamA: {
                        id: '123123123',
                        logoUrl: 'logo://url',
                        name: 'Cool Team',
                        players: [
                            { name: 'P1' },
                            { name: 'P2' }
                        ],
                        showLogo: true
                    },
                    teamB: {
                        id: '234234234',
                        logoUrl: 'logo://url/2',
                        name: 'Cool Team the Second',
                        players: [
                            { name: 'P3' },
                            { name: 'P4' }
                        ],
                        showLogo: true
                    }
                }
            ]);
        });

        it('handles errors from battlefy', async () => {
            mockGet.mockResolvedValue({ data: { error: 'something has gone wrong' } });

            await expect(getBattlefyMatches('aaaa')).rejects
                .toThrow('Got error from Battlefy: something has gone wrong');
        });

        it('handles missing data', async () => {
            mockGet.mockResolvedValue({ data: [ ]});

            await expect(getBattlefyMatches('aaaa')).rejects
                .toThrow('Couldn\'t get tournament data from Battlefy.');
        });
    });

    describe('getBattlefyTournamentData', () => {
        it('fetches tournament data', async () => {
            mockGet.mockResolvedValueOnce({
                data: [
                    {
                        _id: '123123345345',
                        name: 'Cool Tournament',
                        slug: 'cool-tourney',
                        organization: {
                            slug: 'tournament-org'
                        },
                        stages: [
                            {
                                _id: '12314321',
                                name: 'Stage One',
                                bracket: {
                                    type: 'swiss'
                                }
                            },
                            {
                                _id: '4356365',
                                name: 'Stage Two',
                                bracket: {
                                    type: 'elimination',
                                    style: 'double'
                                }
                            }
                        ]
                    }
                ]
            }).mockResolvedValueOnce({
                data: [
                    {
                        _id: 'akfwehjopru48902ujr',
                        name: 'Team One',
                        persistentTeam: {
                            logoUrl: 'logo://url'
                        },
                        players: [
                            {
                                inGameName: 'useruser',
                                username: 'userusername'
                            },
                            {
                                inGameName: 'useruser2',
                                username: 'userusername2'
                            }
                        ]
                    },
                    {
                        _id: 'jn2307d589275',
                        name: 'Team Two',
                        persistentTeam: {
                            logoUrl: 'logo://url/2'
                        },
                        players: [
                            {
                                inGameName: 'ingameingame',
                                username: 'useruser'
                            },
                            {
                                inGameName: 'ingameingame2',
                                username: 'useruser2'
                            }
                        ]
                    }
                ]
            });

            const result = getBattlefyTournamentData('pjaojrtipfj3w09quhf');

            await expect(result).resolves.toEqual({
                meta: {
                    id: 'pjaojrtipfj3w09quhf',
                    name: 'Cool Tournament',
                    source: TournamentDataSource.BATTLEFY,
                    url: 'https://battlefy.com/tournament-org/cool-tourney/123123345345/info?infoTab=details'
                },
                stages: [
                    {
                        id: '12314321',
                        name: 'Stage One',
                        type: BracketType.SWISS,
                    },
                    {
                        id: '4356365',
                        name: 'Stage Two',
                        type: BracketType.DOUBLE_ELIMINATION,
                    },
                ],
                teams: [
                    {
                        id: 'akfwehjopru48902ujr',
                        logoUrl: 'logo://url',
                        name: 'Team One',
                        players:  [
                            {
                                name: 'useruser',
                                username: 'userusername',
                            },
                            {
                                name: 'useruser2',
                                username: 'userusername2',
                            },
                        ],
                        showLogo: true,
                    },
                    {
                        id: 'jn2307d589275',
                        logoUrl: 'logo://url/2',
                        name: 'Team Two',
                        players:  [
                            {
                                name: 'ingameingame',
                                username: 'useruser',
                            },
                            {
                                name: 'ingameingame2',
                                username: 'useruser2',
                            },
                        ],
                        showLogo: true,
                    },
                ],
            });
            expect(mockGet)
                .toHaveBeenCalledWith('https://api.battlefy.com/tournaments/pjaojrtipfj3w09qu'
                    + 'hf?extend%5Bcampaign%5D%5Bsponsor%5D=true&extend%5Bstages%5D%5B%24query%5D%5BdeletedAt'
                    + '%5D%5B%24exists%5D=false&extend%5Bstages%5D%5B%24opts%5D%5Bname%5D=1&extend%5Bstages%5'
                    + 'D%5B%24opts%5D%5Bbracket%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BstartTime%5D=1&extend%'
                    + '5Bstages%5D%5B%24opts%5D%5BendTime%5D=1&extend%5Bstages%5D%5B%24opts%5D%5Bschedule%5D='
                    + '1&extend%5Bstages%5D%5B%24opts%5D%5BmatchCheckinDuration%5D=1&extend%5Bstages%5D%5B%24'
                    + 'opts%5D%5BhasCheckinTimer%5D=1&extend%5Bstages%5D%5B%24opts%5D%5BhasStarted%5D=1&exten'
                    + 'd%5Bstages%5D%5B%24opts%5D%5BhasMatchCheckin%5D=1&extend%5Borganization%5D%5Bowner%5D%'
                    + '5B%24opts%5D%5Btimezone%5D=1&extend%5Borganization%5D%5B%24opts%5D%5Bname%5D=1&extend%'
                    + '5Borganization%5D%5B%24opts%5D%5Bslug%5D=1&extend%5Borganization%5D%5B%24opts%5D%5Bown'
                    + 'erID%5D=1&extend%5Borganization%5D%5B%24opts%5D%5BlogoUrl%5D=1&extend%5Borganization%5'
                    + 'D%5B%24opts%5D%5BbannerUrl%5D=1&extend%5Borganization%5D%5B%24opts%5D%5Bfeatures%5D=1&'
                    + 'extend%5Borganization%5D%5B%24opts%5D%5Bfollowers%5D=1&extend%5Bgame%5D=true&extend%5B'
                    + 'streams%5D%5B%24query%5D%5BdeletedAt%5D%5B%24exists%5D=false');
            expect(mockGet).toHaveBeenCalledWith('https://dtmwra1jsgyb0.cloudfront.net/tournaments/pjaojrtipfj3'
                + 'w09quhf/teams');
        });

        it('handles errors from Battlefy', async () => {
            mockGet.mockResolvedValueOnce({
                data: [{ }]
            }).mockResolvedValueOnce({
                data: {
                    error: 'An error has occurred.'
                }
            });

            const result = getBattlefyTournamentData('pjaojrtipfj3w09quhf');

            await expect(result).rejects.toBe('An error has occurred.');
        });
    });
});
