import express from 'express';
import last from 'lodash/last';
import { Configschema } from '../../types/schemas';
import cloneDeep from 'lodash/cloneDeep';

export type ReplicantChangeHandler = (newValue?: unknown, oldValue?: unknown) => void;
type OnFunction = (event: string, handler: ReplicantChangeHandler) => void;

const defaultBundleConfig = Object.freeze({
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
});

export let replicants: {[key: string]: unknown} = {};
export const replicantChangeListeners: {[key: string]: ReplicantChangeHandler} = {};
export const requestHandlers: {[type in 'POST' | 'GET']: {[path: string]: express.RequestHandler}}
    = { POST: {}, GET: {} };
export const mockBundleConfig: Configschema = cloneDeep(defaultBundleConfig);
export const messageListeners: {[key: string]: (message?: unknown, cb?: () => void) => void} = {};
export const mockMount = jest.fn();
export const mockNodecgLog = {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn()
};
export const mockSendMessage = jest.fn();

beforeEach(() => {
    replicants = {};
    Object.assign(mockBundleConfig, cloneDeep(defaultBundleConfig));
});

require('../helpers/nodecg').set({
    Replicant(name: string) {
        const replicantValue: { value: unknown, on: OnFunction } = {
            get value() {
                return replicants[name];
            },
            set value(newValue: unknown) {
                replicants[name] = newValue;
            },
            on: (event: string, handler: ReplicantChangeHandler) => {
                replicantChangeListeners[name] = handler;
            }
        };
        return replicantValue;
    },
    listenFor: (messageName: string, handler: () => void) => {
        messageListeners[messageName] = handler as (message: unknown, cb?: () => void) => void;
    },
    Router: () => ({
        post(path: string, ...handlers: express.RequestHandler[]) {
            requestHandlers['POST'][path] = last(handlers);
        },
        get(path: string, ...handlers: express.RequestHandler[]) {
            requestHandlers['GET'][path] = last(handlers);
        }
    }),
    mount: mockMount,
    log: mockNodecgLog,
    bundleConfig: mockBundleConfig,
    bundleName: 'ipl-overlay-controls',
    sendMessage: mockSendMessage
});
