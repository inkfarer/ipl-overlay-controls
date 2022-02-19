import ObsDataPicker from '../obsDataPicker.vue';
import { createStore } from 'vuex';
import { ObsStore, obsStoreKey } from '../../../store/obsStore';
import { ObsStatus } from 'types/enums/ObsStatus';
import { config, mount } from '@vue/test-utils';

describe('ObsDataPicker', () => {
    config.global.stubs = {
        FontAwesomeIcon: true,
        IplSelect: true,
        IplButton: true
    };

    function createObsDataStore() {
        return createStore<ObsStore>({
            state: {
                obsCredentials: null,
                obsData: {
                    status: ObsStatus.CONNECTED,
                    scenes: ['Scene One', 'Scene Two', 'Scene Three'],
                    gameplayScene: 'Scene One',
                    intermissionScene: 'Scene Two'
                }
            },
            actions: {
                setData: jest.fn()
            }
        });
    }

    it('matches snapshot', () => {
        const store = createObsDataStore();
        const wrapper = mount(ObsDataPicker, {
            global: {
                plugins: [[store, obsStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot without scene data', () => {
        const store = createObsDataStore();
        store.state.obsData.scenes = null;
        const wrapper = mount(ObsDataPicker, {
            global: {
                plugins: [[store, obsStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('has expected button color when data is changed', async () => {
        const store = createObsDataStore();
        const wrapper = mount(ObsDataPicker, {
            global: {
                plugins: [[store, obsStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="intermission-scene-select"]').vm.$emit('update:modelValue', 'Scene Three');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="update-button"]').attributes().color).toEqual('red');
    });

    it('handles updating data', async () => {
        const store = createObsDataStore();
        jest.spyOn(store, 'dispatch');
        const wrapper = mount(ObsDataPicker, {
            global: {
                plugins: [[store, obsStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="intermission-scene-select"]').vm.$emit('update:modelValue', 'Scene Three');
        await wrapper.vm.$nextTick();
        wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');

        expect(store.dispatch).toHaveBeenCalledWith('setData', {
            gameplayScene: 'Scene One',
            intermissionScene: 'Scene Three'
        });
    });
});
