import { perGameData } from '../gameData';

describe('gameData', () => {
    describe('perGameData', () => {
        it('matches snapshot', () => {
            expect(perGameData).toMatchSnapshot();
        });
    });
});
