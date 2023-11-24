/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface NextRound {
	teamA: Team;
	teamB: Team;
	round: {
		id: string;
		name: string;
		type: 'BEST_OF' | 'PLAY_ALL';
	};
	name: string;
	showOnStream: boolean;
	games: {
		stage: string;
		mode: string;
		[k: string]: unknown;
	}[];
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
