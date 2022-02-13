import { ActiveRound, NextRound, TournamentData } from 'schemas';

import '../tournamentData';
import { messageListeners, replicants } from '../../__mocks__/mockNodecg';

describe('tournamentData', () => {
    describe('toggleTeamImage', () => {
        it('updates data', () => {
            replicants.tournamentData = {
                teams: [
                    { id: '123', showLogo: false },
                    { id: '345', showLogo: false }
                ]
            };
            replicants.activeRound = {
                teamA: { id: '123', showLogo: false },
                teamB: { id: 'b', showLogo: false }
            };
            replicants.nextRound = {
                teamA: { id: 'c', showLogo: false },
                teamB: { id: '123', showLogo: false }
            };

            messageListeners.toggleTeamImage({ teamId: '123', isVisible: true }, undefined);

            const newTeams = (replicants.tournamentData as TournamentData).teams;
            const activeRound = replicants.activeRound as ActiveRound;
            const nextRound = replicants.nextRound as NextRound;

            expect(newTeams[0].showLogo).toBe(true);
            expect(newTeams[1].showLogo).toBe(false);
            expect(activeRound.teamA.showLogo).toBe(true);
            expect(activeRound.teamB.showLogo).toBe(false);
            expect(nextRound.teamA.showLogo).toBe(false);
            expect(nextRound.teamB.showLogo).toBe(true);
        });

        it('acknowledges with an error if no team is found', () => {
            replicants.tournamentData = {
                teams: [
                    { id: '12345', showLogo: false },
                    { id: '23456', showLogo: false }
                ]
            };
            const mockAck = jest.fn();

            messageListeners.toggleTeamImage(
                { teamId: 'this team does not exist', isVisible: true }, mockAck);

            expect(mockAck).toBeCalledWith(new Error('No team found.'));
        });
    });
});
