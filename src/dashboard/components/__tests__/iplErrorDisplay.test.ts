import IplErrorDisplay from '../iplErrorDisplay.vue';
import { createStore } from 'vuex';
import { ErrorHandlerStore, errorHandlerStoreKey } from '../../store/errorHandlerStore';
import { config, mount } from '@vue/test-utils';

describe('IplErrorDisplay', () => {
    config.global.stubs = {
        FontAwesomeIcon: true
    };

    function createErrorHandlerStore() {
        return createStore<ErrorHandlerStore>({
            state: {
                recentErrors: {}
            } 
        });
    }

    it('throws error when missing store', () => {
        expect(() => mount(IplErrorDisplay)).toThrow('Missing error handler store.');
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
