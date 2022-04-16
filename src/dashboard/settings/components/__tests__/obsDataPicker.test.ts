import ObsDataPicker from '../obsDataPicker.vue';
import { useObsStore } from '../../../store/obsStore';
import { ObsStatus } from 'types/enums/ObsStatus';
import { config, mount } from '@vue/test-utils';
import { createTestingPinia, TestingPinia } from '@pinia/testing';

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
        obsStore.obsData = {
            enabled: true,
            status: ObsStatus.CONNECTED,
            scenes: ['Scene One', 'Scene Two', 'Scene Three'],
            gameplayScene: 'Scene One',
            intermissionScene: 'Scene Two'
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
        store.obsData.scenes = null;
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

        wrapper.getComponent('[data-test="intermission-scene-select"]').vm.$emit('update:modelValue', 'Scene Three');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="update-button"]').attributes().color).toEqual('red');
    });

    it('handles updating data', async () => {
        const store = useObsStore();
        store.setData = jest.fn();
        const wrapper = mount(ObsDataPicker, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent('[data-test="intermission-scene-select"]').vm.$emit('update:modelValue', 'Scene Three');
        await wrapper.vm.$nextTick();
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');

        expect(store.setData).toHaveBeenCalledWith({
            gameplayScene: 'Scene One',
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

        wrapper.getComponent('[data-test="intermission-scene-select"]').vm.$emit('update:modelValue', 'Scene Three');
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('right-click', event);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="intermission-scene-select"]').attributes().modelvalue).toEqual('Scene Two');
        expect(event.preventDefault).toHaveBeenCalled();
    });
});
