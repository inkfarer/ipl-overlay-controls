import IplExpandingSpaceGroup from '../iplExpandingSpaceGroup.vue';
import { shallowMount } from '@vue/test-utils';
import { Ref } from 'vue';

describe('IplExpandingSpaceGroup', () => {
    it('provides reactive string to child components', () => {
        const wrapper = shallowMount(IplExpandingSpaceGroup);
        const providedRef: Ref<string>
            = (wrapper.vm.$ as unknown as { provides: Record<string, Ref> }).provides.activeSpace;

        expect(providedRef).toBeTruthy();
        expect(providedRef.value).toBeNull();
    });
});
