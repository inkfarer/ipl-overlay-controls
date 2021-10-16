import { scoreboardStore } from '../scoreboardStore';
import { replicants } from '../../__mocks__/mockNodecg';
import { ScoreboardData } from 'schemas';

describe('scoreboardStore', () => {
    beforeEach(() => {
        scoreboardStore.replaceState({
            scoreboardData: {
                flavorText: '',
                isVisible: null
            }
        });
    });

    describe('setState', () => {
        it('updates state', () => {
            scoreboardStore.commit('setState', {
                name: 'scoreboardData',
                val: { flavorText: 'new value', isVisible: true }
            });

            expect(scoreboardStore.state.scoreboardData).toEqual({ flavorText: 'new value', isVisible: true });
        });
    });

    describe('setFlavorText', () => {
        it('updates replicant value', () => {
            replicants.scoreboardData = { flavorText: '' };
            scoreboardStore.commit('setFlavorText', 'new text :)');

            expect((replicants.scoreboardData as ScoreboardData).flavorText).toEqual('new text :)');
        });
    });

    describe('setScoreboardVisible', () => {
        it('updates replicant value', () => {
            replicants.scoreboardData = { isVisible: null };
            scoreboardStore.commit('setScoreboardVisible', false);

            expect((replicants.scoreboardData as ScoreboardData).isVisible).toEqual(false);
        });
    });
});
