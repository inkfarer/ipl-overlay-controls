import {  useCasterStore } from '../casterStore';
import { mockSendMessage, replicants } from '../../__mocks__/mockNodecg';
import { Casters } from 'schemas';
import * as generateId from '../../../helpers/generateId';
import { createPinia, setActivePinia } from 'pinia';
import { mockNodecg } from '../../../extension/__mocks__/mockNodecg';

describe('casterStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        setActivePinia(createPinia());
    });

    describe('updateCaster', () => {
        it('updates replicant value', () => {
            replicants.casters = {};
            const store = useCasterStore();

            // @ts-ignore
            store.updateCaster(mockNodecg.bundleName, 'casters', '123123', 'cool caster');

            expect((replicants.casters as Casters)['123123']).toEqual('cool caster');
        });
    });

    describe('addUncommittedCaster', () => {
        it('adds uncommitted casters to state', () => {
            const store = useCasterStore();

            // @ts-ignore
            store.addUncommittedCaster(mockNodecg.bundleName, 'casters', '4095687', 'cool caster');

            expect(store.uncommittedCasters['4095687']).toEqual('cool caster');
        });
    });

    describe('removeUncommittedCaster', () => {
        it('removes uncommitted casters from state', () => {
            const store = useCasterStore();
            // @ts-ignore
            store.uncommittedCasters['60389'] = { name: 'cool caster' };

            store.removeUncommittedCaster(mockNodecg.bundleName, 'casters', '60389');

            expect(store.uncommittedCasters['60389']).toBeUndefined();
        });
    });

    describe('removeCaster', () => {
        it('sends message to remove caster', () => {
            const store = useCasterStore();

            store.removeCaster(mockNodecg.bundleName, 'casters', 'oldcaster');

            expect(mockSendMessage).toHaveBeenCalledWith('removeCaster', { bundleName: mockNodecg.bundleName, casterSetKey: 'casters', id: 'oldcaster' });
        });
    });

    describe('addDefaultCaster', () => {
        it('creates caster and returns its id', async () => {
            const store = useCasterStore();
            jest.spyOn(generateId, 'generateId').mockReturnValue('new caster id');

            const result = await store.addDefaultCaster(mockNodecg.bundleName, 'casters');

            expect(store.uncommittedCasters['new caster id']).toEqual({
                name: 'New Caster',
                twitter: '',
                pronouns: '?/?'
            });
            expect(result).toEqual('new caster id');
        });
    });

    describe('createCaster', () => {
        it('sends message to save caster', async () => {
            const store = useCasterStore();
            mockSendMessage.mockResolvedValue('new saved caster id');

            // @ts-ignore
            const result = await store.createCaster(mockNodecg.bundleName, 'casters', { name: 'cool caster!' });

            expect(mockSendMessage).toHaveBeenCalledWith('saveCaster', { bundleName: mockNodecg.bundleName, casterSetKey: 'casters', caster: { name: 'cool caster!' } });
            expect(result).toEqual('new saved caster id');
        });
    });

    describe('loadCastersFromVc', () => {
        it('fetches casters', async () => {
            const store = useCasterStore();
            mockSendMessage.mockResolvedValue({ add: { }, extra: { } });

            await store.loadCastersFromVc();

            expect(mockSendMessage).toHaveBeenCalledWith('getLiveCommentators', undefined);
            expect(store.uncommittedCasters).toEqual({});
        });

        it('adds additional casters as uncommitted', async () => {
            const store = useCasterStore();
            mockSendMessage.mockResolvedValue({
                add: { },
                extra: {
                    '123908': {
                        name: 'cool caster',
                        pronouns: 'they/them'
                    },
                    '6978340': {
                        name: 'cool caster 2'
                    }
                }
            });

            await store.loadCastersFromVc();

            expect(mockSendMessage).toHaveBeenCalledWith('getLiveCommentators', undefined);
            expect(store.uncommittedCasters).toEqual({
                '123908': {
                    name: 'cool caster',
                    pronouns: 'they/them'
                },
                '6978340': {
                    name: 'cool caster 2'
                }
            });
        });
    });

    describe('setCasterOrder', () => {
        it('sends message to extension', () => {
            const store = useCasterStore();

            store.setCasterOrder(mockNodecg.bundleName, 'casters', ['aa', 'bb']);

            expect(mockSendMessage).toHaveBeenCalledWith('setCasterOrder', { bundleName: mockNodecg.bundleName, casterSetKey: 'casters', casterIds: ['aa', 'bb']});
        });
    });
});
