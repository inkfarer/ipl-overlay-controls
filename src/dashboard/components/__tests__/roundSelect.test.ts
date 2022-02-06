import RoundSelect from '../roundSelect.vue';
import { createStore } from 'vuex';
import { config, mount } from '@vue/test-utils';
import { tournamentDataStoreKey } from '../../store/tournamentDataStore';

describe('RoundSelect', () => {
    config.global.stubs = {
        IplSelect: true
    };

    function createTournamentDataStore() {
        return createStore({
            state: {
                roundStore: {
                    roundone: {
                        meta: {
                            name: 'Round One'
                        }
                    },
                    roundtwo: {
                        meta: {
                            name: 'Round Two'
                        }
                    }
                },
                matchStore: {}
            }
        });
    }

    it('matches snapshot', () => {
        const tournamentDataStore = createTournamentDataStore();
        const wrapper = mount(RoundSelect, {
            global: {
                plugins: [[tournamentDataStore, tournamentDataStoreKey]]
            },
            props: {
                modelValue: 'roundtwo'
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
        expect((wrapper.getComponent('[data-test="round-selector"]').vm.$props as { options: unknown }).options)
            .toMatchSnapshot();
    });

    it('emits expected data on select value change', async () => {
        const tournamentDataStore = createTournamentDataStore();
        const wrapper = mount(RoundSelect, {
            global: {
                plugins: [[tournamentDataStore, tournamentDataStoreKey]]
            },
            props: {
                modelValue: 'roundtwo'
            }
        });

        wrapper.getComponent('[data-test="round-selector"]').vm.$emit('update:modelValue', 'roundone');
        await wrapper.vm.$nextTick();

        const modelValueEmits = wrapper.emitted('update:modelValue');
        const roundDataEmits = wrapper.emitted('update:roundData');
        expect(modelValueEmits.length).toEqual(1);
        expect(roundDataEmits.length).toEqual(1);
        expect(modelValueEmits[0]).toEqual(['roundone']);
        expect(roundDataEmits[0]).toEqual([{ id: 'roundone', roundData: { meta: { name: 'Round One' } } }]);
    });
});
