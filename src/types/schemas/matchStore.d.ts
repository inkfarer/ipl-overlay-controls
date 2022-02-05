/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type MatchTeam = {
	id: string;
	name: string;
	logoUrl?: string;
	showLogo: boolean;
	players: {
		name: string;
		[k: string]: unknown;
	}[];
	[k: string]: unknown;
} & {
	score: number;
	[k: string]: unknown;
};

export interface MatchStore {
	[k: string]: Round;
}
export interface Round {
	meta: {
		name: string;
		isCompleted: boolean;
		completionTime?: string;
		relatedRoundId: string;
		[k: string]: unknown;
	};
	games: Game[];
	teamA: MatchTeam;
	teamB: MatchTeam;
	[k: string]: unknown;
}
export interface Game {
	winner: 'none' | 'alpha' | 'bravo';
	stage: string;
	mode: string;
	color?: {
		index: number;
		title: string;
		clrA: string;
		clrB: string;
		categoryName: string;
		isCustom: boolean;
		[k: string]: unknown;
	} & {
		colorsSwapped: boolean;
		[k: string]: unknown;
	};
	[k: string]: unknown;
}