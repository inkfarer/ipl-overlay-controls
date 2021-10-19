import IplButton from '../iplButton.vue';
import { config, shallowMount } from '@vue/test-utils';
import { buttonColors } from '../../styles/colors';

describe('iplButton', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    config.global.stubs = {
        FontAwesomeIcon: true
    };

    it('applies label to element', () => {
        const wrapper = shallowMount(IplButton, { props: { label: 'Button' } });

        expect(wrapper.find('span.label').text()).toEqual('Button');
    });

    it('creates icon if given', () => {
        const wrapper = shallowMount(IplButton, { props: { icon: 'cool-icon' } });

        expect(wrapper.find('font-awesome-icon-stub.icon').attributes().icon).toEqual('cool-icon');
    });

    it('does not create label element if icon is given', () => {
        const wrapper = shallowMount(IplButton, { props: { icon: 'cool-icon', label: 'something' } });

        expect(wrapper.find('span.label').exists()).toEqual(false);
        expect(wrapper.find('font-awesome-icon-stub.icon').exists()).toEqual(true);
    });

    it('throws error if icon and label are both missing', () => {
        expect(() => shallowMount(IplButton, { props: { icon: undefined, label: '' } }))
            .toThrow('ipl-button requires an icon or label to be provided.');
    });

    it('applies appropriate style according to color prop', () => {
        const redWrapper = shallowMount(IplButton, { props: { label: 'Button', color: 'red' } });
        const greenWrapper = shallowMount(IplButton, { props: { label: 'Button', color: 'green' } });

        expect(redWrapper.find('a').element.style.backgroundColor).toEqual('rgb(231, 78, 54)');
        expect(greenWrapper.find('a').element.style.backgroundColor).toEqual('rgb(0, 166, 81)');
    });

    it('emits event on click', async () => {
        const wrapper = shallowMount(IplButton, { props: { label: 'Button' } });

        await wrapper.find('a').trigger('click');

        expect(wrapper.emitted().click.length).toEqual(1);
    });

    it('does not emit event if disabled', async () => {
        const wrapper = shallowMount(IplButton, { props: { label: 'Button', disabled: true } });

        await wrapper.find('a').trigger('click');

        expect(wrapper.emitted().click).toBeUndefined();
    });

    it('gives class to link button element if disabled', () => {
        const wrapper = shallowMount(IplButton, { props: { label: 'Button', disabled: true } });

        expect(wrapper.find('a').classes()).toContain('disabled');
    });

    it('gives class to link button element if element has icon', () => {
        const wrapper = shallowMount(IplButton, { props: { icon: 'dope-icon' } });

        expect(wrapper.find('a').classes()).toContain('has-icon');
    });

    describe('validator: color', () => {
        const validator = IplButton.props.color.validator as (value: string) => boolean;

        Object.keys(buttonColors).forEach(color => {
            it(`allows color '${color}'`, () => {
                expect(validator(color)).toEqual(true);
            });
        });

        it('does not allow unknown colors', () => {
            expect(validator('something that is not a color')).toEqual(false);
        });
    });

    describe('async behavior', () => {
        it('disables button and applies label provided in props to button when action is in progress', async () => {
            const wrapper = shallowMount(IplButton, {
                props: {
                    label: 'Button',
                    async: true,
                    progressMessage: 'Loading...'
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            wrapper.vm.$.vnode.props.onClick = jest.fn().mockReturnValue(new Promise(() => { }));
            const button = wrapper.find('a');

            await button.trigger('click');

            expect(wrapper.vm.disabledInternal).toEqual(true);
            expect(button.classes()).toContain('disabled');
            expect(button.text()).toEqual('Loading...');
        });

        it('applies label provided in props and uses appropriate color on success', async () => {
            const wrapper = shallowMount(IplButton, {
                props: {
                    label: 'Button',
                    async: true,
                    successMessage: 'All good!'
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            wrapper.vm.$.vnode.props.onClick = jest.fn().mockResolvedValue({});
            const button = wrapper.find('a');

            await button.trigger('click');
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.disabledInternal).toEqual(false);
            expect(button.text()).toEqual('All good!');
            expect((wrapper.vm.buttonStyle as { backgroundColor: string }).backgroundColor).toEqual('#00A651');
        });

        it('uses different success color if idle color is already green', async () => {
            const wrapper = shallowMount(IplButton, {
                props: {
                    label: 'Button',
                    async: true,
                    successMessage: 'All good!',
                    color: 'green'
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            wrapper.vm.$.vnode.props.onClick = jest.fn().mockResolvedValue({});
            const button = wrapper.find('a');

            await button.trigger('click');
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.disabledInternal).toEqual(false);
            expect(button.text()).toEqual('All good!');
            expect((wrapper.vm.buttonStyle as { backgroundColor: string }).backgroundColor).toEqual('#18C682');
        });

        it('resets successful button state after a timeout period', async () => {
            // @ts-ignore: Fine for testing
            jest.spyOn(global.window, 'setTimeout').mockImplementation(handler => {
                handler();
            });
            const wrapper = shallowMount(IplButton, {
                props: {
                    label: 'Button',
                    async: true,
                    successMessage: 'All good!',
                    color: 'green'
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            wrapper.vm.$.vnode.props.onClick = jest.fn().mockResolvedValue({});
            const button = wrapper.find('a');

            await button.trigger('click');
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.disabledInternal).toEqual(false);
            expect(button.text()).toEqual('Button');
            expect(wrapper.vm.buttonState).toEqual('idle');
            expect(global.window.setTimeout).toHaveBeenCalled();
        });

        it('applies label provided in props and uses appropriate color on failure', async () => {
            const wrapper = shallowMount(IplButton, {
                props: {
                    label: 'Button',
                    async: true
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            wrapper.vm.$.vnode.props.onClick = jest.fn().mockRejectedValue({});
            const button = wrapper.find('a');

            await button.trigger('click');
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.disabledInternal).toEqual(false);
            expect(button.text()).toEqual('Error!');
            expect((wrapper.vm.buttonStyle as { backgroundColor: string }).backgroundColor).toEqual('#e74e36');
        });

        it('uses different failure color if idle color is already red', async () => {
            const wrapper = shallowMount(IplButton, {
                props: {
                    label: 'Button',
                    async: true,
                    color: 'red'
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            wrapper.vm.$.vnode.props.onClick = jest.fn().mockRejectedValue({});
            const button = wrapper.find('a');

            await button.trigger('click');
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.disabledInternal).toEqual(false);
            expect(button.text()).toEqual('Error!');
            expect((wrapper.vm.buttonStyle as { backgroundColor: string }).backgroundColor).toEqual('#FF682E');
        });

        it('resets unsuccessful button state after a timeout period', async () => {
            // @ts-ignore: Fine for testing
            jest.spyOn(global.window, 'setTimeout').mockImplementation(handler => {
                handler();
            });
            const wrapper = shallowMount(IplButton, {
                props: {
                    label: 'Button',
                    async: true
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            wrapper.vm.$.vnode.props.onClick = jest.fn().mockRejectedValue({});
            const button = wrapper.find('a');

            await button.trigger('click');
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.disabledInternal).toEqual(false);
            expect(button.text()).toEqual('Button');
            expect(wrapper.vm.buttonState).toEqual('idle');
            expect(global.window.setTimeout).toHaveBeenCalled();
        });
    });
});
