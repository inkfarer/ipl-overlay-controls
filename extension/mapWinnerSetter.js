module.exports = function(nodecg) {
	const mapWinners = nodecg.Replicant('mapWinners', { defaultValue: [0, 0, 0, 0, 0, 0, 0] });
	const teamScores = nodecg.Replicant('teamScores', {defaultValue: {
		teamA: 0,
		teamB: 0
	}});
	const autoWinSet = nodecg.Replicant('autoWinSet', {defaultValue: true});
	teamScores.on('change', (newValue, oldValue) => {
		if (!autoWinSet.value || !oldValue) return;
		const scoreSum = newValue.teamA + newValue.teamB;
		if (scoreSum === 1) {
			if (newValue.teamA === 1) {
				mapWinners.value[0] = 1;
			} else mapWinners.value[0] = 2;
		}
		if (scoreSum >= 2 && mapWinners.value[0] !== 0) {
			if (newValue.teamA !== oldValue.teamA) {
				//team a score has changed
				mapWinners.value[scoreSum-1] = 1;
			} else {
				//team b score has changed
				mapWinners.value[scoreSum-1] = 2;
			}
		}
	});
};