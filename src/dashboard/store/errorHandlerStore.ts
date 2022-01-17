import { createStore, Store, useStore } from 'vuex';
import { App, InjectionKey } from 'vue';
import { generateId } from '../../helpers/generateId';

export interface ErrorHandlerStore {
    recentErrors: Record<string, unknown>;
}

export const errorHandlerStore = createStore<ErrorHandlerStore>({
    state: {
        recentErrors: {}
    },
    mutations: {
        removeRecentError(state, { key }: { key: string }): void {
            delete state.recentErrors[key];
        }
    },
    actions: {
        handleError(store, { err, info }: { err: unknown, info: string }): void {
            console.error(`Got error from '${info}': \n`, err);

            if (Object.keys(store.state.recentErrors).length >= 2) return;

            const id = generateId();
            store.state.recentErrors[id] = err;
            window.setTimeout(() => {
                delete store.state.recentErrors[id];
            }, 25000);
        }
    }
});

export const errorHandlerStoreKey: InjectionKey<Store<ErrorHandlerStore>> = Symbol();

export function useErrorHandlerStore(): Store<ErrorHandlerStore> {
    return useStore(errorHandlerStoreKey);
}

export function setUpErrorHandler(app: App<unknown>): void {
    app.use(errorHandlerStore, errorHandlerStoreKey);
    app.config.errorHandler = (err, vm, info) => {
        errorHandlerStore.dispatch('handleError', { err, info });
    };
}
