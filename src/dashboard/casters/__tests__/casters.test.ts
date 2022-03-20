import Casters from '../casters.vue';
import { useCasterStore } from '../../store/casterStore';
import { config, flushPromises, mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

describe('Casters', () => {
    config.global.stubs = {
        IplButton: true,
        CasterEditor: true,
        IplExpandingSpaceGroup: true,
        IplErrorDisplay: true
    };

    describe('add caster button', () => {
        it('adds caster and sets it as the active caster on click', async () => {
            const pinia = createTestingPinia();
            const store = useCasterStore();
            store.addDefaultCaster = jest.fn().mockResolvedValue('new caster id');
            const wrapper = mount(Casters, {
                global: {
                    plugins: [ pinia ]
                }
            });

            wrapper.getComponent('[data-test="add-caster-button"]').vm.$emit('click');
            await flushPromises();

            expect(store.addDefaultCaster).toHaveBeenCalled();
            expect(wrapper.vm.activeCaster).toEqual('caster_new caster id');
            expect(wrapper.getComponent('[data-test="caster-editor-group"]').attributes().modelvalue)
                .toEqual('caster_new caster id');
        });

        it('is disabled if there are three casters', () => {
            const pinia = createTestingPinia();
            const store = useCasterStore();
            store.casters = {
                a: {},
                b: {},
                c: {},
            };
            const wrapper = mount(Casters, {
                global: {
                    plugins: [ pinia ]
                }
            });

            expect(wrapper.getComponent('[data-test="add-caster-button"]').attributes().disabled).toEqual('true');
        });

        it('is disabled if there are three or more casters and uncommitted casters', () => {
            const pinia = createTestingPinia();
            const store = useCasterStore();
            store.casters = {
                a: {},
                b: {},
            };
            store.uncommittedCasters = {
                c: {},
                d: {}
            };
            const wrapper = mount(Casters, {
                global: {
                    plugins: [ pinia ]
                }
            });

            expect(wrapper.getComponent('[data-test="add-caster-button"]').attributes().disabled).toEqual('true');
        });
    });

    describe('load from vc button', () => {
        it('does not exist if radia is disabled', () => {
            const pinia = createTestingPinia();
            const store = useCasterStore();
            store.radiaSettings.enabled = false;
            const wrapper = mount(Casters, {
                global: {
                    plugins: [ pinia ]
                }
            });

            expect(wrapper.findComponent('[data-test="load-from-vc-button"]').exists()).toEqual(false);
        });

        it('does not exist if guild id is not configured', () => {
            const pinia = createTestingPinia();
            const store = useCasterStore();
            store.radiaSettings = {
                enabled: true,
                guildID: '',
                updateOnImport: null
            };
            const wrapper = mount(Casters, {
                global: {
                    plugins: [ pinia ]
                }
            });

            expect(wrapper.findComponent('[data-test="load-from-vc-button"]').exists()).toEqual(false);
        });

        it('is present if radia is enabled and configured', () => {
            const pinia = createTestingPinia();
            const store = useCasterStore();
            store.radiaSettings = {
                enabled: true,
                guildID: '123123123123',
                updateOnImport: null
            };
            const wrapper = mount(Casters, {
                global: {
                    plugins: [ pinia ]
                }
            });

            expect(wrapper.findComponent('[data-test="load-from-vc-button"]').exists()).toEqual(true);
        });

        it('sends store message to load casters on click', () => {
            const pinia = createTestingPinia();
            const store = useCasterStore();
            store.loadCastersFromVc = jest.fn();
            store.radiaSettings = {
                enabled: true,
                guildID: '123123123123',
                updateOnImport: null
            };
            const wrapper = mount(Casters, {
                global: {
                    plugins: [ pinia ]
                }
            });

            wrapper.getComponent('[data-test="load-from-vc-button"]').vm.$emit('click');

            expect(store.loadCastersFromVc).toHaveBeenCalled();
        });
    });

    it('creates element for every caster', async () => {
        const pinia = createTestingPinia();
        const store = useCasterStore();
        store.casters = {
            a: { name: 'cool caster' },
            b: { name: 'cool caster (copy)' },
        };
        const wrapper = mount(Casters, {
            global: {
                plugins: [ pinia ],
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
        const pinia = createTestingPinia();
        const store = useCasterStore();
        store.casters = {
            a: { name: 'cool caster' },
        };
        store.uncommittedCasters = {
            b: { name: 'cool caster (copy)' },
            c: { name: 'cool caster (copy) (copy)' },
        };
        const wrapper = mount(Casters, {
            global: {
                plugins: [ pinia ],
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
        const pinia = createTestingPinia();
        const store = useCasterStore();
        store.uncommittedCasters = {
            a: { name: 'cool caster (copy)' }
        };
        const wrapper = mount(Casters, {
            global: {
                plugins: [ pinia ],
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
