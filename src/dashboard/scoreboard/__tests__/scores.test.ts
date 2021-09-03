import { MockNodecg } from '../../__mocks__/mockNodecg';
import { dispatch, elementById } from '../../helpers/elemHelper';
import { GameWinner } from 'types/enums/gameWinner';

describe('scores', () => {
    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <button id="team-a-score-plus-btn"></button>
            <button id="team-b-score-plus-btn"></button>
            <button id="team-a-score-minus-btn"></button>
            <button id="team-b-score-minus-btn"></button>
            <input id="team-a-score-input">
            <input id="team-b-score-input">
        `;

        require('../scores');
    });

    describe('activeRound: change', () => {
        it('updates score inputs', () => {
            nodecg.listeners.activeRound({ games: [], teamA: { score: 1 }, teamB: { score: 2 } });

            expect(elementById<HTMLInputElement>('team-a-score-input').value).toEqual('1');
            expect(elementById<HTMLInputElement>('team-b-score-input').value).toEqual('2');
        });

        it('disables score add buttons if the final game is completed', () => {
            nodecg.listeners.activeRound({ games: [{}, {}, {}], teamA: { score: 1 }, teamB: { score: 2 } });

            expect(elementById<HTMLButtonElement>('team-a-score-plus-btn').disabled).toEqual(true);
            expect(elementById<HTMLButtonElement>('team-b-score-plus-btn').disabled).toEqual(true);
        });

        it('disables team A minus button if the last winner is bravo', () => {
            nodecg.listeners.activeRound({
                games: [{ winner: GameWinner.ALPHA }, { winner: GameWinner.ALPHA }, { winner: GameWinner.BRAVO }],
                teamA: { score: 1 },
                teamB: { score: 2 } });

            expect(elementById<HTMLButtonElement>('team-a-score-minus-btn').disabled).toEqual(true);
            expect(elementById<HTMLButtonElement>('team-b-score-minus-btn').disabled).toEqual(false);
        });

        it('disables team B minus button if the last winner is alpha', () => {
            nodecg.listeners.activeRound({
                games: [{ winner: GameWinner.BRAVO }, { winner: GameWinner.ALPHA }, { winner: GameWinner.NO_WINNER }],
                teamA: { score: 1 },
                teamB: { score: 2 } });

            expect(elementById<HTMLButtonElement>('team-a-score-minus-btn').disabled).toEqual(false);
            expect(elementById<HTMLButtonElement>('team-b-score-minus-btn').disabled).toEqual(true);
        });
    });

    describe('team-a-score-plus-btn: click', () => {
        it('sends message to set winner', () => {
            dispatch(elementById('team-a-score-plus-btn'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('setWinner', { winner: GameWinner.ALPHA });
        });
    });

    describe('team-a-score-minus-btn: click', () => {
        it('sends message to set winner', () => {
            dispatch(elementById('team-a-score-minus-btn'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('removeWinner');
        });
    });

    describe('team-b-score-plus-btn: click', () => {
        it('sends message to set winner', () => {
            dispatch(elementById('team-b-score-plus-btn'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('setWinner', { winner: GameWinner.BRAVO });
        });
    });

    describe('team-b-score-minus-btn: click', () => {
        it('sends message to set winner', () => {
            dispatch(elementById('team-b-score-minus-btn'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('removeWinner');
        });
    });
});
