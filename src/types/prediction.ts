type PredictionColor = 'BLUE' | 'PINK';

export interface TopPredictor {
    user_id: string;
    user_login: string;
    user_name: string;
    channel_points_used: number;
    channel_points_won: number;
}

export interface ResponseOutcome {
    id: string;
    title: string;
    users: number;
    channel_points: number;
    top_predictors?: TopPredictor[];
    color: PredictionColor;
}

export interface PredictionResponse {
    id: string;
    broadcaster_id: string;
    broadcaster_name: string;
    broadcaster_login: string;
    title: string;
    winning_outcome_id: string;
    outcomes: ResponseOutcome[];
    prediction_window: number;
    status: 'RESOLVED' | 'ACTIVE' | 'CANCELED' | 'LOCKED';
    created_at: string;
    ended_at: string | null;
    locked_at: string | null;
}

export interface PredictionBeginEvent {
    id: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    title: string;
    outcomes: {
        id: string;
        title: string;
        color: PredictionColor
    }[],
    started_at: string;
    locks_at: string;
}

export interface PredictionProgressEvent {
    id: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    title: string;
    outcomes: ResponseOutcome[];
    started_at: string;
    locks_at: string;
}

export interface PredictionLockEvent {
    id: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    title: string;
    outcomes: ResponseOutcome[];
    started_at: string;
    locked_at: string;
}

export interface PredictionEndEvent {
    id: string;
    broadcaster_user_id: string;
    broadcaster_user_login: string;
    broadcaster_user_name: string;
    title: string;
    winning_outcome_id: string;
    outcomes: ResponseOutcome[];
    started_at: string;
    ended_at: string;
    status: 'RESOLVED' | 'CANCELED'
}
