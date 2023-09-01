import type NodeCG from '@nodecg/types';
import { MessageInputMap, MessageResultMap } from 'types/messages/MessageMaps';

export abstract class BaseController {
    private readonly nodecg: NodeCG.ServerAPI;

    protected constructor(nodecg: NodeCG.ServerAPI) {
        this.nodecg = nodecg;
    }

    listen<K extends keyof MessageInputMap, D = MessageInputMap[K]>(
        messageName: K,
        callback: (data: D) => MessageResultMap[K] | Promise<MessageResultMap[K]>
    ): void {
        this.nodecg.listenFor(messageName, async (data: D, cb: NodeCG.Acknowledgement) => {
            try {
                const result = await callback(data);
                if (!cb.handled) {
                    (cb as NodeCG.UnhandledAcknowledgement)(null, result);
                }
            } catch (e) {
                if (!cb.handled) {
                    (cb as NodeCG.UnhandledAcknowledgement)(e);
                }
            }
        });
    }
}
