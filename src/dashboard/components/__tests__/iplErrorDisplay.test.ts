import IplErrorDisplay from '../iplErrorDisplay.vue';
import { createStore } from 'vuex';
import { ErrorHandlerStore, errorHandlerStoreKey } from '../../store/errorHandlerStore';
import { config, mount } from '@vue/test-utils';

describe('IplErrorDisplay', () => {
    const mockRemoveRecentError = jest.fn();

    config.global.stubs = {
        FontAwesomeIcon: true
    };

    function createErrorHandlerStore() {
        return createStore<ErrorHandlerStore>({
            state: {
                recentErrors: {}
            },
            mutations: {
                removeRecentError: mockRemoveRecentError
            }
        });
    }

    it('throws error when missing store', () => {
        expect(() => mount(IplErrorDisplay)).toThrow('Missing error handler store.');
    });

    it('handles error being removed', () => {
        const store = createErrorHandlerStore();
        store.state.recentErrors = {
            err: { message: 'Error!' }
        };
        const wrapper = mount(IplErrorDisplay, {
            global: {
                plugins: [[store, errorHandlerStoreKey]]
            }
        });

        wrapper.getComponent('[data-test="recent-error-err"]').vm.$emit('close');

        expect(mockRemoveRecentError).toHaveBeenCalledWith(expect.any(Object), { key: 'err' });
    });

    it('matches snapshot with errors', () => {
        const store = createErrorHandlerStore();
        store.state.recentErrors = {
            a: { message: 'Error!' },
            b: 'Error!'.repeat(75)
        };
        const wrapper = mount(IplErrorDisplay, {
            global: {
                plugins: [[store, errorHandlerStoreKey]]
            }
        });

        expect(wrapper.html()).toMatchSnapshot();
    });
});
