export type ReplicantChangeHandler = (newValue?: unknown, oldValue?: unknown) => void;
export type MockReplicant = { value: unknown };
type OnFunction = (event: string, handler: ReplicantChangeHandler) => void;

export class MockNodecg {
    replicants: {[key: string]: MockReplicant};
    listeners: {[key: string]: ReplicantChangeHandler};

    constructor() {
        this.replicants = {};
        this.listeners = {};
    }

    init(): void {
        const self = this;
        window.nodecg = {
            // @ts-ignore: Just a test, improve mocks as needed.
            Replicant(name: string) {
                const replicantValue: { value: unknown, on: OnFunction } = {
                    value: undefined,
                    on: (event: string, handler: ReplicantChangeHandler) => {
                        self.listeners[name] = handler;
                    }
                };
                self.replicants[name] = replicantValue;
                return replicantValue;
            }
        };
    }
}
