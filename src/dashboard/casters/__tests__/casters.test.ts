import Casters from '../casters.vue';
import { useCasterStore } from '../../store/casterStore';
import { config, flushPromises, mount } from '@vue/test-utils';
import { createTestingPinia, TestingPinia } from '@pinia/testing';

describe('Casters', () => {
    config.global.stubs = {
        IplButton: true,
        CasterEditor: true,
        IplExpandingSpaceGroup: true,
        IplErrorDisplay: true
    };

    let pinia: TestingPinia;
    beforeEach(() => {
        pinia = createTestingPinia();
        config.global.plugins = [pinia];
    });

    describe('add caster button', () => {
        it('adds caster and sets it as the active caster on click', async () => {
            const store = useCasterStore();
            store.addDefaultCaster = jest.fn().mockResolvedValue('new caster id');
            const wrapper = mount(Casters);

            wrapper.getComponent('[data-test="add-caster-button"]').vm.$emit('click');
            await flushPromises();

            expect(store.addDefaultCaster).toHaveBeenCalled();
            expect(wrapper.vm.activeCaster).toEqual('new caster id');
            expect(wrapper.getComponent('[data-test="caster-editor-group"]').attributes().modelvalue)
                .toEqual('new caster id');
        });

        it('is disabled if there are three casters', () => {
            const store = useCasterStore();
            store.casters = {
                // @ts-ignore
                a: {},
                // @ts-ignore
                b: {},
                // @ts-ignore
                c: {},
            };
            const wrapper = mount(Casters);

            expect(wrapper.getComponent('[data-test="add-caster-button"]').attributes().disabled).toEqual('true');
        });

        it('is disabled if there are three or more casters and uncommitted casters', () => {
            const store = useCasterStore();
            store.casters = {
                // @ts-ignore
                a: {},
                // @ts-ignore
                b: {},
            };
            store.uncommittedCasters = {
                // @ts-ignore
                c: {},
                // @ts-ignore
                d: {}
            };
            const wrapper = mount(Casters);

            expect(wrapper.getComponent('[data-test="add-caster-button"]').attributes().disabled).toEqual('true');
        });
    });

    describe('load from vc button', () => {
        it('does not exist if radia is disabled', () => {
            const store = useCasterStore();
            store.radiaSettings.enabled = false;
            const wrapper = mount(Casters);

            expect(wrapper.findComponent('[data-test="load-from-vc-button"]').exists()).toEqual(false);
        });

        it('does not exist if guild id is not configured', () => {
            const store = useCasterStore();
            store.radiaSettings = {
                enabled: true,
                guildID: '',
                updateOnImport: null
            };
            const wrapper = mount(Casters);

            expect(wrapper.findComponent('[data-test="load-from-vc-button"]').exists()).toEqual(false);
        });

        it('is present if radia is enabled and configured', () => {
            const store = useCasterStore();
            store.radiaSettings = {
                enabled: true,
                guildID: '123123123123',
                updateOnImport: null
            };
            const wrapper = mount(Casters);

            expect(wrapper.findComponent('[data-test="load-from-vc-button"]').exists()).toEqual(true);
        });

        it('sends store message to load casters on click', () => {
            const store = useCasterStore();
            store.loadCastersFromVc = jest.fn();
            store.radiaSettings = {
                enabled: true,
                guildID: '123123123123',
                updateOnImport: null
            };
            const wrapper = mount(Casters);

            wrapper.getComponent('[data-test="load-from-vc-button"]').vm.$emit('click');

            expect(store.loadCastersFromVc).toHaveBeenCalled();
        });
    });

    it('creates element for every caster', async () => {
        const store = useCasterStore();
        store.casters = {
            // @ts-ignore
            a: { name: 'cool caster' },
            // @ts-ignore
            b: { name: 'cool caster (copy)' },
        };
        const wrapper = mount(Casters, {
            global: {
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
        const store = useCasterStore();
        store.casters = {
            // @ts-ignore
            a: { name: 'cool caster' },
        };
        store.uncommittedCasters = {
            // @ts-ignore
            b: { name: 'cool caster (copy)' },
            // @ts-ignore
            c: { name: 'cool caster (copy) (copy)' },
        };
        const wrapper = mount(Casters, {
            global: {
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
        const store = useCasterStore();
        store.uncommittedCasters = {
            // @ts-ignore
            a: { name: 'cool caster (copy)' }
        };
        const wrapper = mount(Casters, {
            global: {
                stubs: {
                    IplExpandingSpaceGroup: false
                }
            }
        });

        const editor = wrapper.findComponent('caster-editor-stub');
        editor.vm.$emit('save', 'new caster');

        expect(wrapper.vm.activeCaster).toEqual('new caster');
    });

    it('handles changing order of casters', async () => {
        const store = useCasterStore();
        store.setCasterOrder = jest.fn().mockResolvedValue({});
        store.uncommittedCasters = {
            // @ts-ignore
            a: { name: 'cool caster' },
        };
        store.casters = {
            // @ts-ignore
            b: { name: 'cool caster (copy)' },
            // @ts-ignore
            c: { name: 'cool caster (copy) (copy)' },
        };
        const wrapper = mount(Casters, {
            global: {
                stubs: {
                    IplExpandingSpaceGroup: false
                }
            }
        });

        await wrapper.getComponent('[data-test="casters-draggable"]').vm.$emit('end');

        expect(store.setCasterOrder).toHaveBeenCalledWith(['b', 'c']);
    });
});
