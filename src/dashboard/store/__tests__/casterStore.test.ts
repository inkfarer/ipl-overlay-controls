import { casterStore } from '../casterStore';
import { mockSendMessage, replicants } from '../../__mocks__/mockNodecg';
import { Casters } from 'schemas';
import * as generateId from '../../../helpers/generateId';

describe('casterStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        casterStore.replaceState({
            casters: {},
            uncommittedCasters: {},
            radiaSettings: {
                enabled: null,
                guildID: null,
                updateOnImport: null
            }
        });
    });

    describe('mutations', () => {
        describe('setState', () => {
            it('updates state', () => {
                casterStore.commit('setState', { name: 'casters', val: { foo: 'bar' } });

                expect(casterStore.state.casters).toEqual({ foo: 'bar' });
            });
        });

        describe('updateCaster', () => {
            it('updates replicant value', () => {
                replicants.casters = {};
                casterStore.commit('updateCaster', { id: '123123', newValue: 'cool caster' });

                expect((replicants.casters as Casters)['123123']).toEqual('cool caster');
            });
        });

        describe('removeCaster', () => {
            it('sends message to remove caster', () => {
                casterStore.commit('removeCaster', 'oldcaster');

                expect(mockSendMessage).toHaveBeenCalledWith('removeCaster', { id: 'oldcaster' });
            });
        });

        describe('addUncommittedCaster', () => {
            it('adds uncommitted casters to state', () => {
                casterStore.commit('addUncommittedCaster', { id: '4095687', caster: 'cool caster' });

                expect(casterStore.state.uncommittedCasters['4095687']).toEqual('cool caster');
            });
        });

        describe('removeUncommittedCaster', () => {
            it('removes uncommitted casters from state', () => {
                casterStore.state.uncommittedCasters['60389'] = { name: 'cool caster' };
                casterStore.commit('removeUncommittedCaster', '60389');

                expect(casterStore.state.uncommittedCasters['60389']).toBeUndefined();
            });
        });
    });

    describe('actions', () => {
        describe('addUncommittedCaster', () => {
            it('creates caster and returns it\'s id', async () => {
                jest.spyOn(generateId, 'generateId').mockReturnValue('new caster id');

                const result = await casterStore.dispatch('addUncommittedCaster');

                expect(casterStore.state.uncommittedCasters['new caster id']).toEqual({
                    name: 'New Caster',
                    twitter: '',
                    pronouns: '?/?'
                });
                expect(result).toEqual('new caster id');
            });
        });

        describe('saveUncommittedCaster', () => {
            it('sends message to save caster and removes it from the uncommitted caster list', async () => {
                mockSendMessage.mockResolvedValue('new saved caster id');
                casterStore.state.uncommittedCasters['unsaved caster'] = { name: 'cool caster' };

                const result = await casterStore.dispatch('saveUncommittedCaster', {
                    id: 'unsaved caster',
                    caster: { name: 'cool caster!' }
                });

                expect(mockSendMessage).toHaveBeenCalledWith('saveCaster', { name: 'cool caster!' });
                expect(casterStore.state.uncommittedCasters['unsaved caster']).toBeUndefined();
                expect(result).toEqual('new saved caster id');
            });
        });

        describe('loadCastersFromVc', () => {
            it('fetches casters', async () => {
                mockSendMessage.mockResolvedValue({});

                await casterStore.dispatch('loadCastersFromVc');

                expect(mockSendMessage).toHaveBeenCalledWith('getLiveCommentators');
                expect(casterStore.state.uncommittedCasters).toEqual({});
            });

            it('adds additional casters as uncommitted', async () => {
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

                await casterStore.dispatch('loadCastersFromVc');

                expect(mockSendMessage).toHaveBeenCalledWith('getLiveCommentators');
                expect(casterStore.state.uncommittedCasters).toEqual({
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
    });
});
