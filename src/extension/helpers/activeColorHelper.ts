import { SetActiveColorRequest } from '../../types/messages/activeRound';
import * as nodecgContext from './nodecg';
import { ActiveRound, RuntimeConfig, SwapColorsInternally } from '../../types/schemas';
import cloneDeep from 'lodash/cloneDeep';
import { ColorGroup, ColorInfo } from '../../types/colors';
import { perGameData } from '../../helpers/gameData/gameData';

const nodecg = nodecgContext.get();

const activeRound = nodecg.Replicant<ActiveRound>('activeRound');
const runtimeConfig = nodecg.Replicant<RuntimeConfig>('runtimeConfig');
const swapColorsInternally = nodecg.Replicant<SwapColorsInternally>('swapColorsInternally');

function swapColors(data: ColorInfo): ColorInfo {
    return {
        ...data,
        clrA: data.clrB,
        clrB: data.clrA
    };
}

export function setActiveColor(data: SetActiveColorRequest): void {
    const newActiveRound = cloneDeep(activeRound.value);
    newActiveRound.activeColor = {
        categoryName: data.categoryName,
        index: data.color.index,
        title: data.color.title,
        isCustom: data.color.isCustom,
        clrNeutral: data.color.clrNeutral
    };
    newActiveRound.teamA.color = data.color.clrA;
    newActiveRound.teamB.color = data.color.clrB;
    activeRound.value = newActiveRound;
}

function getSelectedColorGroup(): ColorGroup {
    return perGameData[runtimeConfig.value.gameVersion].colors.find(group =>
        group.meta.name === activeRound.value.activeColor.categoryName);
}

export type ColorWithCategory = ColorInfo & { categoryName: string };

export function getNextColor(): ColorWithCategory {
    const selectedColorGroup = getSelectedColorGroup();
    const selectedIndex = activeRound.value.activeColor.index;
    const nextColor = selectedColorGroup.colors.find(color =>
        color.index === (selectedIndex + 1 === selectedColorGroup.colors.length ? 0 : selectedIndex + 1));

    return {
        ...(swapColorsInternally.value ? swapColors(nextColor) : nextColor),
        categoryName: selectedColorGroup.meta.name
    };
}

export function getPreviousColor(): ColorWithCategory {
    const selectedColorGroup = getSelectedColorGroup();
    const selectedIndex = activeRound.value.activeColor.index;
    const previousColor = selectedColorGroup.colors.find(color =>
        color.index === (selectedIndex === 0 ? selectedColorGroup.colors.length - 1 : selectedIndex - 1));

    return {
        ...(swapColorsInternally.value ? swapColors(previousColor) : previousColor),
        categoryName: selectedColorGroup.meta.name
    };
}
