import type { NodeCG } from 'nodecg/server';
import type { ListenForCb, UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { MessageInputMap, MessageResultMap } from '../../types/messages/MessageMaps';

export abstract class BaseController {
    private readonly nodecg: NodeCG;

    protected constructor(nodecg: NodeCG) {
        this.nodecg = nodecg;
    }

    listen<K extends keyof MessageInputMap, D = MessageInputMap[K]>(
        messageName: K,
        callback: (data: D) => MessageResultMap[K] | Promise<MessageResultMap[K]>
    ): void {
        this.nodecg.listenFor(messageName, async (data: D, cb: ListenForCb) => {
            try {
                const result = await callback(data);
                if (!cb.handled) {
                    (cb as UnhandledListenForCb)(null, result);
                }
            } catch (e) {
                if (!cb.handled) {
                    (cb as UnhandledListenForCb)(e);
                }
            }
        });
    }
}
