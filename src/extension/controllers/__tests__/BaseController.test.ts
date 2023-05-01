import type { NodeCG } from 'nodecg/server';
import { BaseController } from '../BaseController';

class TestController extends BaseController {
    constructor(nodecg: NodeCG) {
        super(nodecg);
    }

    testListen(cb: () => unknown) {
        // @ts-ignore
        this.listen('testMessage', cb);
    }
}

describe('BaseController', () => {
    beforeEach(() => {
        (BaseController.prototype.listen as jest.Mock).mockRestore();
    });

    describe('listen', () => {
        it('listens for the specified event', () => {
            const nodecg = {
                listenFor: jest.fn()
            };
            // @ts-ignore
            const controller = new TestController(nodecg);

            controller.testListen(jest.fn());

            expect(nodecg.listenFor).toHaveBeenCalledWith('testMessage', expect.any(Function));
        });

        describe.each([
            () => jest.fn(() => 'test result'),
            () => jest.fn(() => Promise.resolve('test result'))
        ])('behaves as expected when the handler returns a proper value (%#)', callbackFactory => {
            it('returns the callback if it is unhandled', async () => {
                const callback = callbackFactory();
                const nodecg = {
                    listenFor: jest.fn()
                };
                // @ts-ignore
                const controller = new TestController(nodecg);

                controller.testListen(callback);
                const controllerListenForCb = nodecg.listenFor.mock.calls[0][1];

                const listenForCb = jest.fn();
                Object.defineProperty(listenForCb, 'handled', { value: false });
                await controllerListenForCb('test input', listenForCb);

                expect(callback).toHaveBeenCalledWith('test input');
                expect(listenForCb).toHaveBeenCalledWith(null, 'test result');
            });

            it('does not respond to the message if it is handled', async () => {
                const callback = callbackFactory();
                const nodecg = {
                    listenFor: jest.fn()
                };
                // @ts-ignore
                const controller = new TestController(nodecg);

                controller.testListen(callback);
                const controllerListenForCb = nodecg.listenFor.mock.calls[0][1];

                const listenForCb = jest.fn();
                Object.defineProperty(listenForCb, 'handled', { value: true });
                await controllerListenForCb('test input', listenForCb);

                expect(callback).toHaveBeenCalledWith('test input');
                expect(listenForCb).not.toHaveBeenCalled();
            });
        });

        describe.each([
            () => jest.fn().mockImplementation(() => { throw new Error('test error'); }),
            () => jest.fn().mockRejectedValue(new Error('test error'))
        ])('behaves as expected when the handler throws an error (%#)', callbackFactory => {
            it('returns the callback if it is unhandled and the handler throws an error', async () => {
                const callback = callbackFactory();
                const nodecg = {
                    listenFor: jest.fn()
                };
                // @ts-ignore
                const controller = new TestController(nodecg);

                controller.testListen(callback);
                const controllerListenForCb = nodecg.listenFor.mock.calls[0][1];

                const listenForCb = jest.fn();
                Object.defineProperty(listenForCb, 'handled', { value: false });
                await controllerListenForCb('test input', listenForCb);

                expect(callback).toHaveBeenCalledWith('test input');
                expect(listenForCb).toHaveBeenCalledWith(new Error('test error'));
            });

            it('does not respond to the message if it is handled and the handler throws an error', async () => {
                const callback = callbackFactory();
                const nodecg = {
                    listenFor: jest.fn()
                };
                // @ts-ignore
                const controller = new TestController(nodecg);

                controller.testListen(callback);
                const controllerListenForCb = nodecg.listenFor.mock.calls[0][1];

                const listenForCb = jest.fn();
                Object.defineProperty(listenForCb, 'handled', { value: true });
                await controllerListenForCb('test input', listenForCb);

                expect(callback).toHaveBeenCalledWith('test input');
                expect(listenForCb).not.toHaveBeenCalled();
            });
        });
    });
});
