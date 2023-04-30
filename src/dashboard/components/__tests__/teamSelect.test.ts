import TeamSelect from '../teamSelect.vue';
import { config, mount } from '@vue/test-utils';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useTournamentDataStore } from '../../store/tournamentDataStore';
import { IplCheckbox, IplSelect } from '@iplsplatoon/vue-components';

describe('TeamSelect', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplSelect: true,
        IplCheckbox: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useTournamentDataStore().$state = {
            tournamentData: {
                teams: [
                    // @ts-ignore
                    {
                        id: 'teamone',
                        name: 'Team One',
                        showLogo: true
                    },
                    // @ts-ignore
                    {
                        id: 'teamtwo',
                        name: 'Team Two',
                        showLogo: false
                    }
                ]
            }
        };
    });

    it('matches snapshot', () => {
        const wrapper = mount(TeamSelect, {
            global: {
                plugins: [pinia]
            },
            props: {
                modelValue: 'teamone',
                label: 'Team A'
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
        expect(wrapper.getComponent<typeof IplSelect>('[data-test="team-selector"]').vm.$props.options)
            .toMatchSnapshot();
    });

    it('handles setting team image visibility', () => {
        const store = useTournamentDataStore();
        store.setTeamImageHidden = jest.fn();
        const wrapper = mount(TeamSelect, {
            global: {
                plugins: [pinia]
            },
            props: {
                modelValue: 'teamone',
                label: 'Team A'
            }
        });

        wrapper.getComponent<typeof IplCheckbox>('[data-test="team-image-toggle"]').vm.$emit('update:modelValue', false);

        expect(store.setTeamImageHidden).toHaveBeenCalledWith({ teamId: 'teamone', isVisible: false });
    });
});
