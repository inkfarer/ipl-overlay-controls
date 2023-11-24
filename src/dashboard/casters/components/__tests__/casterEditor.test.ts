import CasterEditor from '../casterEditor.vue';
import { config, flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { useCasterStore } from '../../../store/casterStore';
import { reactive } from 'vue';
import { createTestingPinia, TestingPinia } from '@pinia/testing';
import { IplButton, IplInput } from '@iplsplatoon/vue-components';
import CasterSearch from '../casterSearch.vue';

describe('CasterEditor', () => {
    let pinia: TestingPinia;

    beforeEach(() => {
        pinia = createTestingPinia();
        config.global.plugins = [pinia];
    });

    config.global.stubs = {
        IplInput: true,
        IplButton: true,
        CasterSearch: true
    };

    it('fills inputs with caster data', () => {
        const wrapper = mount(CasterEditor, {
            props: {
                caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'they/them', id: 'test-caster-id', uncommitted: false }
            }
        });

        expect(wrapper.getComponent('[name="name"]').attributes().modelvalue).toEqual('cool caster');
        expect(wrapper.getComponent('[name="twitter"]').attributes().modelvalue).toEqual('@ccaster');
        expect(wrapper.getComponent('[name="pronouns"]').attributes().modelvalue).toEqual('they/them');
    });

    it('updates caster data provided in props', async () => {
        const caster = reactive({ name: 'cool caster', twitter: '@ccaster', pronouns: 'they/them', id: 'casterid', uncommitted: false });
        const wrapper = mount(CasterEditor, {
            props: {
                caster
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
        const caster = reactive({ name: 'cool caster', twitter: '@ccaster', pronouns: 'they/them', id: 'casterid', uncommitted: false });
        const wrapper = mount(CasterEditor, {
            props: {
                caster
            }
        });

        wrapper.getComponent<typeof IplInput>('[name="twitter"]').vm.$emit('focuschange', true);
        await wrapper.setProps({
            caster: { name: 'cool caster (edited)', twitter: '@ccaster', pronouns: 'they/them' }
        });

        expect(wrapper.getComponent('[name="name"]').attributes().modelvalue).toEqual('cool caster');
    });

    it('has expected label and color on update button', () => {
        const wrapper = mount(CasterEditor, {
            props: {
                caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'they/them', id: 'casterid', uncommitted: false }
            }
        });

        const attrs = wrapper.getComponent('[data-test="update-button"]').attributes();
        expect(attrs.label).toEqual('Update');
        expect(attrs.color).toEqual('blue');
    });

    it('has expected label and color on update button if data is uncommitted', () => {
        const wrapper = mount(CasterEditor, {
            props: {
                caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'they/them', id: 'casterid', uncommitted: true }
            }
        });

        const attrs = wrapper.getComponent('[data-test="update-button"]').attributes();
        expect(attrs.label).toEqual('Save');
        expect(attrs.color).toEqual('green');
    });

    it('has expected label and color on update button if data is updated', async () => {
        const wrapper = mount(CasterEditor, {
            props: {
                caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'they/them', id: 'casterid', uncommitted: false }
            }
        });

        wrapper.getComponent<typeof IplInput>('[name="name"]').vm.$emit('update:modelValue', 'new player value');
        await wrapper.vm.$nextTick();

        const attrs = wrapper.getComponent('[data-test="update-button"]').attributes();
        expect(attrs.label).toEqual('Update');
        expect(attrs.color).toEqual('red');
    });

    it('displays expected badges if caster is uncommitted', () => {
        const wrapper = mount(CasterEditor, {
            props: {
                caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'they/them', id: 'casterid', uncommitted: true }
            }
        });

        expect(wrapper.find('.badge.uncommitted-badge').exists()).toEqual(true);
        const pronounBadge = wrapper.find('.badge.pronoun-badge');
        expect(pronounBadge.exists()).toEqual(true);
        expect(pronounBadge.text()).toEqual('they/them');
    });

    it('displays expected badges if caster is committed', () => {
        const wrapper = mount(CasterEditor, {
            props: {
                caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him', id: 'casterid', uncommitted: false }
            }
        });

        expect(wrapper.find('.badge.uncommitted-badge').exists()).toEqual(false);
        const pronounBadge = wrapper.find('.badge.pronoun-badge');
        expect(pronounBadge.exists()).toEqual(true);
        expect(pronounBadge.text()).toEqual('he/him');
    });

    describe('update caster button', () => {
        it('sends update to store on click if caster is committed', () => {
            const store = useCasterStore();
            store.updateCaster = jest.fn();
            // @ts-ignore
            const wrapper = mount(CasterEditor, {
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him', uncommitted: false, id: 'casterid' }
                }
            });

            wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').vm.$emit('click');

            expect(store.updateCaster).toHaveBeenCalledWith({
                id: 'casterid',
                newValue: { name: 'cool caster', pronouns: 'he/him', twitter: '@ccaster' }
            });
        });

        it('reverts changes on right click if caster is committed', async () => {
            // @ts-ignore
            const wrapper = mount(CasterEditor, {
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him', uncommitted: false, id: 'casterid' }
                }
            });
            const event = new Event(null);
            jest.spyOn(event, 'preventDefault');

            wrapper.getComponent<typeof IplInput>('[name="name"]').vm.$emit('update:modelValue', 'new player value');
            wrapper.getComponent<typeof IplInput>('[name="twitter"]').vm.$emit('update:modelValue', '@newtwit');
            wrapper.getComponent<typeof IplInput>('[name="pronouns"]').vm.$emit('update:modelValue', 'they/them');
            await wrapper.vm.$nextTick();

            wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').vm.$emit('rightClick', event);
            await wrapper.vm.$nextTick();

            expect(wrapper.getComponent('[name="name"]').attributes().modelvalue).toEqual('cool caster');
            expect(wrapper.getComponent('[name="twitter"]').attributes().modelvalue).toEqual('@ccaster');
            expect(wrapper.getComponent('[name="pronouns"]').attributes().modelvalue).toEqual('he/him');
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('saves to store and emits event on click if caster is uncommitted', async () => {
            const store = useCasterStore();
            store.createCaster = jest.fn().mockResolvedValue('new-caster-id');
            // @ts-ignore
            const wrapper = mount(CasterEditor, {
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him', uncommitted: true, id: 'casterid' }
                }
            });

            wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').vm.$emit('click');
            await flushPromises();

            expect(store.createCaster).toHaveBeenCalledWith({ name: 'cool caster', pronouns: 'he/him', twitter: '@ccaster' });
            expect(store.removeUncommittedCaster).toHaveBeenCalledWith('casterid');
            const saveEvents = wrapper.emitted('save');
            expect(saveEvents.length).toEqual(1);
            expect(saveEvents[0]).toEqual(['new-caster-id']);
        });

        it('does nothing on right click if caster is uncommitted', async () => {
            const wrapper = mount(CasterEditor, {
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him', id: 'casterid', uncommitted: true }
                }
            });
            const event = new Event(null);
            jest.spyOn(event, 'preventDefault');

            wrapper.getComponent<typeof IplInput>('[name="name"]').vm.$emit('update:modelValue', 'new player value');
            wrapper.getComponent<typeof IplInput>('[name="twitter"]').vm.$emit('update:modelValue', '@newtwit');
            wrapper.getComponent<typeof IplInput>('[name="pronouns"]').vm.$emit('update:modelValue', 'they/them');
            await wrapper.vm.$nextTick();

            wrapper.getComponent<typeof IplButton>('[data-test="update-button"]').vm.$emit('rightClick', event);
            await wrapper.vm.$nextTick();

            expect(wrapper.getComponent('[name="name"]').attributes().modelvalue).toEqual('new player value');
            expect(wrapper.getComponent('[name="twitter"]').attributes().modelvalue).toEqual('@newtwit');
            expect(wrapper.getComponent('[name="pronouns"]').attributes().modelvalue).toEqual('they/them');
            expect(event.preventDefault).not.toHaveBeenCalled();
        });

        it('is disabled if there are three or more casters and the given caster is uncommitted', () => {
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
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him', id: 'casterid', uncommitted: true }
                }
            });

            expect(wrapper.getComponent('[data-test="update-button"]').attributes().disabled).toEqual('true');
        });

        it('is not disabled if there are three or more casters and the given caster is committed', () => {
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
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him', id: 'casterid', uncommitted: false }
                }
            });

            expect(wrapper.getComponent('[data-test="update-button"]').attributes().disabled).toEqual('false');
        });
    });

    describe('remove caster button', () => {
        it('sends remove event to store if uncommitted', () => {
            const store = useCasterStore();
            store.removeUncommittedCaster = jest.fn();
            const wrapper = mount(CasterEditor, {
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him', id: 'casterid', uncommitted: true }
                }
            });

            wrapper.getComponent<typeof IplButton>('[data-test="remove-button"]').vm.$emit('click');

            expect(store.removeUncommittedCaster).toHaveBeenCalledWith('casterid');
        });

        it('sends remove event to store if committed', () => {
            const store = useCasterStore();
            store.removeCaster = jest.fn();
            const wrapper = mount(CasterEditor, {
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him', id: 'casterid', uncommitted: false }
                }
            });

            wrapper.getComponent<typeof IplButton>('[data-test="remove-button"]').vm.$emit('click');

            expect(store.removeCaster).toHaveBeenCalledWith('casterid');
        });
    });

    describe('formatters', () => {
        let wrapper: VueWrapper;

        beforeEach(() => {
            wrapper = mount(CasterEditor, {
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him', id: 'casterid', uncommitted: false }
                }
            });
        });

        describe('pronounFormatter', () => {
            it('converts input to lower case', () => {
                const formatter = (wrapper.getComponent<typeof IplInput>('[name="pronouns"]')
                    .vm.$props as { formatter: (value: string) => string }).formatter;

                expect(formatter('YEEHAW')).toEqual('yeehaw');
                expect(formatter('tEST1234')).toEqual('test1234');
            });
        });

        describe('twitterFormatter', () => {
            let formatter: (value: string) => string;

            beforeEach(() => {
                formatter = (wrapper.getComponent<typeof IplInput>('[name="twitter"]')
                    .vm.$props as { formatter: (value: string) => string }).formatter;
            });

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

    describe('caster search', () => {
        it('is visible when radia is enabled', () => {
            const store = useCasterStore();
            // @ts-ignore
            store.radiaIntegrationEnabled = true;
            const wrapper = mount(CasterEditor, {
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him', id: 'casterid', uncommitted: false }
                }
            });

            expect(wrapper.findComponent('[data-test="caster-search"]').exists()).toEqual(true);
        });

        it('handles a caster being chosen', async () => {
            const store = useCasterStore();
            // @ts-ignore
            store.radiaIntegrationEnabled = true;
            const wrapper = mount(CasterEditor, {
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him', id: 'casterid', uncommitted: false }
                }
            });

            wrapper.findComponent<typeof CasterSearch>('[data-test="caster-search"]').vm.$emit('select', {
                name: 'caster from search',
                twitter: '@fromsearch',
                pronouns: 'they/them'
            });
            await wrapper.vm.$nextTick();

            expect(wrapper.getComponent('[name="name"]').attributes().modelvalue).toEqual('caster from search');
            expect(wrapper.getComponent('[name="twitter"]').attributes().modelvalue).toEqual('@fromsearch');
            expect(wrapper.getComponent('[name="pronouns"]').attributes().modelvalue).toEqual('they/them');
        });

        it('is not present when radia is disabled', () => {
            const pinia = createTestingPinia();
            const store = useCasterStore(pinia);
            // @ts-ignore
            store.radiaIntegrationEnabled = false;
            const wrapper = mount(CasterEditor, {
                props: {
                    caster: { name: 'cool caster', twitter: '@ccaster', pronouns: 'he/him', id: 'casterid', uncommitted: false }
                }
            });

            expect(wrapper.findComponent('[data-test="caster-search"]').exists()).toEqual(false);
        });
    });
});
