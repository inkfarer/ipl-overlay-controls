import { MockNodecg } from '../../__mocks__/mockNodecg_legacy';
import { Module, UnknownModule } from '../../../helpers/__mocks__/module';
import { elementById } from '../../helpers/elemHelper';
import { PredictionStatus } from 'types/enums/predictionStatus';
import difference from 'lodash/difference';
import { WinningOption } from '../types/winningOption';

describe('resolvePredictionDialog', () => {
    const mockElemHelper = {
        hideElement: jest.fn(),
        showElement: jest.fn()
    };
    let module: Module;
    let elements: UnknownModule;
    let nodecg: MockNodecg;

    jest.mock('../../helpers/elemHelper', () => mockElemHelper);

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <button id="auto-resolve-predictions-btn"></button>
            <button id="resolve-A-predictions-btn"></button>
            <button id="resolve-B-predictions-btn"></button>
            <div id="message-warning"></div>
            <div id="warning-message-box"></div>
            <div id="message-info"></div>
            <div id="info-message-box"></div>
            <div id="prediction-patch-status"></div>
        `;

        module = require('../resolvePredictionDialog');
        elements = require('../elements');
    });

    describe('setBtnDisable', () => {
        it('disables buttons', () => {
            module.setBtnDisable(true);

            expect(elementById<HTMLButtonElement>('auto-resolve-predictions-btn').disabled).toEqual(true);
            expect(elementById<HTMLButtonElement>('resolve-A-predictions-btn').disabled).toEqual(true);
            expect(elementById<HTMLButtonElement>('resolve-B-predictions-btn').disabled).toEqual(true);
        });

        it('enables buttons', () => {
            module.setBtnDisable(false);

            expect(elementById<HTMLButtonElement>('auto-resolve-predictions-btn').disabled).toEqual(false);
            expect(elementById<HTMLButtonElement>('resolve-A-predictions-btn').disabled).toEqual(false);
            expect(elementById<HTMLButtonElement>('resolve-B-predictions-btn').disabled).toEqual(false);
        });
    });

    describe('setUI', () => {
        it('updates buttons if winning option is not valid', () => {
            elements.winningOption = { validOption: false };

            module.setUI({
                currentPrediction: {
                    outcomes: [
                        { title: 'Option 1' },
                        { title: 'Option 2' }
                    ],
                    status: PredictionStatus.LOCKED
                }
            });

            const autoResolveButton = elementById<HTMLButtonElement>('auto-resolve-predictions-btn');
            expect(autoResolveButton.disabled).toEqual(true);
            expect(autoResolveButton.innerText).toEqual('Auto Resolve: ?');
            const resolveABtn = elementById<HTMLButtonElement>('resolve-A-predictions-btn');
            expect(resolveABtn.disabled).toEqual(false);
            expect(resolveABtn.innerText).toEqual('Option 1');
            const resolveBBtn = elementById<HTMLButtonElement>('resolve-B-predictions-btn');
            expect(resolveBBtn.disabled).toEqual(false);
            expect(resolveBBtn.innerText).toEqual('Option 2');
            expect(mockElemHelper.hideElement).toHaveBeenCalledWith(elementById('warning-message-box'));
            expect(mockElemHelper.showElement).toHaveBeenCalledWith(elementById('info-message-box'));
            expect(elementById('message-info').innerText).toEqual('Unable to determine winning team automatically');
        });

        it('updates buttons if winning option is valid', () => {
            elements.winningOption = { validOption: true, optionTitle: 'Option Win' };

            module.setUI({
                currentPrediction: {
                    outcomes: [
                        { title: 'Option One' },
                        { title: 'Option Two' }
                    ],
                    status: PredictionStatus.LOCKED
                }
            });

            const autoResolveButton = elementById<HTMLButtonElement>('auto-resolve-predictions-btn');
            expect(autoResolveButton.disabled).toEqual(false);
            expect(autoResolveButton.innerText).toEqual('Auto Resolve: Option Win');
            const resolveABtn = elementById<HTMLButtonElement>('resolve-A-predictions-btn');
            expect(resolveABtn.disabled).toEqual(false);
            expect(resolveABtn.innerText).toEqual('Option One');
            const resolveBBtn = elementById<HTMLButtonElement>('resolve-B-predictions-btn');
            expect(resolveBBtn.disabled).toEqual(false);
            expect(resolveBBtn.innerText).toEqual('Option Two');
            expect(mockElemHelper.hideElement).toHaveBeenCalledWith(elementById('warning-message-box'));
            expect(mockElemHelper.showElement).not.toHaveBeenCalledWith(elementById('info-message-box'));
            expect(mockElemHelper.hideElement).toHaveBeenCalledWith(elementById('info-message-box'));
        });

        it('handles missing prediction data', () => {
            elements.winningOption = { validOption: true };

            module.setUI({
                currentPrediction: undefined
            });

            expect(mockElemHelper.showElement).toHaveBeenCalledWith(elementById('info-message-box'));
            expect(elementById('message-info').innerText).toEqual('This prediction cannot be resolved right now');
            expect(elementById<HTMLButtonElement>('auto-resolve-predictions-btn').disabled).toEqual(true);
            const resolveABtn = elementById<HTMLButtonElement>('resolve-A-predictions-btn');
            expect(resolveABtn.disabled).toEqual(true);
            expect(resolveABtn.innerText).toEqual('unknown');
            const resolveBBtn = elementById<HTMLButtonElement>('resolve-B-predictions-btn');
            expect(resolveBBtn.disabled).toEqual(true);
            expect(resolveBBtn.innerText).toEqual('unknown');
        });

        difference(Object.values(PredictionStatus), [PredictionStatus.LOCKED]).forEach(status => {
            it(`displays message is prediction status is ${status}`, () => {
                elements.winningOption = { validOption: false };

                module.setUI({
                    currentPrediction: {
                        outcomes: [
                            { title: 'Option One' },
                            { title: 'Option Two' }
                        ],
                        status: status
                    }
                });

                expect(mockElemHelper.showElement).toHaveBeenCalledWith(elementById('info-message-box'));
                expect(elementById('message-info').innerText).toEqual('This prediction cannot be resolved right now');
                expect(elementById<HTMLButtonElement>('auto-resolve-predictions-btn').disabled).toEqual(true);
                expect(elementById<HTMLButtonElement>('resolve-A-predictions-btn').disabled).toEqual(true);
                expect(elementById<HTMLButtonElement>('resolve-B-predictions-btn').disabled).toEqual(true);
            });
        });
    });

    describe('autoResolveWinner', () => {
        it('handles missing prediction data', () => {
            module.autoResolveWinner(undefined, { currentPrediction: undefined });

            expect((elements.winningOption as WinningOption).validOption).toEqual(false);
        });

        it('handles teams being tied', () => {
            module.autoResolveWinner({
                teamA: { score: 1, name: 'Team Alpha' },
                teamB: { score: 1, name: 'Team Bravo' }
            }, {
                currentPrediction: {
                    outcomes: [
                        { title: 'team bravo' },
                        { title: 'team alpha' }
                    ]
                }
            });

            expect((elements.winningOption as WinningOption).validOption).toEqual(false);
        });

        it('sets winner correctly if team A is leading', () => {
            module.autoResolveWinner({
                teamA: { score: 1, name: 'Team Alpha' },
                teamB: { score: 0, name: 'Team Bravo' }
            }, {
                currentPrediction: {
                    outcomes: [
                        { title: 'team bravo' },
                        { title: 'team alpha' }
                    ]
                }
            });

            const winningOption = elements.winningOption as WinningOption;
            expect(winningOption.validOption).toEqual(true);
            expect(winningOption.optionIndex).toEqual(1);
            expect(winningOption.optionTitle).toEqual('team alpha');
        });

        it('sets winner correctly if team B is leading', () => {
            module.autoResolveWinner({
                teamA: { score: 100, name: 'Team Alpha' },
                teamB: { score: 101, name: 'Team Two' }
            }, {
                currentPrediction: {
                    outcomes: [
                        { title: 'team two' },
                        { title: 'team alpha' }
                    ]
                }
            });

            const winningOption = elements.winningOption as WinningOption;
            expect(winningOption.validOption).toEqual(true);
            expect(winningOption.optionIndex).toEqual(0);
            expect(winningOption.optionTitle).toEqual('team two');
        });
    });

    describe('resolvePrediction', () => {
        it('displays warning if no prediction exists', () => {
            nodecg.replicants.predictionStore.value = { currentPrediction: undefined };

            module.resolvePrediction(0);

            expect(elementById('message-warning').innerText).toEqual('No outcomes/prediction to resolve >.<');
            expect(mockElemHelper.showElement).toHaveBeenCalledWith(elementById('warning-message-box'));
        });

        it('displays warning if no prediction id exists', () => {
            nodecg.replicants.predictionStore.value = { currentPrediction: { id: undefined } };

            module.resolvePrediction(0);

            expect(elementById('message-warning').innerText).toEqual('No outcomes/prediction to resolve >.<');
            expect(mockElemHelper.showElement).toHaveBeenCalledWith(elementById('warning-message-box'));
        });

        it('displays warning if index is invalid', () => {
            nodecg.replicants.predictionStore.value = { currentPrediction: { id: 'aaaaa' } };

            module.resolvePrediction(100);

            expect(elementById('message-warning').innerText).toEqual('No outcomes/prediction to resolve >.<');
            expect(mockElemHelper.showElement).toHaveBeenCalledWith(elementById('warning-message-box'));
        });

        it('sends a message', () => {
            nodecg.replicants.predictionStore.value = {
                currentPrediction: {
                    id: 'aaaaa',
                    outcomes: [
                        { id: 'aaa' },
                        { id: 'bbb' }
                    ]
                },
            };

            module.resolvePrediction(1);

            expect(nodecg.sendMessage).toHaveBeenCalledWith('patchPrediction', {
                id: 'aaaaa',
                status: PredictionStatus.RESOLVED,
                winning_outcome_id: 'bbb'
            }, expect.any(Function));
        });
    });
});
