import { replicants } from '../../__mocks__/mockNodecg';
import { PlayType } from '../../../types/enums/playType';
import { mock } from 'jest-mock-extended';
import type * as ActiveRoundHelper from '../../replicants/activeRoundHelper';
import type * as GenerateId from '../../../helpers/generateId';
import { GameWinner } from '../../../types/enums/gameWinner';
const mockActiveRoundHelper = mock<typeof ActiveRoundHelper>();
jest.mock('../../replicants/activeRoundHelper', () => mockActiveRoundHelper);
const mockGenerateId = mock<typeof GenerateId>();
jest.mock('../../../helpers/generateId', () => mockGenerateId);

import { resetMatchStore, setActiveRoundToFirstMatch } from '../matchStoreHelper';
import { GameVersion } from '../../../types/enums/gameVersion';

describe('matchStoreHelper', () => {
    describe('resetMatchStore', () => {
        it('sets match store value to a single match created from data from the first round and teams', () => {
            replicants.roundStore = {
                roundone: {
                    meta: {
                        name: 'Cool Round',
                        type: PlayType.BEST_OF
                    },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Splat Zones' },
                        { stage: 'MakoMart', mode: 'Turf War' }
                    ]
                },
                roundtwo: {}
            };
            replicants.tournamentData = {
                teams: [
                    { id: 'teamone' },
                    { id: 'teamtwo' },
                    { id: 'teamthree' }
                ]
            };
            replicants.activeRound = 'active round value';
            mockGenerateId.generateId.mockReturnValue('new id');

            resetMatchStore();

            expect(replicants.matchStore).toEqual({
                'new id': {
                    meta: {
                        name: 'Cool Round',
                        isCompleted: false,
                        type: PlayType.BEST_OF
                    },
                    teamA: {
                        id: 'teamone',
                        score: 0
                    },
                    teamB: {
                        id: 'teamtwo',
                        score: 0
                    },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Splat Zones', winner: GameWinner.NO_WINNER },
                        { stage: 'MakoMart', mode: 'Turf War', winner: GameWinner.NO_WINNER }
                    ]
                }
            });
            expect(mockActiveRoundHelper.setActiveRoundGames).toHaveBeenCalledWith('active round value', 'new id');
            expect(mockActiveRoundHelper.setActiveRoundTeams)
                .toHaveBeenCalledWith('active round value', 'teamone', 'teamtwo');
        });
    });

    describe('setActiveRoundToFirstMatch', () => {
        it('updates active round data', () => {
            replicants.activeRound = {};
            replicants.matchStore = {
                matchone: {
                    teamA: { id: 'teamone' },
                    teamB: { id: 'teamtwo' }
                },
                matchtwo: {}
            };

            setActiveRoundToFirstMatch();

            expect(mockActiveRoundHelper.setActiveRoundGames).toHaveBeenCalledWith({}, 'matchone');
            expect(mockActiveRoundHelper.setActiveRoundTeams)
                .toHaveBeenCalledWith({}, 'teamone', 'teamtwo');
            expect(replicants.activeRound).toEqual({});
        });

        it('resets color data if required', () => {
            const activeRound = {
                teamA: {
                    id: 'teamone',
                    color: '#fff'
                },
                teamB: {
                    id: 'teamtwo',
                    color: '#ddd'
                },
                activeColor: {
                    index: 1,
                    title: 'Cool Color',
                    categoryName: 'Cool Category',
                    isCustom: false,
                    clrNeutral: '#aaa'
                }
            };
            replicants.activeRound = activeRound;
            replicants.matchStore = {
                matchone: {
                    teamA: { id: 'teamone' },
                    teamB: { id: 'teamtwo' }
                },
                matchtwo: {}
            };
            replicants.swapColorsInternally = false;
            replicants.runtimeConfig = { gameVersion: GameVersion.SPLATOON_2 };

            setActiveRoundToFirstMatch(true);

            expect(mockActiveRoundHelper.setActiveRoundGames).toHaveBeenCalledWith(expect.anything(), 'matchone');
            expect(mockActiveRoundHelper.setActiveRoundTeams)
                .toHaveBeenCalledWith(expect.anything(), 'teamone', 'teamtwo');
            expect(replicants.activeRound).toEqual({
                activeColor: {
                    categoryName: 'Ranked Modes',
                    clrNeutral: '#F4067E',
                    index: 0,
                    title: 'Green vs Grape',
                    isCustom: false
                },
                teamA: {
                    color: '#37FC00',
                    id: 'teamone'
                },
                teamB: {
                    color: '#7D28FC',
                    id: 'teamtwo'
                }
            });
        });

        it('resets color data if required and colors are swapped', () => {
            const activeRound = {
                teamA: {
                    id: 'teamone',
                    color: '#fff'
                },
                teamB: {
                    id: 'teamtwo',
                    color: '#ddd'
                },
                activeColor: {
                    index: 1,
                    title: 'Cool Color',
                    categoryName: 'Cool Category',
                    isCustom: false,
                    clrNeutral: '#aaa'
                }
            };
            replicants.activeRound = activeRound;
            replicants.matchStore = {
                matchone: {
                    teamA: { id: 'teamone' },
                    teamB: { id: 'teamtwo' }
                },
                matchtwo: {}
            };
            replicants.swapColorsInternally = true;
            replicants.runtimeConfig = { gameVersion: GameVersion.SPLATOON_2 };

            setActiveRoundToFirstMatch(true);

            expect(mockActiveRoundHelper.setActiveRoundGames).toHaveBeenCalledWith(expect.anything(), 'matchone');
            expect(mockActiveRoundHelper.setActiveRoundTeams)
                .toHaveBeenCalledWith(expect.anything(), 'teamone', 'teamtwo');
            expect(replicants.activeRound).toEqual({
                activeColor: {
                    categoryName: 'Ranked Modes',
                    clrNeutral: '#F4067E',
                    index: 0,
                    title: 'Green vs Grape',
                    isCustom: false
                },
                teamA: {
                    color: '#7D28FC',
                    id: 'teamone'
                },
                teamB: {
                    color: '#37FC00',
                    id: 'teamtwo'
                }
            });
        });
    });
});
