import { replicantChangeListeners, replicants } from '../../__mocks__/mockNodecg';

describe('scoreboardData', () => {
    require('../scoreboardData');

    beforeEach(() => {
        replicants.scoreboardData = { flavorText: 'old flavor text' };
        replicants.tournamentData = { meta: { shortName: 'Tournament Name' } };
        replicants.activeRound = { match: { name: 'Match Name' } };
    });

    describe('activeRound:change', () => {
        it('sets flavor text', () => {
            replicantChangeListeners.activeRound({ match: { name: 'New Match Name' } });

            expect(replicants.scoreboardData).toEqual({ flavorText: 'Tournament Name - New Match Name' });
        });

        it('does nothing if match name is unchanged', () => {
            replicantChangeListeners.activeRound({ match: { name: 'Match Name' } }, { match: { name: 'Match Name' } });

            expect(replicants.scoreboardData).toEqual({ flavorText: 'old flavor text' });
        });
    });

    describe('tournamentData:change', () => {
        it('sets flavor text', () => {
            replicantChangeListeners.tournamentData(
                { meta: { shortName: 'New Tournament Name' } },
                { meta: { shortName: 'Old Tournament Name' } });

            expect(replicants.scoreboardData).toEqual({ flavorText: 'New Tournament Name - Match Name' });
        });

        it('does nothing if match name is unchanged', () => {
            replicantChangeListeners.tournamentData(
                { meta: { shortName: 'Tournament Name' } },
                { meta: { shortName: 'Tournament Name' } });

            expect(replicants.scoreboardData).toEqual({ flavorText: 'old flavor text' });
        });
    });
});
