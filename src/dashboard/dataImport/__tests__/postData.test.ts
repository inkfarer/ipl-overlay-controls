import { sendLocalFile } from '../postData';

describe('postData', () => {
    describe('sendLocalFile', () => {
        it('posts team data', () => {
            const input = document.createElement('input');
            const file = new File([], 'new-file.json');
            Object.defineProperty(input, 'files', { value: [file], writable: false });
            const expectedFormData = new FormData();
            expectedFormData.append('file', file);
            expectedFormData.append('jsonType', 'teams');
            global.fetch = jest.fn().mockResolvedValue({ status: 200 });

            sendLocalFile('teams', input, document.createElement('div'));

            expect(fetch).toHaveBeenCalledWith('/ipl-overlay-controls/upload-tournament-json', {
                method: 'POST',
                body: expectedFormData
            });
        });

        it('posts round data', () => {
            const input = document.createElement('input');
            const file = new File([], 'new-file.json');
            Object.defineProperty(input, 'files', { value: [file], writable: false });
            const expectedFormData = new FormData();
            expectedFormData.append('file', file);
            expectedFormData.append('jsonType', 'rounds');
            global.fetch = jest.fn().mockResolvedValue({ status: 200 });

            sendLocalFile('rounds', input, document.createElement('div'));

            expect(fetch).toHaveBeenCalledWith('/ipl-overlay-controls/upload-tournament-json', {
                method: 'POST',
                body: expectedFormData
            });
        });

        it('logs on bad status', async () => {
            const input = document.createElement('input');
            const file = new File([], 'new-file.json');
            Object.defineProperty(input, 'files', { value: [file], writable: false });
            const expectedFormData = new FormData();
            expectedFormData.append('file', file);
            expectedFormData.append('jsonType', 'rounds');
            global.fetch = jest.fn().mockResolvedValue({ status: 401 });
            console.error = jest.fn();

            await sendLocalFile('rounds', input, document.createElement('div'));

            expect(console.error).toHaveBeenCalledWith('Import failed with status 401');
        });
    });
});
