import { errorHandlerStore } from '../errorHandlerStore';
import * as generateId from '../../../helpers/generateId';

describe('errorHandlerStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        errorHandlerStore.replaceState({
            recentErrors: {}
        });

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        jest.spyOn(global.console, 'error').mockImplementation(() => {});
    });

    describe('removeRecentError', () => {
        it('removes error from list', () => {
            errorHandlerStore.state.recentErrors = {
                err1: {},
                err2: {}
            };

            errorHandlerStore.commit('removeRecentError', { key: 'err2' });

            expect(errorHandlerStore.state.recentErrors).toEqual({ err1: {} });
        });
    });

    describe('handleError', () => {
        it('logs given error', () => {
            const error = new Error('yeehaw');

            errorHandlerStore.dispatch('handleError', { err: error, info: 'component event handler' });

            expect(console.error).toHaveBeenCalledWith('Got error from \'component event handler\': \n', error);
        });

        it('stores error in state', () => {
            jest.spyOn(generateId, 'generateId').mockReturnValue('1010101');
            const error = new Error('yeehaw');

            errorHandlerStore.dispatch('handleError', { err: error, info: 'component event handler' });

            expect(errorHandlerStore.state.recentErrors).toEqual({
                '1010101': error
            });
        });

        it('clears errors from state after timeout', () => {
            jest.useFakeTimers();
            jest.spyOn(generateId, 'generateId')
                .mockReturnValueOnce('1010101')
                .mockReturnValueOnce('2020202');
            const error1 = new Error('yeehaw1');
            const error2 = new Error('yeehaw2');

            errorHandlerStore.dispatch('handleError', { err: error1, info: 'component event handler' });
            jest.advanceTimersByTime(12500);
            errorHandlerStore.dispatch('handleError', { err: error2, info: 'component event handler' });

            expect(errorHandlerStore.state.recentErrors).toEqual({
                '1010101': error1,
                '2020202': error2
            });

            jest.advanceTimersByTime(12500);

            expect(errorHandlerStore.state.recentErrors).toEqual({
                '2020202': error2
            });
            jest.useRealTimers();
        });

        it('stores no more than 2 errors in state at once', () => {
            jest.spyOn(generateId, 'generateId')
                .mockReturnValueOnce('1010101')
                .mockReturnValueOnce('2020202')
                .mockReturnValueOnce('3030303');
            const error1 = new Error('yeehaw1');
            const error2 = new Error('yeehaw2');
            const error3 = new Error('yeehaw3');

            errorHandlerStore.dispatch('handleError', { err: error1, info: 'component event handler' });
            errorHandlerStore.dispatch('handleError', { err: error2, info: 'component event handler' });
            errorHandlerStore.dispatch('handleError', { err: error3, info: '???' });

            expect(errorHandlerStore.state.recentErrors).toEqual({
                '1010101': error1,
                '2020202': error2
            });
        });
    });
});
