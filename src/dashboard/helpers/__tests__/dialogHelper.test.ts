import { mockDialog, mockGetDialog } from '../../__mocks__/mockNodecg';
import { closeDialog } from '../dialogHelper';

describe('dialogHelper', () => {
    describe('closeDialog', () => {
        it('gets and closes given dialog', () => {
            closeDialog('dialog');

            expect(mockGetDialog).toHaveBeenCalledWith('dialog');
            expect(mockDialog.close).toHaveBeenCalled();
        });
    });
});
