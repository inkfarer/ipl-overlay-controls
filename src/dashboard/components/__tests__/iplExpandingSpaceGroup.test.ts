import IplExpandingSpaceGroup from '../iplExpandingSpaceGroup.vue';
import { shallowMount } from '@vue/test-utils';
import { Ref } from 'vue';

describe('IplExpandingSpaceGroup', () => {
    it('gets the active space from props and provides it to child components', () => {
        const wrapper = shallowMount(IplExpandingSpaceGroup, { props: { modelValue: 'coolspace' } });
        const providedRef: Ref<string>
            = (wrapper.vm.$ as unknown as { provides: Record<string, Ref> }).provides.activeSpace;

        expect(providedRef).toBeTruthy();
        expect(providedRef.value).toEqual('coolspace');
    });
});
