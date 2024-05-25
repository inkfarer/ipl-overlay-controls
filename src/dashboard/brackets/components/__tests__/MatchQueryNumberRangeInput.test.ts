import { shallowMount } from '@vue/test-utils';
import MatchQueryNumberRangeInput from '../MatchQueryNumberRangeInput.vue';
import { IplRadio } from '@iplsplatoon/vue-components';

describe('MatchQueryNumberRangeInput', () => {
    it('Renders a selector with the expected options', () => {
        const wrapper = shallowMount(MatchQueryNumberRangeInput, {
            props: {
                min: 2,
                max: 5,
                label: 'test-label',
                modelValue: '4'
            }
        });

        const radio = wrapper.getComponent(IplRadio);
        expect(radio.vm.options).toEqual([
            { name: '2', value: '2' },
            { name: '3', value: '3' },
            { name: '4', value: '4' },
            { name: '5', value: '5' }
        ]);
        expect(radio.vm.label).toEqual('test-label');
        expect(radio.vm.modelValue).toEqual('4');
    });

    it('handles updates from the inner radio button', () => {
        const wrapper = shallowMount(MatchQueryNumberRangeInput, {
            props: {
                min: 2,
                max: 5,
                label: 'test-label'
            }
        });

        const radio = wrapper.getComponent(IplRadio);
        radio.vm.$emit('update:modelValue', '3');

        expect(wrapper.emitted('update:modelValue')).toEqual([['3']]);
    });
});
