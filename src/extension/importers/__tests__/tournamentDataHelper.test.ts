import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { flushPromises } from '@vue/test-utils';
import { mock } from 'jest-mock-extended';
import type * as ActiveRoundHelper from '../../replicants/activeRoundHelper';
import type * as NextRoundHelper from '../../replicants/nextRoundHelper';
import type * as GenerateId from '../../../helpers/generateId';
import type * as RadiaClient from '../clients/radiaClient';
import type * as BattlefyClient from '../clients/battlefyClient';
import type * as BattlefyDataMapper from '../mappers/battlefyDataMapper';
import type * as MatchStoreModule from '../../replicants/matchStore';
import { replicants } from '../../__mocks__/mockNodecg';
const mockActiveRoundHelper = mock<typeof ActiveRoundHelper>();
const mockNextRoundHelper = mock<typeof NextRoundHelper>();
const mockGenerateId = mock<typeof GenerateId>();
const mockRadiaClient = mock<typeof RadiaClient>();
const mockBattlefyClient = mock<typeof BattlefyClient>();
const mockBattlefyDataMapper = mock<typeof BattlefyDataMapper>();
const mockMatchStoreModule = mock<typeof MatchStoreModule>();
jest.mock('../../replicants/activeRoundHelper', () => mockActiveRoundHelper);
jest.mock('../../replicants/nextRoundHelper', () => mockNextRoundHelper);
jest.mock('../../../helpers/generateId', () => mockGenerateId);
jest.mock('../clients/radiaClient', () => mockRadiaClient);
jest.mock('../clients/battlefyClient', () => mockBattlefyClient);
jest.mock('../mappers/battlefyDataMapper', () => mockBattlefyDataMapper);
jest.mock('../../replicants/matchStore', () => mockMatchStoreModule);

import {
    parseUploadedTeamData,
    updateRadiaTournamentData,
    updateTournamentDataReplicants
} from '../tournamentDataHelper';

