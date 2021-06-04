const axios = require('axios').default;

async function listen(nodecg) {
	const casters = nodecg.Replicant('casters');
	const radiaSettings = nodecg.Replicant('radiaSettings');
	var apiUrl;
	var authentication;

	if (
		!nodecg.bundleConfig ||
		typeof nodecg.bundleConfig.radia === 'undefined'
	) {
		nodecg.log.error(
			`"radia" is not defined in cfg/${nodecg.bundleName}.json! The ability to import data via the Radia
			Production API is not possible`
		);
		radiaSettings.value.enabled = false;
		return;  // Exit from extension as keys aren't available to use.
	} else {
		apiUrl = nodecg.bundleConfig.radia.url;
		authentication = nodecg.bundleConfig.radia.authentication;
		radiaSettings.value.enabled = true;
	}

	nodecg.listenFor('getLiveCommentators', async (data, ack) => {
		getLiveCasters(apiUrl, authentication, radiaSettings.value.guildID)
			.then((data) => {
				var addedCasters = []  // stores casters added to replicant
				// Clear all currently stored caster data
				casters.value = {}
				// Get how many casters we need to place into the replicant
				var numberOfCaster = 3;
				// If the API hands back less than 3 casters that the number of casters to assign
				if(data.length < numberOfCaster){
					numberOfCaster = data.length;
				}
				// Place data into replicant
				for(var i = 0; i < numberOfCaster; i++){
					const commentator = data.pop();
					casters.value[commentator['discord_user_id']] = {
						"twitter": commentator['twitter'],
						"name": commentator['name'],
						"pronouns": commentator['pronouns'],
					};
					addedCasters.push(commentator)
				}
				// Returns object where:
				// add: The casters that where added to the replicant
				// extra: Casters that where not added to replicant as we already meet the max of 3 casters
				ack(null, {add: addedCasters, extra: data});
			})
			.catch((err) => {
				// If the API gives us a 404, just ignore it :)
				if(err.response.status === 404){
					ack(null, null);
				}
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
			if (data.error) {
				reject(data.error);
				return;
			}
			let casters = [];
			data.forEach(function(item, index) {
				casters.push({
					discord_user_id: item['discord_user_id'],
					name: item["name"],
					twitter: `@${item["twitter"]}`,
					pronouns: item["pronouns"]
				})
			});
			resolve(casters);
		}).catch((err) => {
			reject(err);
		});
	});
}

module.exports = {
	listen
};
