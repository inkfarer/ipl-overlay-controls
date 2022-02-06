import TeamSelect from '../teamSelect.vue';
import { createStore } from 'vuex';
import { config, mount } from '@vue/test-utils';
import { tournamentDataStoreKey } from '../../store/tournamentDataStore';

describe('TeamSelect', () => {
    config.global.stubs = {
        IplSelect: true,
        IplCheckbox: true
    };

    function createTournamentDataStore() {
        return createStore({
            state: {
                tournamentData: {
                    teams: [
                        {
                            id: 'teamone',
                            name: 'Team One',
                            showLogo: true
                        },
                        {
                            id: 'teamtwo',
                            name: 'Team Two',
                            showLogo: false
                        }
                    ]
                }
            },
            actions: {
                setTeamImageHidden: jest.fn()
            }
        });
    }

    it('matches snapshot', () => {
        const store = createTournamentDataStore();
        const wrapper = mount(TeamSelect, {
            global: {
                plugins: [[store, tournamentDataStoreKey]]
            },
            props: {
                modelValue: 'teamone',
                label: 'Team A'
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
        expect((wrapper.getComponent('[data-test="team-selector"]').vm.$props as { options: unknown }).options)
            .toMatchSnapshot();
    });

    it('handles setting team image visibility', () => {
        const store = createTournamentDataStore();
        jest.spyOn(store, 'dispatch');
        const wrapper = mount(TeamSelect, {
            global: {
                plugins: [[store, tournamentDataStoreKey]]
            },
            props: {
                modelValue: 'teamone',
                label: 'Team A'
            }
        });

        wrapper.getComponent('[data-test="team-image-toggle"]').vm.$emit('update:modelValue', false);

        expect(store.dispatch).toHaveBeenCalledWith('setTeamImageHidden', { teamId: 'teamone', isVisible: false });
    });
});
