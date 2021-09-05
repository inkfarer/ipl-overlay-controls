import { setValueIfNotEdited } from '../inputHelper';

describe('setValueIfNotEdited', () => {
    it('does not change value if dataset.edited is true', () => {
        const input = document.createElement('input');
        input.dataset.edited = 'true';
        input.value = 'oldoldvaluevalue';

        setValueIfNotEdited(input, 'newnewvaluevalue');

        expect(input.value).toEqual('oldoldvaluevalue');
    });

    it('changes value if dataset.edited is unset', () => {
        const input = document.createElement('input');
        input.value = 'oldoldvaluevalue';

        setValueIfNotEdited(input, 'newnewvaluevalue');

        expect(input.value).toEqual('newnewvaluevalue');
    });
    
    it('changes value if dataset.edited is false', () => {
        const input = document.createElement('input');
        input.dataset.edited = 'false';
        input.value = 'oldoldvaluevalue';

        setValueIfNotEdited(input, 'newnewvaluevalue');

        expect(input.value).toEqual('newnewvaluevalue');
    });
});
