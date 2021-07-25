import { getBattlefyMatches } from '../battlefyClient';
import axios from 'axios';

describe('battlefyClient', () => {
    jest.mock('axios');
    const mockGet = jest.fn();

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
            axios.get = mockGet;
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
            axios.get = mockGet;
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
            axios.get = mockGet;
            mockGet.mockResolvedValue({ data: { error: 'something has gone wrong' } });

            await expect(getBattlefyMatches('aaaa')).rejects
                .toThrow('Got error from Battlefy: something has gone wrong');
        });

        it('handles missing data', async () => {
            axios.get = mockGet;
            mockGet.mockResolvedValue({ data: [ ]});

            await expect(getBattlefyMatches('aaaa')).rejects
                .toThrow('Couldn\'t get tournament data from Battlefy.');
        });
    });
});
