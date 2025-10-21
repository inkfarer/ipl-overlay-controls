import { RoundGame, RoundStore } from 'types/schemas';
import JSONCrush from 'jsoncrush';
import { generateId } from '../../helpers/generateId';
import { PlayType } from 'types/enums/playType';
import { MapsIplabsGame, MapsIplabsRound } from 'types/importer.js';
import { Splatoon3Stages } from '../../helpers/gameData/splatoon3Data';
import { normalizeStageName } from './roundDataHelper';
import { GameVersion } from 'types/enums/gameVersion';
import i18next from 'i18next';

export function importFromMapsIplabs(url: string): RoundStore {
    const urlParams = new URLSearchParams(`?${url.split('?')[1]}`);
    const compressedContext = urlParams.get('c');
    const encodeVersion = parseInt(urlParams.get('v'));

    if (!compressedContext) {
        throw new Error(i18next.t('roundFromMapsIplabs.missingRoundData'));
    }
    if (isNaN(encodeVersion)) {
        throw new Error(i18next.t('roundFromMapsIplabs.missingEncodingVersion'));
    }

    if (encodeVersion === 1) {
        return decodeV1(compressedContext);
    } else if (encodeVersion >= 1) {
        throw new Error(i18next.t('roundFromMapsIplabs.encodingVersionTooNew'));
    }
    
    throw new Error(i18next.t('roundFromMapsIplabs.unsupportedEncodingVersion'));
}

function decodeV1(compressedContext: string): RoundStore {
    const context = JSON.parse(JSONCrush.uncrush(compressedContext));
    if (!isValidJSONFormat(context)) {
        throw new Error(i18next.t('roundFromMapsIplabs.invalidJsonFormat'));
    }

    const result: RoundStore = {};

    for (const roundIndex in context.rounds) {
        const contextRound = context.rounds[roundIndex] as MapsIplabsRound;
        const games: RoundGame[] = [];

        for (const gameIndex in contextRound.games) {
            const contextGame = contextRound.games[gameIndex] as MapsIplabsGame;

            if (contextGame === 'counterpick') {
                games.push({
                    stage: 'Counterpick',
                    mode: 'Unknown Mode'
                });
                continue;
            }

            if (typeof contextGame.map === 'string') {
                games.push({
                    stage: normalizeStageName(contextGame.map, GameVersion.SPLATOON_3),
                    mode: modeAbbreviationToFullName(contextGame.mode)
                });
                continue;
            }

            games.push({
                stage: mapsInOrder[contextGame.map] ?? 'Unknown Stage',
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
const mapsInOrder: (typeof Splatoon3Stages[number])[] = [
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
    'Robo ROM-en',
    'Lemuria Hub',
    'Urchin Underpass'
];
