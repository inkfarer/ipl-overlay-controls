import { PredictionDataMapper } from '../predictionDataMapper';

describe('predictionDataMapper', () => {
    describe('fromApiResponse', () => {
        it('converts data from raw API response', () => {
            const result = PredictionDataMapper.fromApiResponse({
                id: 'idid123',
                broadcaster_id: 'caster111111',
                broadcaster_name: 'Broadcaster',
                broadcaster_login: 'caster',
                title: 'Who will win?',
                winning_outcome_id: '123abc',
                outcomes: [
                    {
                        id: '123abc',
                        title: 'Option One',
                        users: 100,
                        channel_points: 1234,
                        top_predictors: [
                            {
                                user_id: 'user1',
                                user_login: 'user1_login',
                                user_name: 'user1_name',
                                channel_points_used: 15,
                                channel_points_won: 0
                            },
                            {
                                user_id: 'user2',
                                user_login: 'user2_login',
                                user_name: 'user2_name',
                                channel_points_used: 25,
                                channel_points_won: 10
                            }
                        ],
                        color: 'PINK'
                    },
                    {
                        id: '234bca',
                        title: 'Option Two',
                        users: 95,
                        channel_points: 1256,
                        top_predictors: null,
                        color: 'BLUE'
                    }
                ],
                prediction_window: 125,
                status: 'ACTIVE',
                created_at: '2021-05-10',
                ended_at: '2021-05-12',
                locked_at: null
            });

            expect(result).toEqual({
                id: 'idid123',
                broadcasterId: 'caster111111',
                broadcasterName: 'Broadcaster',
                broadcasterLogin: 'caster',
                title: 'Who will win?',
                winningOutcome: '123abc',
                outcomes: [
                    {
                        id: '123abc',
                        title: 'Option One',
                        users: 100,
                        pointsUsed: 1234,
                        topPredictors: [
                            {
                                id: 'user1',
                                login: 'user1_login',
                                username: 'user1_name',
                                pointsUsed: 15,
                                pointsWon: 0
                            },
                            {
                                id: 'user2',
                                login: 'user2_login',
                                username: 'user2_name',
                                pointsUsed: 25,
                                pointsWon: 10
                            }

                        ],
                        color: 'PINK'
                    },
                    {
                        id: '234bca',
                        title: 'Option Two',
                        users: 95,
                        pointsUsed: 1256,
                        topPredictors: [],
                        color: 'BLUE'
                    }
                ],
                duration: 125,
                status: 'ACTIVE',
                createdAt: '2021-05-10',
                endedAt: '2021-05-12',
                lockedAt: null
            });
        });
    });
});
