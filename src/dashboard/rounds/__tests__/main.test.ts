import { MockNodecg } from '../../__mocks__/mockNodecg_legacy';
import { dispatch, elementById } from '../../helpers/elemHelper';
import { GameWinner } from 'types/enums/gameWinner';

describe('main', () => {
    const mockGenerateId = jest.fn();
    let nodecg: MockNodecg;

    jest.mock('../../../helpers/generateId', () => ({
        __esModule: true,
        generateId: mockGenerateId
    }));

    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();

        nodecg = new MockNodecg();
        nodecg.init();

        document.body.innerHTML = `
            <button id="create-3-game-round"></button>
            <button id="create-5-game-round"></button>
            <button id="create-7-game-round"></button>
            <button id="reset-rounds"></button>
            <div id="round-grid"></div>
        `;

        require('../main_legacy');
    });

    describe('create-3-game-round: click', () => {
        it('creates a round', () => {
            mockGenerateId.mockReturnValue('idid123');

            dispatch(elementById('create-3-game-round'), 'click');

            const roundElement = elementById('round_idid123');
            expect(roundElement).not.toBeNull();
            expect(roundElement.querySelectorAll('.stage-selector').length).toEqual(3);
            expect(roundElement.querySelectorAll('.mode-selector').length).toEqual(3);
        });
    });

    describe('create-5-game-round: click', () => {
        it('creates a round', () => {
            mockGenerateId.mockReturnValue('idid1234');

            dispatch(elementById('create-5-game-round'), 'click');

            const roundElement = elementById('round_idid1234');
            expect(roundElement).not.toBeNull();
            expect(roundElement.querySelectorAll('.stage-selector').length).toEqual(5);
            expect(roundElement.querySelectorAll('.mode-selector').length).toEqual(5);
        });
    });

    describe('create-7-game-round: click', () => {
        it('creates a round', () => {
            mockGenerateId.mockReturnValue('idid1234567');

            dispatch(elementById('create-7-game-round'), 'click');

            const roundElement = elementById('round_idid1234567');
            expect(roundElement).not.toBeNull();
            expect(roundElement.querySelectorAll('.stage-selector').length).toEqual(7);
            expect(roundElement.querySelectorAll('.mode-selector').length).toEqual(7);
        });
    });

    describe('round editor', () => {
        it('updates round data on update button click', () => {
            mockGenerateId.mockReturnValue('123');
            dispatch(elementById('create-3-game-round'), 'click');
            elementById<HTMLInputElement>('name-input_123').value = 'Cool Round';
            elementById<HTMLSelectElement>('stage-selector_123_0').value = 'Moray Towers';
            elementById<HTMLSelectElement>('mode-selector_123_0').value = 'Rainmaker';
            elementById<HTMLSelectElement>('stage-selector_123_1').value = 'MakoMart';
            elementById<HTMLSelectElement>('mode-selector_123_1').value = 'Tower Control';
            elementById<HTMLSelectElement>('stage-selector_123_2').value = 'Skipper Pavilion';
            elementById<HTMLSelectElement>('mode-selector_123_2').value = 'Turf War';

            dispatch(elementById('update-round_123'), 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('updateRoundStore', {
                id: '123',
                roundName: 'Cool Round',
                games: [
                    { stage: 'Moray Towers', mode: 'Rainmaker', winner: GameWinner.NO_WINNER },
                    { stage: 'MakoMart', mode: 'Tower Control', winner: GameWinner.NO_WINNER },
                    { stage: 'Skipper Pavilion', mode: 'Turf War', winner: GameWinner.NO_WINNER }
                ]
            });
        });

        it('deletes round on delete button click', () => {
            mockGenerateId.mockReturnValue('567');
            dispatch(elementById('create-5-game-round'), 'click');
            const removeButton = elementById('remove-round_567');
            removeButton.dataset.uncommitted = 'false';

            dispatch(removeButton, 'click');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('removeRound', { roundId: '567' });
        });

        it('deletes round element if round is uncommitted', () => {
            mockGenerateId.mockReturnValue('567');
            dispatch(elementById('create-5-game-round'), 'click');
            const removeButton = elementById('remove-round_567');
            removeButton.dataset.uncommitted = 'true';

            dispatch(removeButton, 'click');

            expect(elementById('round-grid').innerHTML).toEqual('');
        });
    });

    describe('reset-rounds: confirm', () => {
        it('sends message to reset rounds', () => {
            dispatch(elementById('reset-rounds'), 'confirm');

            expect(nodecg.sendMessage).toHaveBeenCalledWith('resetRoundStore');
        });
    });

    describe('roundStore: change', () => {
        it('adds new rounds', () => {
            nodecg.listeners.roundStore({
                roundone: {
                    meta: { name: 'Round Two' },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'Manta Maria', mode: 'Turf War' },
                        { stage: 'MakoMart', mode: 'Clam Blitz' }
                    ]
                },
                roundtwo: {
                    meta: { name: 'Round Two' },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'Manta Maria', mode: 'Turf War' },
                        { stage: 'MakoMart', mode: 'Clam Blitz' },
                        { stage: 'Humpback Pump Track', mode: 'Tower Control' },
                        { stage: 'Ancho-V Games', mode: 'Splat Zones' }
                    ]
                }
            });

            expect(elementById('round-grid').innerHTML).toMatchSnapshot();
        });

        it('handles rounds being added and updated', () => {
            const roundGrid = elementById('round-grid');

            const initialRounds = {
                roundone: {
                    meta: { name: 'Round Two' },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'Manta Maria', mode: 'Turf War' },
                        { stage: 'MakoMart', mode: 'Clam Blitz' }
                    ]
                },
                roundtwo: {
                    meta: { name: 'Round Two' },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'Manta Maria', mode: 'Turf War' },
                        { stage: 'MakoMart', mode: 'Clam Blitz' },
                        { stage: 'Humpback Pump Track', mode: 'Tower Control' },
                        { stage: 'Ancho-V Games', mode: 'Splat Zones' }
                    ]
                }
            };
            nodecg.listeners.roundStore(initialRounds);

            expect(roundGrid.innerHTML).toMatchSnapshot();

            const newRounds = {
                roundone: {
                    meta: { name: 'Round Two' },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'Manta Maria', mode: 'Turf War' },
                        { stage: 'MakoMart', mode: 'Clam Blitz' }
                    ]
                },
                roundtwo: {
                    meta: { name: 'Round Two' },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'Manta Maria', mode: 'Turf War' },
                        { stage: 'MakoMart', mode: 'Clam Blitz' },
                        { stage: 'Humpback Pump Track', mode: 'Tower Control' },
                        { stage: 'Ancho-V Games', mode: 'Splat Zones' }
                    ]
                },
                roundthree: {
                    meta: { name: 'Round Two' },
                    games: [
                        { stage: 'Walleye Warehouse', mode: 'Tower Control' },
                        { stage: 'Sturgeon Shipyard', mode: 'Turf War' },
                        { stage: 'Piranha Pit', mode: 'Unknown Mode' },
                        { stage: 'Unknown Stage', mode: 'Tower Control' },
                        { stage: 'New Albacore Hotel', mode: 'Splat Zones' },
                        { stage: 'MakoMart', mode: 'Clam Blitz' },
                        { stage: 'Humpback Pump Track', mode: 'Splat Zones' }
                    ]
                }
            };
            nodecg.listeners.roundStore(newRounds, initialRounds);

            expect(roundGrid.innerHTML).toMatchSnapshot();
        });

        it('handles rounds being removed', () => {
            const roundGrid = elementById('round-grid');

            const initialRounds = {
                roundone: {
                    meta: { name: 'Round Two' },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'Manta Maria', mode: 'Turf War' },
                        { stage: 'MakoMart', mode: 'Clam Blitz' }
                    ]
                },
                roundtwo: {
                    meta: { name: 'Round Two' },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'Manta Maria', mode: 'Turf War' },
                        { stage: 'MakoMart', mode: 'Clam Blitz' },
                        { stage: 'Humpback Pump Track', mode: 'Tower Control' },
                        { stage: 'Ancho-V Games', mode: 'Splat Zones' }
                    ]
                }
            };
            nodecg.listeners.roundStore(initialRounds);

            expect(roundGrid.innerHTML).toMatchSnapshot();

            const newRounds = {
                roundone: {
                    meta: { name: 'Round Two' },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'Manta Maria', mode: 'Turf War' },
                        { stage: 'MakoMart', mode: 'Clam Blitz' }
                    ]
                }
            };
            nodecg.listeners.roundStore(newRounds, initialRounds);

            expect(roundGrid.innerHTML).toMatchSnapshot();
        });

        it('disables remove button if there is only one round', () => {
            nodecg.listeners.roundStore({
                roundone: {
                    meta: { name: 'Round Two' },
                    games: [
                        { stage: 'Blackbelly Skatepark', mode: 'Rainmaker' },
                        { stage: 'Manta Maria', mode: 'Turf War' },
                        { stage: 'MakoMart', mode: 'Clam Blitz' }
                    ]
                },
            });

            expect(elementById<HTMLButtonElement>('remove-round_roundone').disabled).toEqual(true);
        });
    });
});
