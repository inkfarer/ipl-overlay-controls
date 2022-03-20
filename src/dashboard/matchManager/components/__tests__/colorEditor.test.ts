import ColorEditor from '../colorEditor.vue';
import { useActiveRoundStore } from '../../../store/activeRoundStore';
import { GameWinner } from 'types/enums/gameWinner';
import { config, mount } from '@vue/test-utils';
import { GameVersion } from 'types/enums/gameVersion';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useSettingsStore } from '../../../settings/settingsStore';

describe('ColorEditor', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplCheckbox: true,
        IplInput: true,
        IplButton: true
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
                    title: 'Dark Blue vs Green',
                    index: 5,
                    categoryName: 'Ranked Modes',
                    isCustom: false,
                    clrNeutral: '#333'
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

        // @ts-ignore
        useSettingsStore().$state = {
            runtimeConfig: {
                gameVersion: GameVersion.SPLATOON_2
            }
        };
    });

    it('matches snapshot', () => {
        const wrapper = mount(ColorEditor, {
            global: {
                plugins: [ pinia ]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when using custom color', () => {
        const store = useActiveRoundStore();
        store.activeRound.activeColor.isCustom = true;
        const wrapper = mount(ColorEditor, {
            global: {
                plugins: [ pinia ]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('sets color on option click', async () => {
        const store = useActiveRoundStore();
        store.setActiveColor = jest.fn();
        const wrapper = mount(ColorEditor, {
            global: {
                plugins: [ pinia ]
            }
        });

        await wrapper.get('[data-test="color-option-0-0"]').trigger('click');

        expect(store.setActiveColor).toHaveBeenCalledWith({
            categoryName: 'Ranked Modes',
            color: {
                clrA: '#37FC00',
                clrB: '#7D28FC',
                clrNeutral: '#F4067E',
                index: 0,
                isCustom: false,
                title: 'Green vs Grape'
            }
        });
    });

    it('has expected button color when custom color is changed', async () => {
        const store = useActiveRoundStore();
        store.activeRound.activeColor.isCustom = true;
        const wrapper = mount(ColorEditor, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent('[name="team-a-color"]').vm.$emit('update:modelValue', '#123123');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="custom-color-submit-btn"]').attributes().color).toEqual('red');
    });

    it('updates active color on custom color update button click', () => {
        const store = useActiveRoundStore();
        store.setActiveColor = jest.fn();
        store.activeRound.activeColor.isCustom = true;
        const wrapper = mount(ColorEditor, {
            global: {
                plugins: [ pinia ]
            }
        });

        wrapper.getComponent('[name="team-a-color"]').vm.$emit('update:modelValue', '#123123');
        wrapper.getComponent('[name="team-b-color"]').vm.$emit('update:modelValue', '#345345');
        wrapper.getComponent('[data-test="custom-color-submit-btn"]').vm.$emit('click');

        expect(store.setActiveColor).toHaveBeenCalledWith({
            categoryName: 'Custom Color',
            color: {
                index: 0,
                title: 'Custom Color',
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
        const wrapper = mount(ColorEditor, {
            global: {
                plugins: [ pinia ]
            }
        });
        const event = new Event(null);
        jest.spyOn(event, 'preventDefault');

        wrapper.getComponent('[name="team-a-color"]').vm.$emit('update:modelValue', '#123123');
        wrapper.getComponent('[name="team-b-color"]').vm.$emit('update:modelValue', '#345345');
        wrapper.getComponent('[data-test="custom-color-submit-btn"]').vm.$emit('right-click', event);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[name="team-a-color"]').attributes().modelvalue).toEqual('#889');
        expect(wrapper.getComponent('[name="team-b-color"]').attributes().modelvalue).toEqual('#999');
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('swaps custom colors when swapColorsInternally is changed', async () => {
        const store = useActiveRoundStore();
        store.activeRound.activeColor.isCustom = true;
        store.swapColorsInternally = false;
        const wrapper = mount(ColorEditor, {
            global: {
                plugins: [ pinia ]
            }
        });
        const teamAColorElem = wrapper.getComponent('[name="team-a-color"]');
        const teamBColorElem = wrapper.getComponent('[name="team-b-color"]');

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
        const wrapper = mount(ColorEditor, {
            global: {
                plugins: [ pinia ]
            }
        });
        const teamAColorElem = wrapper.getComponent('[name="team-a-color"]');
        const teamBColorElem = wrapper.getComponent('[name="team-b-color"]');

        teamAColorElem.vm.$emit('update:modelValue', '#123123');
        teamBColorElem.vm.$emit('update:modelValue', '#345345');

        store.activeRound.teamA.color = '#987978';
        store.activeRound.teamB.color = '#FFFFFF';
        await wrapper.vm.$nextTick();

        expect(teamAColorElem.attributes().modelvalue).toEqual('#987978');
        expect(teamBColorElem.attributes().modelvalue).toEqual('#FFFFFF');
    });
});
