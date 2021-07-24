import express from 'express';
import last from 'lodash/last';

export type ReplicantChangeHandler = (newValue?: unknown, oldValue?: unknown) => void;
export type MockReplicant = { value: unknown };
type OnFunction = (event: string, handler: ReplicantChangeHandler) => void;

export class MockNodecg {
    replicants: {[key: string]: MockReplicant};
    replicantListeners: {[key: string]: ReplicantChangeHandler};
    messageListeners: {[key: string]: (message?: unknown, cb?: () => void) => void};
    requestHandlers: {[type in 'POST' | 'GET']: {[path: string]: express.RequestHandler}};
    mount: jest.Mock;

    constructor() {
        this.replicants = {};
        this.replicantListeners = {};
        this.messageListeners = {};
        this.requestHandlers = { POST: {}, GET: {} };
        this.mount = jest.fn();
    }

    init(): void {
        const self = this;
        require('../helpers/nodecg').set({
            // @ts-ignore: Just a test, improve mocks as needed.
            Replicant(name: string) {
                const replicantValue: { value: unknown, on: OnFunction } = {
                    value: undefined,
                    on: (event: string, handler: ReplicantChangeHandler) => {
                        self.replicantListeners[name] = handler;
                    }
                };
                self.replicants[name] = replicantValue;
                return replicantValue;
            },
            listenFor: (messageName: string, handler: () => void) => {
                self.messageListeners[messageName] = handler as (message: unknown, cb?: () => void) => void;
            },
            Router: () => ({
                post(path: string, ...handlers: express.RequestHandler[]) {
                    self.requestHandlers['POST'][path] = last(handlers);
                }
            }),
            mount: self.mount,
            log: {
                warn: jest.fn()
            }
        });
    }
}
