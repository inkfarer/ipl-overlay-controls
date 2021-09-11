/* tslint:disable */
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
				streams?: {
					id: number;
					streamName: string;
				}[];
				eventData: {
					id: number;
					name: string;
					game: string;
				};
			};
		};
		name?: string;
	};
	teams: {
		id: string;
		name: string;
		logoUrl?: string;
		showLogo: boolean;
		players: {
			name: string;
			[k: string]: unknown;
		}[];
		[k: string]: unknown;
	}[];
	stages?: {
		name: string;
		id: string;
		type: 'SWISS' | 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN' | 'LADDER';
	}[];
}
