import { MockNodecg } from '../../__mocks__/mockNodecg';
import { dispatch, elementById } from '../../helpers/elemHelper';

describe('predictions', () => {
    let nodecg: MockNodecg;

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <div id="prediction-data-status"></div>
            <div id="option-wrapper-a">
                <div id="option-data-wrapper-a" class="option-data-wrapper">
                    <div id="option-title-a" class="option-title"></div>
                    <div id="percent-a" class="percent"></div>
                    <div id="bar-a" class="bar"></div>
                    <label id="label-a"></label>
                </div>
            </div>
            <div id="option-wrapper-b">
                <div id="option-data-wrapper-b" class="option-data-wrapper">
                    <div id="option-title-b" class="option-title"></div>
                    <div id="percent-b" class="percent"></div>
                    <div id="bar-b" class="bar"></div>
                    <label id="label-b"></label>
                </div>
            </div>
            <div id="get-prediction-status"></div>
            <div id="prediction-point-count"></div>
            <div id="prediction-title"></div>
            <div id="no-prediction-message"></div>
            <div id="unsupported-service-message"></div>
            <div id="current-prediction-space"></div>
            <div id="prediction-get-space"></div>
            <div id="prediction-request-status"></div>
            <button id="create-prediction-btn"></button>
            <button id="resolve-prediction-btn"></button>
            <button id="lock-prediction-btn"></button>
            <button id="cancel-prediction-btn"></button>
            <button id="get-predictions-btn"></button>
            <button id="show-prediction-btn"></button>
        `;

        require('../predictions');
    });

    describe('predictionStore: change', () => {
        it('displays message if predictions are not enabled', () => {
            nodecg.listeners.predictionStore({ enablePrediction: false });

            expect(elementById('unsupported-service-message').style.display).toEqual('');
            expect(elementById('current-prediction-space').style.display).toEqual('none');
            expect(elementById('prediction-get-space').style.display).toEqual('none');
        });

        it('displays message if no current prediction exists', () => {
            nodecg.listeners.predictionStore({ enablePrediction: true, currentPrediction: undefined });

            expect(elementById('no-prediction-message').style.display).toEqual('');
            expect(elementById('current-prediction-space').style.display).toEqual('none');
            expect(elementById('unsupported-service-message').style.display).toEqual('none');
            expect(elementById('prediction-get-space').style.display).toEqual('');
        });

        it('hides option to fetch prediction data if websocket is open', () => {
            nodecg.listeners.predictionStore({
                enablePrediction: true,
                currentPrediction: undefined,
                socketOpen: true
            });

            expect(elementById('prediction-get-space').style.display).toEqual('none');
        });

        it('shows option to fetch prediction data if websocket is closed', () => {
            nodecg.listeners.predictionStore({
                enablePrediction: true,
                currentPrediction: undefined,
                socketOpen: false
            });

            expect(elementById('prediction-get-space').style.display).toEqual('');
        });

        it('updates prediction data displays', () => {
            nodecg.listeners.predictionStore({
                enablePrediction: true,
                currentPrediction: {
                    outcomes: [
                        { pointsUsed: 12000, title: 'Team A', id: '111', users: 10 },
                        { pointsUsed: 9999, title: 'Team Bravo', id: '222', users: 11 }
                    ],
                    status: 'ACTIVE',
                    title: 'Who will win?'
                },
                socketOpen: true
            });

            expect(elementById('prediction-point-count').innerText).toEqual('21999 points predicted by 21 users');
            expect(elementById('get-prediction-status').innerText).toEqual('active');
            expect(elementById('prediction-title').innerText).toEqual('Who will win?');

            expect(elementById('option-title-a').innerText).toEqual('Team A');
            expect(elementById('percent-a').innerText).toEqual('55%');
            expect(elementById('label-a').innerText).toEqual('Option A');
            expect(elementById('bar-a').style.width).toEqual('55%');
            expect(elementById('option-wrapper-a').dataset.outcomeId).toEqual('111');

            expect(elementById('option-title-b').innerText).toEqual('Team Bravo');
            expect(elementById('percent-b').innerText).toEqual('45%');
            expect(elementById('label-b').innerText).toEqual('Option B');
            expect(elementById('bar-b').style.width).toEqual('45%');
            expect(elementById('option-wrapper-b').dataset.outcomeId).toEqual('222');
        });

        it('updates prediction data displays when the first outcome is the winner', () => {
            nodecg.listeners.predictionStore({
                enablePrediction: true,
                currentPrediction: {
                    outcomes: [
                        { pointsUsed: 182390, title: 'Team A', id: 'aaa111' },
                        { pointsUsed: 12313, title: 'Team Bravo', id: '222' }
                    ],
                    status: 'ACTIVE',
                    title: 'Who will win?',
                    winningOutcome: 'aaa111'
                }
            });

            expect(elementById('option-data-wrapper-a').classList).toContain('winner');
            expect(elementById('option-title-a').innerText).toEqual('Team A');
            expect(elementById('percent-a').innerText).toEqual('94%');
            const labelA = elementById('label-a');
            expect(labelA.innerText).toEqual('Winner - Option A');
            expect(labelA.classList).toContain('winner');
            expect(elementById('bar-a').style.width).toEqual('94%');
            expect(elementById('option-wrapper-a').dataset.outcomeId).toEqual('aaa111');

            expect(elementById('option-data-wrapper-b').classList).not.toContain('winner');
            expect(elementById('option-title-b').innerText).toEqual('Team Bravo');
            expect(elementById('percent-b').innerText).toEqual('6%');
            const labelB = elementById('label-b');
            expect(labelB.innerText).toEqual('Option B');
            expect(labelB.classList).not.toContain('winner');
            expect(elementById('bar-b').style.width).toEqual('6%');
            expect(elementById('option-wrapper-b').dataset.outcomeId).toEqual('222');
        });

        it('updates prediction data displays when the second outcome is the winner', () => {
            nodecg.listeners.predictionStore({
                enablePrediction: true,
                currentPrediction: {
                    outcomes: [
                        { pointsUsed: 585833, title: 'Team Alpha', id: '1212' },
                        { pointsUsed: 1029387, title: 'The Second Team', id: 'bbb123' }
                    ],
                    status: 'ACTIVE',
                    title: 'Who will win?',
                    winningOutcome: 'bbb123'
                }
            });

            expect(elementById('option-data-wrapper-a').classList).not.toContain('winner');
            expect(elementById('option-title-a').innerText).toEqual('Team Alpha');
            expect(elementById('percent-a').innerText).toEqual('36%');
            const labelA = elementById('label-a');
            expect(labelA.innerText).toEqual('Option A');
            expect(labelA.classList).not.toContain('winner');
            expect(elementById('bar-a').style.width).toEqual('36%');
            expect(elementById('option-wrapper-a').dataset.outcomeId).toEqual('1212');

            expect(elementById('option-data-wrapper-b').classList).toContain('winner');
            expect(elementById('option-title-b').innerText).toEqual('The Second Team');
            expect(elementById('percent-b').innerText).toEqual('64%');
            const labelB = elementById('label-b');
            expect(labelB.innerText).toEqual('Winner - Option B');
            expect(labelB.classList).toContain('winner');
            expect(elementById('bar-b').style.width).toEqual('64%');
            expect(elementById('option-wrapper-b').dataset.outcomeId).toEqual('bbb123');
        });

        it('hides appropriate buttons if status is ACTIVE', () => {
            nodecg.listeners.predictionStore({
                enablePrediction: true,
                currentPrediction: {
                    outcomes: [
                        { channel_points: 585833, title: 'Team Alpha', id: '1212' },
                        { channel_points: 1029387, title: 'The Second Team', id: 'bbb123' }
                    ],
                    status: 'ACTIVE',
                    title: 'Who will win?',
                    winning_outcome_id: 'bbb123'
                }
            });

            expect(elementById('lock-prediction-btn').style.display).toEqual('');
            expect(elementById('cancel-prediction-btn').style.display).toEqual('');
            expect(elementById('prediction-request-status').style.display).toEqual('');
            expect(elementById('resolve-prediction-btn').style.display).toEqual('none');
            expect(elementById('create-prediction-btn').style.display).toEqual('none');
        });

        it('hides appropriate buttons if status is LOCKED', () => {
            nodecg.listeners.predictionStore({
                enablePrediction: true,
                currentPrediction: {
                    outcomes: [
                        { channel_points: 585833, title: 'Team Alpha', id: '1212' },
                        { channel_points: 1029387, title: 'The Second Team', id: 'bbb123' }
                    ],
                    status: 'LOCKED',
                    title: 'Who will win?',
                    winning_outcome_id: 'bbb123'
                }
            });

            expect(elementById('lock-prediction-btn').style.display).toEqual('none');
            expect(elementById('cancel-prediction-btn').style.display).toEqual('');
            expect(elementById('prediction-request-status').style.display).toEqual('');
            expect(elementById('resolve-prediction-btn').style.display).toEqual('');
            expect(elementById('create-prediction-btn').style.display).toEqual('none');
        });

        it('hides appropriate buttons if status is RESOLVED', () => {
            nodecg.listeners.predictionStore({
                enablePrediction: true,
                currentPrediction: {
                    outcomes: [
                        { channel_points: 585833, title: 'Team Alpha', id: '1212' },
                        { channel_points: 1029387, title: 'The Second Team', id: 'bbb123' }
                    ],
                    status: 'RESOLVED',
                    title: 'Who will win?',
                    winning_outcome_id: 'bbb123'
                }
            });

            expect(elementById('lock-prediction-btn').style.display).toEqual('none');
            expect(elementById('cancel-prediction-btn').style.display).toEqual('none');
            expect(elementById('prediction-request-status').style.display).toEqual('none');
            expect(elementById('resolve-prediction-btn').style.display).toEqual('none');
            expect(elementById('create-prediction-btn').style.display).toEqual('');
        });

        it('hides appropriate buttons if status is CANCELED', () => {
            nodecg.listeners.predictionStore({
                enablePrediction: true,
                currentPrediction: {
                    outcomes: [
                        { channel_points: 585833, title: 'Team Alpha', id: '1212' },
                        { channel_points: 1029387, title: 'The Second Team', id: 'bbb123' }
                    ],
                    status: 'CANCELED',
                    title: 'Who will win?',
                    winning_outcome_id: 'bbb123'
                }
            });

            expect(elementById('lock-prediction-btn').style.display).toEqual('none');
            expect(elementById('cancel-prediction-btn').style.display).toEqual('none');
            expect(elementById('prediction-request-status').style.display).toEqual('none');
            expect(elementById('resolve-prediction-btn').style.display).toEqual('none');
            expect(elementById('create-prediction-btn').style.display).toEqual('');
        });
    });

    describe('get-predictions-btn: click', () => {
        it('sends message', () => {
            dispatch(elementById('get-predictions-btn'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('getPredictions', {}, expect.any(Function));
        });
    });

    describe('show-prediction-btn: click', () => {
        it('sends a message', () => {
            dispatch(elementById('show-prediction-btn'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('showPredictionData');
        });
    });
});
