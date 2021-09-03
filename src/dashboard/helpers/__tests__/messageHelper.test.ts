import { hideMessage, showMessage } from '../messageHelper';
import { elementById } from '../elemHelper';

describe('messageHelper', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('showMessage', () => {
        it('creates message if one does not exist', () => {
            showMessage('msg', 'info', 'Message!', elem => { document.body.appendChild(elem); });

            expect(elementById('msg').outerHTML).toMatchSnapshot();
        });

        it('edits existing message to match given parameters', () => {
            showMessage('msg1212', 'info', 'Message!', elem => { document.body.appendChild(elem); });
            showMessage('msg1212', 'warning', 'Message?');

            expect(elementById('msg1212').outerHTML).toMatchSnapshot();
        });
    });

    describe('hideMessage', () => {
        it('sets display property of existing element', () => {
            const message = document.createElement('div');
            message.id = 'msgmsg';
            document.body.appendChild(message);

            hideMessage('msgmsg');

            expect(message.style.display).toEqual('none');
        });
    });
});
