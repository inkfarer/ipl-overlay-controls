import * as nodecgContext from '../helpers/nodecg';
import { ObsData, RuntimeConfig, ScoreboardData } from '../../types/schemas';
import { UnhandledListenForCb } from 'nodecg/lib/nodecg-instance';
import { setCurrentScene } from './obsSocket';
import { GameVersion } from '../../types/enums/gameVersion';
import { switchToNextColor } from '../replicants/activeRound';

const nodecg = nodecgContext.get();
const obsData = nodecg.Replicant<ObsData>('obsData');
const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');
const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');

interface GameStartTimings {
    showScoreboard: number
    showCasters: number
}
interface GameEndTimings {
    hideScoreboard: number
    changeScene: number
}

const startTimings: Record<GameVersion, GameStartTimings> = {
    [GameVersion.SPLATOON_2]: {
        showScoreboard: 11500,
        showCasters: 23500
    },
    [GameVersion.SPLATOON_3]: {
        showScoreboard: 11500,
        showCasters: 23500
    }
};
const endTimings: Record<GameVersion, GameEndTimings> = {
    [GameVersion.SPLATOON_2]: {
        hideScoreboard: 3000,
        changeScene: 10500
    },
    [GameVersion.SPLATOON_3]: {
        hideScoreboard: 3000,
        changeScene: 10500
    }
};

let gameStartTimeouts: Array<NodeJS.Timeout> = [];
let gameEndTimeouts: Array<NodeJS.Timeout> = [];

function cancelTimeouts(timeouts: Array<NodeJS.Timeout>): void {
    timeouts.forEach(timeout => clearTimeout(timeout));
}

function cancelGameTimeouts(): void {
    cancelTimeouts(gameStartTimeouts);
    gameStartTimeouts = [];
    cancelTimeouts(gameEndTimeouts);
    gameEndTimeouts = [];
}

nodecg.listenFor('startGame', async (data: never, callback: UnhandledListenForCb) => {
    const timings = startTimings[runtimeConfig.value.gameVersion];
    cancelGameTimeouts();

    switchToNextColor();
    await setCurrentScene(obsData.value.gameplayScene);
    gameStartTimeouts.push(setTimeout(() => {
        scoreboardData.value.isVisible = true;
    }, timings.showScoreboard));
    gameStartTimeouts.push(setTimeout(() => {
        nodecg.sendMessage('mainShowCasters');
    }, timings.showCasters));

    setTimeout(() => {
        callback();
    }, Math.max(...Object.values(timings)));
});

nodecg.listenFor('endGame', async (data: never, callback: UnhandledListenForCb) => {
    const timings = endTimings[runtimeConfig.value.gameVersion];
    cancelGameTimeouts();

    gameEndTimeouts.push(setTimeout(() => {
        scoreboardData.value.isVisible = false;
    }, timings.hideScoreboard));
    gameEndTimeouts.push(setTimeout(async () => {
        await setCurrentScene(obsData.value.intermissionScene);
    }, timings.changeScene));

    setTimeout(() => {
        callback();
    }, Math.max(...Object.values(timings)));
});
