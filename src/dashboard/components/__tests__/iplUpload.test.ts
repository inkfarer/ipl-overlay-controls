import IplUpload from '../iplUpload.vue';
import { config, mount } from '@vue/test-utils';

describe('IplUpload', () => {
    config.global.stubs = {
        FontAwesomeIcon: true
    };

    it('has class when dragged over', async () => {
        const wrapper = mount(IplUpload, { props: { modelValue: null } });
        const label = wrapper.get('.ipl-upload');

        await label.trigger('dragenter');

        expect(label.classes()).toContain('active');
    });

    it('has no class when drag ends', async () => {
        const wrapper = mount(IplUpload, { props: { modelValue: null } });
        const label = wrapper.get('.ipl-upload');

        await label.trigger('dragenter');
        await label.trigger('dragleave');

        expect(label.classes()).not.toContain('active');
    });

    it('has no class when drag ends with drop event', async () => {
        const wrapper = mount(IplUpload, { props: { modelValue: null } });
        const label = wrapper.get('.ipl-upload');

        await label.trigger('dragenter');
        await label.trigger('drop', { dataTransfer: { items: []} });

        expect(label.classes()).not.toContain('active');
    });

    it('shows file data if a file is uploaded', () => {
        const mockFile = new File([], 'mock-file.jpg');
        const wrapper = mount(IplUpload, { props: { modelValue: mockFile } });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('shows message if no file is uploaded', () => {
        const wrapper = mount(IplUpload, { props: { modelValue: null } });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('emits update when a file is dropped onto the element', async () => {
        const mockFile = new File([], 'mock-file');
        const wrapper = mount(IplUpload, { props: { modelValue: null } });
        const label = wrapper.get('.ipl-upload');

        await label.trigger('drop', {
            dataTransfer: {
                items: [
                    { kind: 'string' },
                    { kind: 'file', getAsFile: () => mockFile }
                ]
            }
        });

        const updates = wrapper.emitted('update:modelValue');
        expect(updates.length).toEqual(1);
        expect(updates[0]).toEqual([mockFile]);
    });

    it('emits no update if something other than a file was dropped onto the element', async () => {
        const wrapper = mount(IplUpload, { props: { modelValue: null } });
        const label = wrapper.get('.ipl-upload');

        await label.trigger('drop', {
            dataTransfer: {
                items: [
                    { kind: 'string' }
                ]
            }
        });

        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('emits update on file input change', async () => {
        const mockFile = new File([], 'mock-file');
        const wrapper = mount(IplUpload, { props: { modelValue: null } });
        const input = wrapper.get('.ipl-upload input');

        // A hacky way to overwrite an input's files property without it causing errors
        Object.defineProperty(input.element, 'files', { value: [mockFile]});
        await input.trigger('change');

        const updates = wrapper.emitted('update:modelValue');
        expect(updates.length).toEqual(1);
        expect(updates[0]).toEqual([mockFile]);
    });

    it('emits no change if file input is changed to no file', async () => {
        const wrapper = mount(IplUpload, { props: { modelValue: null } });
        const input = wrapper.get('.ipl-upload input');

        Object.defineProperty(input.element, 'files', { value: []});
        await input.trigger('change');

        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });
});
