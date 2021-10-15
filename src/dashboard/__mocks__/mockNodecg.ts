import { NodeCGBrowser } from 'nodecg/browser';

export const mockSendMessage = jest.fn();
export let replicants: {[key: string]: unknown} = {};

beforeEach(() => {
    replicants = {};
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
    sendMessage: mockSendMessage
} as unknown as NodeCGBrowser;
