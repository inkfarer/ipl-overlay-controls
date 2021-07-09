export interface CreatePrediction {
    title: string;
    outcomes: {
        title: string;
    }[];
    prediction_window: number;
}

export interface PatchPrediction {
    id: string;
    status: 'RESOLVED' | 'CANCELED' | 'LOCKED';
    winning_outcome_id?: string;
}