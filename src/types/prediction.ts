export interface TopPredictor {
    user_id: string;
    user_login: string;
    user_name: string;
    channel_points_used: number;
    channel_points_won: number;
}

export interface Outcome {
    id: string;
    title: string;
    users: number;
    channel_points: number;
    top_predictors: TopPredictor[] | null;
    color: 'BLUE' | 'PINK';
}

export interface Prediction {
    id: string;
    broadcaster_id: string;
    broadcaster_name: string;
    broadcaster_login: string;
    title: string;
    winning_outcome_id: string;
    outcomes: Outcome[];
    prediction_window: number;
    status: 'RESOLVED' | 'ACTIVE' | 'CANCELED' | 'LOCKED';
    created_at: string;
    ended_at: string | null;
    locked_at: string | null;
}

export interface ErrorDetails {
    detail: {
        error: string;
        status: number;
        message: string;
    }
}
