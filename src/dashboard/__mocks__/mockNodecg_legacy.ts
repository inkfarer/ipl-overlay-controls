import Mock = jest.Mock;

export type ReplicantChangeHandler = (newValue?: unknown, oldValue?: unknown) => void;
export type MockReplicant = { value: unknown };
type OnFunction = (event: string, handler: ReplicantChangeHandler) => void;

export class MockNodecg {
    replicants: {[key: string]: MockReplicant};
    listeners: {[key: string]: ReplicantChangeHandler};
    sendMessage: Mock

    constructor() {
        this.replicants = {};
        this.listeners = {};
        this.sendMessage = jest.fn();
    }

    init(): void {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        window.nodecg = {
            // @ts-ignore: Just a mock
            Replicant(name: string) {
                const replicantValue: { value: unknown, on: OnFunction } = {
                    value: undefined,
                    on: (event: string, handler: ReplicantChangeHandler) => {
                        self.listeners[name] = handler;
                    }
                };
                self.replicants[name] = replicantValue;
                return replicantValue;
            },
            sendMessage: self.sendMessage,
            // @ts-ignore: Just a mock
            log: {
                info: jest.fn()
            }
        };

        // @ts-ignore: It's a mock.
        window.NodeCG = {
            waitForReplicants: jest.fn().mockResolvedValue(true)
        };
    }
}
