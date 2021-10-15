import { MockNodecg } from '../../__mocks__/mockNodecg_legacy';
import { dispatch, elementById } from '../../helpers/elemHelper';
import { GameWinner } from 'types/enums/gameWinner';

describe('roundUpdater', () => {
    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <button id="update-round">`;

        require('../roundUpdater');
    });

    describe('round update button click', () => {
        it('sends message to update active round data', () => {
            nodecg.replicants.activeRound.value = {
                games: [
                    { winner: GameWinner.ALPHA },
                    { winner: GameWinner.BRAVO },
                    { winner: GameWinner.ALPHA },
                    { color: { name: 'Cool Color' }, winner: GameWinner.NO_WINNER } ]};
            createRoundSelectors(0, 'Blackbelly Skatepark', 'Rainmaker');
            createRoundSelectors(1, 'MakoMart', 'Tower Control');
            createRoundSelectors(2, 'Moray Towers', 'Clam Blitz');
            createRoundSelectors(3, 'Piranha Pit', 'Splat Zones');
            createColorSelector(0, '#123123', '#234234', false);
            createColorSelector(1, '#AAA234', '#243BBB', true);
            createCustomColorSelector(2, '#775674', '#123545');
            createUneditedColorSelector(3);

            dispatch(elementById('update-round'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('updateActiveGames', {
                games: [
                    {
                        color: {
                            categoryName: 'colorCat_0',
                            clrA: '#123123',
                            clrB: '#234234',
                            colorsSwapped: false,
                            index: 0,
                            title: 'COLOR0',
                            isCustom: false
                        },
                        stage: 'Blackbelly Skatepark',
                        mode: 'Rainmaker',
                        winner: GameWinner.ALPHA
                    },
                    {
                        color: {
                            categoryName: 'colorCat_1',
                            clrA: '#243BBB',
                            clrB: '#AAA234',
                            colorsSwapped: true,
                            index: 1,
                            title: 'COLOR1',
                            isCustom: false
                        },
                        stage: 'MakoMart',
                        mode: 'Tower Control',
                        winner: GameWinner.BRAVO
                    },
                    {
                        color: {
                            categoryName: 'Custom Color',
                            clrA: '#775674',
                            clrB: '#123545',
                            colorsSwapped: false,
                            index: 0,
                            title: 'Custom Color',
                            isCustom: true
                        },
                        stage: 'Moray Towers',
                        mode: 'Clam Blitz',
                        winner: GameWinner.ALPHA
                    },
                    {
                        color: { name: 'Cool Color' },
                        stage: 'Piranha Pit',
                        mode: 'Splat Zones',
                        winner: GameWinner.NO_WINNER
                    }
                ]
            });
        });
    });
});

function createRoundSelectors(index: number, stage: string, mode: string): void {
    document.body.appendChild(select(`stage-selector_${index}`, stage));
    document.body.appendChild(select(`mode-selector_${index}`, mode));
}

function createColorSelector(index: number, firstColor: string, secondColor: string, colorsSwapped: boolean): void {
    const colorOption = document.createElement('option');
    colorOption.dataset.firstColor = firstColor;
    colorOption.dataset.secondColor = secondColor;
    colorOption.dataset.categoryName = `colorCat_${index}`;
    colorOption.dataset.index = index.toString(10);
    colorOption.text = `COLOR${index}`;
    const colorSelect = document.createElement('select');
    colorSelect.id = `color-selector_${index}`;
    colorSelect.appendChild(colorOption);
    colorSelect.selectedIndex = 0;
    colorSelect.dataset.source = 'gameInfo-edited';
    document.body.appendChild(colorSelect);
    document.body.appendChild(toggle(`color-swap-toggle_${index}`, colorsSwapped));
    document.body.appendChild(toggle(`custom-color-toggle_${index}`, false));
}

function createUneditedColorSelector(index: number) {
    const select = document.createElement('select');
    select.id = `color-selector_${index}`;
    select.dataset.source = 'gameInfo';
    document.body.appendChild(select);
}

function createCustomColorSelector(
    index: number,
    firstColor: string,
    secondColor: string
): void {
    const colorSelect = document.createElement('select');
    colorSelect.dataset.source = 'gameInfo-edited';
    colorSelect.id = `color-selector_${index}`;
    document.body.appendChild(colorSelect);

    document.body.appendChild(input(`custom-color-selector_a_${index}`, firstColor));
    document.body.appendChild(input(`custom-color-selector_b_${index}`, secondColor));
    document.body.appendChild(toggle(`color-swap-toggle_${index}`, false));
    document.body.appendChild(toggle(`custom-color-toggle_${index}`, true));
}

function select(id: string, value: string): HTMLSelectElement {
    const option = document.createElement('option');
    option.value = value;
    const result = document.createElement('select');
    result.appendChild(option);
    result.value = value;
    result.id = id;
    return result;
}

function toggle(id: string, checked: boolean): HTMLInputElement {
    const result = document.createElement('input');
    result.id = id;
    result.checked = checked;
    return result;
}

function input(id: string, value: string): HTMLInputElement {
    const result = document.createElement('input');
    result.id = id;
    result.value = value;
    return result;
}
