import IplProgressBar from '../iplProgressBar.vue';
import { mount } from '@vue/test-utils';

describe('IplProgressBar', () => {
    it('sets progress bar width from props', () => {
        const wrapper = mount(IplProgressBar, { props: { value: 64, color: 'blue' } });

        expect((wrapper.get('.progress-bar').element as HTMLElement).style.width).toEqual('64%');
    });

    it('restricts bar width to only 4% or more', () => {
        const wrapper = mount(IplProgressBar, { props: { value: 1, color: 'pink', backgroundColor: 'dark' } });

        expect((wrapper.get('.progress-bar').element as HTMLElement).style.width).toEqual('4%');
    });

    it('restricts bar width to 100% or less', () => {
        const wrapper = mount(IplProgressBar, { props: { value: 110, color: 'pink', backgroundColor: 'dark' } });

        expect((wrapper.get('.progress-bar').element as HTMLElement).style.width).toEqual('100%');
    });

    it('sets progress bar color from props', () => {
        const wrapper = mount(IplProgressBar, { props: { value: 23, color: 'pink' } });

        expect((wrapper.get('.progress-bar').element as HTMLElement).style.backgroundColor).toEqual('rgb(245, 0, 155)');
    });

    it('sets background color from props', () => {
        const wrapper = mount(IplProgressBar, { props: { value: 23, color: 'pink', backgroundColor: 'dark' } });

        expect((wrapper.get('.ipl-progress-bar__wrapper').element as HTMLElement).style.backgroundColor)
            .toEqual('rgb(38, 47, 64)');
    });
});
