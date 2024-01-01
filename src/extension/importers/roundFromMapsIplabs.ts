import { RoundGame, RoundStore } from 'types/schemas';
import JSONCrush from 'jsoncrush';
import { generateId } from '../../helpers/generateId';
import { PlayType } from 'types/enums/playType';
import { MapsIplabsGame, MapsIplabsRound } from 'types/importer.js';

export async function importFromMapsIplabs(url: string): Promise<RoundStore> {
    const urlParams = new URLSearchParams(`?${url.split('?')[1]}`);
    const compressedContext = urlParams.get('c');
    const encodeVersion = parseInt(urlParams.get('v'));

    if (!compressedContext) {
        throw new Error('No round data found in maps.iplabs.ink url. (If this is from an older version of the site- try remaking the url.');
    }
    if (isNaN(encodeVersion)) {
        throw new Error('Encoding version of maps.iplabs.ink not found.');
    }

    if (encodeVersion === 1) {
        return decodeV1(compressedContext);
    } else if (encodeVersion >= 1) {
        throw new Error('Encoding version of maps.iplabs.ink too new. Try updating your overlay controls.');
    }
    
    throw new Error('Encoding version of maps.iplabs.ink not supported. Try remaking the url.');
}

async function decodeV1(compressedContext: string): Promise<RoundStore> {
    
    const context = JSON.parse(JSONCrush.uncrush(compressedContext));
    if (!isValidJSONFormat(context)) {
        throw new Error('Invalid URL encoded JSON format.');
    }

    const result: RoundStore = {};

    for (const roundIndex in context.rounds) {

        const contextRound = context.rounds[roundIndex] as MapsIplabsRound;
        const games: RoundGame[] = [];

        for (const gameIndex in contextRound.games) {
            const contextGame = contextRound.games[gameIndex] as MapsIplabsGame;

            if (contextGame === 'counterpick') {
                games.push({
                    stage: 'Unknown Stage',
                    mode: 'Unknown Mode'
                });
                continue;
            }

            if (typeof contextGame.map === 'string') {
                games.push({
                    stage: contextGame.map,
                    mode: modeAbbreviationToFullName(contextGame.mode)
                });
                continue;
            }

            games.push({
                stage: mapsInOrder[contextGame.map],
                mode: modeAbbreviationToFullName(contextGame.mode)
            });
        }

        const playStyle: PlayType = contextRound.playStyle === 'playAll' ? PlayType.PLAY_ALL : PlayType.BEST_OF;

        result[generateId()] = {
            meta: {
                name: contextRound.name,
                isCompleted: false,
                type: playStyle
            },
            games
        };
    }

    return result;
}

function isValidJSONFormat(context: {rounds: MapsIplabsRound[]}): boolean {
    if (Object.prototype.hasOwnProperty.call(context, 'rounds')) {
        return context.rounds.length > 0;
    }
    return false;
}

function modeAbbreviationToFullName(abbreviation: string): string {
    switch (abbreviation) {
        case 'tw': return 'Turf War';
        case 'sz': return 'Splat Zones';
        case 'tc': return 'Tower Control';
        case 'rm': return 'Rainmaker';
        case 'cb': return 'Clam Blitz';
    }
    return 'Unknown Mode';
}

//v1 decode requires the maps to be in a certain order.
//there are better ways to impliment this
const mapsInOrder = [
    'Scorch Gorge',
    'Eeltail Alley',
    'Hagglefish Market',
    'Undertow Spillway',
    'Mincemeat Metalworks',
    'Hammerhead Bridge',
    'Museum d\'Alfonsino',
    'Mahi-Mahi Resort',
    'Inkblot Art Academy',
    'Sturgeon Shipyard',
    'MakoMart',
    'Wahoo World',
    'Flounder Heights',
    'Brinewater Springs',
    'Manta Maria',
    'Um\'ami Ruins',
    'Humpback Pump Track',
    'Barnacle & Dime',
    'Crableg Capital',
    'Shipshape Cargo Co.',
    'Bluefin Depot',
    'Robo ROM-en'
];
