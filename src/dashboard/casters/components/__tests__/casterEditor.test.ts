import CasterEditor from '../casterEditor.vue';
import { config, flushPromises, mount } from '@vue/test-utils';
import { useCasterStore } from '../../../store/casterStore';
import { reactive } from 'vue';
import { createTestingPinia } from '@pinia/testing';

describe('CasterEditor', () => {
    config.global.stubs = {
        IplInput: true,
        IplButton: true
    };

    it('fills inputs with caster data', () => {
        const pinia = createTestingPinia();
        const wrapper = mount(CasterEditor, {
            global: {
                plugins: [ pinia ]
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
        const pinia = createTestingPinia();
        const caster = reactive({ name: 'cool caster', twitter: '@ccaster', pronouns: 'they/them' });
        const wrapper = mount(CasterEditor, {
            global: {
                plugins: [ pinia ]
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
        const pinia = createTestingPinia();
        const caster = reactive({ name: 'cool caster', twitter: '@ccaster', pronouns: 'they/them' });
        const wrapper = mount(CasterEditor, {
            global: {
                plugins: [ pinia ]
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
        const pinia = createTestingPinia();
        const wrapper = mount(CasterEditor, {
            global: {
                plugins: [ pinia ]
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
        const pinia = createTestingPinia();
        const wrapper = mount(CasterEditor, {
            global: {
                plugins: [ pinia ]
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
        const pinia = createTestingPinia();
        const wrapper = mount(CasterEditor, {
            global: {
                plugins: [ pinia ]
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
        const pinia = createTestingPinia();
        const wrapper = mount(CasterEditor, {
            global: {
                plugins: [ pinia ]
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
        const pinia = createTestingPinia();
        const wrapper = mount(CasterEditor, {
            global: {
                plugins: [ pinia ]
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
            const pinia = createTestingPinia();
            const store = useCasterStore();
            store.updateCaster = jest.fn();
            // @ts-ignore
            const wrapper = mount(CasterEditor, {
                global: {
                    plugins: [ pinia ]
                },
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him', uncommitted: false },
                    casterId: 'casterid',
                    uncommitted: false
                }
            });

            wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');

            expect(store.updateCaster).toHaveBeenCalledWith({
                id: 'casterid',
                newValue: { name: 'cool caster', pronouns: 'he/him', twitter: '@ccaster' }
            });
        });

        it('reverts changes on right click if caster is committed', async () => {
            const pinia = createTestingPinia();
            // @ts-ignore
            const wrapper = mount(CasterEditor, {
                global: {
                    plugins: [ pinia ]
                },
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him', uncommitted: false },
                    casterId: 'casterid',
                    uncommitted: false
                }
            });
            const event = new Event(null);
            jest.spyOn(event, 'preventDefault');

            wrapper.getComponent('[name="name"]').vm.$emit('update:modelValue', 'new player value');
            wrapper.getComponent('[name="twitter"]').vm.$emit('update:modelValue', '@newtwit');
            wrapper.getComponent('[name="pronouns"]').vm.$emit('update:modelValue', 'they/them');
            await wrapper.vm.$nextTick();

            wrapper.getComponent('[data-test="update-button"]').vm.$emit('right-click', event);
            await wrapper.vm.$nextTick();

            expect(wrapper.getComponent('[name="name"]').attributes().modelvalue).toEqual('cool caster');
            expect(wrapper.getComponent('[name="twitter"]').attributes().modelvalue).toEqual('@ccaster');
            expect(wrapper.getComponent('[name="pronouns"]').attributes().modelvalue).toEqual('he/him');
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('saves to store and emits event on click if caster is uncommitted', async () => {
            const pinia = createTestingPinia();
            const store = useCasterStore();
            store.saveUncommittedCaster = jest.fn().mockResolvedValue('new-caster-id');
            // @ts-ignore
            const wrapper = mount(CasterEditor, {
                global: {
                    plugins: [ pinia ]
                },
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him', uncommitted: true },
                    casterId: 'casterid',
                    uncommitted: true
                }
            });

            wrapper.getComponent('[data-test="update-button"]').vm.$emit('click');
            await flushPromises();

            expect(store.saveUncommittedCaster).toHaveBeenCalledWith({
                id: 'casterid',
                caster: { name: 'cool caster', pronouns: 'he/him', twitter: '@ccaster' }
            });
            const saveEvents = wrapper.emitted('save');
            expect(saveEvents.length).toEqual(1);
            expect(saveEvents[0]).toEqual(['new-caster-id']);
        });

        it('does nothing on right click if caster is uncommitted', async () => {
            const pinia = createTestingPinia();
            const wrapper = mount(CasterEditor, {
                global: {
                    plugins: [ pinia ]
                },
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him' },
                    casterId: 'casterid',
                    uncommitted: true
                }
            });
            const event = new Event(null);
            jest.spyOn(event, 'preventDefault');

            wrapper.getComponent('[name="name"]').vm.$emit('update:modelValue', 'new player value');
            wrapper.getComponent('[name="twitter"]').vm.$emit('update:modelValue', '@newtwit');
            wrapper.getComponent('[name="pronouns"]').vm.$emit('update:modelValue', 'they/them');
            await wrapper.vm.$nextTick();

            wrapper.getComponent('[data-test="update-button"]').vm.$emit('right-click', event);
            await wrapper.vm.$nextTick();

            expect(wrapper.getComponent('[name="name"]').attributes().modelvalue).toEqual('new player value');
            expect(wrapper.getComponent('[name="twitter"]').attributes().modelvalue).toEqual('@newtwit');
            expect(wrapper.getComponent('[name="pronouns"]').attributes().modelvalue).toEqual('they/them');
            expect(event.preventDefault).not.toHaveBeenCalled();
        });

        it('is disabled if there are three or more casters and the given caster is uncommitted', () => {
            const pinia = createTestingPinia();
            const store = useCasterStore();
            store.casters = {
                // @ts-ignore
                a: {},
                // @ts-ignore
                b: {},
                // @ts-ignore
                c: {}
            };
            const wrapper = mount(CasterEditor, {
                global: {
                    plugins: [ pinia ]
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
            const pinia = createTestingPinia();
            const store = useCasterStore();
            store.casters = {
                // @ts-ignore
                a: {},
                // @ts-ignore
                b: {},
                // @ts-ignore
                c: {}
            };
            const wrapper = mount(CasterEditor, {
                global: {
                    plugins: [ pinia ]
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
            const pinia = createTestingPinia();
            const store = useCasterStore();
            store.removeUncommittedCaster = jest.fn();
            const wrapper = mount(CasterEditor, {
                global: {
                    plugins: [ pinia ]
                },
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him' },
                    casterId: 'casterid',
                    uncommitted: true
                }
            });

            wrapper.getComponent('[data-test="remove-button"]').vm.$emit('click');

            expect(store.removeUncommittedCaster).toHaveBeenCalledWith('casterid');
        });

        it('sends remove event to store if committed', () => {
            const pinia = createTestingPinia();
            const store = useCasterStore();
            store.removeCaster = jest.fn();
            const wrapper = mount(CasterEditor, {
                global: {
                    plugins: [ pinia ]
                },
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him' },
                    casterId: 'casterid',
                    uncommitted: false
                }
            });

            wrapper.getComponent('[data-test="remove-button"]').vm.$emit('click');

            expect(store.removeCaster).toHaveBeenCalledWith('casterid');
        });
    });

    describe('formatters', () => {
        const pinia = createTestingPinia();
        const wrapper = mount(CasterEditor, {
            global: {
                plugins: [ pinia ]
            },
            props: {
                caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him' },
                casterId: 'casterid',
                uncommitted: false
            }
        });

        describe('pronounFormatter', () => {
            const formatter = (wrapper.getComponent('[name="pronouns"]')
                .vm.$props as { formatter: (value: string) => string }).formatter;

            it('converts input to lower case', () => {
                expect(formatter('YEEHAW')).toEqual('yeehaw');
                expect(formatter('tEST1234')).toEqual('test1234');
            });
        });

        describe('twitterFormatter', () => {
            const formatter = (wrapper.getComponent('[name="twitter"]')
                .vm.$props as { formatter: (value: string) => string }).formatter;

            it('adds @ symbol before text if it is not present', () => {
                expect(formatter('Gamer')).toEqual('@Gamer');
                expect(formatter('gaming')).toEqual('@gaming');
            });

            it('does nothing if input already starts with an @ symbol', () => {
                expect(formatter('@yeehaw')).toEqual('@yeehaw');
                expect(formatter('@TEST123')).toEqual('@TEST123');
            });
        });
    });
});
