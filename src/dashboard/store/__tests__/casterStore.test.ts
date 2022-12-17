import {  useCasterStore } from '../casterStore';
import { mockSendMessage, replicants } from '../../__mocks__/mockNodecg';
import { Casters } from 'schemas';
import * as generateId from '../../../helpers/generateId';
import { createPinia, setActivePinia } from 'pinia';

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
            store.updateCaster({ id: '123123', newValue: 'cool caster' });

            expect((replicants.casters as Casters)['123123']).toEqual('cool caster');
        });
    });

    describe('addUncommittedCaster', () => {
        it('adds uncommitted casters to state', () => {
            const store = useCasterStore();

            // @ts-ignore
            store.addUncommittedCaster({ id: '4095687', caster: 'cool caster' });

            expect(store.uncommittedCasters['4095687']).toEqual('cool caster');
        });
    });

    describe('removeUncommittedCaster', () => {
        it('removes uncommitted casters from state', () => {
            const store = useCasterStore();
            // @ts-ignore
            store.uncommittedCasters['60389'] = { name: 'cool caster' };

            store.removeUncommittedCaster('60389');

            expect(store.uncommittedCasters['60389']).toBeUndefined();
        });
    });

    describe('removeCaster', () => {
        it('sends message to remove caster', () => {
            const store = useCasterStore();

            store.removeCaster('oldcaster');

            expect(mockSendMessage).toHaveBeenCalledWith('removeCaster', { id: 'oldcaster' });
        });
    });

    describe('addDefaultCaster', () => {
        it('creates caster and returns its id', async () => {
            const store = useCasterStore();
            jest.spyOn(generateId, 'generateId').mockReturnValue('new caster id');

            const result = await store.addDefaultCaster();

            expect(store.uncommittedCasters['new caster id']).toEqual({
                name: 'New Caster',
                twitter: '',
                pronouns: '?/?'
            });
            expect(result).toEqual('new caster id');
        });
    });

    describe('saveUncommittedCaster', () => {
        it('sends message to save caster and removes it from the uncommitted caster list', async () => {
            const store = useCasterStore();
            mockSendMessage.mockResolvedValue('new saved caster id');
            // @ts-ignore
            store.uncommittedCasters['unsaved caster'] = { name: 'cool caster' };

            const result = await store.saveUncommittedCaster({
                id: 'unsaved caster',
                // @ts-ignore
                caster: { name: 'cool caster!' }
            });

            expect(mockSendMessage).toHaveBeenCalledWith('saveCaster', { name: 'cool caster!' });
            expect(store.uncommittedCasters['unsaved caster']).toBeUndefined();
            expect(result).toEqual('new saved caster id');
        });
    });

    describe('loadCastersFromVc', () => {
        it('fetches casters', async () => {
            const store = useCasterStore();
            mockSendMessage.mockResolvedValue({});

            await store.loadCastersFromVc();

            expect(mockSendMessage).toHaveBeenCalledWith('getLiveCommentators');
            expect(store.uncommittedCasters).toEqual({});
        });

        it('adds additional casters as uncommitted', async () => {
            const store = useCasterStore();
            mockSendMessage.mockResolvedValue({
                add: [],
                extra: [ {
                    discord_user_id: '123908',
                    name: 'cool caster',
                    pronouns: 'they/them'
                }, {
                    discord_user_id: '6978340',
                    name: 'cool caster 2'
                } ]
            });

            await store.loadCastersFromVc();

            expect(mockSendMessage).toHaveBeenCalledWith('getLiveCommentators');
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

            store.setCasterOrder(['aa', 'bb']);

            expect(mockSendMessage).toHaveBeenCalledWith('setCasterOrder', { casterIds: ['aa', 'bb']});
        });
    });
});
