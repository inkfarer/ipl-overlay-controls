import { App } from 'vue';
import { generateId } from '../../helpers/generateId';
import { defineStore } from 'pinia';

export const useErrorHandlerStore = defineStore('errorHandler', {
    state: () => ({
        recentErrors: {}
    }),
    actions: {
        removeRecentError({ key }: { key: string }): void {
            delete this.recentErrors[key];
        },
        handleError({ err, info }: { err: unknown, info: string }): void {
            console.error(`Got error from '${info}': \n`, err);

            if (Object.keys(this.recentErrors).length >= 2) return;

            const id = generateId();
            this.recentErrors[id] = err;
            window.setTimeout(() => {
                delete this.recentErrors[id];
            }, 25000);
        }
    }
});

export function setUpErrorHandler(app: App<unknown>): void {
    const store = useErrorHandlerStore();
    app.config.errorHandler = (err, vm, info) => {
        store.handleError({ err, info });
    };
}
