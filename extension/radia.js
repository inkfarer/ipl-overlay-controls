const axios = require('axios').default;

async function listen(nodecg) {
	const casters = nodecg.Replicant('casters');
	const radiaSettings = nodecg.Replicant('radiaSettings');
	var APIURL;
	var Authentication;

	if (
		!nodecg.bundleConfig ||
		typeof nodecg.bundleConfig.radia === 'undefined'
	) {
		nodecg.log.error(
			`"radia" is not defined in cfg/${nodecg.bundleName}.json! ` +
			'the ability to import data via the Radia Production API ' +
			'is not possible'
		);
	} else {
		APIURL = nodecg.bundleConfig.radia.url;
		Authentication = nodecg.bundleConfig.radia.Authentication;
	}

	nodecg.listenFor('getLiveCommentators', async (data, ack) => {
		getLiveCasters(APIURL, Authentication, radiaSettings.value.guildID)
			.then((data) => {
				console.log(data)
				ack(null, data);
			})
			.catch((err) => {
				ack(err);
			});
	});

}

/**
 * Get the current live casters in vc from a guild
 * @param url Base API URL
 * @param Authorisation API jey for authentication
 * @param guildID Guild ID of discord server
 * @returns {Promise<list>} List of live casters
 */
async function getLiveCasters(url, Authorisation, guildID) {
	return new Promise((resolve, reject) => {
		axios.get(`${url}/live/guild/${guildID}`, {
			headers: {
				'Authorization': Authorisation
			}
		}).then((response) => {
			const data = response.data;
			console.log(response);
			if (data.error) {
				reject(data.error);
				return;
			}
			let casters = [];
			data.forEach(function(item, index) {
				casters.push({
					name: item["name"],
					twitter: `@${item["twitter"]}`,
					pronouns: item["pronouns"]
				})
			})
			return casters
		}).catch((err) => {
			reject(err);
		});
	});
}

module.exports = {
	listen
};
