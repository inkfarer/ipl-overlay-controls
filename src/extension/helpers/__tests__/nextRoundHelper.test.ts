import { GameWinner } from '../../../types/enums/gameWinner';
import { mock } from 'jest-mock-extended';
import type * as TournamentDataHelper from '../tournamentDataHelper';
import { replicants } from '../../__mocks__/mockNodecg';
const mockTournamentDataHelper = mock<typeof TournamentDataHelper>();
jest.mock('../tournamentDataHelper', () => mockTournamentDataHelper);

import { setNextRoundGames, setNextRoundTeams } from '../nextRoundHelper';

describe('nextRoundHelper', () => {
    describe('setNextRoundGames', () => {
        it('sets the value for nextRound', () => {
            replicants.roundStore = {
                aaaaaa: {
                    meta: {
                        name: 'Cool Round'
                    },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker', winner: GameWinner.NO_WINNER },
                        { stage: 'MakoMart', mode: 'Clam Blitz', winner: GameWinner.NO_WINNER },
                        { stage: 'Piranha Pit', mode: 'Tower Control', winner: GameWinner.NO_WINNER }
                    ]
                }
            };
            replicants.nextRound = {
                round: { },
                games: [ ]
            };

            setNextRoundGames('aaaaaa');

            expect(replicants.nextRound).toEqual({
                round: {
                    id: 'aaaaaa',
                    name: 'Cool Round'
                },
                games: [
                    { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                    { stage: 'MakoMart', mode: 'Clam Blitz' },
                    { stage: 'Piranha Pit', mode: 'Tower Control' }
                ]
            });
        });

        it('throws error if round is missing', () => {
            replicants.roundStore = {
                bbbbbb: { }
            };

            expect(() => setNextRoundGames('aaaaaa'))
                .toThrow('translation:nextRoundHelper.roundNotFound');
        });
    });

    describe('setNextRoundTeams', () => {
        it('sets the value for nextRound', () => {
            replicants.nextRound = {
                teamA: { },
                teamB: { }
            };
            mockTournamentDataHelper.getTeam
                // @ts-ignore
                .mockReturnValueOnce('TEAM A')
                // @ts-ignore
                .mockReturnValueOnce('TEAM B');

            setNextRoundTeams('aaa', 'bbb');

            expect(replicants.nextRound).toEqual({
                teamA: 'TEAM A',
                teamB: 'TEAM B'
            });
        });

        it('throws error on missing teams', () => {
            mockTournamentDataHelper.getTeam
                // @ts-ignore
                .mockReturnValueOnce('TEAM A')
                .mockReturnValueOnce(undefined);

            expect(() => setNextRoundTeams('aaa', 'bbb')).toThrow('translation:nextRoundHelper.teamNotFound');
        });
    });
});
