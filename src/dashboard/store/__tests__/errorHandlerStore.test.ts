import { useErrorHandlerStore } from '../errorHandlerStore';
import * as generateId from '../../../helpers/generateId';
import { createPinia, setActivePinia } from 'pinia';

describe('errorHandlerStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        setActivePinia(createPinia());

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        jest.spyOn(global.console, 'error').mockImplementation(() => {});
    });

    describe('removeRecentError', () => {
        it('removes error from list', () => {
            const store = useErrorHandlerStore();
            store.recentErrors = {
                err1: {},
                err2: {}
            };

            store.removeRecentError({ key: 'err2' });

            expect(store.recentErrors).toEqual({ err1: {} });
        });
    });

    describe('handleError', () => {
        it('logs given error', () => {
            const store = useErrorHandlerStore();
            const error = new Error('yeehaw');

            store.handleError({ err: error, info: 'component event handler' });

            expect(console.error).toHaveBeenCalledWith('Got error from \'component event handler\': \n', error);
        });

        it('stores error in state', () => {
            const store = useErrorHandlerStore();
            jest.spyOn(generateId, 'generateId').mockReturnValue('1010101');
            const error = new Error('yeehaw');

            store.handleError({ err: error, info: 'component event handler' });

            expect(store.recentErrors).toEqual({
                '1010101': error
            });
        });

        it('clears errors from state after timeout', () => {
            const store = useErrorHandlerStore();
            jest.useFakeTimers();
            jest.spyOn(generateId, 'generateId')
                .mockReturnValueOnce('1010101')
                .mockReturnValueOnce('2020202');
            const error1 = new Error('yeehaw1');
            const error2 = new Error('yeehaw2');

            store.handleError({ err: error1, info: 'component event handler' });
            jest.advanceTimersByTime(12500);
            store.handleError({ err: error2, info: 'component event handler' });

            expect(store.recentErrors).toEqual({
                '1010101': error1,
                '2020202': error2
            });

            jest.advanceTimersByTime(12500);

            expect(store.recentErrors).toEqual({
                '2020202': error2
            });
            jest.useRealTimers();
        });

        it('stores no more than 2 errors in state at once', () => {
            const store = useErrorHandlerStore();
            jest.spyOn(generateId, 'generateId')
                .mockReturnValueOnce('1010101')
                .mockReturnValueOnce('2020202')
                .mockReturnValueOnce('3030303');
            const error1 = new Error('yeehaw1');
            const error2 = new Error('yeehaw2');
            const error3 = new Error('yeehaw3');

            store.handleError({ err: error1, info: 'component event handler' });
            store.handleError({ err: error2, info: 'component event handler' });
            store.handleError({ err: error3, info: '???' });

            expect(store.recentErrors).toEqual({
                '1010101': error1,
                '2020202': error2
            });
        });
    });
});
