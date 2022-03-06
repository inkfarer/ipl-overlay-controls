import { ActiveRound, SwapColorsInternally } from 'schemas';
import { GameWinner } from 'types/enums/gameWinner';
import {
    GetNextAndPreviousColorsResponse,
    SetActiveColorRequest,
    SetWinnerRequest,
    SwapRoundColorRequest
} from 'types/messages/activeRound';
import { SetRoundRequest } from 'types/messages/rounds';
import { ActiveRoundGame } from 'types/activeRoundGame';
import { defineStore } from 'pinia';

const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');

export const activeRoundReps = [ activeRound, swapColorsInternally ];

export interface ActiveRoundStore {
    activeRound: ActiveRound;
    swapColorsInternally: SwapColorsInternally;
}

export const useActiveRoundStore = defineStore('activeRound', {
    state: () => ({
        activeRound: null,
        swapColorsInternally: null
    } as ActiveRoundStore),
    actions: {
        setWinner({ winner }: { winner: GameWinner }): void {
            nodecg.sendMessage('setWinner', { winner });
        },
        removeWinner(): void {
            nodecg.sendMessage('removeWinner');
        },
        setActiveColor(request: SetActiveColorRequest): void {
            nodecg.sendMessage('setActiveColor', request);
        },
        swapColors(): void {
            swapColorsInternally.value = !swapColorsInternally.value;
        },
        setWinnerForIndex({ index, winner }: { index: number, winner: GameWinner }): void {
            nodecg.sendMessage('setWinner', { winner, roundIndex: index } as SetWinnerRequest);
        },
        resetActiveRound(): void {
            nodecg.sendMessage('resetActiveRound');
        },
        setActiveRound(request: SetRoundRequest): void {
            nodecg.sendMessage('setActiveRound', request);
        },
        swapRoundColor(request: SwapRoundColorRequest): void {
            nodecg.sendMessage('swapRoundColor', request);
        },
        updateActiveGames(games: ActiveRoundGame[]): void {
            nodecg.sendMessage('updateActiveGames', { games });
        },
        switchToNextColor(): void {
            nodecg.sendMessage('switchToNextColor');
        },
        switchToPreviousColor(): void {
            nodecg.sendMessage('switchToPreviousColor');
        },
        async getNextAndPreviousColors(): Promise<GetNextAndPreviousColorsResponse> {
            return nodecg.sendMessage('getNextAndPreviousColors');
        }
    }
});
