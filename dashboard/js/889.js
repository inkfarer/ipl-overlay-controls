"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[889],{6889:e=>{e.exports=JSON.parse('{"casterImport":{"noCommentatorsReceived":"Got no commentators from API."},"obs":{"obsSocketDisabled":"OBS integration is disabled.","sceneNotFound":"Could not find one or more of the provided scenes.","socketClosed":"OBS websocket closed with message: {{message}}","socketOpen":"OBS websocket is open.","obsConnectionFailed":"Failed to connect to OBS: {{message}}","reconnectingToSocket":"Attempting to reconnect to OBS... (Attempt {{count}})","receivedNoScenes":"Received scene list from OBS with no scenes. This should not be possible!"},"activeRoundHelper":{"gameOutOfRange":"Cannot set winner for game {{index}} as it does not exist.","matchNotFound":"Could not find match {{matchId}}.","teamNotFound":"Could not find a team."},"bundleHelper":{"gameVersionParsingFailedWarning":"Could not parse compatible game versions for bundle \'{{bundleName}}\'"},"nextRoundHelper":{"roundNotFound":"Could not find round {{roundId}}.","teamNotFound":"Could not find a team."},"roundStoreHelper":{"defaultRoundName":"Default Round {{roundNumber}}"},"battlefyClient":{"battlefyReturnedError":"Got error from Battlefy: {{message}}","battlefyReturnedNoData":"Couldn\'t get tournament data from Battlefy.","battlefyReturnedUnknownResponse":"Received an unknown response from Battlefy.","placeholderTournamentName":"Unknown Tournament","matchName":"Round {{roundNumber}} Match {{matchNumber}}","shortMatchName":"{{stageName}} Round {{roundNumber}}"},"radiaClient":{"missingGuildId":"No guild ID provided.","predictionSupportCheckError":"Failed to check for prediction support: {{message}}","requestFailed":"Radia API request failed with response {{statusCode}}"},"startggClient":{"tournamentNotFound":"Could not find tournament with slug \'{{slug}}\'.","noEventsFoundForTournament":"Tournament \'{{slug}} has no events.","eventNotFound":"Could not find event with id \'{{eventId}}\'","shortRoundName":{"withoutPool":"{{phaseName}} Round {{roundNumber}}","withPool":"{{phaseName}} Pool {{poolName}} Round {{roundNumber}}"},"longRoundName":"Set {{set}} - Round {{round}} - Pool {{pool}} - {{phase}}"},"fileImport":{"invalidFileOrJsonType":"Invalid attached file or jsonType property provided.","roundDataUpdateFailed":{"console":"Failed to update round data: {{message}}","response":"Got an error while parsing round data."},"teamDataUpdateFailed":{"console":"Failed to parse team data: {{message}}","response":"Got an error while parsing team data."}},"music":{"missingLastfmConfigWarning":"\\"lastfm\\" is missing from cfg/{{bundleName}}.json! Getting music information from last.fm automatically will not function.","userNotFound":"Last.fm couldn\'t find user \'{{username}}\' - error message: \'{{message}}\'"},"predictions":{"socketClosed":"Radia websocket has closed.","reconnectingToSocket":"Reconnecting to socket... (Attempt {{count}})","tooManyReconnectionAttempts":"Too many reconnection attempts. Radia websocket is closed.","socketTimeout":"Radia websocket has not been reachable for {{count}} milliseconds. Closing connection...","missingBundleConfigurationWarning":"\\"radia.socketUrl\\" is missing from cfg/{{bundleName}}.json! Importing predictions will not be possible.","socketOpen":"Radia websocket is open.","socketReceivedError":"Received error from Radia websocket. Code: {{code}}, Message: {{message}}","missingGuildId":"Radia guild ID is not configured!","missingConfigurationError":"Unable to proceed as some Radia configuration is missing.","predictionDataRequestError":"Unable to get prediction data: {{message}}","socketReconnectionFailed":"Unable to reconnect to Radia websocket: {{message}}","unresolvedPredictionAlreadyExists":"An unresolved prediction already exists.","noPredictionAvailable":"No prediction available to resolve.","cannotCancelPrediction":"Cannot cancel a prediction that is not locked or active.","cannotLockPrediction":"Only an active prediction may be locked.","missingOutcome":"No outcome to resolve provided.","cannotResolvePrediction":"Only a locked prediction may be resolved."},"roundFromMapsIplabs":{"missingRoundData":"No round data found in maps.iplabs.ink url. (If this is from an older version of the site - try remaking the url.)","missingEncodingVersion":"Encoding version of maps.iplabs.ink not found.","encodingVersionTooNew":"Encoding version of maps.iplabs.ink too new. Try updating ipl-overlay-controls.","unsupportedEncodingVersion":"Encoding version of maps.iplabs.ink not supported. Try remaking the url.","invalidJsonFormat":"Invalid URL encoded JSON format."},"roundImporter":{"badGameVersionForMapsIplabs":"maps.iplabs.ink links only support Splatoon 3"},"tournamentDataHelper":{"noTeamsFound":"Tournament has no teams.","placeholderUploadedTournamentName":"Uploaded Tournament","battlefyDataImportFailed":"Could not fetch Battlefy data for tournament \'{{tournamentId}}\'","placeholderTournamentName":"Unknown Tournament","tournamentDataParsingFailed":"Invalid data provided.","radiaTournamentDataUpdateFailed":"Failed to update tournament data in Radia: {{message}}"},"tournamentImporter":{"missingStartggConfigurationWarning":"\\"smashgg\\" is not defined in cfg/{{bundleName}}.json! Importing tournament data from start.gg will not be possible.","missingStartggApiKey":"No start.gg API key is configured.","missingSendouInkApiKey":"No sendou.ink API key is configured.","rawDataImportFailed":"Got response code {{statusCode}} from {{url}}"},"tournamentRefresh":{"unsupportedSource":"Cannot refresh data from $t(common:tournamentDataSource.{{source}})"},"casters":{"casterNotFound":"Caster \'{{id}}\' not found.","badCasterIdListForReordering":"Could not re-order casters as caster ID list has unknown or missing IDs"},"roundStore":{"roundNotFound":"Could not find round \'{{id}}\'.","roundAlreadyExists":"Round \'{{id}}\' already exists.","cannotDeleteLastRound":"Cannot delete the last round."},"tournamentData":{"teamNotFound":"No team found."},"automationActions":{"unknownTask":"Unknown automation task \'{{name}}\'","actionAlreadyOngoing":"An action is already in progress.","noActionOngoing":"No action is in progress.","taskStartFailed":"Failed to start automation task","errorInTask":"Encountered an error during automation task"},"replicantFixer":{"resettingActiveColors":"Resetting active round colors as the currently assigned colors are unknown"},"versionChecker":{"incompatibleBundleWarning":"Bundle \'{{otherBundle}}\' expects version {{compatibleVersion}} of {{thisBundle}}! The installed version is {{installedVersion}}.","incompatibleGameVersionWarning":"Bundle \'{{bundleName}}\' is not compatible with $t(common:gameVersion.{{gameVersion}})!"},"missingRadiaConfigurationWarning":"\\"radia\\" is not defined in cfg/{{bundleName}}.json! Importing data from the Radia Productions API will not be possible.","invalidArgumentsError":"Invalid arguments."}')}}]);