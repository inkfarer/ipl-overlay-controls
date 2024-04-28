import ObsSocketSettings from '../obsSocketSettings.vue';
import { ObsStatus } from 'types/enums/ObsStatus';
import { config, mount } from '@vue/test-utils';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { useObsStore } from '../../../store/obsStore';
import { IplButton, IplInput } from '@iplsplatoon/vue-components';

describe('ObsSocketSettings', () => {
    let pinia: TestingPinia;

    config.global.stubs = {
        IplInput: true,
        IplButton: true,
        FontAwesomeIcon: true
    };

    beforeEach(() => {
        pinia = createTestingPinia();

        const obsStore = useObsStore();
        obsStore.obsState = { status: ObsStatus.CONNECTED, enabled: true };
        obsStore.obsCredentials = { address: 'localhost:4444', password: 'pwd' };
    });

    it.each(Object.values(ObsStatus))('matches snapshot when status is %s', status => {
        const store = useObsStore();
        store.obsState.status = status;
        const wrapper = mount(ObsSocketSettings, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot when obs socket is disabled', () => {
        const store = useObsStore();
        store.obsState.enabled = false;
        const wrapper = mount(ObsSocketSettings, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('disables connecting if data is invalid', async () => {
        const wrapper = mount(ObsSocketSettings, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplInput>('[name="socketUrl"]').vm.$emit('update:modelValue', '');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="socket-connect-button"]').attributes().disabled).toEqual('true');
    });

    it('changes connect button color if data is changed', async () => {
        const wrapper = mount(ObsSocketSettings, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplInput>('[name="socketUrl"]').vm.$emit('update:modelValue', 'https://new-socket-url');
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[data-test="socket-connect-button"]').attributes().color).toEqual('red');
    });

    it('handles connecting to socket', async () => {
        const store = useObsStore();
        store.connect = jest.fn();
        const wrapper = mount(ObsSocketSettings, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplInput>('[name="socketUrl"]').vm.$emit('update:modelValue', 'https://new-socket-url');
        await wrapper.vm.$nextTick();
        wrapper.getComponent<typeof IplButton>('[data-test="socket-connect-button"]').vm.$emit('click');

        expect(store.connect).toHaveBeenCalledWith({ address: 'https://new-socket-url', password: 'pwd' });
    });

    it('resets data on connect button right click', async () => {
        const wrapper = mount(ObsSocketSettings, {
            global: {
                plugins: [pinia]
            }
        });
        const event = new Event(null);
        jest.spyOn(event, 'preventDefault');

        wrapper.getComponent<typeof IplInput>('[name="socketUrl"]').vm.$emit('update:modelValue', 'https://new-socket-url');
        wrapper.getComponent<typeof IplButton>('[data-test="socket-connect-button"]').vm.$emit('rightClick', event);
        await wrapper.vm.$nextTick();

        expect(wrapper.getComponent('[name="socketUrl"]').attributes().modelvalue).toEqual('localhost:4444');
        expect(event.preventDefault).toHaveBeenCalled();
    });
});
