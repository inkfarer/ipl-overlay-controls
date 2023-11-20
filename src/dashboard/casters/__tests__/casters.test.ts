import Casters from '../casters.vue';
import { useCasterStore } from '../../store/casterStore';
import { config, mount } from '@vue/test-utils';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import Draggable from 'vuedraggable';
import CasterEditor from '../components/casterEditor.vue';
import { IplButton } from '@iplsplatoon/vue-components';
import { mockSendMessage } from '../../__mocks__/mockNodecg';

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
            store.addDefaultCaster = jest.fn().mockReturnValue('new caster id');
            const wrapper = mount(Casters);

            wrapper.getComponent<typeof IplButton>('[data-test="add-caster-button"]').vm.$emit('click');
            await wrapper.vm.$nextTick();

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

    describe('radia support', () => {
        it('hides radia buttons if radia is disabled', () => {
            const store = useCasterStore();
            store.radiaSettings.enabled = false;
            const wrapper = mount(Casters);

            expect(wrapper.findComponent('[data-test="upload-casters-button"]').exists()).toEqual(false);
            expect(wrapper.findComponent('[data-test="load-from-vc-button"]').exists()).toEqual(false);
        });

        it('hides radia buttons if guild id is not configured', () => {
            const store = useCasterStore();
            store.radiaSettings = {
                enabled: true,
                guildID: '',
                updateOnImport: null
            };
            const wrapper = mount(Casters);

            expect(wrapper.findComponent('[data-test="upload-casters-button"]').exists()).toEqual(false);
            expect(wrapper.findComponent('[data-test="load-from-vc-button"]').exists()).toEqual(false);
        });

        it('shows radia buttons if radia is enabled and configured', () => {
            const store = useCasterStore();
            store.radiaSettings = {
                enabled: true,
                guildID: '123123123123',
                updateOnImport: null
            };
            const wrapper = mount(Casters);

            expect(wrapper.findComponent('[data-test="upload-casters-button"]').exists()).toEqual(true);
            expect(wrapper.findComponent('[data-test="load-from-vc-button"]').exists()).toEqual(true);
        });
    });

    describe('load from vc button', () => {
        it('sends store message to load casters on click', () => {
            const store = useCasterStore();
            store.loadCastersFromVc = jest.fn();
            store.radiaSettings = {
                enabled: true,
                guildID: '123123123123',
                updateOnImport: null
            };
            const wrapper = mount(Casters);

            wrapper.getComponent<typeof IplButton>('[data-test="load-from-vc-button"]').vm.$emit('click');

            expect(store.loadCastersFromVc).toHaveBeenCalled();
        });
    });

    describe('upload casters button', () => {
        it('sends message to upload casters on click', () => {
            const store = useCasterStore();
            store.loadCastersFromVc = jest.fn();
            store.radiaSettings = {
                enabled: true,
                guildID: '123123123123',
                updateOnImport: null
            };
            const wrapper = mount(Casters);

            wrapper.getComponent<typeof IplButton>('[data-test="upload-casters-button"]').vm.$emit('click');

            expect(mockSendMessage).toHaveBeenCalledWith('pushCastersToRadia', undefined);
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

        const editors = wrapper.findAllComponents<typeof CasterEditor>('caster-editor-stub');
        expect(editors.length).toEqual(2);
        // @ts-ignore
        expect(editors[0].vm.caster.id).toEqual('a');
        // @ts-ignore
        expect(editors[1].vm.caster.id).toEqual('b');
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

        const editors = wrapper.findAllComponents<typeof CasterEditor>('caster-editor-stub');
        expect(editors.length).toEqual(3);
        // @ts-ignore
        expect(editors[0].vm.caster.id).toEqual('a');
        // @ts-ignore
        expect(editors[0].vm.caster.uncommitted).toEqual(false);
        // @ts-ignore
        expect(editors[1].vm.caster.id).toEqual('b');
        // @ts-ignore
        expect(editors[1].vm.caster.uncommitted).toEqual(true);
        // @ts-ignore
        expect(editors[2].vm.caster.id).toEqual('c');
        // @ts-ignore
        expect(editors[2].vm.caster.uncommitted).toEqual(true);
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

        const editor = wrapper.findComponent<typeof CasterEditor>('caster-editor-stub');
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

        await wrapper.getComponent<typeof Draggable>('[data-test="casters-draggable"]').vm.$emit('end');

        expect(store.setCasterOrder).toHaveBeenCalledWith(['b', 'c']);
    });
});
