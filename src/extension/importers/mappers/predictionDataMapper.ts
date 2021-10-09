import {
    PredictionBeginEvent, PredictionEndEvent, PredictionLockEvent, PredictionProgressEvent, PredictionResponse,
    ResponseOutcome
} from 'types/prediction';
import { Outcome, Prediction } from 'schemas';
import { DateTime } from 'luxon';

export class PredictionDataMapper {
    static fromApiResponse(response: PredictionResponse): Prediction {
        return {
            id: response.id,
            broadcasterId: response.broadcaster_id,
            broadcasterName: response.broadcaster_name,
            broadcasterLogin: response.broadcaster_login,
            title: response.title,
            winningOutcome: response.winning_outcome_id ?? undefined,
            outcomes: this.mapOutcomes(response.outcomes),
            duration: response.prediction_window,
            status: response.status,
            creationTime: response.created_at,
            endTime: response.ended_at ?? undefined,
            lockTime: response.locked_at ?? undefined
        };
    }

    static fromBeginEvent(event: PredictionBeginEvent): Prediction {
        return {
            id: event.id,
            broadcasterId: event.broadcaster_user_id,
            broadcasterName: event.broadcaster_user_name,
            broadcasterLogin: event.broadcaster_user_login,
            title: event.title,
            outcomes: event.outcomes.map(outcome => ({
                id: outcome.id,
                title: outcome.title,
                color: outcome.color.toUpperCase() as 'BLUE' | 'PINK',
                users: 0,
                pointsUsed: 0,
                topPredictors: []
            })),
            duration: this.getIsoTimeDifferenceSeconds(event.started_at, event.locks_at),
            status: 'ACTIVE',
            creationTime: event.started_at,
            lockTime: event.locks_at
        };
    }

    static fromProgressEvent(event: PredictionProgressEvent): Prediction {
        return {
            id: event.id,
            broadcasterId: event.broadcaster_user_id,
            broadcasterName: event.broadcaster_user_name,
            broadcasterLogin: event.broadcaster_user_login,
            title: event.title,
            outcomes: this.mapOutcomes(event.outcomes),
            duration: this.getIsoTimeDifferenceSeconds(event.started_at, event.locks_at),
            status: 'ACTIVE',
            creationTime: event.started_at,
            lockTime: event.locks_at
        };
    }

    static fromLockEvent(event: PredictionLockEvent): Prediction {
        return {
            id: event.id,
            broadcasterId: event.broadcaster_user_id,
            broadcasterName: event.broadcaster_user_name,
            broadcasterLogin: event.broadcaster_user_login,
            title: event.title,
            outcomes: this.mapOutcomes(event.outcomes),
            duration: this.getIsoTimeDifferenceSeconds(event.started_at, event.locked_at),
            status: 'LOCKED',
            creationTime: event.started_at,
            lockTime: event.locked_at
        };
    }

    static applyEndEvent(event: PredictionEndEvent, existingValue: Prediction): Prediction {
        return {
            id: event.id,
            broadcasterId: event.broadcaster_user_id,
            broadcasterName: event.broadcaster_user_name,
            broadcasterLogin: event.broadcaster_user_login,
            title: event.title,
            winningOutcome: event.winning_outcome_id,
            outcomes: this.mapOutcomes(event.outcomes),
            duration: existingValue.duration,
            status: event.status.toUpperCase() as 'CANCELED' | 'RESOLVED',
            creationTime: event.started_at,
            lockTime: existingValue.lockTime,
            endTime: event.ended_at ?? undefined
        };
    }

    private static mapOutcomes(outcomes: ResponseOutcome[]): Outcome[] {
        return outcomes.map(outcome => ({
            id: outcome.id,
            title: outcome.title,
            users: outcome.users,
            pointsUsed: outcome.channel_points,
            topPredictors: outcome.top_predictors == null ? [] : outcome.top_predictors.map(predictor => ({
                id: predictor.user_id,
                login: predictor.user_login,
                username: predictor.user_name,
                pointsUsed: predictor.channel_points_used,
                pointsWon: predictor.channel_points_won ?? 0
            })),
            color: outcome.color.toUpperCase() as 'BLUE' | 'PINK'
        }));
    }

    private static getIsoTimeDifferenceSeconds(start: string, end: string): number {
        const startTime = DateTime.fromISO(start);
        const endTime = DateTime.fromISO(end);
        return Math.round(endTime.diff(startTime).as('seconds'));
    }
}
