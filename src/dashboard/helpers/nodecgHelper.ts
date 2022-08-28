import { MessageInputMap, MessageResultMap } from 'types/messages/MessageMaps';

export async function sendMessage<K extends keyof MessageInputMap>(
    message: K,
    data?: MessageInputMap[K]
): Promise<MessageResultMap[K]> {
    return nodecg.sendMessage(message, data);
}
