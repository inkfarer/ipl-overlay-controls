import RoundSelect from '../roundSelect.vue';
import { config, mount } from '@vue/test-utils';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useTournamentDataStore } from '../../store/tournamentDataStore';
import { IplSelect } from '@iplsplatoon/vue-components';

describe('RoundSelect', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplSelect: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useTournamentDataStore().$state = {
            roundStore: {
                roundone: {
                    // @ts-ignore
                    meta: {
                        name: 'Round One'
                    }
                },
                roundtwo: {
                    // @ts-ignore
                    meta: {
                        name: 'Round Two'
                    }
                }
            },
            matchStore: {}
        };
    });

    it('matches snapshot', () => {
        const wrapper = mount(RoundSelect, {
            global: {
                plugins: [pinia]
            },
            props: {
                modelValue: 'roundtwo'
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
        expect(wrapper.getComponent<typeof IplSelect>('[data-test="round-selector"]').vm.$props.options)
            .toMatchSnapshot();
    });

    it('emits expected data on select value change', async () => {
        const wrapper = mount(RoundSelect, {
            global: {
                plugins: [pinia]
            },
            props: {
                modelValue: 'roundtwo'
            }
        });

        wrapper.getComponent<typeof IplSelect>('[data-test="round-selector"]').vm.$emit('update:modelValue', 'roundone');
        await wrapper.vm.$nextTick();

        const modelValueEmits = wrapper.emitted('update:modelValue');
        const roundDataEmits = wrapper.emitted('update:roundData');
        expect(modelValueEmits.length).toEqual(1);
        expect(roundDataEmits.length).toEqual(2);
        expect(modelValueEmits[0]).toEqual(['roundone']);
        expect(roundDataEmits[1]).toEqual([{ id: 'roundone', roundData: { meta: { name: 'Round One' } } }]);
    });
});
