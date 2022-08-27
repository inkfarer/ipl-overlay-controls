import OBSWebSocket from 'obs-websocket-js';

const socket = new OBSWebSocket();

export async function setCurrentScene(scene: string): Promise<void> {
    return socket.call('SetCurrentProgramScene', { sceneName: scene });
}
