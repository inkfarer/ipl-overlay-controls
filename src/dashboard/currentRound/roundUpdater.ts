import { activeRound } from './replicants';
import { ActiveRoundGame } from 'types/activeRoundGame';
import { GameWinner } from 'types/gameWinner';
import { UpdateActiveGamesRequest } from 'types/messages/activeRound';

const roundUpdateButton = document.getElementById('update-round') as HTMLButtonElement;

roundUpdateButton.addEventListener('click', () => {
    const numberOfGames = activeRound.value.games.length;
    const games: ActiveRoundGame[] = [];

    for (let i = 0; i < numberOfGames; i++) {
        const stageSelector = document.getElementById(`stage-selector_${i}`) as HTMLSelectElement;
        const modeSelector = document.getElementById(`mode-selector_${i}`) as HTMLSelectElement;

        const existingGame = activeRound.value.games[i];
        const currentGame: ActiveRoundGame = {
            mode: modeSelector.value,
            stage: stageSelector.value,
            winner: existingGame.winner as GameWinner
        };

        const colorSelector = document.getElementById(`color-selector_${i}`) as HTMLSelectElement;
        if (colorSelector.dataset.source === 'gameInfo-edited') {
            const colorSwapToggle = document.getElementById(`color-swap-toggle_${i}`) as HTMLInputElement;
            const customColorToggle = document.getElementById(`custom-color-toggle_${i}`) as HTMLInputElement;

            colorSelector.dataset.source = 'gameInfo';
            colorSwapToggle.dataset.source = 'gameInfo';

            if (customColorToggle.checked) {
                const teamAColorInput = document.getElementById(`custom-color-selector_a_${i}`) as HTMLInputElement;
                const teamBColorInput = document.getElementById(`custom-color-selector_b_${i}`) as HTMLInputElement;

                currentGame.color = {
                    index: 999,
                    title: 'Custom Color',
                    clrA: teamAColorInput.value,
                    clrB: teamBColorInput.value,
                    categoryName: 'Custom Color',
                    colorsSwapped: colorSwapToggle.checked
                };
            } else {
                const colorOption = colorSelector.options[colorSelector.selectedIndex] as HTMLOptionElement;

                currentGame.color = {
                    index: Number(colorOption.dataset.index),
                    title: colorOption.text,
                    clrA: colorSwapToggle.checked ? colorOption.dataset.secondColor : colorOption.dataset.firstColor,
                    clrB: colorSwapToggle.checked ? colorOption.dataset.firstColor : colorOption.dataset.secondColor,
                    categoryName: colorOption.dataset.categoryName,
                    colorsSwapped: colorSwapToggle.checked
                };
            }
        } else if (colorSelector.dataset.source === 'gameInfo') {
            currentGame.color = existingGame.color;
        }

        games.push(currentGame);
    }

    nodecg.sendMessage('updateActiveGames', { games: games } as UpdateActiveGamesRequest);
});
