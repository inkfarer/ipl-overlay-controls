module.exports = function (nodecg) {
    const gameWinners = nodecg.Replicant('gameWinners');
    const teamScores = nodecg.Replicant('teamScores');
    const setWinnersAutomatically = nodecg.Replicant('setWinnersAutomatically');
    teamScores.on('change', (newValue, oldValue) => {
        if (!setWinnersAutomatically.value || !oldValue) return;
        const scoreSum = newValue.teamA + newValue.teamB;
        if (scoreSum === 1) {
            if (newValue.teamA === 1) {
                gameWinners.value[0] = 1;
            } else gameWinners.value[0] = 2;
        }

        if (scoreSum >= 2 && gameWinners.value[0] !== 0) {
            if (newValue.teamA === oldValue.teamA) {
                // Team b score has changed
                gameWinners.value[scoreSum - 1] = 2;
            } else {
                // Team a score has changed
                gameWinners.value[scoreSum - 1] = 1;
            }
        }
    });

    const activeRoundId = nodecg.Replicant('activeRoundId');
    activeRoundId.on('change', (newValue, oldValue) => {
        if (oldValue) {
            gameWinners.value = [0, 0, 0, 0, 0, 0, 0];
        }
    });
};
