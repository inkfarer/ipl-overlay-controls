import { MockNodecg } from '../../__mocks__/mockNodecg_legacy';
import { dispatch, elementById } from '../../helpers/elemHelper';
import { NextRoundStartTime } from 'schemas';
import { DateTime } from 'luxon';

describe('mainScene', () => {
    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <input id="flavor-text-input">
            <input id="next-stage-minute-input">
            <input id="next-stage-hour-input">
            <input id="next-stage-timer-toggle">
            <select id="next-stage-day-select">
                <option selected value="21/10/2022">21/10</option>
                <option value="21/09/2022">21/09</option>
            </select>
            <button id="main-scene-update-btn"></button>`;

        require('../mainScene');
    });

    describe('mainFlavorText: change', () => {
        it('sets input value', () => {
            nodecg.listeners.mainFlavorText('NEW FLAVOR TEXT!!!');

            expect(elementById<HTMLInputElement>('flavor-text-input').value).toEqual('NEW FLAVOR TEXT!!!');
        });
    });

    describe('main-scene-update-btn: click', () => {
        it('updates flavor text', () => {
            elementById<HTMLInputElement>('flavor-text-input').value = 'cool flavor text?!?!?!';

            dispatch(elementById('main-scene-update-btn'), 'click');

            expect(nodecg.replicants.mainFlavorText.value).toEqual('cool flavor text?!?!?!');
        });

        it('updates next stage time', () => {
            elementById<HTMLInputElement>('next-stage-hour-input').value = '10';
            elementById<HTMLInputElement>('next-stage-minute-input').value = '59';
            nodecg.replicants.nextRoundStartTime.value = { startTime: '2021-21-03' };

            dispatch(elementById('main-scene-update-btn'), 'click');

            expect((nodecg.replicants.nextRoundStartTime.value as NextRoundStartTime).startTime)
                .toEqual(DateTime.fromObject({ hour: 10, minute: 59, year: 2022, day: 21, month: 10 }).toUTC().toISO());
        });

        it('does not set next stage time if no valid hour is given', () => {
            elementById<HTMLInputElement>('next-stage-hour-input').value = 'foobar';
            elementById<HTMLInputElement>('next-stage-minute-input').value = '59';
            nodecg.replicants.nextRoundStartTime.value = { startTime: '2021-21-03' };

            dispatch(elementById('main-scene-update-btn'), 'click');

            expect((nodecg.replicants.nextRoundStartTime.value as NextRoundStartTime).startTime)
                .toEqual('2021-21-03');
        });

        it('does not set next stage time if no valid minute is given', () => {
            elementById<HTMLInputElement>('next-stage-hour-input').value = '10';
            elementById<HTMLInputElement>('next-stage-minute-input').value = 'something';
            nodecg.replicants.nextRoundStartTime.value = { startTime: '2021-21-03' };

            dispatch(elementById('main-scene-update-btn'), 'click');

            expect((nodecg.replicants.nextRoundStartTime.value as NextRoundStartTime).startTime)
                .toEqual('2021-21-03');
        });

        it('does not set next stage time if no date is given', () => {
            elementById<HTMLInputElement>('next-stage-hour-input').value = '10';
            elementById<HTMLInputElement>('next-stage-minute-input').value = 'something';
            elementById('next-stage-day-select').innerHTML = '';
            nodecg.replicants.nextRoundStartTime.value = { startTime: '2021-21-03' };

            dispatch(elementById('main-scene-update-btn'), 'click');

            expect((nodecg.replicants.nextRoundStartTime.value as NextRoundStartTime).startTime)
                .toEqual('2021-21-03');
        });
    });

    describe('next-stage-timer-toggle: change', () => {
        it('sets visible to true if checked', () => {
            nodecg.replicants.nextRoundStartTime.value = { isVisible: undefined };
            const toggle = elementById<HTMLInputElement>('next-stage-timer-toggle');
            toggle.checked = true;

            dispatch(toggle, 'change');

            expect((nodecg.replicants.nextRoundStartTime.value as NextRoundStartTime).isVisible).toEqual(true);
        });

        it('sets visible to false if unchecked', () => {
            nodecg.replicants.nextRoundStartTime.value = { isVisible: undefined };
            const toggle = elementById<HTMLInputElement>('next-stage-timer-toggle');
            toggle.checked = false;

            dispatch(toggle, 'change');

            expect((nodecg.replicants.nextRoundStartTime.value as NextRoundStartTime).isVisible).toEqual(false);
        });
    });

    describe('nextRoundStartTime: change', () => {
        it('updates inputs if time differs from today and tomorrow', () => {
            const dateString = '2020-10-21T07:59:00.000Z';
            const isoDate = DateTime.fromISO(dateString);
            const localDate = isoDate.toLocal();

            nodecg.listeners.nextRoundStartTime({ startTime: dateString });

            expect(elementById<HTMLInputElement>('next-stage-hour-input').value).toEqual(localDate.toFormat('HH'));
            expect(elementById<HTMLInputElement>('next-stage-minute-input').value).toEqual(localDate.toFormat('mm'));
            const daySelect = elementById<HTMLSelectElement>('next-stage-day-select');
            expect(daySelect.value).toEqual('21/10/2020');
            expect(daySelect.options[daySelect.selectedIndex].text).toEqual('21/10');
            expect(daySelect.options.length).toEqual(3);
        });

        it('updates inputs if time is today', () => {
            const now = DateTime.now();
            const dateString = now.toUTC().toISO();

            nodecg.listeners.nextRoundStartTime({ startTime: dateString });
            const daySelect = elementById<HTMLSelectElement>('next-stage-day-select');
            expect(daySelect.value).toEqual(now.toFormat('dd/MM/yyyy'));
            expect(daySelect.options[daySelect.selectedIndex].text).toEqual(now.toFormat('dd/MM'));
            expect(daySelect.options.length).toEqual(2);
        });

        it('updates inputs if time is tomorrow', () => {
            const tomorrow = DateTime.now().plus({ days: 1 });
            const dateString = tomorrow.toUTC().toISO();

            nodecg.listeners.nextRoundStartTime({ startTime: dateString });
            const daySelect = elementById<HTMLSelectElement>('next-stage-day-select');
            expect(daySelect.value).toEqual(tomorrow.toFormat('dd/MM/yyyy'));
            expect(daySelect.options[daySelect.selectedIndex].text).toEqual(tomorrow.toFormat('dd/MM'));
            expect(daySelect.options.length).toEqual(2);
        });
    });

    describe('next-stage-hour-input: change', () => {
        it('pads value', () => {
            const hourInput = elementById<HTMLInputElement>('next-stage-hour-input');
            hourInput.value = '6';

            dispatch(hourInput, 'change');

            expect(hourInput.value).toEqual('06');
        });

        it('does not pad value if it is not necessary', () => {
            const hourInput = elementById<HTMLInputElement>('next-stage-hour-input');
            hourInput.value = '10';

            dispatch(hourInput, 'change');

            expect(hourInput.value).toEqual('10');
        });

        it('clamps input value', () => {
            const input = elementById<HTMLInputElement>('next-stage-hour-input');
            input.value = '50';

            dispatch(input, 'change');

            expect(input.value).toEqual('23');
        });
    });

    describe('next-stage-minute-input: change', () => {
        it('pads value', () => {
            const input = elementById<HTMLInputElement>('next-stage-minute-input');
            input.value = '4';

            dispatch(input, 'change');

            expect(input.value).toEqual('04');
        });

        it('does not pad value if it is not necessary', () => {
            const input = elementById<HTMLInputElement>('next-stage-minute-input');
            input.value = '10';

            dispatch(input, 'change');

            expect(input.value).toEqual('10');
        });

        it('clamps input value', () => {
            const input = elementById<HTMLInputElement>('next-stage-minute-input');
            input.value = '1000';

            dispatch(input, 'change');

            expect(input.value).toEqual('59');
        });
    });
});
