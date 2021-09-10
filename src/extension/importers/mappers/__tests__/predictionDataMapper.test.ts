import { PredictionDataMapper } from '../predictionDataMapper';
import { Prediction } from 'schemas';

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
                creationTime: '2021-05-10',
                endTime: '2021-05-12',
                lockTime: undefined
            } as Prediction);
        });
    });

    describe('fromBeginEvent', () => {
        it('creates prediction object from prediction begin event', () => {
            const result = PredictionDataMapper.fromBeginEvent({
                id: 'event123',
                broadcaster_user_id: 'caster12345',
                broadcaster_user_login: 'caster',
                broadcaster_user_name: 'Broadcaster',
                title: 'Who will win?',
                outcomes: [
                    {
                        id: 'outcome1',
                        title: 'Option',
                        color: 'PINK'
                    }
                ],
                started_at: '2020-07-15T17:16:03.17106713Z',
                locks_at: '2020-07-15T17:21:03.17106713Z'
            });

            expect(result).toEqual({
                id: 'event123',
                broadcasterId: 'caster12345',
                broadcasterLogin: 'caster',
                broadcasterName: 'Broadcaster',
                title: 'Who will win?',
                outcomes: [
                    {
                        id: 'outcome1',
                        title: 'Option',
                        color: 'PINK',
                        users: 0,
                        pointsUsed: 0,
                        topPredictors: []
                    }
                ],
                duration: 300,
                status: 'ACTIVE',
                creationTime: '2020-07-15T17:16:03.17106713Z',
                lockTime: '2020-07-15T17:21:03.17106713Z'
            } as Prediction);
        });
    });

    describe('fromProgressEvent', () => {
        it('creates prediction object from prediction progress event', () => {
            const result = PredictionDataMapper.fromProgressEvent({
                id: 'event123',
                broadcaster_user_id: 'caster12345',
                broadcaster_user_login: 'caster',
                broadcaster_user_name: 'Broadcaster',
                title: 'Who will win?',
                outcomes: [
                    {
                        id: 'outcome1',
                        title: 'Option',
                        color: 'PINK',
                        users: 10,
                        channel_points: 95,
                        top_predictors: [
                            {
                                user_id: 'user1',
                                user_login: 'user1_l',
                                user_name: 'user1_n',
                                channel_points_used: 1234,
                                channel_points_won: 0
                            }
                        ]
                    }
                ],
                started_at: '2020-07-15T17:16:03.17106713Z',
                locks_at: '2020-07-15T17:21:03.17106713Z'
            });

            expect(result).toEqual({
                id: 'event123',
                broadcasterId: 'caster12345',
                broadcasterLogin: 'caster',
                broadcasterName: 'Broadcaster',
                title: 'Who will win?',
                outcomes: [
                    {
                        id: 'outcome1',
                        title: 'Option',
                        color: 'PINK',
                        users: 10,
                        pointsUsed: 95,
                        topPredictors: [
                            {
                                id: 'user1',
                                login: 'user1_l',
                                username: 'user1_n',
                                pointsUsed: 1234,
                                pointsWon: 0
                            }
                        ]
                    }
                ],
                duration: 300,
                status: 'ACTIVE',
                creationTime: '2020-07-15T17:16:03.17106713Z',
                lockTime: '2020-07-15T17:21:03.17106713Z'
            } as Prediction);
        });
    });

    describe('fromLockEvent', () => {
        it('creates prediction object from prediction lock event', () => {
            const result = PredictionDataMapper.fromLockEvent({
                id: 'event123',
                broadcaster_user_id: 'caster12345',
                broadcaster_user_login: 'caster',
                broadcaster_user_name: 'Broadcaster',
                title: 'Who will win?',
                outcomes: [
                    {
                        id: 'outcome1',
                        title: 'Option',
                        color: 'PINK',
                        users: 10,
                        channel_points: 95,
                        top_predictors: [
                            {
                                user_id: 'user1',
                                user_login: 'user1_l',
                                user_name: 'user1_n',
                                channel_points_used: 1234,
                                channel_points_won: 0
                            }
                        ]
                    }
                ],
                started_at: '2020-07-15T17:16:03.17106713Z',
                locked_at: '2020-07-15T17:21:03.17106713Z'
            });

            expect(result).toEqual({
                id: 'event123',
                broadcasterId: 'caster12345',
                broadcasterLogin: 'caster',
                broadcasterName: 'Broadcaster',
                title: 'Who will win?',
                outcomes: [
                    {
                        id: 'outcome1',
                        title: 'Option',
                        color: 'PINK',
                        users: 10,
                        pointsUsed: 95,
                        topPredictors: [
                            {
                                id: 'user1',
                                login: 'user1_l',
                                username: 'user1_n',
                                pointsUsed: 1234,
                                pointsWon: 0
                            }
                        ]
                    }
                ],
                duration: 300,
                status: 'LOCKED',
                creationTime: '2020-07-15T17:16:03.17106713Z',
                lockTime: '2020-07-15T17:21:03.17106713Z'
            } as Prediction);
        });
    });

    describe('applyEndEvent', () => {
        it('creates prediction object from prediction end event', () => {
            const result = PredictionDataMapper.applyEndEvent({
                id: 'event123',
                broadcaster_user_id: 'caster12345',
                broadcaster_user_login: 'caster',
                broadcaster_user_name: 'Broadcaster',
                title: 'Who will win?',
                winning_outcome_id: 'outcome1',
                outcomes: [
                    {
                        id: 'outcome1',
                        title: 'Option',
                        color: 'PINK',
                        users: 10,
                        channel_points: 95,
                        top_predictors: [
                            {
                                user_id: 'user1',
                                user_login: 'user1_l',
                                user_name: 'user1_n',
                                channel_points_used: 1234,
                                channel_points_won: 0
                            }
                        ]
                    }
                ],
                status: 'RESOLVED',
                started_at: '2020-07-15T17:16:03.17106713Z',
                ended_at: '2020-07-15T17:16:11.17106713Z'
            }, {
                id: 'event1234',
                broadcasterId: 'caster123456',
                broadcasterLogin: 'caster_old',
                broadcasterName: 'Broadcaster_old',
                title: 'Who will win??',
                outcomes: [
                    {
                        id: 'outcome1_old',
                        title: 'Old Option',
                        color: 'BLUE',
                        users: 10,
                        pointsUsed: 95,
                        topPredictors: [
                            {
                                id: 'user1',
                                login: 'user1_l',
                                username: 'user1_n',
                                pointsUsed: 1234,
                                pointsWon: 0
                            }
                        ]
                    }
                ],
                duration: 300,
                status: 'LOCKED',
                creationTime: '2020-07-15T17:16:03.17106713Z',
                lockTime: '2020-07-15T17:21:03.17106713Z'
            });

            expect(result).toEqual({
                id: 'event123',
                broadcasterId: 'caster12345',
                broadcasterLogin: 'caster',
                broadcasterName: 'Broadcaster',
                title: 'Who will win?',
                winningOutcome: 'outcome1',
                outcomes: [
                    {
                        id: 'outcome1',
                        title: 'Option',
                        color: 'PINK',
                        users: 10,
                        pointsUsed: 95,
                        topPredictors: [
                            {
                                id: 'user1',
                                login: 'user1_l',
                                username: 'user1_n',
                                pointsUsed: 1234,
                                pointsWon: 0
                            }
                        ]
                    }
                ],
                duration: 300,
                status: 'RESOLVED',
                creationTime: '2020-07-15T17:16:03.17106713Z',
                lockTime: '2020-07-15T17:21:03.17106713Z',
                endTime: '2020-07-15T17:16:11.17106713Z'
            } as Prediction);
        });
    });
});