describe('tournamentDataHelper', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();

        replicants.radiaSettings = { guildID: '', updateOnImport: false };
    });

    describe('updateTournamentDataReplicants', () => {
        beforeEach(() => {
            replicants.activeRound = { active: 'round' };
        });

        it('throws error if tournament is missing teams', () => {
            // @ts-ignore
            expect(() => updateTournamentDataReplicants({ teams: []}))
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

            // @ts-ignore
            updateTournamentDataReplicants(input);

            expect(replicants.tournamentData).toEqual(input);
            expect(mockActiveRoundHelper.setActiveRoundTeams).toHaveBeenCalledWith({ active: 'round' }, '1111', '2222');
            expect(mockNextRoundHelper.setNextRoundTeams).toHaveBeenCalledWith('3333', '4444');
            expect(mockMatchStoreModule.clearMatchesWithUnknownTeams).toHaveBeenCalled();
        });

        it('assigns active and next round data if less than 4 teams are available', () => {
            updateTournamentDataReplicants({
                teams: [
                    // @ts-ignore
                    {
                        id: '121212',
                        name: 'Cool Team'
                    },
                    // @ts-ignore
                    {
                        id: '232323',
                        name: 'Cool Team 2'
                    }
                ]
            });

            expect(mockActiveRoundHelper.setActiveRoundTeams).toHaveBeenCalledWith({ active: 'round' }, '121212', '232323');
            expect(mockNextRoundHelper.setNextRoundTeams).toHaveBeenCalledWith('121212', '232323');
        });

        it('assigns active and next round data if 1 team is available', () => {
            updateTournamentDataReplicants({
                teams: [
                    // @ts-ignore
                    {
                        id: '121212',
                        name: 'Cool Team'
                    }
                ]
            });

            expect(mockActiveRoundHelper.setActiveRoundTeams).toHaveBeenCalledWith({ active: 'round' }, '121212', '121212');
            expect(mockNextRoundHelper.setNextRoundTeams).toHaveBeenCalledWith('121212', '121212');
        });

        it('shortens overlong team and player names', () => {
            updateTournamentDataReplicants({
                teams: [
                    // @ts-ignore
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

            expect(replicants.tournamentData).toEqual({
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
            updateTournamentDataReplicants({
                teams: [
                    // @ts-ignore
                    {
                        id: '121212',
                        name: 'Cool Team'
                    },
                    // @ts-ignore
                    {
                        id: '232323',
                        name: 'Cool Team 2'
                    },
                    // @ts-ignore
                    {
                        id: '343434',
                        name: 'Cool Team 3'
                    }
                ]
            });

            expect(mockActiveRoundHelper.setActiveRoundTeams).toHaveBeenCalledWith({ active: 'round' }, '121212', '232323');
            expect(mockNextRoundHelper.setNextRoundTeams).toHaveBeenCalledWith('232323', '343434');
        });

        it('updates Radia data', async () => {
            replicants.radiaSettings = { guildID: 'guild-id', updateOnImport: true };
            // @ts-ignore
            mockRadiaClient.updateTournamentData.mockResolvedValue({});

            updateTournamentDataReplicants({
                // @ts-ignore
                meta: {
                    name: 'Cool tournament',
                    url: 'tournament://cool'
                },
                teams: [
                    // @ts-ignore
                    {
                        id: '121212',
                        name: 'Cool Team'
                    },
                    // @ts-ignore
                    {
                        id: '232323',
                        name: 'Cool Team 2'
                    },
                    // @ts-ignore
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
        beforeEach(() => {
            mockGenerateId.generateId
                .mockReturnValueOnce('111111')
                .mockReturnValueOnce('222222');
        });

        it('throws error if empty array is given', async () => {
            // @ts-ignore
            await expect(() => parseUploadedTeamData([])).rejects.toThrow('Provided data is missing teams.');
        });

        it('assigns missing ID and showLogo props to teams if necessary', async () => {
            const result = await parseUploadedTeamData([
                {
                    id: '5091758327590',
                    showLogo: false,
                    name: 'Team w/ Props',
                    players: []
                },
                // @ts-ignore
                {
                    showLogo: false,
                    name: 'Team w/o ID',
                    players: []
                },
                // @ts-ignore
                {
                    id: '5902853092',
                    name: 'Team w/o showLogo',
                    players: []
                },
                // @ts-ignore
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
            const result = await parseUploadedTeamData({
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
                    // @ts-ignore
                    {
                        showLogo: false,
                        name: 'Team w/o ID',
                        players: []
                    },
                    // @ts-ignore
                    {
                        id: '5902853092',
                        name: 'Team w/o showLogo',
                        players: []
                    },
                    // @ts-ignore
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
                // @ts-ignore
                stages: 'battlefy stages',
                name: 'Cool Tournament'
            });
            // @ts-ignore
            mockBattlefyDataMapper.mapBattlefyStagesToTournamentData.mockReturnValue('parsed battlefy stages');

            const result = await parseUploadedTeamData({
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
                    // @ts-ignore
                    {
                        showLogo: false,
                        name: 'Team w/o ID',
                        players: []
                    },
                    // @ts-ignore
                    {
                        id: '5902853092',
                        name: 'Team w/o showLogo',
                        players: []
                    },
                    // @ts-ignore
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
            await expect(parseUploadedTeamData({
                // @ts-ignore
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
            await expect(parseUploadedTeamData({
                // @ts-ignore
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
            await expect(() => parseUploadedTeamData({
                meta: {
                    id: '123123',
                    source: 'SMASHGG',
                },
                teams: undefined
            }, 'tournament://rad-tournament')).rejects.toThrow('Provided data is missing teams.');
        });

        it('throws error if input has no teams', async () => {
            await expect(() => parseUploadedTeamData({
                meta: {
                    id: '123123',
                    source: 'SMASHGG'
                },
                teams: []
            }, 'tournament://rad-tournament')).rejects.toThrow('Provided data is missing teams.');
        });

        it('throws error if input is not array or object', async () => {
            const expectedError = 'Invalid data provided to parseUploadedTeamData()';

            // @ts-ignore
            await expect(() => parseUploadedTeamData('foobar', '')).rejects.toThrow(expectedError);
            // @ts-ignore
            await expect(() => parseUploadedTeamData(1234, '')).rejects.toThrow(expectedError);
            await expect(() => parseUploadedTeamData(null, '')).rejects.toThrow(expectedError);
        });
    });

    describe('updateRadiaTournamentData', () => {
        it('updates radia tournament data', () => {
            replicants.radiaSettings = { updateOnImport: true, guildID: 'cool-guild' };
            updateRadiaTournamentData('cool-tournament', 'Cool Tournament');

            expect(mockRadiaClient.updateTournamentData).toHaveBeenCalledWith('cool-guild', 'cool-tournament', 'Cool Tournament');
        });

        it('does not update data if updating on import is disabled', () => {
            replicants.radiaSettings = { updateOnImport: false, guildID: 'cool-guild' };
            updateRadiaTournamentData('cool-tournament', 'Cool Tournament');

            expect(mockRadiaClient.updateTournamentData).not.toHaveBeenCalled();
        });

        it('does not update data if guild id is missing', () => {
            replicants.radiaSettings = { updateOnImport: true, guildID: '' };
            updateRadiaTournamentData('cool-tournament', 'Cool Tournament');

            expect(mockRadiaClient.updateTournamentData).not.toHaveBeenCalled();
        });

        it('does not update data if tournament name is missing', () => {
            replicants.radiaSettings = { updateOnImport: true, guildID: 'cool-guild' };
            updateRadiaTournamentData('cool-tournament', undefined);

            expect(mockRadiaClient.updateTournamentData).not.toHaveBeenCalled();
        });

        it('does not update data if tournament name is missing', () => {
            replicants.radiaSettings = { updateOnImport: true, guildID: 'cool-guild' };
            updateRadiaTournamentData(undefined, 'Cool Tourney');

            expect(mockRadiaClient.updateTournamentData).not.toHaveBeenCalled();
        });
    });
});
