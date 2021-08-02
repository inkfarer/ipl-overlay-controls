import { MockNodecg } from '../../__mocks__/mockNodecg';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';

describe('tournamentDataHelper', () => {
    const mockSetActiveRoundTeams = jest.fn();
    const mockSetNextRoundTeams = jest.fn();
    let helper: {[key: string]: (...args: unknown[]) => unknown};
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

    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();

        nodecg = new MockNodecg();
        nodecg.init();

        helper = require('../tournamentDataHelper');
    });

    describe('updateTeamDataReplicants', () => {
        it('throws error if tournament is missing teams', () => {
            expect(() => helper.updateTeamDataReplicants({ teams: []}))
                .toThrow('Tournament has no teams.');
        });

        it('sorts and assigns team data to tournament data, active round and next round', () => {
            const input = {
                teams: [
                    {
                        id: '2222',
                        name: 'BBBBBBBBBBBB',
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

            helper.updateTeamDataReplicants(input);

            expect(nodecg.replicants.tournamentData.value).toEqual(input);
            expect(mockSetActiveRoundTeams).toHaveBeenCalledWith('1111', '2222');
            expect(mockSetNextRoundTeams).toHaveBeenCalledWith('3333', '4444');
        });

        it('assigns active and next round data if less than 4 teams are available', () => {
            helper.updateTeamDataReplicants({
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
            helper.updateTeamDataReplicants({
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

        it('assigns active and next round data if 3 teams are available', () => {
            helper.updateTeamDataReplicants({
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
    });

    describe('handleRawData', () => {
        it('assigns missing ID and showLogo props to teams if necessary', () => {
            const result = helper.handleRawData([
                {
                    id: '5091758327590',
                    showLogo: false,
                    name: 'Team w/ Props'
                },
                {
                    showLogo: false,
                    name: 'Team w/o ID'
                },
                {
                    id: '5902853092',
                    name: 'Team w/o showLogo'
                },
                {
                    name: 'Team w/o properties'
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
                        name: 'Team w/ Props'
                    },
                    {
                        id: '111111',
                        showLogo: false,
                        name: 'Team w/o ID'
                    },
                    {
                        id: '5902853092',
                        showLogo: true,
                        name: 'Team w/o showLogo'
                    },
                    {
                        id: '222222',
                        showLogo: true,
                        name: 'Team w/o properties'
                    }
                ]
            });
        });
    });
});
