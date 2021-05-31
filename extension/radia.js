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
		return;  // Exit from extension as keys aren't available to use.
	} else {
		APIURL = nodecg.bundleConfig.radia.url;
		Authentication = nodecg.bundleConfig.radia.Authentication;
	}

	nodecg.listenFor('getLiveCommentators', async (data, ack) => {
		getLiveCasters(APIURL, Authentication, radiaSettings.value.guildID)
			.then((data) => {
				console.log(data)
				// Clear all currently stored caster data
				for (const [key, value] of Object.entries(casters.value)){
					delete casters.value[key];
				}
				// Get how many casters we need to place into the replicant
				var numberOfCaster = 3;
				if(data.length < numberOfCaster){
					numberOfCaster = data.length;
				}
				// Place data into replicant
				for(var i = 0; i < numberOfCaster; i++){
					casters.value[generateId()] = data.pop();
				}
				ack(null, data);  // We return any casters left in the array after taking our max of 3
			})
			.catch((err) => {
				ack(err);
			});
	});
}

/**
 * Generate a random ID
 * @returns {string}
 */
function generateId() {
	return '' + Math.random().toString(36).substr(2, 9);
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
