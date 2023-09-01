/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface TournamentData {
	meta: {
		id: string;
		source: 'SMASHGG' | 'BATTLEFY' | 'UPLOAD' | 'UNKNOWN';
		sourceSpecificData?: {
			smashgg?: {
				tournamentId: number;
				streams?: Streams[];
				eventData: {
					id: number;
					name: string;
					game: string;
				};
			};
		};
		name?: string;
		shortName: string;
		url?: string;
	};
	teams: Team[];
	stages?: {
		name: string;
		id: string;
		type: 'SWISS' | 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN' | 'LADDER';
		playType?: 'BEST_OF' | 'PLAY_ALL';
	}[];
}
export interface Streams {
	id: number;
	streamName: string;
}
export interface Team {
	id: string;
	name: string;
	logoUrl?: string;
	showLogo: boolean;
	players: Player[];
	[k: string]: unknown;
}
export interface Player {
	name: string;
	[k: string]: unknown;
}
