import { addChangeReminder, setToggleButtonDisabled } from '../buttonHelper';
import { dispatch } from '../elemHelper';

describe('buttonHelper', () => {
    describe('setToggleButtonDisabled', () => {
        it('sets true toggle as disabled if state is true', () => {
            const toggleTrue = document.createElement('button');
            const toggleFalse = document.createElement('button');

            setToggleButtonDisabled(toggleTrue, toggleFalse, true);

            expect(toggleTrue.disabled).toEqual(true);
            expect(toggleFalse.disabled).toEqual(false);
        });

        it('sets false toggle as disabled if state is false', () => {
            const toggleTrue = document.createElement('button');
            const toggleFalse = document.createElement('button');

            setToggleButtonDisabled(toggleTrue, toggleFalse, false);

            expect(toggleTrue.disabled).toEqual(false);
            expect(toggleFalse.disabled).toEqual(true);
        });
    });

    describe('addChangeReminder', () => {
        it('sets button reminder on input', () => {
            const input = document.createElement('input');
            const button = document.createElement('button');

            addChangeReminder([input], button);
            dispatch(input, 'input');

            expect(button.style.backgroundColor).toEqual('rgb(231, 78, 54)');
            expect(input.dataset.edited).toEqual('true');
        });

        it('sets button reminder on select change', () => {
            const select = document.createElement('select');
            const button = document.createElement('button');

            addChangeReminder([select], button);
            dispatch(select, 'change');

            expect(button.style.backgroundColor).toEqual('rgb(231, 78, 54)');
            expect(select.dataset.edited).toEqual('true');
        });

        it('clears reminder on button click', () => {
            const input = document.createElement('input');
            const button = document.createElement('button');
            const select = document.createElement('select');

            addChangeReminder([input, select], button);
            dispatch(input, 'input');
            dispatch(select, 'change');
            dispatch(button, 'click');

            expect(button.style.backgroundColor).toEqual('rgb(63, 81, 181)');
            expect(input.dataset.edited).toEqual('false');
            expect(select.dataset.edited).toEqual('false');
        });
    });
});
