import Casters from '../casters.vue';
import { createStore } from 'vuex';
import { CasterStore, casterStoreKey } from '../../store/casterStore';
import { config, flushPromises, mount } from '@vue/test-utils';

describe('Casters', () => {
    const mockAddUncommittedCaster = jest.fn();
    const mockLoadCastersFromVc = jest.fn();

    config.global.stubs = {
        IplButton: true,
        CasterEditor: true,
        IplExpandingSpaceGroup: true
    };

    function createCasterStore() {
        return createStore<CasterStore>({
            state: {
                casters: {},
                uncommittedCasters: {},
                radiaSettings: {
                    guildID: null,
                    enabled: null,
                    updateOnImport: null
                }
            },
            actions: {
                addUncommittedCaster: mockAddUncommittedCaster,
                loadCastersFromVc: mockLoadCastersFromVc
            }
        });
    }

    describe('add caster button', () => {
        it('adds caster and sets it as the active caster on click', async () => {
            const store = createCasterStore();
            mockAddUncommittedCaster.mockResolvedValue('new caster id');
            const wrapper = mount(Casters, {
                global: {
                    plugins: [ [ store, casterStoreKey ] ]
                }
            });

            wrapper.getComponent('[data-test="add-caster-button"]').vm.$emit('click');
            await flushPromises();

            expect(mockAddUncommittedCaster).toHaveBeenCalled();
            expect(wrapper.vm.activeCaster).toEqual('caster_new caster id');
            expect(wrapper.getComponent('[data-test="caster-editor-group"]').attributes().modelvalue)
                .toEqual('caster_new caster id');
        });

        it('is disabled if there are three casters', () => {
            const store = createCasterStore();
            store.state.casters = {
                a: {},
                b: {},
                c: {},
            };
            const wrapper = mount(Casters, {
                global: {
                    plugins: [ [ store, casterStoreKey ] ]
                }
            });

            expect(wrapper.getComponent('[data-test="add-caster-button"]').attributes().disabled).toEqual('true');
        });

        it('is disabled if there are three or more casters and uncommitted casters', () => {
            const store = createCasterStore();
            store.state.casters = {
                a: {},
                b: {},
            };
            store.state.uncommittedCasters = {
                c: {},
                d: {}
            };
            const wrapper = mount(Casters, {
                global: {
                    plugins: [ [ store, casterStoreKey ] ]
                }
            });

            expect(wrapper.getComponent('[data-test="add-caster-button"]').attributes().disabled).toEqual('true');
        });
    });

    describe('load from vc button', () => {
        it('does not exist if radia is disabled', () => {
            const store = createCasterStore();
            store.state.radiaSettings.enabled = false;
            const wrapper = mount(Casters, {
                global: {
                    plugins: [ [ store, casterStoreKey ] ]
                }
            });

            expect(wrapper.findComponent('[data-test="load-from-vc-button"]').exists()).toEqual(false);
        });

        it('does not exist if guild id is not configured', () => {
            const store = createCasterStore();
            store.state.radiaSettings = {
                enabled: true,
                guildID: '',
                updateOnImport: null
            };
            const wrapper = mount(Casters, {
                global: {
                    plugins: [ [ store, casterStoreKey ] ]
                }
            });

            expect(wrapper.findComponent('[data-test="load-from-vc-button"]').exists()).toEqual(false);
        });

        it('is present if radia is enabled and configured', () => {
            const store = createCasterStore();
            store.state.radiaSettings = {
                enabled: true,
                guildID: '123123123123',
                updateOnImport: null
            };
            const wrapper = mount(Casters, {
                global: {
                    plugins: [ [ store, casterStoreKey ] ]
                }
            });

            expect(wrapper.findComponent('[data-test="load-from-vc-button"]').exists()).toEqual(true);
        });

        it('sends store message to load casters on click', () => {
            const store = createCasterStore();
            store.state.radiaSettings = {
                enabled: true,
                guildID: '123123123123',
                updateOnImport: null
            };
            const wrapper = mount(Casters, {
                global: {
                    plugins: [ [ store, casterStoreKey ] ]
                }
            });

            wrapper.getComponent('[data-test="load-from-vc-button"]').vm.$emit('click');

            expect(mockLoadCastersFromVc).toHaveBeenCalled();
        });
    });

    it('creates element for every caster', async () => {
        const store = createCasterStore();
        store.state.casters = {
            a: { name: 'cool caster' },
            b: { name: 'cool caster (copy)' },
        };
        const wrapper = mount(Casters, {
            global: {
                plugins: [ [ store, casterStoreKey ] ],
                stubs: {
                    IplExpandingSpaceGroup: false
                }
            }
        });

        const editors = wrapper.findAllComponents('caster-editor-stub');
        expect(editors.length).toEqual(2);
        expect(editors[0].attributes().casterid).toEqual('a');
        expect(editors[1].attributes().casterid).toEqual('b');
    });

    it('creates element for every uncommitted caster', async () => {
        const store = createCasterStore();
        store.state.casters = {
            a: { name: 'cool caster' },
        };
        store.state.uncommittedCasters = {
            b: { name: 'cool caster (copy)' },
            c: { name: 'cool caster (copy) (copy)' },
        };
        const wrapper = mount(Casters, {
            global: {
                plugins: [ [ store, casterStoreKey ] ],
                stubs: {
                    IplExpandingSpaceGroup: false
                }
            }
        });

        const editors = wrapper.findAllComponents('caster-editor-stub');
        expect(editors.length).toEqual(3);
        const committedAttrs1 = editors[0].attributes();
        expect(committedAttrs1.casterid).toEqual('a');
        expect(committedAttrs1.uncommitted).toEqual('false');
        const uncommittedAttrs1 = editors[1].attributes();
        expect(uncommittedAttrs1.casterid).toEqual('b');
        expect(uncommittedAttrs1.uncommitted).toEqual('true');
        const uncommittedAttrs2 = editors[2].attributes();
        expect(uncommittedAttrs2.casterid).toEqual('c');
        expect(uncommittedAttrs2.uncommitted).toEqual('true');
    });

    it('handles uncommitted caster emitting save event', async () => {
        const store = createCasterStore();
        store.state.uncommittedCasters = {
            a: { name: 'cool caster (copy)' }
        };
        const wrapper = mount(Casters, {
            global: {
                plugins: [ [ store, casterStoreKey ] ],
                stubs: {
                    IplExpandingSpaceGroup: false
                }
            }
        });

        const editor = wrapper.findComponent('caster-editor-stub');
        editor.vm.$emit('save', 'new caster');

        expect(wrapper.vm.activeCaster).toEqual('caster_new caster');
    });
});
