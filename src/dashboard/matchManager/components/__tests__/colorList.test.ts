import ColorList from '../colorList.vue';
import { useActiveRoundStore } from '../../../store/activeRoundStore';
import { GameWinner } from 'types/enums/gameWinner';
import { config, mount } from '@vue/test-utils';
import { GameVersion } from 'types/enums/gameVersion';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useSettingsStore } from '../../../store/settingsStore';
import { IplButton, IplCheckbox, IplInput } from '@iplsplatoon/vue-components';

describe('ColorList', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplCheckbox: true,
        IplInput: true,
        IplButton: true,
        FontAwesomeIcon: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        useActiveRoundStore().$state = {
            activeRound: {
                teamA: {
                    score: 0,
                    id: null,
                    name: null,
                    showLogo: null,
                    players: null,
                    color: '#889'
                },
                teamB: {
                    score: 2,
                    id: null,
                    name: null,
                    showLogo: null,
                    players: null,
                    color: '#999'
                },
                activeColor: {
                    title: 'Yellow vs Blue',
                    colorKey: 'yellowBlue',
                    index: 6,
                    categoryName: 'Ranked Modes',
                    categoryKey: 'rankedModes',
                    isCustom: false,
                    clrNeutral: '#FD5600'
                },
                match: null,
                games: [
                    {
                        winner: GameWinner.BRAVO,
                        stage: null,
                        mode: null
                    },
                    {
                        winner: GameWinner.BRAVO,
                        stage: null,
                        mode: null
                    },
                    {
                        winner: GameWinner.NO_WINNER,
                        stage: null,
                        mode: null
                    },
                ],
            },
            swapColorsInternally: false
        };

        useSettingsStore().$state = {
            // @ts-ignore
            runtimeConfig: {
                gameVersion: GameVersion.SPLATOON_2
            }
        };
    });

    it('matches snapshot', () => {
        const wrapper = mount(ColorList, {
            global: {
                plugins: [ pinia ]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when color names are shown', async () => {
        const wrapper = mount(ColorList, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent<typeof IplCheckbox>('[data-test="color-names-toggle"]').vm.$emit('update:modelValue', true);
        await wrapper.vm.$nextTick();

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when using custom color', () => {
        const store = useActiveRoundStore();
        store.activeRound.activeColor.isCustom = true;
        const wrapper = mount(ColorList, {
            global: {
                plugins: [ pinia ]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('sets color on option click', async () => {
        const store = useActiveRoundStore();
        store.setActiveColor = jest.fn();
        const wrapper = mount(ColorList, {
            global: {
                plugins: [ pinia ]
            }
        });

        await wrapper.get('[data-test="color-option-0-0"]').trigger('click');

        expect(store.setActiveColor).toHaveBeenCalledWith({
            categoryName: 'Ranked Modes',
            categoryKey: 'rankedModes',
            color: {
                clrA: '#37FC00',
                clrB: '#7D28FC',
                clrNeutral: '#F4067E',
                index: 0,
                isCustom: false,
                title: 'Green vs Grape',
                key: 'greenGrape'
            }
        });
    });

    it('has expected button color when custom color is changed', async () => {
        const store = useActiveRoundStore();
        store.activeRound.activeColor.isCustom = true;
        const wrapper = mount(ColorList, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent<typeof IplInput>('[name="team-a-color"]').vm.$emit('update:modelValue', '#123123');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="custom-color-submit-btn"]').attributes().color).toEqual('red');
    });

    it('updates active color on custom color update button click', () => {
        const store = useActiveRoundStore();
        store.setActiveColor = jest.fn();
        store.activeRound.activeColor.isCustom = true;
        const wrapper = mount(ColorList, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent<typeof IplInput>('[name="team-a-color"]').vm.$emit('update:modelValue', '#123123');
        wrapper.getComponent<typeof IplInput>('[name="team-b-color"]').vm.$emit('update:modelValue', '#345345');
        wrapper.getComponent<typeof IplButton>('[data-test="custom-color-submit-btn"]').vm.$emit('click');

        expect(store.setActiveColor).toHaveBeenCalledWith({
            categoryName: 'Custom Color',
            categoryKey: 'customColor',
            color: {
                index: 0,
                title: 'Custom Color',
                key: 'customColor',
                clrA: '#123123',
                clrB: '#345345',
                clrNeutral: '#FFFFFF',
                isCustom: true
            }
        });
    });

    it('reverts changes on custom color update button right click', async () => {
        const store = useActiveRoundStore();
        store.activeRound.activeColor.isCustom = true;
        const wrapper = mount(ColorList, {
            global: {
                plugins: [ pinia ]
            }
        });
        const event = new Event(null);
        jest.spyOn(event, 'preventDefault');

        wrapper.getComponent<typeof IplInput>('[name="team-a-color"]').vm.$emit('update:modelValue', '#123123');
        wrapper.getComponent<typeof IplInput>('[name="team-b-color"]').vm.$emit('update:modelValue', '#345345');
        wrapper.getComponent<typeof IplButton>('[data-test="custom-color-submit-btn"]').vm.$emit('rightClick', event);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[name="team-a-color"]').attributes().modelvalue).toEqual('#889');
        expect(wrapper.getComponent('[name="team-b-color"]').attributes().modelvalue).toEqual('#999');
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('swaps custom colors when swapColorsInternally is changed', async () => {
        const store = useActiveRoundStore();
        store.activeRound.activeColor.isCustom = true;
        store.swapColorsInternally = false;
        const wrapper = mount(ColorList, {
            global: {
                plugins: [ pinia ]
            }
        });
        const teamAColorElem = wrapper.getComponent<typeof IplInput>('[name="team-a-color"]');
        const teamBColorElem = wrapper.getComponent<typeof IplInput>('[name="team-b-color"]');

        teamAColorElem.vm.$emit('update:modelValue', '#123123');
        teamBColorElem.vm.$emit('update:modelValue', '#345345');

        store.swapColorsInternally = true;
        await wrapper.vm.$nextTick();

        expect(teamAColorElem.attributes().modelvalue).toEqual('#345345');
        expect(teamBColorElem.attributes().modelvalue).toEqual('#123123');
    });

    it('handles team colors changing in store', async () => {
        const store = useActiveRoundStore();
        store.activeRound.activeColor.isCustom = true;
        const wrapper = mount(ColorList, {
            global: {
                plugins: [ pinia ]
            }
        });
        const teamAColorElem = wrapper.getComponent<typeof IplInput>('[name="team-a-color"]');
        const teamBColorElem = wrapper.getComponent<typeof IplInput>('[name="team-b-color"]');

        teamAColorElem.vm.$emit('update:modelValue', '#123123');
        teamBColorElem.vm.$emit('update:modelValue', '#345345');

        store.activeRound.teamA.color = '#987978';
        store.activeRound.teamB.color = '#FFFFFF';
        await wrapper.vm.$nextTick();

        expect(teamAColorElem.attributes().modelvalue).toEqual('#987978');
        expect(teamBColorElem.attributes().modelvalue).toEqual('#FFFFFF');
    });

    it('does not change custom color inputs if active color is updated but is not custom', async () => {
        const store = useActiveRoundStore();
        store.activeRound.activeColor.isCustom = true;
        const wrapper = mount(ColorList, {
            global: {
                plugins: [ pinia ]
            }
        });

        store.activeRound.activeColor.isCustom = false;
        store.activeRound.teamA.color = '#987978';
        store.activeRound.teamB.color = '#FFFFFF';
        await wrapper.vm.$nextTick();
        await wrapper.getComponent<typeof IplCheckbox>('[data-test="use-custom-color-toggle"]').vm.$emit('update:modelValue', true);

        expect(wrapper.getComponent('[name="team-a-color"]').attributes().modelvalue).toEqual('#889');
        expect(wrapper.getComponent('[name="team-b-color"]').attributes().modelvalue).toEqual('#999');
    });
});
