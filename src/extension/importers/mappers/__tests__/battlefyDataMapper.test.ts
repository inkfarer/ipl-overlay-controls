import { mapBattlefyStagesToHighlightedMatches, mapBattlefyStagesToTournamentData } from '../battlefyDataMapper';
import { BracketType } from '../../../../types/enums/bracketType';
import { Stage } from '../../../types/battlefyTournamentData';

describe('battlefyDataMapper', () => {
    describe('mapBattlefyStagesToTournamentData', () => {
        it('maps stage data to expected format', () => {
            expect(mapBattlefyStagesToTournamentData([
                {
                    _id: '12314321',
                    name: 'Stage One',
                    bracket: {
                        type: 'swiss'
                    }
                },
                {
                    _id: '4356365',
                    name: 'Stage Two',
                    bracket: {
                        type: 'elimination',
                        style: 'double'
                    }
                }
            ] as Stage[])).toEqual([
                {
                    name: 'Stage One',
                    id: '12314321',
                    type: BracketType.SWISS
                },
                {
                    name: 'Stage Two',
                    id: '4356365',
                    type: BracketType.DOUBLE_ELIMINATION
                }
            ]);
        });
    });

    describe('mapBattlefyStagesToHighlightedMatches', () => {
        it('maps stages to expected format', () => {
            expect(mapBattlefyStagesToHighlightedMatches([
                {
                    _id: 'swiswsiswis',
                    name: 'Swiss Stage',
                    bracket: { type: 'swiss' },
                    matches: [
                        {
                            _id: '354364141',
                            isMarkedLive: true,
                            matchNumber: 50,
                            roundNumber: 1,
                            completedAt: '2020-05-30',
                            top: {
                                team: {
                                    _id: '123123123',
                                    name: 'Cool Team',
                                    persistentTeam: {
                                        logoUrl: 'logo://url'
                                    },
                                    players: [
                                        { inGameName: 'P1' },
                                        { inGameName: 'P2' }
                                    ]
                                }
                            },
                            bottom: {
                                team: {
                                    _id: '234234234',
                                    name: 'Cool Team the Second',
                                    persistentTeam: {
                                        logoUrl: 'logo://url/2'
                                    },
                                    players: [
                                        { inGameName: 'P3' },
                                        { inGameName: 'P4' }
                                    ]
                                }
                            }
                        }
                    ]
                },
                {
                    _id: 'elimliemleieml',
                    name: 'Elimination Stage',
                    bracket: { type: 'elimination' },
                    matches: [
                        {
                            _id: '354364141',
                            isMarkedLive: true,
                            matchNumber: 23,
                            roundNumber: 3,
                            matchType: 'winner',
                            top: {
                                team: {
                                    _id: '123123123',
                                    name: 'Cool Team',
                                    persistentTeam: {
                                        logoUrl: 'logo://url'
                                    },
                                    players: [
                                        { inGameName: 'P5' },
                                        { inGameName: 'P6' }
                                    ]
                                }
                            },
                            bottom: {
                                team: {
                                    _id: '234234234',
                                    name: 'Cool Team the Second',
                                    persistentTeam: {
                                        logoUrl: 'logo://url/2'
                                    },
                                    players: [
                                        { inGameName: 'P7' },
                                        { inGameName: 'P8' }
                                    ]
                                }
                            }
                        },
                        { isMarkedLive: false },
                        { isMarkedLive: false }
                    ]
                },
                { bracket: { type: 'unknown' } }
            ] as Stage[])).toEqual([
                {
                    meta:  {
                        completionTime: '2020-05-30',
                        id: '354364141',
                        match: 50,
                        name: 'Round 1 Match 50',
                        round: 1,
                        stageName: 'Swiss Stage',
                    },
                    teamA:  {
                        id: '123123123',
                        logoUrl: 'logo://url',
                        name: 'Cool Team',
                        players:  [
                            {
                                name: 'P1',
                            },
                            {
                                name: 'P2',
                            },
                        ],
                        showLogo: true,
                    },
                    teamB:  {
                        id: '234234234',
                        logoUrl: 'logo://url/2',
                        name: 'Cool Team the Second',
                        players:  [
                            {
                                name: 'P3',
                            },
                            {
                                name: 'P4',
                            },
                        ],
                        showLogo: true,
                    },
                },
                {
                    meta:  {
                        id: '354364141',
                        match: 23,
                        name: 'Round 3 Match C23',
                        round: 3,
                        stageName: 'Elimination Stage',
                    },
                    teamA:  {
                        id: '123123123',
                        logoUrl: 'logo://url',
                        name: 'Cool Team',
                        players:  [
                            {
                                name: 'P5',
                            },
                            {
                                name: 'P6',
                            },
                        ],
                        showLogo: true,
                    },
                    teamB:  {
                        id: '234234234',
                        logoUrl: 'logo://url/2',
                        name: 'Cool Team the Second',
                        players:  [
                            {
                                name: 'P7',
                            },
                            {
                                name: 'P8',
                            },
                        ],
                        showLogo: true,
                    },
                },
            ]);
        });
    });
});
