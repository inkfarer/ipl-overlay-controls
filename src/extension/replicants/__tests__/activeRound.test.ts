import { MockNodecg } from '../../__mocks__/mockNodecg';
import { ActiveRound } from 'schemas';

describe('activeRound', () => {
    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();
        nodecg = new MockNodecg();
        nodecg.init();

        require('../activeRound');
    });

    describe('swapColorsInternally', () => {
        it('swaps colors on change', () => {
            nodecg.replicants.activeRound.value = {
                teamA: {
                    color: 'Team A Color'
                },
                teamB: {
                    color: 'Team B Color'
                }
            };

            nodecg.replicantListeners.swapColorsInternally(true, false);

            const activeRound = nodecg.replicants.activeRound.value as ActiveRound;
            expect(activeRound.teamA.color).toBe('Team B Color');
            expect(activeRound.teamB.color).toBe('Team A Color');
        });

        it('does nothing when the old value is missing', () => {
            const activeRoundValue = {
                teamA: {
                    color: 'Team A Color'
                },
                teamB: {
                    color: 'Team B Color'
                }
            };
            nodecg.replicants.activeRound.value = activeRoundValue;

            nodecg.replicantListeners.swapColorsInternally(true, undefined);

            expect(nodecg.replicants.activeRound.value).toEqual(activeRoundValue);
        });
    });
});
