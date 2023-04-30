import NextStageTimeInput from '../nextStageTimeInput.vue';
import { config, mount } from '@vue/test-utils';
import { DateTime } from 'luxon';
import { IplInput, IplSelect, padNumber } from '@iplsplatoon/vue-components';

describe('NextStageTimeInput', () => {
    const mockNow = '2021-01-23T05:54:00Z';

    beforeEach(() => {
        jest.spyOn(DateTime, 'now').mockReturnValue(DateTime.fromISO(mockNow));
    });

    config.global.stubs = {
        IplInput: true,
        IplSelect: true
    };

    it('applies given time to components in local time', () => {
        const dateString = '2021-10-23T05:54:42Z';
        const localDate = DateTime.fromISO(dateString).toLocal();
        const wrapper = mount(NextStageTimeInput, { props: { modelValue: dateString } });

        expect(wrapper.getComponent('[name="hour"]').attributes().modelvalue).toEqual(padNumber(localDate.hour));
        expect(wrapper.getComponent('[name="min"]').attributes().modelvalue).toEqual(padNumber(localDate.minute));
        expect(wrapper.getComponent('[data-test="next-stage-date-select"]').attributes().modelvalue)
            .toEqual(localDate.toFormat('dd/MM/yyyy'));
    });

    it('emits update on hour change', async () => {
        const dateString = '2021-10-23T05:54:00Z';
        const localDate = DateTime.fromISO(dateString).toLocal();
        const wrapper = mount(NextStageTimeInput, { props: { modelValue: dateString } });

        wrapper.getComponent<typeof IplInput>('[name="hour"]').vm.$emit('update:modelValue', String(localDate.hour + 1));
        await wrapper.vm.$nextTick();

        const emitted = wrapper.emitted('update:modelValue');
        expect(emitted.length).toEqual(1);
        expect(emitted[0]).toEqual([ '2021-10-23T06:54:00.000Z' ]);
    });

    it('emits update on minute change', async () => {
        const dateString = '2021-10-23T05:54:00Z';
        const localDate = DateTime.fromISO(dateString).toLocal();
        const wrapper = mount(NextStageTimeInput, { props: { modelValue: dateString } });

        wrapper.getComponent<typeof IplInput>('[name="min"]').vm.$emit('update:modelValue', String(localDate.minute + 2));
        await wrapper.vm.$nextTick();

        const emitted = wrapper.emitted('update:modelValue');
        expect(emitted.length).toEqual(1);
        expect(emitted[0]).toEqual([ '2021-10-23T05:56:00.000Z' ]);
    });

    it('emits update on date change', async () => {
        const wrapper = mount(NextStageTimeInput, { props: { modelValue: '2021-02-23T05:54:00Z' } });

        wrapper.getComponent<typeof IplSelect>('[data-test="next-stage-date-select"]')
            .vm.$emit('update:modelValue', '23/01/2021');
        await wrapper.vm.$nextTick();

        const emitted = wrapper.emitted('update:modelValue');
        expect(emitted.length).toEqual(1);
        expect(emitted[0]).toEqual([ '2021-01-23T05:54:00.000Z' ]);
    });

    it('has expected date options if selected time is today', async () => {
        const wrapper = mount(NextStageTimeInput, { props: { modelValue: mockNow } });

        expect((wrapper.getComponent<typeof IplSelect>('[data-test="next-stage-date-select"]').vm.$props as { options: unknown }).options)
            .toEqual([
                {
                    value: '23/01/2021',
                    name: '23/01'
                },
                {
                    value: '24/01/2021',
                    name: '24/01'
                }
            ]);
    });

    it('has expected date options if selected time is not today', async () => {
        const wrapper = mount(NextStageTimeInput, { props: { modelValue: '2020-12-24T05:54:00Z' } });

        expect((wrapper.getComponent<typeof IplSelect>('[data-test="next-stage-date-select"]').vm.$props as { options: unknown }).options)
            .toEqual([
                {
                    value: '23/01/2021',
                    name: '23/01'
                },
                {
                    value: '24/01/2021',
                    name: '24/01'
                },
                {
                    value: '24/12/2020',
                    name: '24/12'
                }
            ]);
    });

    describe('hourFormatter', () => {
        const wrapper = mount(NextStageTimeInput, { props: { modelValue: '2020-12-24T05:54:00Z' } });

        const formatter = wrapper.getComponent<typeof IplInput>('[name="hour"]').vm.$props.formatter;

        it('normalizes numbers below 0 to zero', () => {
            expect(formatter('-1')).toEqual('00');
        });

        it('normalizes numbers above 23 to 23', () => {
            expect(formatter('999')).toEqual('23');
        });

        it('does nothing to empty values', () => {
            expect(formatter('')).toEqual('');
        });

        it('pads numbers', () => {
            expect(formatter('4')).toEqual('04');
        });
    });

    describe('minuteFormatter', () => {
        const wrapper = mount(NextStageTimeInput, { props: { modelValue: '2020-12-24T05:54:00Z' } });

        const formatter = wrapper.getComponent<typeof IplInput>('[name="min"]').vm.$props.formatter;

        it('normalizes numbers below 0 to zero', () => {
            expect(formatter('-1')).toEqual('00');
        });

        it('normalizes numbers above 59 to 59', () => {
            expect(formatter('75')).toEqual('59');
        });

        it('does nothing to empty values', () => {
            expect(formatter('')).toEqual('');
        });

        it('pads numbers', () => {
            expect(formatter('4')).toEqual('04');
        });
    });
});
