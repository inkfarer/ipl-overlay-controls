import { ImportStatus } from 'types/enums/importStatus';
import difference from 'lodash/difference';
import { setImportStatus } from '../importStatusHelper';

describe('importStatusHelper', () => {
    describe('setImportStatus', () => {
        jest.useFakeTimers();

        Object.keys(ImportStatus).forEach(status => {
            it(`matches snapshot for status ${status}`, () => {
                const elem = document.createElement('div');

                setImportStatus((status as ImportStatus), elem);

                expect(elem.outerHTML + elem.innerText).toMatchSnapshot();
            });
        });

        difference(Object.keys(ImportStatus), [ImportStatus.LOADING, ImportStatus.NO_STATUS]).forEach(status => {
            it(`resets import status after timeout if status is ${status}`, () => {
                const elem = document.createElement('div');

                setImportStatus((status as ImportStatus), elem);
                jest.runAllTimers();

                expect(elem.outerHTML + elem.innerText)
                    .toEqual('<div style="background-color: rgb(24, 30, 41); color: white;"></div>STATUS');
            });
        });
    });
});
