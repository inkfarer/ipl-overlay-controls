import TeamRosterDisplay from '../teamRosterDisplay.vue';
import { mount } from '@vue/test-utils';
import { ActiveRoundTeam } from 'schemas';

describe('TeamRosterDisplay', () => {
    it('matches snapshot', () => {
        const wrapper = mount(TeamRosterDisplay, {
            props: {
                team: {
                    name: 'Cool Team',
                    players: [
                        { name: 'player one' },
                        { name: 'player two' },
                        { name: 'player three' },
                        { name: 'player four' }
                    ]
                } as ActiveRoundTeam
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot with overlong names', () => {
        const wrapper = mount(TeamRosterDisplay, {
            props: {
                team: {
                    name: 'Cool Team Cool Team Cool Team Cool Team Cool Team Cool Team',
                    players: [
                        { name: 'player one' },
                        { name: 'player two' },
                        { name: 'player three player three player three player three player three player three player three player three' },
                        { name: 'player four' }
                    ]
                } as ActiveRoundTeam
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });
});
