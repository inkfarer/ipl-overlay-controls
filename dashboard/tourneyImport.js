const battlefyData = nodecg.Replicant('tourneyData');

submitId.onclick = () => {
	setStatusLoading();
	nodecg.sendMessage('getTourneyData', {method: methodSel.value, id: tourneyIdInput.value}, (e, result) => {
		if (e) {
			console.error(e);
			setStatusFailure();
			return;
		}
		//console.log(result);
		setStatusSuccess();
	});
}

const methodData = {
	battlefy: {
		dataTitle: 'Tournament ID'
	},
	smashgg: {
		dataTitle: 'Tournament Slug'
	},
	raw: {
		dataTitle: 'Data URL'
	}
}

methodSel.addEventListener('change', e => {
	dataInputTitle.innerText = methodData[e.target.value].dataTitle;
});

battlefyData.on('change', (newValue) => {
	tourneyIdDisplay.innerText = newValue.meta.id;
})

function setStatusLoading() {
	submitStatus.style.backgroundColor = "var(--yellow)";
	submitStatus.style.color = "#000";
	submitStatus.innerText = "LOADING";
}

function setStatusSuccess() {
	submitStatus.style.backgroundColor = "var(--green)";
	submitStatus.style.color = "#fff";
	submitStatus.innerText = "SUCCESS";
}

function setStatusFailure() {
	submitStatus.style.backgroundColor = "var(--red)";
	submitStatus.style.color = "#fff";
	submitStatus.innerText = "FAIL";
}