import ObsIntegrator from '../obsIntegrator.vue';
import { config, mount } from '@vue/test-utils';

describe('ObsIntegrator', () => {
    config.global.stubs = {
        FontAwesomeIcon: true
    };

    beforeEach(() => {
        window.obsstudio = undefined;
    });

    it('matches snapshot outside obs', () => {
        const wrapper = mount(ObsIntegrator);

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot within obs', () => {
        // @ts-ignore
        window.obsstudio = { pluginVersion: '2.18.9' };

        const wrapper = mount(ObsIntegrator);

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('matches snapshot if obs version is too low', () => {
        // @ts-ignore
        window.obsstudio = { pluginVersion: '2.10.0' };

        const wrapper = mount(ObsIntegrator);

        expect(wrapper.html()).toMatchSnapshot();
    });

    it('hides message after timeout when obs version is too low', async () => {
        jest.useFakeTimers();
        // @ts-ignore
        window.obsstudio = { pluginVersion: '2.10.0' };

        const wrapper = mount(ObsIntegrator);

        expect(wrapper.findComponent('[data-test="outdated-plugin-warning"]').exists()).toEqual(true);
        jest.advanceTimersByTime(60000);
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent('[data-test="outdated-plugin-warning"]').exists()).toEqual(false);
    });
});
