import { ActiveRound, PredictionStore } from 'schemas';
import { WinningOption } from './types/winningOption';

export const predictionStore = nodecg.Replicant<PredictionStore>('predictionStore');
export const activeRound = nodecg.Replicant<ActiveRound>('activeRound');

// Stores data on current winning Option
export const winningOption: WinningOption = {
    validOption: false,
    optionIndex: -1,
    optionTitle: ''
};

export const autoResolveBtn = document.getElementById('auto-resolve-predictions-btn') as HTMLButtonElement;
export const resolveOptionABtn = document.getElementById('resolve-A-predictions-btn') as HTMLButtonElement;
export const resolveOptionBBtn = document.getElementById('resolve-B-predictions-btn') as HTMLButtonElement;
