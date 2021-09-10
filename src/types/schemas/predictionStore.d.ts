/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface PredictionStore {
	/**
	 * If Predictions should be enabled for current settings
	 */
	enablePrediction: boolean;
	socketOpen: boolean;
	modificationTime?: string;
	currentPrediction?: Prediction;
}
/**
 * Twitch Prediction instance
 */
export interface Prediction {
	/**
	 * Twitch ID of the Prediction.
	 */
	id: string;
	/**
	 * Twitch ID of the broadcaster
	 */
	broadcasterId: string;
	/**
	 * Twitch User Login
	 */
	broadcasterName: string;
	/**
	 * Twitch user Display Name
	 */
	broadcasterLogin: string;
	/**
	 * Title of prediction
	 */
	title: string;
	/**
	 * ID of winning outcome
	 */
	winningOutcome?: string;
	/**
	 * Array of possible outcomes for the Prediction
	 */
	outcomes: Outcome[];
	/**
	 * Total duration for the Prediction (in seconds)
	 */
	duration: number;
	/**
	 * Status of the Prediction
	 */
	status: 'RESOLVED' | 'ACTIVE' | 'CANCELED' | 'LOCKED';
	/**
	 * UTC timestamp for the Prediction's start time
	 */
	creationTime: string;
	/**
	 * UTC timestamp for when the Prediction ends
	 */
	endTime?: string;
	/**
	 * UTC timestamp for when the Prediction locks
	 */
	lockTime?: string;
}
export interface Outcome {
	/**
	 * Twitch ID of prediction Outcome
	 */
	id: string;
	/**
	 * Text displayed for outcome
	 */
	title: string;
	/**
	 * Number of unique users that chose the outcome.
	 */
	users: number;
	/**
	 * Channel Points Spent on outcome
	 */
	pointsUsed: number;
	/**
	 * Users who were the top predictors
	 */
	topPredictors: {
		/**
		 * Twitch User ID
		 */
		id: string;
		/**
		 * Twitch User Login
		 */
		login: string;
		/**
		 * Twitch user Display Name
		 */
		username: string;
		/**
		 * Channel Points used to make bet
		 */
		pointsUsed: number;
		/**
		 * Channel points won from prediction
		 */
		pointsWon: number;
	}[];
	/**
	 * Color for the outcome.
	 */
	color: 'BLUE' | 'PINK';
}
