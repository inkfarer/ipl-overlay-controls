import { PredictionResponse } from 'types/prediction';
import { Prediction } from 'schemas';

export class PredictionDataMapper {
    static fromApiResponse(response: PredictionResponse): Prediction {
        return {
            id: response.id,
            broadcasterId: response.broadcaster_id,
            broadcasterName: response.broadcaster_name,
            broadcasterLogin: response.broadcaster_login,
            title: response.title,
            winningOutcome: response.winning_outcome_id,
            outcomes: response.outcomes.map(outcome => ({
                id: outcome.id,
                title: outcome.title,
                users: outcome.users,
                pointsUsed: outcome.channel_points,
                topPredictors: outcome.top_predictors === null ? [] : outcome.top_predictors.map(predictor => ({
                    id: predictor.user_id,
                    login: predictor.user_login,
                    username: predictor.user_name,
                    pointsUsed: predictor.channel_points_used,
                    pointsWon: predictor.channel_points_won
                })),
                color: outcome.color
            })),
            duration: response.prediction_window,
            status: response.status,
            createdAt: response.created_at,
            endedAt: response.ended_at,
            lockedAt: response.locked_at
        };
    }
}
