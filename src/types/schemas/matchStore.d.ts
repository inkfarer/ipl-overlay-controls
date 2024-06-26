/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type MatchTeam = Team & {
	score: number;
	[k: string]: unknown;
};

export interface MatchStore {
	[k: string]: Match;
}
export interface Match {
	meta: {
		name: string;
		type: 'BEST_OF' | 'PLAY_ALL';
		isCompleted: boolean;
		completionTime?: string;
		[k: string]: unknown;
	};
	games: MatchGame[];
	teamA: MatchTeam;
	teamB: MatchTeam;
	[k: string]: unknown;
}
export interface MatchGame {
	winner: 'none' | 'alpha' | 'bravo';
	stage: string;
	mode: string;
	color?: Color & {
		colorsSwapped: boolean;
		[k: string]: unknown;
	};
	[k: string]: unknown;
}
export interface Color {
	index: number;
	colorKey: string;
	categoryKey: string;
	title: string;
	clrA: string;
	clrB: string;
	clrNeutral: string;
	categoryName: string;
	isCustom: boolean;
	[k: string]: unknown;
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
