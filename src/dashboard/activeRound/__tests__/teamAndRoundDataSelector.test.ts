import { MockNodecg } from '../../__mocks__/mockNodecg';
import { dispatch, elementById } from '../../helpers/elemHelper';

describe('teamAndRoundDataSelector', () => {
    const mockCheckRoundProgress = jest.fn();
    const mockHandleTeamImageToggleChange = jest.fn();
    let nodecg: MockNodecg;

    jest.mock('../roundProgressHelper', () => ({
        __esModule: true,
        checkRoundProgress: mockCheckRoundProgress
    }));

    jest.mock('../../helpers/teamImageToggleHelper', () => ({
        __esModule: true,
        handleTeamImageToggleChange: mockHandleTeamImageToggleChange
    }));

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <select id="round-selector" class="round-selector">
                <option value="round-round">ROUND</option>
                <option value="round-no-progress">ROUND</option>
                <option 
                    value="round"
                    data-team-a-id="aaa"
                    data-team-b-id="bbb"
                    data-team-a-name="TEAMA"
                    data-team-b-name="TEAMB"
                >ROUND</option>
                <option 
                    value="round-completed"
                    data-team-a-id="aaa"
                    data-team-b-id="bbb"
                    data-team-a-name="TEAMA"
                    data-team-b-name="TEAMB"
                    data-is-completed="true"
                >ROUND</option>
            </select>
            <select id="team-a-selector" class="team-selector">
                <option value="team-team">TEAM</option>
                <option value="team-a">TEAM</option>
                <option value="aaa">TEAM</option>
            </select>
            <select id="team-b-selector" class="team-selector">
                <option value="team-team">TEAM</option>
                <option value="team-b">TEAM</option>
                <option value="bbb">TEAM</option>
            </select>
            <button id="update-active-round-button" />
            <div id="round-data-info">
                <div class="content" />
            </div>
            <input id="show-team-a-image">
            <input id="show-team-b-image">
            <div id="team-a-color-display" />
            <div id="team-b-color-display" />
        `;

        require('../teamAndRoundDataSelector');
    });

    describe('activeRound change', () => {
        it('updates inputs and data displays', () => {
            nodecg.listeners.activeRound({
                teamA: { id: 'team-a', showLogo: true, color: '#aaa' },
                teamB: { id: 'team-b', showLogo: false, color: '#bbb' },
                round: { id: 'round-no-progress' }
            });

            expect(elementById<HTMLInputElement>('team-a-selector').value).toEqual('team-a');
            expect(elementById<HTMLInputElement>('team-b-selector').value).toEqual('team-b');
            expect(elementById<HTMLInputElement>('round-selector').value).toEqual('round-no-progress');
            const showTeamAImage = elementById<HTMLInputElement>('show-team-a-image');
            expect(showTeamAImage.checked).toEqual(true);
            expect(showTeamAImage.dataset.teamId).toEqual('team-a');
            const showTeamBImage = elementById<HTMLInputElement>('show-team-b-image');
            expect(showTeamBImage.checked).toEqual(false);
            expect(showTeamBImage.dataset.teamId).toEqual('team-b');
            expect(elementById('team-a-color-display').style.backgroundColor).toEqual('rgb(170, 170, 170)');
            expect(elementById('team-b-color-display').style.backgroundColor).toEqual('rgb(187, 187, 187)');
            expect(mockCheckRoundProgress).toHaveBeenCalled();
        });
    });

    describe('tournamentData change', () => {
        it('updates team selectors', () => {
            nodecg.replicants.activeRound.value = {
                teamA: { id: 'team1' },
                teamB: { id: 'team2' }
            };

            nodecg.listeners.tournamentData({
                teams: [
                    { id: 'team1', name: 'Cool Team' },
                    { id: 'team2', name: 'LONG TEAM NAME LONG TEAM NAME LONG TEAM NAME LONG TEAM NAME LONG TEAM NAME' }
                ]
            });

            const expectedSelectorContent = '<option value="team1">Cool Team</option><option value="team2">LONG TEAM NAME LONG TEAM NAME LONG TEAM NAME ...</option>';
            const teamASelector = elementById<HTMLSelectElement>('team-a-selector');
            expect(teamASelector.innerHTML).toEqual(expectedSelectorContent);
            expect(teamASelector.value).toEqual('team1');
            const teamBSelector = elementById<HTMLSelectElement>('team-b-selector');
            expect(teamBSelector.innerHTML).toEqual(expectedSelectorContent);
            expect(teamBSelector.value).toEqual('team2');
        });
    });

    describe('roundStore change', () => {
        beforeEach(() => {
            const roundSelector = elementById<HTMLSelectElement>('round-selector');
            roundSelector.innerHTML = '<option value="123123" />';
            roundSelector.value = '123123';
        });

        it('updates round selector', () => {
            nodecg.replicants.activeRound.value = {
                round: { id: '123123' }
            };

            nodecg.listeners.roundStore({
                '123123': {
                    meta: { name: 'Cool Round', isCompleted: true },
                    teamA: { name: 'Cool Team A', id: '123123a' },
                    teamB: { name: 'Cool Team B', id: '123123b' }
                },
                '345345': {
                    meta: { name: 'Cool Round 2', isCompleted: false },
                    teamA: { name: 'Cool Team A', id: '345345a' },
                    teamB: { name: 'Cool Team B', id: '345345b' }
                },
                '567567': {
                    meta: { name: 'Cool Round 3', isCompleted: false }
                }
            });

            const roundSelector = elementById<HTMLSelectElement>('round-selector');
            expect(roundSelector.innerHTML).toEqual('<option value="123123" data-team-a-id="123123a" data-team-b-id="123123b" data-team-a-name="Cool Team A" data-team-b-name="Cool Team B" data-is-completed="true">Cool Round</option><option value="345345" data-team-a-id="345345a" data-team-b-id="345345b" data-team-a-name="Cool Team A" data-team-b-name="Cool Team B" data-is-completed="false">Cool Round 2</option><option value="567567">Cool Round 3</option>');
            expect(roundSelector.value).toEqual('123123');
            expect(mockCheckRoundProgress).toHaveBeenCalled();
        });
    });

    describe('roundSelector change', () => {
        it('checks round progress', () => {
            dispatch(elementById('round-selector'), 'change');

            expect(mockCheckRoundProgress).toHaveBeenCalled();
        });
    });

    describe('updateActiveRoundButton click', () => {
        it('sends setActiveRound message', () => {
            elementById<HTMLSelectElement>('team-a-selector').value = 'team-a';
            elementById<HTMLSelectElement>('team-b-selector').value = 'team-b';
            elementById<HTMLSelectElement>('round-selector').value = 'round-round';

            dispatch(elementById('update-active-round-button'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('setActiveRound', {
                roundId: 'round-round',
                teamAId: 'team-a',
                teamBId: 'team-b'
            });
        });
    });

    describe('showTeamAImage change', () => {
        it('calls handleTeamImageToggleChange', () => {
            dispatch(elementById('show-team-a-image'), 'change');

            expect(mockHandleTeamImageToggleChange).toHaveBeenCalled();
        });
    });

    describe('showTeamBImage change', () => {
        it('calls handleTeamImageToggleChange', () => {
            dispatch(elementById('show-team-b-image'), 'change');

            expect(mockHandleTeamImageToggleChange).toHaveBeenCalled();
        });
    });
});
