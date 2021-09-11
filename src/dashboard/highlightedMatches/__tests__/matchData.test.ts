import { MockNodecg } from '../../__mocks__/mockNodecg';
import { dispatch, elementById } from '../../helpers/elemHelper';
import { MultiSelect } from '../../components/multiSelect';
import { TournamentDataSource } from 'types/enums/tournamentDataSource';
import { BracketType } from 'types/enums/bracketType';
import difference from 'lodash/difference';

describe('matchData', () => {
    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <div id="match-data-status"></div>
            <multi-select id="stage-selector">
                <select class="stage-selector" id="inner-stage-selector"></select>
            </multi-select>
            <select id="match-selector" class="match-selector"></select>
            <button id="set-next-match-btn"></button>
            <button id="get-matches"></button>
            <label id="match-label"></label>
            <div id="unsupported-service-message"></div>
            <div id="load-matches-hint"></div>
            <div id="load-matches-space"></div>
            <div id="select-match-space"></div>
            <div id="team-a-name"></div>
            <div id="team-b-name"></div>`;

        require('../matchData');
    });

    describe('get-matches: click', () => {
        describe('source: BATTLEFY', () => {
            it('sends a message if getting specific stages', () => {
                nodecg.replicants.tournamentData.value = { meta: { source: TournamentDataSource.BATTLEFY } };
                elementById<MultiSelect>('stage-selector').selectedOptions
                    = [{ value: 'stage-1' }, { value: 'stage-2' }] as unknown as HTMLOptionElement[];

                dispatch(elementById('get-matches'), 'click');

                expect(nodecg.sendMessage).toHaveBeenCalledWith('getHighlightedMatches', {
                    stages: [ 'stage-1', 'stage-2' ],
                    getAllMatches: false
                },
                expect.any(Function));
            });

            it('sends a message if getting all stages', () => {
                nodecg.replicants.tournamentData.value = { meta: { source: TournamentDataSource.BATTLEFY } };
                elementById<MultiSelect>('stage-selector').selectedOptions
                    = [{ value: 'stage-1' }, { value: 'AllStages' }] as unknown as HTMLOptionElement[];

                dispatch(elementById('get-matches'), 'click');

                expect(nodecg.sendMessage).toHaveBeenCalledWith('getHighlightedMatches', {
                    stages: [ 'stage-1', 'AllStages' ],
                    getAllMatches: true
                },
                expect.any(Function));
            });

            it('sends no message if no stages have been selected', () => {
                nodecg.replicants.tournamentData.value = { meta: { source: TournamentDataSource.BATTLEFY } };
                elementById<MultiSelect>('stage-selector').selectedOptions = [] as unknown as HTMLOptionElement[];

                dispatch(elementById('get-matches'), 'click');

                expect(nodecg.sendMessage).not.toHaveBeenCalled();
            });
        });

        describe('source: SMASHGG', () => {
            it('sends a message if getting specific stages', () => {
                nodecg.replicants.tournamentData.value = { meta: { source: TournamentDataSource.SMASHGG } };
                elementById<MultiSelect>('stage-selector').selectedOptions
                    = [{ value: '123123' }, { value: '345345' }] as unknown as HTMLOptionElement[];

                dispatch(elementById('get-matches'), 'click');

                expect(nodecg.sendMessage).toHaveBeenCalledWith(
                    'getHighlightedMatches',
                    { streamIDs: [ 123123, 345345 ], getAllMatches: false },
                    expect.any(Function));
            });

            it('sends a message if getting all stages', () => {
                nodecg.replicants.tournamentData.value = { meta: { source: TournamentDataSource.SMASHGG } };
                elementById<MultiSelect>('stage-selector').selectedOptions
                    = [{ value: '234' }, { value: 'AllStreams' }] as unknown as HTMLOptionElement[];

                dispatch(elementById('get-matches'), 'click');

                expect(nodecg.sendMessage).toHaveBeenCalledWith('getHighlightedMatches', {
                    streamIDs: [],
                    getAllMatches: true
                },
                expect.any(Function));
            });

            it('sends no message if no stages have been selected', () => {
                nodecg.replicants.tournamentData.value = { meta: { source: TournamentDataSource.SMASHGG } };
                elementById<MultiSelect>('stage-selector').selectedOptions = [] as unknown as HTMLOptionElement[];

                dispatch(elementById('get-matches'), 'click');

                expect(nodecg.sendMessage).not.toHaveBeenCalled();
            });
        });
    });

    describe('stage-selector: change', () => {
        it('disables get matches button if no options are selected', () => {
            const selector = elementById<MultiSelect>('stage-selector');
            selector.selectedOptions = [] as unknown as HTMLOptionElement[];

            dispatch(selector, 'change');

            expect(elementById<HTMLButtonElement>('get-matches').disabled).toEqual(true);
        });

        it('enables get matches button if options are selected', () => {
            const selector = elementById<MultiSelect>('stage-selector');
            selector.selectedOptions = [{}] as unknown as HTMLOptionElement[];

            dispatch(selector, 'change');

            expect(elementById<HTMLButtonElement>('get-matches').disabled).toEqual(false);
        });
    });

    describe('set-next-match-btn: click', () => {
        it('sends a message to set round data', () => {
            const matchSelector = elementById<HTMLSelectElement>('match-selector');
            matchSelector.innerHTML = `
                <option value="round1">r1</option>
                <option value="round2">r2</option>`;
            matchSelector.value = 'round2';
            nodecg.replicants.highlightedMatches.value = [
                {
                    meta: { id: 'round1' }
                },
                {
                    meta: { id: 'round2' },
                    teamA: { id: 'aaaa' },
                    teamB: { id: 'bbbb' }
                }
            ];

            dispatch(elementById('set-next-match-btn'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('setNextRound', {
                teamAId: 'aaaa',
                teamBId: 'bbbb'
            });
        });

        it('sends no message if the round is not found', () => {
            const matchSelector = elementById<HTMLSelectElement>('match-selector');
            matchSelector.innerHTML = `
                <option value="round1">r1</option>
                <option value="round2">r2</option>`;
            matchSelector.value = 'round2';
            nodecg.replicants.highlightedMatches.value = [
                {
                    meta: { id: 'round1' }
                },
                {
                    meta: { id: 'round3' },
                    teamA: { id: 'aaaa' },
                    teamB: { id: 'bbbb' }
                }
            ];

            dispatch(elementById('set-next-match-btn'), 'click');

            expect(nodecg.sendMessage).not.toHaveBeenCalled();
        });
    });

    describe('tournamentData: change', () => {
        it('hides messages and updates stages if source is BATTLEFY', () => {
            const stageSelector = elementById<HTMLSelectElement>('inner-stage-selector');
            stageSelector.innerHTML = '<option value="old-option"></option>';

            nodecg.listeners.tournamentData({
                meta: { source: TournamentDataSource.BATTLEFY },
                stages: [
                    { type: BracketType.DOUBLE_ELIMINATION, name: 'Cool Stage', id: '123123' },
                    {
                        type: BracketType.LADDER,
                        name: 'Ladder Stage Ladder Stage Ladder Stage Ladder Stage Ladder Stage Ladder Stage',
                        id: '345345'
                    },
                    { type: BracketType.SINGLE_ELIMINATION, name: 'Cool Stage 2', id: '5467567' },
                    { type: BracketType.ROUND_ROBIN, name: 'Robin Stage', id: '1236' },
                    { type: BracketType.SWISS, name: 'Swiss Stage', id: '9999' }
                ]
            });

            expect(stageSelector.innerHTML).toMatchSnapshot();
            expect(elementById('load-matches-space').style.display).toEqual('');
            expect(elementById('unsupported-service-message').style.display).toEqual('none');
            expect(elementById('match-label').innerText).toEqual('Bracket');
        });

        it('hides messages and updates stages if source is SMASHGG', () => {
            const stageSelector = elementById<HTMLSelectElement>('inner-stage-selector');
            stageSelector.innerHTML = '<option value="old-option"></option>';

            nodecg.listeners.tournamentData({
                meta: {
                    source: TournamentDataSource.SMASHGG,
                    sourceSpecificData: {
                        smashgg: {
                            streams: [
                                { streamName: 'Cool Stream', id: 123123 },
                                { streamName: 'Cool Stream 2', id: 345345 }
                            ]
                        }
                    }
                }
            });

            expect(stageSelector.innerHTML).toMatchSnapshot();
            expect(elementById('load-matches-space').style.display).toEqual('');
            expect(elementById('unsupported-service-message').style.display).toEqual('none');
            expect(elementById('match-label').innerText).toEqual('Stream');
        });

        difference(
            Object.values(TournamentDataSource),
            [TournamentDataSource.BATTLEFY, TournamentDataSource.SMASHGG]
        ).forEach(source => {
            it(`shows warning message if source is ${source}`, () => {
                const stageSelector = elementById<HTMLSelectElement>('inner-stage-selector');
                stageSelector.innerHTML = '<option value="old-option"></option>';

                nodecg.listeners.tournamentData({
                    meta: { source: source },
                });

                expect(stageSelector.innerHTML).toEqual('');
                expect(elementById('load-matches-space').style.display).toEqual('none');
                expect(elementById('unsupported-service-message').style.display).toEqual('');
                expect(elementById('load-matches-hint').style.display).toEqual('none');
            });
        });
    });

    describe('highlightedMatchData: change', () => {
        describe('no matches available', () => {
            it('displays message if source is BATTLEFY', () => {
                const loadMatchesMsg = elementById('load-matches-hint');
                loadMatchesMsg.style.display = 'none';
                nodecg.replicants.tournamentData.value = { meta: { source: TournamentDataSource.BATTLEFY } };

                nodecg.listeners.highlightedMatches([]);

                expect(elementById('select-match-space').style.display).toEqual('none');
                expect(loadMatchesMsg.style.display).toEqual('');
            });

            it('displays message if source is SMASHGG', () => {
                const loadMatchesMsg = elementById('load-matches-hint');
                loadMatchesMsg.style.display = 'none';
                nodecg.replicants.tournamentData.value = { meta: { source: TournamentDataSource.SMASHGG } };

                nodecg.listeners.highlightedMatches([]);

                expect(elementById('select-match-space').style.display).toEqual('none');
                expect(loadMatchesMsg.style.display).toEqual('');
            });

            difference(
                Object.values(TournamentDataSource),
                [TournamentDataSource.BATTLEFY, TournamentDataSource.SMASHGG]
            ).forEach(source => {
                it(`displays no match selector or message if source is ${source}`, () => {
                    const loadMatchesMsg = elementById('load-matches-hint');
                    loadMatchesMsg.style.display = 'none';
                    nodecg.replicants.tournamentData.value = { meta: { source: source } };

                    nodecg.listeners.highlightedMatches([]);

                    expect(elementById('select-match-space').style.display).toEqual('none');
                    expect(loadMatchesMsg.style.display).toEqual('none');
                });
            });
        });

        describe('with matches', () => {
            it('hides message', () => {
                const selectMatchSpace = elementById('select-match-space');
                selectMatchSpace.style.display = 'none';

                nodecg.listeners.highlightedMatches([{
                    meta: { stageName: 'Cool Stage' },
                    teamA: { name: 'Cool Team' },
                    teamB: { name: 'Cooler Team' }
                }]);

                expect(elementById('load-matches-hint').style.display).toEqual('none');
                expect(selectMatchSpace.style.display).toEqual('');
            });

            it('fills match selector if all matches are on the same stage', () => {
                nodecg.listeners.highlightedMatches([
                    {
                        meta: { stageName: 'Cool Stage', id: '111', name: 'Match 1' },
                        teamA: { name: 'Cool Team' },
                        teamB: { name: 'Cooler Team' }
                    },
                    {
                        meta: { stageName: 'Cool Stage', id: '222', name: 'Match 2' },
                        teamA: { name: 'Cool Team 2' },
                        teamB: { name: 'Cooler Team 2' }
                    },
                    {
                        meta: { stageName: 'Cool Stage', id: '333', name: 'Match 3' },
                        teamA: { name: 'Cool Team 3' },
                        teamB: { name: 'Cooler Team 3' }
                    }
                ]);

                expect(elementById('match-selector').innerHTML).toMatchSnapshot();
                expect(elementById('team-a-name').innerText).toEqual('Cool Team');
                expect(elementById('team-b-name').innerText).toEqual('Cooler Team');
            });

            it('fills match selector if all matches are not on the same stage', () => {
                nodecg.listeners.highlightedMatches([
                    {
                        meta: { stageName: 'Cool Stage', id: '123', name: 'Dope Match 1' },
                        teamA: { name: 'Dope Team' },
                        teamB: { name: 'Doper Team' }
                    },
                    {
                        meta: { stageName: 'Cool Stage 2', id: '234', name: 'Cool Match 2' },
                        teamA: { name: 'Cool Team' },
                        teamB: { name: 'Cooler Team' }
                    },
                    {
                        meta: { stageName: 'Cool Stage 3', id: '345', name: 'Rad Match 3' },
                        teamA: { name: 'Rad Team' },
                        teamB: { name: 'Radder team' }
                    }
                ]);

                expect(elementById('match-selector').innerHTML).toMatchSnapshot();
                expect(elementById('team-a-name').innerText).toEqual('Dope Team');
                expect(elementById('team-b-name').innerText).toEqual('Doper Team');
            });
        });
    });

    describe('match-selector: input', () => {
        it('sets match data if found', () => {
            const selector = elementById<HTMLSelectElement>('match-selector');
            selector.innerHTML = `
                <option value="123123">
                <option value="234234">`;
            selector.value = '234234';
            nodecg.replicants.highlightedMatches.value = [
                { meta: { id: '123123' }, teamA: { name: 'Cool Team' }, teamB: { name: 'Cool Team 2' } },
                { meta: { id: '234234' }, teamA: { name: 'Rad Team' }, teamB: { name: 'Rad Team 2' } }
            ];

            dispatch(selector, 'input');

            expect(elementById('team-a-name').innerText).toEqual('Rad Team');
            expect(elementById('team-b-name').innerText).toEqual('Rad Team 2');
            expect(elementById<HTMLButtonElement>('set-next-match-btn').disabled).toEqual(false);
        });

        it('handles missing match data', () => {
            const selector = elementById<HTMLSelectElement>('match-selector');
            selector.innerHTML = `
                <option value="123123">
                <option value="456456">`;
            selector.value = '456456';
            nodecg.replicants.highlightedMatches.value = [
                { meta: { id: '123123' }, teamA: { name: 'Cool Team' }, teamB: { name: 'Cool Team 2' } },
                { meta: { id: '234234' }, teamA: { name: 'Rad Team' }, teamB: { name: 'Rad Team 2' } }
            ];

            dispatch(selector, 'input');

            expect(elementById('team-a-name').innerText).toEqual('Unknown');
            expect(elementById('team-b-name').innerText).toEqual('Unknown');
            expect(elementById<HTMLButtonElement>('set-next-match-btn').disabled).toEqual(true);
        });
    });
});
