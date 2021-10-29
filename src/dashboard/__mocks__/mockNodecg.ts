import { NodeCGBrowser } from 'nodecg/browser';
import { Configschema } from 'schemas';

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

export const mockSendMessage = jest.fn();
export let replicants: {[key: string]: unknown} = {};
export let mockBundleConfig: Configschema = defaultBundleConfig;

beforeEach(() => {
    replicants = {};
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
    sendMessage: mockSendMessage,
    bundleConfig: mockBundleConfig
} as unknown as NodeCGBrowser;
