import { MockNodecg } from '../../__mocks__/mockNodecg';
import { dispatch, elementById } from '../../helpers/elemHelper';
import { Module } from '../../../helpers/__mocks__/module';
import { NextRound } from 'schemas';

describe('main', () => {
    const mockTeamImageToggleHelper = {
        handleTeamImageToggleChange: jest.fn()
    };
    let main: Module;
    let nodecg: MockNodecg;

    jest.mock('../../helpers/teamImageToggleHelper', () => mockTeamImageToggleHelper);

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <button id="update-next-round-btn"></button>
            <button id="begin-next-match-btn"></button>
            <select id="round-selector"></select>
            <select id="next-team-a-selector" class="team-selector"></select>
            <select id="next-team-b-selector" class="team-selector"></select>
            <div id="saved-progress-message">
                <div class="content"></div>
            </div>
            <input id="show-team-a-image">
            <input id="show-team-b-image">
            <input id="show-on-stream-toggle">
        `;

        main = require('../main_legacy');
    });

    describe('roundStore: change', () => {
        beforeEach(() => {
            nodecg.replicants.nextRound.value = { round: { id: 'bbbbbb' } };
        });

        it('updates selector', () => {
            nodecg.listeners.roundStore({
                aaaaaa: {
                    meta: { name: 'Round 1' }
                },
                bbbbbb: {
                    meta: { name: 'Round 2' }
                }
            });

            expect(elementById('round-selector').innerHTML).toMatchSnapshot();
        });
    });

    describe('nextRound: change', () => {
        beforeEach(() => {
            nodecg.replicants.roundStore.value = {};
        });

        it('updates inputs', () => {
            const teamASelector = elementById<HTMLSelectElement>('next-team-a-selector');
            const teamBSelector = elementById<HTMLSelectElement>('next-team-b-selector');
            teamASelector.innerHTML = '<option value="asdasd"></option><option value="123123"></option>';
            teamBSelector.innerHTML = '<option value="qweqwe"></option><option value="456456"></option>';
            const roundSelector = elementById<HTMLSelectElement>('round-selector');
            roundSelector.innerHTML = '<option value="zxczxc"></option><option value="890890"></option>';
            const showOnStreamToggle = elementById<HTMLInputElement>('show-on-stream-toggle');
            showOnStreamToggle.checked = false;

            nodecg.listeners.nextRound({
                teamA: { showLogo: true, id: '123123' },
                teamB: { showLogo: false, id: '456456' },
                round: { id: '890890' },
                showOnStream: true,
            });

            const showTeamAImage = elementById<HTMLInputElement>('show-team-a-image');
            const showTeamBImage = elementById<HTMLInputElement>('show-team-b-image');
            expect(showTeamAImage.checked).toEqual(true);
            expect(showTeamAImage.dataset.teamId).toEqual('123123');
            expect(showTeamBImage.checked).toEqual(false);
            expect(showTeamBImage.dataset.teamId).toEqual('456456');
            expect(teamASelector.value).toEqual('123123');
            expect(teamBSelector.value).toEqual('456456');
            expect(roundSelector.value).toEqual('890890');
            expect(showOnStreamToggle.checked).toEqual(true);
        });
    });

    describe('tournamentData: change', () => {
        beforeEach(() => {
            nodecg.replicants.nextRound.value = {
                teamA: { id: '111' },
                teamB: { id: '222' }
            };
        });

        it('updates inputs', () => {
            const teamASelector = elementById('next-team-a-selector');
            const teamBSelector = elementById('next-team-b-selector');
            teamASelector.innerHTML = '<option value="valuevalue"></option>';
            teamBSelector.innerHTML = '<option value="value2value2"></option>';

            nodecg.listeners.tournamentData({
                teams: [
                    { name: 'Team One', id: '111' },
                    { name: 'Team Two', id: '222' }
                ]
            });

            expect(teamASelector.innerHTML).toMatchSnapshot();
            expect(teamBSelector.innerHTML).toMatchSnapshot();
        });
    });

    describe('update-next-round-btn: click', () => {
        it('sends a message', () => {
            const teamASelector = elementById<HTMLSelectElement>('next-team-a-selector');
            const teamBSelector = elementById<HTMLSelectElement>('next-team-b-selector');
            teamASelector.innerHTML = '<option value="aaa"></option>';
            teamASelector.value = 'aaa';
            teamBSelector.innerHTML = '<option value="bbb"></option>';
            teamBSelector.value = 'bbb';
            const roundSelector = elementById<HTMLSelectElement>('round-selector');
            roundSelector.innerHTML = '<option value="roundround"></option>';
            roundSelector.value = 'roundround';

            dispatch(elementById('update-next-round-btn'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('setNextRound', {
                teamAId: 'aaa',
                teamBId: 'bbb',
                roundId: 'roundround'
            });
        });
    });

    describe('begin-next-match-btn: confirm', () => {
        it('sends a message', () => {
            dispatch(elementById('begin-next-match-btn'), 'confirm');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('beginNextMatch');
        });
    });

    describe('show-team-a-image: change', () => {
        it('handles change', () => {
            dispatch(elementById('show-team-a-image'), 'change');

            expect(mockTeamImageToggleHelper.handleTeamImageToggleChange).toHaveBeenCalled();
        });
    });

    describe('show-team-b-image: change', () => {
        it('handles change', () => {
            dispatch(elementById('show-team-b-image'), 'change');

            expect(mockTeamImageToggleHelper.handleTeamImageToggleChange).toHaveBeenCalled();
        });
    });

    describe('checkNextRoundProgress', () => {
        it('shows message if round has progress', () => {
            const message = elementById('saved-progress-message');
            const messageContent = message.querySelector('.content') as HTMLElement;

            main.checkNextRoundProgress({
                meta: { name: 'Round Round' },
                teamA: { score: 1, name: 'Team Alpha' },
                teamB: { score: 0, name: 'Team Bravo' }
            });

            expect(message.style.display).toEqual('');
            expect(messageContent.innerText).toEqual('\'Round Round\' already has saved progress.\n'
                + '(Team Alpha vs Team Bravo)');
        });

        it('shows message if round is completed', () => {
            const message = elementById('saved-progress-message');
            const messageContent = message.querySelector('.content') as HTMLElement;

            main.checkNextRoundProgress({
                meta: { name: 'Round Round 2', isCompleted: true },
                teamA: { score: 1, name: 'Team Gamma' },
                teamB: { score: 2, name: 'Team Kappa' }
            });

            expect(message.style.display).toEqual('');
            expect(messageContent.innerText).toEqual('\'Round Round 2\' is already completed.\n'
                + '(Team Gamma vs Team Kappa)');
        });

        it('hides message if round has no progress', () => {
            const message = elementById('saved-progress-message');

            main.checkNextRoundProgress({
                meta: { name: 'Round Round 2', isCompleted: false },
                teamA: { score: 0, name: 'Team Gamma' },
                teamB: { score: 0, name: 'Team Kappa' }
            });

            expect(message.style.display).toEqual('none');
        });
    });

    describe('show-on-stream-toggle: change', () => {
        it('updates replicant data', () => {
            nodecg.replicants.nextRound.value = { showOnStream: false };
            const toggle = elementById<HTMLInputElement>('show-on-stream-toggle');
            toggle.checked = true;

            dispatch(toggle, 'change');

            expect((nodecg.replicants.nextRound.value as NextRound).showOnStream).toEqual(true);
        });
    });
});
