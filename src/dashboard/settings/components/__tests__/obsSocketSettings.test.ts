import ObsSocketSettings from '../obsSocketSettings.vue';
import { createStore } from 'vuex';
import { ObsStore, obsStoreKey } from '../../../store/obsStore';
import { ObsStatus } from 'types/enums/ObsStatus';
import { config, mount } from '@vue/test-utils';

describe('ObsSocketSettings', () => {
    config.global.stubs = {
        IplInput: true,
        IplButton: true
    };

    function createObsStore() {
        return createStore<ObsStore>({
            state: {
                obsData: { status: ObsStatus.CONNECTED, enabled: true },
                obsCredentials: {
                    address: 'localhost:4444',
                    password: 'pwd'
                }
            },
            actions: {
                connect: jest.fn()
            }
        });
    }

    it.each(Object.values(ObsStatus))('matches snapshot when status is %s', status => {
        const store = createObsStore();
        store.state.obsData.status = status;
        const wrapper = mount(ObsSocketSettings, {
            global: {
                plugins: [[store, obsStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when obs socket is disabled', () => {
        const store = createObsStore();
        store.state.obsData.enabled = false;
        const wrapper = mount(ObsSocketSettings, {
            global: {
                plugins: [[store, obsStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('disables connecting if data is invalid', async () => {
        const store = createObsStore();
        const wrapper = mount(ObsSocketSettings, {
            global: {
                plugins: [[store, obsStoreKey]]
            }
        });

        wrapper.getComponent('[name="socketUrl"]').vm.$emit('update:modelValue', '');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="socket-connect-button"]').attributes().disabled).toEqual('true');
    });

    it('changes connect button color if data is changed', async () => {
        const store = createObsStore();
        const wrapper = mount(ObsSocketSettings, {
            global: {
                plugins: [[store, obsStoreKey]]
            }
        });

        wrapper.getComponent('[name="socketUrl"]').vm.$emit('update:modelValue', 'https://new-socket-url');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="socket-connect-button"]').attributes().color).toEqual('red');
    });

    it('handles connecting to socket', async () => {
        const store = createObsStore();
        jest.spyOn(store, 'dispatch');
        const wrapper = mount(ObsSocketSettings, {
            global: {
                plugins: [[store, obsStoreKey]]
            }
        });

        wrapper.getComponent('[name="socketUrl"]').vm.$emit('update:modelValue', 'https://new-socket-url');
        await wrapper.vm.$nextTick();
        wrapper.getComponent('[data-test="socket-connect-button"]').vm.$emit('click');

        expect(store.dispatch).toHaveBeenCalledWith('connect', { address: 'https://new-socket-url', password: 'pwd' });
    });
});
