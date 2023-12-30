import { RoundGame, RoundStore } from "types/schemas";
import JSONCrush from "../../../node_modules/jsoncrush/JSONCrush.js" //blaming webpack for this
import { generateId } from "src/helpers/generateId";
import { PlayType } from "types/enums/playType";

export async function importFromMapsIplabs(url: string): Promise<RoundStore> {
    const urlParams = new URLSearchParams(`?${url.split('?')[1]}`);
    const compressedContext = urlParams.get('c');
    const encodeVersion = parseInt(urlParams.get('v'));

    if (!compressedContext) {
        throw new Error('No round data found in maps.iplabs.ink url. Older versions of the site url are not supported- try remaking the url.');
    }
    if (isNaN(encodeVersion)) {
        throw new Error('Encoding version of maps.iplabs.ink not found.');
    }

    switch (encodeVersion) {
        case 1: return decodeV1(compressedContext);
    }

    throw new Error('Invalid maps.iplabs.ink version, please use a newer version of the site and remake the url.');
}

async function decodeV1(compressedContext: string): Promise<RoundStore> {
    
    const context = JSON.parse(JSONCrush.uncrush(compressedContext));
    if (!isValidJSONFormat(context)) {
        throw new Error('Invalid URL encoded JSON format.');
    }

    const result: RoundStore = {};

    for (const roundIndex in context.rounds) {

        const round = context.rounds[roundIndex];
        /*  round formatted like this (make this an interface??)
        {
            name: 'Bracket Reset',
            games: [
                { map: 19, mode: 'sz' },
                'counterpick',
                'counterpick',
                'counterpick',
                'counterpick'
                ],
                playStyle: 'bestOf'
            }
        } */

        const games: RoundGame[] = [];

        for (const gameIndex in round.games) {
            const game = round.games[gameIndex];

            if (game === "counterpick") {
                games.push({
                    stage: "Unknown Stage",
                    mode: "Unknown Mode"
                });
                continue;
            }

            games.push({
                stage: mapsInOrder[game.map],
                mode: modeAbbreviationToFullName(game.mode)
            });
        }

        let playStyle: PlayType = PlayType.BEST_OF;
        if (round.playStyle === "playAll") playStyle = PlayType.PLAY_ALL

        result[generateId()] = {
            meta: {
                name: round.name,
                isCompleted: false,
                type: playStyle
            },
            games
        };
    }

    return result;
}

function isValidJSONFormat(context: any): boolean {
    return context.hasOwnProperty('rounds');
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
    "Scorch Gorge",
    "Eeltail Alley",
    "Hagglefish Market",
    "Undertow Spillway",
    "Mincemeat Metalworks",
    "Hammerhead Bridge",
    "Museum d'Alfonsino",
    "Mahi-Mahi Resort",
    "Inkblot Art Academy",
    "Sturgeon Shipyard",
    "MakoMart",
    "Wahoo World",
    "Flounder Heights",
    "Brinewater Springs",
    "Manta Maria",
    "Um'ami Ruins",
    "Humpback Pump Track",
    "Barnacle & Dime",
    "Crableg Capital",
    "Shipshape Cargo Co.",
    "Bluefin Depot",
    "Robo ROM-en"
];