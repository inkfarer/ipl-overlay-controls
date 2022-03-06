import { replicants } from '../../__mocks__/mockNodecg';
import { ScoreboardData } from 'schemas';
import { createPinia, setActivePinia } from 'pinia';
import { useScoreboardStore } from '../scoreboardStore';

describe('scoreboardStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('setFlavorText', () => {
        it('updates replicant value', () => {
            const store = useScoreboardStore();
            replicants.scoreboardData = { flavorText: '' };

            store.setFlavorText('new text :)');

            expect((replicants.scoreboardData as ScoreboardData).flavorText).toEqual('new text :)');
        });
    });

    describe('setScoreboardVisible', () => {
        it('updates replicant value', () => {
            replicants.scoreboardData = { isVisible: null };
            const store = useScoreboardStore();

            store.setScoreboardVisible(false);

            expect((replicants.scoreboardData as ScoreboardData).isVisible).toEqual(false);
        });
    });
});
