const axios = require('axios');
const { promises } = require('dns');

module.exports = async function (nodecg) {
	const tourneyData = nodecg.Replicant('tourneyData');
	var smashGGKey;

	if (!nodecg.bundleConfig || typeof nodecg.bundleConfig.smashgg === 'undefined') {
		nodecg.log.error(`"smashgg" is not defined in cfg/${nodecg.bundleName}.json! ` + 
		'Importing tournament data from smash.gg will not be possible.');
	} else {
		smashGGKey = nodecg.bundleConfig.smashgg.apiKey;
	}

	nodecg.listenFor('getTourneyData', async (data, ack) => {
		if (!data.id || !data.method) {
			ack(new Error('Missing arguments.'), null);
			return;
		}

		switch(data.method) {
			case 'battlefy':
				getBattlefyData(data.id)
					.then(data => {
						tourneyData.value = data;
						ack(null, data[0].tourneyId);
					})
					.catch(err => {
						ack(err);
					});
				return;
			case 'smashgg':
				if (!smashGGKey) {
					ack(new Error('No smash.gg token provided.'));
					return;
				}

				getSmashGGData(data.id, smashGGKey)
					.then(data => {
						tourneyData.value = data;
						ack(null, data[0].tourneyId);
					})
					.catch(err => {
						ack(err);
					});
				return;
			case 'raw':
				getRaw(data.id)
					.then(data => {
						tourneyData.value = data;
						ack(null, data.id);
					})
					.catch(err => {
						ack(err);
					});
				return;
		} 
	});
}

const maxNameLength = 48;
function addDots(string) {
	if (!string) return string;
	if (string.length >= maxNameLength) return string.substring(0, maxNameLength) + '...';
	else return string;
}

async function getBattlefyData(id) {
	const requestURL = "https://dtmwra1jsgyb0.cloudfront.net/tournaments/" + id + "/teams";
	return new Promise((resolve, reject) => {
		axios.get(requestURL)
			.then (response => {
				const data = response.data;
				//console.log(response);
				if (data.error) {
					reject(data.error);
					return;
				}
				let teams = [{tourneyId: id}];
				for (let i = 0; i < data.length; i++) {
					const element = data[i];
					var teamInfo = {
						name: addDots(element.name),
						logoUrl: element.persistentTeam.logoUrl,
						players: []
					}
					for (let j = 0; j < element.players.length; j++) {
						const elementPlayer = element.players[j];
						let playerInfo = {
							name: addDots(elementPlayer.inGameName),
							username: addDots(elementPlayer.username)
						};
						teamInfo.players.push(playerInfo);
					}
					teams.push(teamInfo);
				}
				resolve(teams);
			})
			.catch(err => {
				reject(err);
			});
	});
}

async function getSmashGGData(slug, token) {
	return new Promise(async (resolve, reject) => {
		getSmashGGPage('1', slug, token, true)
		.then(async data => {
			var tourneyInfo = [{tourneyId: slug}].concat(data.pageInfo);
			
			// if there are more pages, add them to our data set
			if (data.raw.data.tournament.teams.pageInfo.totalPages > 1) {
				for (let i = 2; i <= data.raw.data.tournament.teams.pageInfo.totalPages; i++) {
					let pageInfo = await getSmashGGPage(i, slug, token);
					tourneyInfo = tourneyInfo.concat(pageInfo.pageInfo);
				}
			}

			// we did it
			resolve(tourneyInfo);
		})
		.catch(err => {
			reject(err);
		});
	});
}

async function getSmashGGPage(page, slug, token, getRaw = false) {
	const query = `query Entrants($slug: String!, $page: Int!, $perPage: Int!) {
		tournament(slug: $slug) {
		id
		name
		teams(query: {
			page: $page
			perPage: $perPage
		}) {
			pageInfo {
			total
			totalPages
			}
			nodes {
			id
			name
			entrant {
				id
				participants {
				id
				gamerTag
				}
			}
			}
		}
		}
	}`
	const perPage = '50';

	return new Promise((resolve, reject) => {
		axios.post('https://api.smash.gg/gql/alpha', 
		JSON.stringify({
			query,
			variables: {slug, page, perPage}
		}), {
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': `Bearer ${token}`
			}
		})
		.then(response => {
			const data = response.data;
			let pageInfo = [];
			for (let i = 0; i < data.data.tournament.teams.nodes.length; i++) {
				let teamPlayers = [];
				const element = data.data.tournament.teams.nodes[i];

				if (!element.entrant) continue;

				for (let j = 0; j < element.entrant.participants.length; j++) {
					const teamPlayer = element.entrant.participants[j];
					let name = addDots(teamPlayer.gamerTag);
					teamPlayers.push({
						name: name
					});
				}
				let teamName = addDots(element.name);
				pageInfo.push({
					name: teamName,
					players: teamPlayers,
				});
			}
			if (getRaw) {
				resolve({pageInfo: pageInfo, raw: data});
			} else {
				resolve({pageInfo: pageInfo});
			}
		})
		.catch(e => {
			reject(e);
		});
	});
}

async function getRaw(url) {
	return new Promise((resolve, reject) => {
		axios.get(url)
			.then(response => {
				response.data.unshift({
					tourneyId: url
				});
				resolve(response.data);
			})
			.catch(err => {
				reject(err);
			});
	});
}