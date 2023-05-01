import IplErrorDisplay from '../iplErrorDisplay.vue';
import { config, mount } from '@vue/test-utils';
import { useErrorHandlerStore } from '../../store/errorHandlerStore';
import { createTestingPinia } from '@pinia/testing';
import { IplMessage } from '@iplsplatoon/vue-components';

describe('IplErrorDisplay', () => {
    config.global.stubs = {
        FontAwesomeIcon: true
    };

    it('handles error being removed', () => {
        const pinia = createTestingPinia();
        const store = useErrorHandlerStore();
        store.removeRecentError = jest.fn();
        store.recentErrors = {
            err: { message: 'Error!' }
        };
        const wrapper = mount(IplErrorDisplay, {
            global: {
                plugins: [pinia]
            }
        });

        wrapper.getComponent<typeof IplMessage>('[data-test="recent-error-err"]').vm.$emit('close');

        expect(store.removeRecentError).toHaveBeenCalledWith({ key: 'err' });
    });

    it('matches snapshot with errors', () => {
        const pinia = createTestingPinia();
        const store = useErrorHandlerStore();
        store.recentErrors = {
            a: { message: 'Error!' },
            b: 'Error!'.repeat(75)
        };
        const wrapper = mount(IplErrorDisplay, {
            global: {
                plugins: [pinia]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });
});
