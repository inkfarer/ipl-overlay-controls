import ObsDataPicker from '../obsDataPicker.vue';
import { useObsStore } from '../../../store/obsStore';
import { ObsStatus } from 'types/enums/ObsStatus';
import { config, mount } from '@vue/test-utils';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { IplButton, IplSelect } from '@iplsplatoon/vue-components';
import { mockSendMessage } from '../../../__mocks__/mockNodecg';

describe('ObsDataPicker', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        FontAwesomeIcon: true,
        IplSelect: true,
        IplButton: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        const obsStore = useObsStore();
        obsStore.obsCredentials = null;
        obsStore.obsState = {
            enabled: true,
            status: ObsStatus.CONNECTED,
            scenes: ['Scene One', 'Scene Two', 'Scene Three'],
            inputs: [
                {
                    name: 'Test Input One',
                    uuid: 'test-uuid-1',
                    noVideoOutput: false
                },
                {
                    name: 'Test Input Two',
                    uuid: 'test-uuid-2',
                    noVideoOutput: true
                }
            ]
        };
        // @ts-ignore
        obsStore.currentConfig = {
            gameplayScene: 'Scene One',
            intermissionScene: 'Scene Two',
            gameplayInput: 'Test Input One'
        };
    });

    it('matches snapshot', () => {
        const wrapper = mount(ObsDataPicker, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot without scene data', () => {
        const store = useObsStore();
        store.obsState.scenes = null;
        const wrapper = mount(ObsDataPicker, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('has expected button color when data is changed', async () => {
        const wrapper = mount(ObsDataPicker, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplSelect>('[data-test="intermission-scene-select"]').vm.$emit('update:modelValue', 'Scene Three');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="update-button"]').attributes().color).toEqual('red');
    });

    it('disables updating if any data is missing', async () => {
        // @ts-ignore
        useObsStore().currentConfig = {
            gameplayScene: null,
            intermissionScene: 'Scene Two',
            gameplayInput: 'Test Input One'
        };
        const wrapper = mount(ObsDataPicker, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').vm.disabled).toEqual(true);
    });

    it('handles updating data', async () => {
        const wrapper = mount(ObsDataPicker, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplSelect>('[data-test="intermission-scene-select"]').vm.$emit('update:modelValue', 'Scene Three');
        await wrapper.vm.$nextTick();
        wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').vm.$emit('click');

        expect(mockSendMessage).toHaveBeenCalledWith('setObsConfig', {
            gameplayScene: 'Scene One',
            gameplayInput: 'Test Input One',
            intermissionScene: 'Scene Three'
        });
    });

    it('reverts changes on update button right click', async () => {
        const wrapper = mount(ObsDataPicker, {
            global: {
                plugins: [pinia]
            }
        });
        const event = new Event(null);
        jest.spyOn(event, 'preventDefault');

        wrapper.getComponent<typeof IplSelect>('[data-test="intermission-scene-select"]').vm.$emit('update:modelValue', 'Scene Three');
        wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').vm.$emit('rightClick', event);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="intermission-scene-select"]').attributes().modelvalue).toEqual('Scene Two');
        expect(event.preventDefault).toHaveBeenCalled();
    });
});
