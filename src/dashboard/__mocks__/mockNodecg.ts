import { Configschema } from 'schemas';
import NodeCG from '@nodecg/types';

const defaultBundleConfig = {
    lastfm: {
        apiKey: 'lastfmkey123',
        secret: 'lastfmsecret456'
    },
    smashgg: {
        apiKey: 'smashggkey789'
    },
    radia: {
        url: 'radia://url',
        socketUrl: 'ws://radia.url',
        authentication: 'radia-auth-12345'
    }
};

export const mockDialog = {
    open: jest.fn(),
    close: jest.fn()
};
export const mockGetDialog = jest.fn().mockReturnValue(mockDialog);
export const mockSendMessage = jest.fn();
export let replicants: {[key: string]: unknown} = {};
export let mockBundleConfig: Configschema = defaultBundleConfig;
export let messageListeners: {[key: string]: (message?: unknown, cb?: () => void) => void} = {};

beforeEach(() => {
    replicants = {};
    messageListeners = {};
    mockBundleConfig = defaultBundleConfig;
});

window.nodecg = {
    Replicant(name: string) {
        return {
            get value() {
                return replicants[name];
            },
            set value(newValue: unknown) {
                replicants[name] = newValue;
            },
            on: jest.fn()
        };
    },
    listenFor: (messageName: string, handler: () => void) => {
        messageListeners[messageName] = handler as (message: unknown, cb?: () => void) => void;
    },
    sendMessage: mockSendMessage,
    getDialog: mockGetDialog,
    bundleConfig: mockBundleConfig,
    bundleName: 'ipl-overlay-controls'
} as unknown as NodeCG.ClientAPI;
