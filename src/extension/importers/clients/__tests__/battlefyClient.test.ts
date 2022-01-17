import { BattlefyTournamentData } from '../../../types/battlefyTournamentData';

jest.mock('../../mappers/battlefyDataMapper');

import { getBattlefyMatches, getBattlefyTournamentData, getBattlefyTournamentUrl } from '../battlefyClient';
import * as battlefyDataMapper from '../../mappers/battlefyDataMapper';
import axios from 'axios';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import Mock = jest.Mock;

describe('battlefyClient', () => {
    jest.mock('axios');
    const mockGet = jest.fn();
    beforeEach(() => {
        axios.get = mockGet;
    });

    describe('getBattlefyTournamentUrl', () => {
        it('creates URL from tournament data', () => {
            expect(getBattlefyTournamentUrl({
                organization: { slug: 'organizer' },
                slug: 'cool-tournament',
                _id: '123456ABC'
            } as BattlefyTournamentData)).toEqual('https://battlefy.com/organizer/cool-tournament/123456ABC/info?infoTab=details');
        });
    });

    describe('getBattlefyMatches', () => {
        it('fetches highlighted matches', async () => {
            (battlefyDataMapper.mapBattlefyStagesToHighlightedMatches as Mock).mockReturnValue('parsed battlefy data');
            mockGet.mockResolvedValue({ data: [ { stages: 'battlefy stages' } ]});

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
            expect(battlefyDataMapper.mapBattlefyStagesToHighlightedMatches).toHaveBeenCalledWith('battlefy stages');
            expect(result).toEqual('parsed battlefy data');
        });

        it('fetches specified highlighted matches', async () => {
            (battlefyDataMapper.mapBattlefyStagesToHighlightedMatches as Mock).mockReturnValue('parsed battlefy data');
            mockGet.mockResolvedValue({ data: [ { stages: [ { _id: 'swiswsiswis' }, { _id: '123123' } ]} ]});

            const result = await getBattlefyMatches('aaaa', [ 'swiswsiswis' ]);

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
            expect(battlefyDataMapper.mapBattlefyStagesToHighlightedMatches).toHaveBeenCalledWith([ { _id: 'swiswsiswis' } ]);
            expect(result).toEqual('parsed battlefy data');
        });

        it('handles errors from battlefy', async () => {
            mockGet.mockResolvedValue({ data: { error: 'something has gone wrong' } });

            await expect(getBattlefyMatches('aaaa')).rejects
                .toThrow('Got error from Battlefy: something has gone wrong');
        });

        it('handles missing data', async () => {
            mockGet.mockResolvedValue({ data: []});

            await expect(getBattlefyMatches('aaaa')).rejects
                .toThrow('Couldn\'t get tournament data from Battlefy.');
        });
    });

    describe('getBattlefyTournamentData', () => {
        it('fetches tournament data', async () => {
            (battlefyDataMapper.mapBattlefyStagesToTournamentData as Mock).mockReturnValue('stages');
            mockGet.mockResolvedValueOnce({
                data: [
                    {
                        _id: '123123345345',
                        name: 'Cool Tournament',
                        slug: 'cool-tourney',
                        organization: {
                            slug: 'tournament-org'
                        },
                        stages: 'stages from battlefy'
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
                stages: 'stages',
                teams: [
                    {
                        id: 'akfwehjopru48902ujr',
                        logoUrl: 'logo://url',
                        name: 'Team One',
                        players: [
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
                        players: [
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
            expect(battlefyDataMapper.mapBattlefyStagesToTournamentData).toHaveBeenCalledWith('stages from battlefy');
        });

        it('handles errors from Battlefy', async () => {
            mockGet.mockResolvedValueOnce({
                data: [ {} ]
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
