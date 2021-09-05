/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type ActiveRoundTeam = {
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
	color: string;
	[k: string]: unknown;
};

export interface ActiveRound {
	teamA: ActiveRoundTeam;
	teamB: ActiveRoundTeam;
	activeColor: {
		index: number;
		title: string;
		categoryName: string;
		isCustom: boolean;
	};
	round: {
		id: string;
		name: string;
		isCompleted: boolean;
	};
	games: {
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
	}[];
}
