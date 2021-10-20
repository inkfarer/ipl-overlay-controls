import CasterEditor from '../casterEditor.vue';
import { config, flushPromises, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { CasterStore, casterStoreKey } from '../../casterStore';
import { reactive } from 'vue';

describe('CasterEditor', () => {
    const mockUpdateCaster = jest.fn();
    const mockSaveUncommittedCaster = jest.fn();
    const mockRemoveUncommittedCaster = jest.fn();
    const mockRemoveCaster = jest.fn();

    config.global.stubs = {
        IplInput: true,
        IplButton: true
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
            mutations: {
                updateCaster: mockUpdateCaster,
                removeUncommittedCaster: mockRemoveUncommittedCaster,
                removeCaster: mockRemoveCaster
            },
            actions: {
                saveUncommittedCaster: mockSaveUncommittedCaster
            }
        });
    }

    it('fills inputs with caster data', () => {
        const store = createCasterStore();
        const wrapper = mount(CasterEditor, {
            global: {
                plugins: [ [ store, casterStoreKey ] ]
            },
            props: {
                caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'they/them' },
                casterId: 'casterid'
            }
        });

        expect(wrapper.getComponent('[name="name"]').attributes().modelvalue).toEqual('cool caster');
        expect(wrapper.getComponent('[name="twitter"]').attributes().modelvalue).toEqual('@ccaster');
        expect(wrapper.getComponent('[name="pronouns"]').attributes().modelvalue).toEqual('they/them');
    });

    it('updates caster data provided in props', async () => {
        const store = createCasterStore();
        const caster = reactive({ name: 'cool caster', twitter: '@ccaster', pronouns: 'they/them' });
        const wrapper = mount(CasterEditor, {
            global: {
                plugins: [ [ store, casterStoreKey ] ]
            },
            props: {
                caster,
                casterId: 'casterid'
            }
        });

        await wrapper.setProps({
            caster: {
                name: 'cool caster (edited)',
                twitter: '@ccaster',
                pronouns: 'they/them'
            }
        });

        expect(wrapper.getComponent('[name="name"]').attributes().modelvalue).toEqual('cool caster (edited)');
    });

    it('does not update caster data if any input is focused', async () => {
        const store = createCasterStore();
        const caster = reactive({ name: 'cool caster', twitter: '@ccaster', pronouns: 'they/them' });
        const wrapper = mount(CasterEditor, {
            global: {
                plugins: [ [ store, casterStoreKey ] ]
            },
            props: {
                caster,
                casterId: 'casterid'
            }
        });

        wrapper.getComponent('[name="twitter"]').vm.$emit('focuschange', true);
        await wrapper.setProps({
            caster: { name: 'cool caster (edited)', twitter: '@ccaster', pronouns: 'they/them' }
        });

        expect(wrapper.getComponent('[name="name"]').attributes().modelvalue).toEqual('cool caster');
    });

    it('has expected label and color on update button', () => {
        const store = createCasterStore();
        const wrapper = mount(CasterEditor, {
            global: {
                plugins: [ [ store, casterStoreKey ] ]
            },
            props: {
                caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'they/them' },
                casterId: 'casterid'
            }
        });

        const attrs = wrapper.getComponent('[data-test="update-button"]').attributes();
        expect(attrs.label).toEqual('Update');
        expect(attrs.color).toEqual('blue');
    });

    it('has expected label and color on update button if data is uncommitted', () => {
        const store = createCasterStore();
        const wrapper = mount(CasterEditor, {
            global: {
                plugins: [ [ store, casterStoreKey ] ]
            },
            props: {
                caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'they/them' },
                casterId: 'casterid',
                uncommitted: true
            }
        });

        const attrs = wrapper.getComponent('[data-test="update-button"]').attributes();
        expect(attrs.label).toEqual('Save');
        expect(attrs.color).toEqual('green');
    });

    it('has expected label and color on update button if data is updated', async () => {
        const store = createCasterStore();
        const wrapper = mount(CasterEditor, {
            global: {
                plugins: [ [ store, casterStoreKey ] ]
            },
            props: {
                caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'they/them' },
                casterId: 'casterid'
            }
        });

        wrapper.getComponent('[name="name"]').vm.$emit('update:modelValue', 'new player value');
        await wrapper.vm.$nextTick();

        const attrs = wrapper.getComponent('[data-test="update-button"]').attributes();
        expect(attrs.label).toEqual('Update');
        expect(attrs.color).toEqual('red');
    });

    it('displays expected badges if caster is uncommitted', () => {
        const store = createCasterStore();
        const wrapper = mount(CasterEditor, {
            global: {
                plugins: [ [ store, casterStoreKey ] ]
            },
            props: {
                caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'they/them' },
                casterId: 'casterid',
                uncommitted: true
            }
        });

        expect(wrapper.find('.badge.uncommitted-badge').exists()).toEqual(true);
        const pronounBadge = wrapper.find('.badge.pronoun-badge');
        expect(pronounBadge.exists()).toEqual(true);
        expect(pronounBadge.text()).toEqual('they/them');
    });

    it('displays expected badges if caster is committed', () => {
        const store = createCasterStore();
        const wrapper = mount(CasterEditor, {
            global: {
                plugins: [ [ store, casterStoreKey ] ]
            },
            props: {
                caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him' },
                casterId: 'casterid',
                uncommitted: false
            }
        });

        expect(wrapper.find('.badge.uncommitted-badge').exists()).toEqual(false);
        const pronounBadge = wrapper.find('.badge.pronoun-badge');
        expect(pronounBadge.exists()).toEqual(true);
        expect(pronounBadge.text()).toEqual('he/him');
    });

    describe('update caster button', () => {
        it('sends update to store on click if caster is committed', () => {
            const store = createCasterStore();
            const wrapper = mount(CasterEditor, {
                global: {
                    plugins: [ [ store, casterStoreKey ] ]
                },
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him' },
                    casterId: 'casterid',
                    uncommitted: false
                }
            });

            wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');

            expect(mockUpdateCaster).toHaveBeenCalledWith(expect.any(Object), {
                id: 'casterid',
                newValue: { name: 'cool caster', pronouns: 'he/him', twitter: '@ccaster' }
            });
        });

        it('saves to store and emits event on click if caster is uncommitted', async () => {
            const store = createCasterStore();
            const wrapper = mount(CasterEditor, {
                global: {
                    plugins: [ [ store, casterStoreKey ] ]
                },
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him' },
                    casterId: 'casterid',
                    uncommitted: true
                }
            });
            mockSaveUncommittedCaster.mockResolvedValue('new-caster-id');

            wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');
            await flushPromises();

            expect(mockSaveUncommittedCaster).toHaveBeenCalledWith(expect.any(Object), {
                id: 'casterid',
                caster: { name: 'cool caster', pronouns: 'he/him', twitter: '@ccaster' }
            });
            const saveEvents = wrapper.emitted('save');
            expect(saveEvents.length).toEqual(1);
            expect(saveEvents[0]).toEqual(['new-caster-id']);
        });

        it('is disabled if there are three or more casters and the given caster is uncommitted', () => {
            const store = createCasterStore();
            store.state.casters = {
                a: {},
                b: {},
                c: {}
            };
            const wrapper = mount(CasterEditor, {
                global: {
                    plugins: [ [ store, casterStoreKey ] ]
                },
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him' },
                    casterId: 'casterid',
                    uncommitted: true
                }
            });

            expect(wrapper.getComponent('[data-test="update-button"]').attributes().disabled).toEqual('true');
        });

        it('is not disabled if there are three or more casters and the given caster is committed', () => {
            const store = createCasterStore();
            store.state.casters = {
                a: {},
                b: {},
                c: {}
            };
            const wrapper = mount(CasterEditor, {
                global: {
                    plugins: [ [ store, casterStoreKey ] ]
                },
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him' },
                    casterId: 'casterid',
                    uncommitted: false
                }
            });

            expect(wrapper.getComponent('[data-test="update-button"]').attributes().disabled).toEqual('false');
        });
    });

    describe('remove caster button', () => {
        it('sends remove event to store if uncommitted', () => {
            const store = createCasterStore();
            const wrapper = mount(CasterEditor, {
                global: {
                    plugins: [ [ store, casterStoreKey ] ]
                },
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him' },
                    casterId: 'casterid',
                    uncommitted: true
                }
            });

            wrapper.getComponent('[data-test="remove-button"]').vm.$emit('click');

            expect(mockRemoveUncommittedCaster).toHaveBeenCalledWith(expect.any(Object), 'casterid');
        });

        it('sends remove event to store if committed', () => {
            const store = createCasterStore();
            const wrapper = mount(CasterEditor, {
                global: {
                    plugins: [ [ store, casterStoreKey ] ]
                },
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him' },
                    casterId: 'casterid',
                    uncommitted: false
                }
            });

            wrapper.getComponent('[data-test="remove-button"]').vm.$emit('click');

            expect(mockRemoveCaster).toHaveBeenCalledWith(expect.any(Object), 'casterid');
        });
    });
});
