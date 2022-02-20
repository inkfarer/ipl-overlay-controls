import { replicants } from '../../__mocks__/mockNodecg';
import { getNextColor, getPreviousColor, setActiveColor } from '../activeColorHelper';
import { GameVersion } from '../../../types/enums/gameVersion';

describe('activeColorHelper', () => {
    describe('setActiveColor', () => {
        it('sets color from given data', () => {
            replicants.activeRound = { teamA: { score: 1 }, teamB: { score: 0 } };

            setActiveColor({
                categoryName: 'Cool Colors',
                color: {
                    index: 1,
                    title: 'Cool Color',
                    isCustom: false,
                    clrNeutral: '#222',
                    clrA: '#444',
                    clrB: '#666'
                }
            });

            expect(replicants.activeRound).toEqual({
                teamA: {
                    score: 1,
                    color: '#444'
                },
                teamB: {
                    score: 0,
                    color: '#666'
                },
                activeColor: {
                    categoryName: 'Cool Colors',
                    title: 'Cool Color',
                    index: 1,
                    isCustom: false,
                    clrNeutral: '#222'
                }
            });
        });
    });

    describe('getNextColor', () => {
        it('gets next color', () => {
            replicants.swapColorsInternally = false;
            replicants.runtimeConfig = { gameVersion: GameVersion.SPLATOON_2 };
            replicants.activeRound = {
                activeColor: {
                    categoryName: 'Ranked Modes',
                    index: 2
                }
            };

            expect(getNextColor()).toEqual({
                categoryName: 'Ranked Modes',
                clrA: '#FF9E03',
                clrB: '#B909E0',
                clrNeutral: '#08C66B',
                index: 3,
                isCustom: false,
                title: 'Mustard vs Purple'
            });
        });

        it('gets first color when no next color is available', () => {
            replicants.swapColorsInternally = false;
            replicants.runtimeConfig = { gameVersion: GameVersion.SPLATOON_2 };
            replicants.activeRound = {
                activeColor: {
                    categoryName: 'Ranked Modes',
                    index: 6
                }
            };

            expect(getNextColor()).toEqual({
                categoryName: 'Ranked Modes',
                clrA: '#37FC00',
                clrB: '#7D28FC',
                clrNeutral: '#F4067E',
                index: 0,
                isCustom: false,
                title: 'Green vs Grape'
            });
        });

        it('gets next color when colors are swapped', () => {
            replicants.swapColorsInternally = true;
            replicants.runtimeConfig = { gameVersion: GameVersion.SPLATOON_2 };
            replicants.activeRound = {
                activeColor: {
                    categoryName: 'Ranked Modes',
                    index: 2
                }
            };

            expect(getNextColor()).toEqual({
                categoryName: 'Ranked Modes',
                clrA: '#B909E0',
                clrB: '#FF9E03',
                clrNeutral: '#08C66B',
                index: 3,
                isCustom: false,
                title: 'Mustard vs Purple'
            });
        });
    });

    describe('getPreviousColor', () => {
        it('gets previous color', () => {
            replicants.swapColorsInternally = false;
            replicants.runtimeConfig = { gameVersion: GameVersion.SPLATOON_2 };
            replicants.activeRound = {
                activeColor: {
                    categoryName: 'Ranked Modes',
                    index: 2
                }
            };

            expect(getPreviousColor()).toEqual({
                categoryName: 'Ranked Modes',
                index: 1,
                title: 'Green vs Magenta',
                clrA: '#04D976',
                clrB: '#D600AB',
                clrNeutral: '#D2E500',
                isCustom: false
            });
        });

        it('gets last color from list when no previous color is available', () => {
            replicants.swapColorsInternally = false;
            replicants.runtimeConfig = { gameVersion: GameVersion.SPLATOON_2 };
            replicants.activeRound = {
                activeColor: {
                    categoryName: 'Ranked Modes',
                    index: 0
                }
            };

            expect(getPreviousColor()).toEqual({
                categoryName: 'Ranked Modes',
                index: 6,
                title: 'Yellow vs Blue',
                clrA: '#FEF232',
                clrB: '#2ED2FE',
                clrNeutral: '#FD5600',
                isCustom: false
            });
        });

        it('gets next color when colors are swapped', () => {
            replicants.swapColorsInternally = true;
            replicants.runtimeConfig = { gameVersion: GameVersion.SPLATOON_2 };
            replicants.activeRound = {
                activeColor: {
                    categoryName: 'Ranked Modes',
                    index: 2
                }
            };

            expect(getPreviousColor()).toEqual({
                categoryName: 'Ranked Modes',
                index: 1,
                title: 'Green vs Magenta',
                clrA: '#D600AB',
                clrB: '#04D976',
                clrNeutral: '#D2E500',
                isCustom: false
            });
        });
    });
});
