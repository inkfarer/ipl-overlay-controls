import { MessageInputMap, MessageResultMap } from '../../types/messages/MessageMaps';
import { BaseController } from '../controllers/BaseController';

export let controllerListeners:
    {[key in keyof MessageInputMap]?: (data?: unknown) => MessageResultMap[key]} = {};

beforeEach(() => {
    jest.spyOn(BaseController.prototype, 'listen').mockImplementation(
        <key extends keyof MessageInputMap, result = MessageResultMap[key]>
        (name: key, callback: (data: unknown) => result) => {
            controllerListeners[name] = callback;
        });

    controllerListeners = {};
});
