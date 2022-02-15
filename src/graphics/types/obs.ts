export interface ObsEvent extends Event {
    detail: {
        active?: boolean;
    };
}

export {};

declare global {
    interface Window {
        obsstudio?: {
            pluginVersion: string;
            getCurrentScene: (cb: () => { height: number, width: number, name: string }) => void;
            getStatus: (cb: () => {
                recording: boolean,
                recordingPaused: boolean,
                replayBuffer: boolean,
                streaming: boolean,
                virtualcam: boolean
            }) => void;
            saveReplayBuffer: () => void;
        };
    }
}
