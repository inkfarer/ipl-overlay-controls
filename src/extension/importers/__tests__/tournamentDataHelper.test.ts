import { MockNodecg } from '../../__mocks__/mockNodecg';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { Module } from '../../../helpers/__mocks__/module';
import { flushPromises } from '@vue/test-utils';

describe('tournamentDataHelper', () => {
    const mockSetActiveRoundTeams = jest.fn();
    const mockSetNextRoundTeams = jest.fn();
    const mockRadiaClient = {
        __esModule: true,
        updateTournamentData: jest.fn()
    };
    const mockBattlefyClient = {
        __esModule: true,
        getBattlefyTournamentInfo: jest.fn()
    };
    const mockBattlefyDataMapper = {
        __esModule: true,
        mapBattlefyStagesToTournamentData: jest.fn()
    };
    let helper: Module;
    let nodecg: MockNodecg;

    jest.mock('../../replicants/activeRoundHelper', () => ({
        __esModule: true,
        setActiveRoundTeams: mockSetActiveRoundTeams
    }));

    jest.mock('../../replicants/nextRoundHelper', () => ({
        __esModule: true,
        setNextRoundTeams: mockSetNextRoundTeams
    }));

    jest.mock('../../../helpers/generateId', () => ({
        __esModule: true,
        generateId: jest.fn()
            .mockReturnValueOnce('111111')
            .mockReturnValueOnce('222222')
    }));

    jest.mock('../clients/radiaClient', () => mockRadiaClient);

    jest.mock('../clients/battlefyClient', () => mockBattlefyClient);

    jest.mock('../mappers/battlefyDataMapper', () => mockBattlefyDataMapper);

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();

        nodecg = new MockNodecg({});
        nodecg.init();

        helper = require('../tournamentDataHelper');
        nodecg.replicants.radiaSettings.value = { guildID: '', updateOnImport: false };
    });

    describe('updateTournamentDataReplicants', () => {
        it('throws error if tournament is missing teams', () => {
            expect(() => helper.updateTournamentDataReplicants({ teams: []}))
                .toThrow('Tournament has no teams.');
        });

        it('sorts and assigns team data to tournament data, active round and next round', () => {
            const input = {
                teams: [
                    {
                        id: '2222',
                        name: 'BBBBBBBBBBBB'
                    },
                    {
                        id: '1111',
                        name: 'AAAAAAAAAA'
                    },
                    {
                        id: '5555',
                        name: 'FFFFFFFFFFFF'
                    },
                    {
                        id: '4444',
                        name: 'ddddddddd'
                    },
                    {
                        id: '3333',
                        name: 'CCCCCCCCCC'
                    }
                ]
            };

            helper.updateTournamentDataReplicants(input);

            expect(nodecg.replicants.tournamentData.value).toEqual(input);
            expect(mockSetActiveRoundTeams).toHaveBeenCalledWith('1111', '2222');
            expect(mockSetNextRoundTeams).toHaveBeenCalledWith('3333', '4444');
        });

        it('assigns active and next round data if less than 4 teams are available', () => {
            helper.updateTournamentDataReplicants({
                teams: [
                    {
                        id: '121212',
                        name: 'Cool Team'
                    },
                    {
                        id: '232323',
                        name: 'Cool Team 2'
                    }
                ]
            });

            expect(mockSetActiveRoundTeams).toHaveBeenCalledWith('121212', '232323');
            expect(mockSetNextRoundTeams).toHaveBeenCalledWith('121212', '232323');
        });

        it('assigns active and next round data if 1 team is available', () => {
            helper.updateTournamentDataReplicants({
                teams: [
                    {
                        id: '121212',
                        name: 'Cool Team'
                    }
                ]
            });

            expect(mockSetActiveRoundTeams).toHaveBeenCalledWith('121212', '121212');
            expect(mockSetNextRoundTeams).toHaveBeenCalledWith('121212', '121212');
        });

        it('shortens overlong team and player names', () => {
            helper.updateTournamentDataReplicants({
                teams: [
                    {
                        id: '121212',
                        name: 'Cool Tea' + 'a'.repeat(1000),
                        players: [
                            { name: 'a'.repeat(999) },
                            { name: 'b'.repeat(900) }
                        ]
                    }
                ]
            });

            expect(nodecg.replicants.tournamentData.value).toEqual({
                teams: [
                    {
                        id: '121212',
                        name: 'Cool Tea' + 'a'.repeat(501) + '...',
                        players: [
                            { name: 'a'.repeat(509) + '...' },
                            { name: 'b'.repeat(509) + '...' }
                        ]
                    }
                ]
            });
        });

        it('assigns active and next round data if 3 teams are available', () => {
            helper.updateTournamentDataReplicants({
                teams: [
                    {
                        id: '121212',
                        name: 'Cool Team'
                    },
                    {
                        id: '232323',
                        name: 'Cool Team 2'
                    },
                    {
                        id: '343434',
                        name: 'Cool Team 3'
                    }
                ]
            });

            expect(mockSetActiveRoundTeams).toHaveBeenCalledWith('121212', '232323');
            expect(mockSetNextRoundTeams).toHaveBeenCalledWith('232323', '343434');
        });

        it('updates Radia data', async () => {
            nodecg.replicants.radiaSettings.value = { guildID: 'guild-id', updateOnImport: true };
            mockRadiaClient.updateTournamentData.mockResolvedValue({});

            helper.updateTournamentDataReplicants({
                meta: {
                    name: 'Cool tournament',
                    url: 'tournament://cool'
                },
                teams: [
                    {
                        id: '121212',
                        name: 'Cool Team'
                    },
                    {
                        id: '232323',
                        name: 'Cool Team 2'
                    },
                    {
                        id: '343434',
                        name: 'Cool Team 3'
                    }
                ]
            });
            await flushPromises();

            expect(mockRadiaClient.updateTournamentData)
                .toHaveBeenCalledWith('guild-id', 'tournament://cool', 'Cool tournament');
        });
    });

    describe('parseUploadedTeamData', () => {
        it('throws error if empty array is given', async () => {
            await expect(() => helper.parseUploadedTeamData([])).rejects.toThrow('Provided data is missing teams.');
        });

        it('assigns missing ID and showLogo props to teams if necessary', async () => {
            const result = await helper.parseUploadedTeamData([
                {
                    id: '5091758327590',
                    showLogo: false,
                    name: 'Team w/ Props',
                    players: []
                },
                {
                    showLogo: false,
                    name: 'Team w/o ID',
                    players: []
                },
                {
                    id: '5902853092',
                    name: 'Team w/o showLogo',
                    players: []
                },
                {
                    name: 'Team w/o properties',
                    players: []
                }
            ], 'tournament://cool-tourney');

            expect(result).toEqual({
                meta: {
                    id: 'tournament://cool-tourney',
                    source: TournamentDataSource.UPLOAD
                },
                teams: [
                    {
                        id: '5091758327590',
                        showLogo: false,
                        name: 'Team w/ Props',
                        players: []
                    },
                    {
                        id: '111111',
                        showLogo: false,
                        name: 'Team w/o ID',
                        players: []
                    },
                    {
                        id: '5902853092',
                        showLogo: true,
                        name: 'Team w/o showLogo',
                        players: []
                    },
                    {
                        id: '222222',
                        showLogo: true,
                        name: 'Team w/o properties',
                        players: []
                    }
                ]
            });
        });

        it('handles full tournament data object as input', async () => {
            const result = await helper.parseUploadedTeamData({
                meta: {
                    id: '123123',
                    source: 'SMASHGG'
                },
                teams: [
                    {
                        id: '5091758327590',
                        showLogo: false,
                        name: 'Team w/ Props',
                        players: []
                    },
                    {
                        showLogo: false,
                        name: 'Team w/o ID',
                        players: []
                    },
                    {
                        id: '5902853092',
                        name: 'Team w/o showLogo',
                        players: []
                    },
                    {
                        name: 'Team w/o properties',
                        players: []
                    }
                ]}, 'tournament://rad-tournament');

            expect(result).toEqual({
                meta: {
                    id: '123123',
                    source: 'SMASHGG'
                },
                teams: [
                    {
                        id: '5091758327590',
                        showLogo: false,
                        name: 'Team w/ Props',
                        players: []
                    },
                    {
                        id: '111111',
                        showLogo: false,
                        name: 'Team w/o ID',
                        players: []
                    },
                    {
                        id: '5902853092',
                        showLogo: true,
                        name: 'Team w/o showLogo',
                        players: []
                    },
                    {
                        id: '222222',
                        showLogo: true,
                        name: 'Team w/o properties',
                        players: []
                    }
                ]
            });
        });

        it('fetches additional data for battlefy tournaments', async () => {
            mockBattlefyClient.getBattlefyTournamentInfo.mockResolvedValue({
                stages: 'battlefy stages',
                name: 'Cool Tournament'
            });
            mockBattlefyDataMapper.mapBattlefyStagesToTournamentData.mockReturnValue('parsed battlefy stages');

            const result = await helper.parseUploadedTeamData({
                meta: {
                    id: '123123',
                    source: TournamentDataSource.BATTLEFY
                },
                teams: [
                    {
                        id: '5091758327590',
                        showLogo: false,
                        name: 'Team w/ Props',
                        players: []
                    },
                    {
                        showLogo: false,
                        name: 'Team w/o ID',
                        players: []
                    },
                    {
                        id: '5902853092',
                        name: 'Team w/o showLogo',
                        players: []
                    },
                    {
                        name: 'Team w/o properties',
                        players: []
                    }
                ]}, 'tournament://rad-tournament');

            expect(result).toEqual({
                meta: {
                    id: '123123',
                    source: TournamentDataSource.BATTLEFY,
                    name: 'Cool Tournament'
                },
                teams: [
                    {
                        id: '5091758327590',
                        showLogo: false,
                        name: 'Team w/ Props',
                        players: []
                    },
                    {
                        id: '111111',
                        showLogo: false,
                        name: 'Team w/o ID',
                        players: []
                    },
                    {
                        id: '5902853092',
                        showLogo: true,
                        name: 'Team w/o showLogo',
                        players: []
                    },
                    {
                        id: '222222',
                        showLogo: true,
                        name: 'Team w/o properties',
                        players: []
                    }
                ],
                stages: 'parsed battlefy stages'
            });
        });

        it('replaces missing source and id with defaults', async () => {
            await expect(helper.parseUploadedTeamData({
                meta: {},
                teams: [
                    {
                        id: '5091758327590',
                        showLogo: false,
                        name: 'Team w/ Props',
                        players: []
                    }
                ]
            }, 'tournament://rad-tournament')).resolves.toEqual({
                meta: {
                    id: 'tournament://rad-tournament',
                    source: TournamentDataSource.UPLOAD
                },
                teams: [
                    {
                        id: '5091758327590',
                        showLogo: false,
                        name: 'Team w/ Props',
                        players: []
                    }
                ]
            });
        });

        it('shortens overlong team and player names', async () => {
            await expect(helper.parseUploadedTeamData({
                meta: {},
                teams: [
                    {
                        id: '5091758327590',
                        showLogo: false,
                        name: 'T'.repeat(999),
                        players: [
                            { name: 'g'.repeat(1234) }
                        ]
                    }
                ]
            }, 'tournament://rad-tournament')).resolves.toEqual({
                meta: {
                    id: 'tournament://rad-tournament',
                    source: TournamentDataSource.UPLOAD
                },
                teams: [
                    {
                        id: '5091758327590',
                        showLogo: false,
                        name: 'T'.repeat(509) + '...',
                        players: [
                            { name: 'g'.repeat(509) + '...' }
                        ]
                    }
                ]
            });
        });

        it('throws error if input is missing teams', async () => {
            await expect(() => helper.parseUploadedTeamData({
                meta: {
                    id: '123123',
                    source: 'SMASHGG',
                },
                teams: undefined
            }, 'tournament://rad-tournament')).rejects.toThrow('Provided data is missing teams.');
        });

        it('throws error if input has no teams', async () => {
            await expect(() => helper.parseUploadedTeamData({
                meta: {
                    id: '123123',
                    source: 'SMASHGG'
                },
                teams: []
            }, 'tournament://rad-tournament')).rejects.toThrow('Provided data is missing teams.');
        });

        it('throws error if input is not array or object', async () => {
            const expectedError = 'Invalid data provided to parseUploadedTeamData()';

            await expect(() => helper.parseUploadedTeamData('foobar', '')).rejects.toThrow(expectedError);
            await expect(() => helper.parseUploadedTeamData(1234, '')).rejects.toThrow(expectedError);
            await expect(() => helper.parseUploadedTeamData(null, '')).rejects.toThrow(expectedError);
        });
    });

    describe('updateRadiaTournamentData', () => {
        it('updates radia tournament data', () => {
            nodecg.replicants.radiaSettings.value = { updateOnImport: true, guildID: 'cool-guild' };
            helper.updateRadiaTournamentData('cool-tournament', 'Cool Tournament');

            expect(mockRadiaClient.updateTournamentData).toHaveBeenCalledWith('cool-guild', 'cool-tournament', 'Cool Tournament');
        });

        it('does not update data if updating on import is disabled', () => {
            nodecg.replicants.radiaSettings.value = { updateOnImport: false, guildID: 'cool-guild' };
            helper.updateRadiaTournamentData('cool-tournament', 'Cool Tournament');

            expect(mockRadiaClient.updateTournamentData).not.toHaveBeenCalled();
        });

        it('does not update data if guild id is missing', () => {
            nodecg.replicants.radiaSettings.value = { updateOnImport: true, guildID: '' };
            helper.updateRadiaTournamentData('cool-tournament', 'Cool Tournament');

            expect(mockRadiaClient.updateTournamentData).not.toHaveBeenCalled();
        });

        it('does not update data if tournament name is missing', () => {
            nodecg.replicants.radiaSettings.value = { updateOnImport: true, guildID: 'cool-guild' };
            helper.updateRadiaTournamentData('cool-tournament', undefined);

            expect(mockRadiaClient.updateTournamentData).not.toHaveBeenCalled();
        });

        it('does not update data if tournament name is missing', () => {
            nodecg.replicants.radiaSettings.value = { updateOnImport: true, guildID: 'cool-guild' };
            helper.updateRadiaTournamentData(undefined, 'Cool Tourney');

            expect(mockRadiaClient.updateTournamentData).not.toHaveBeenCalled();
        });
    });
});
