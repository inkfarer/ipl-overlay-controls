import { ActiveRound, NextRound, TournamentData } from 'schemas';
import { MockNodecg } from '../../__mocks__/mockNodecg';

describe('tournamentData', () => {
    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();
        nodecg = new MockNodecg();
        nodecg.init();

        require('../tournamentData');
    });

    describe('toggleTeamImage', () => {
        it('updates data', () => {
            nodecg.replicants.tournamentData.value = {
                teams: [
                    { id: '123', showLogo: false },
                    { id: '345', showLogo: false }
                ]
            };
            nodecg.replicants.activeRound.value = {
                teamA: { id: '123', showLogo: false },
                teamB: { id: 'b', showLogo: false }
            };
            nodecg.replicants.nextRound.value = {
                teamA: { id: 'c', showLogo: false },
                teamB: { id: '123', showLogo: false }
            };

            nodecg.messageListeners['toggleTeamImage']({ teamId: '123', isVisible: true }, undefined);

            const newTeams = (nodecg.replicants.tournamentData.value as TournamentData).teams;
            const activeRound = nodecg.replicants.activeRound.value as ActiveRound;
            const nextRound = nodecg.replicants.nextRound.value as NextRound;

            expect(newTeams[0].showLogo).toBe(true);
            expect(newTeams[1].showLogo).toBe(false);
            expect(activeRound.teamA.showLogo).toBe(true);
            expect(activeRound.teamB.showLogo).toBe(false);
            expect(nextRound.teamA.showLogo).toBe(false);
            expect(nextRound.teamB.showLogo).toBe(true);
        });

        it('acknowledges with an error if no team is found', () => {
            nodecg.replicants.tournamentData.value = {
                teams: [
                    { id: '12345', showLogo: false },
                    { id: '23456', showLogo: false }
                ]
            };
            const mockAck = jest.fn();

            nodecg.messageListeners['toggleTeamImage'](
                { teamId: 'this team does not exist', isVisible: true }, mockAck);

            expect(mockAck).toBeCalledWith(new Error('No team found.'));
        });
    });
});
