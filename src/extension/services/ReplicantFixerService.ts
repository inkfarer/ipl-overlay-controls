import type NodeCG from '@nodecg/types';
import { ActiveRound, RuntimeConfig, SwapColorsInternally } from 'schemas';
import { perGameData } from '../../helpers/gameData/gameData';

export class ReplicantFixerService {
    private readonly nodecg: NodeCG.ServerAPI;
    private activeRound: NodeCG.ServerReplicant<ActiveRound>;
    private runtimeConfig: NodeCG.ServerReplicant<RuntimeConfig>;
    private swapColorsInternally: NodeCG.ServerReplicant<SwapColorsInternally>;

    constructor(nodecg: NodeCG.ServerAPI) {
        this.nodecg = nodecg;
        this.activeRound = nodecg.Replicant('activeRound');
        this.runtimeConfig = nodecg.Replicant('runtimeConfig');
        this.swapColorsInternally = nodecg.Replicant('swapColorsInternally');
    }

    fix(): void {
        const colorCategories = perGameData[this.runtimeConfig.value.gameVersion].colors;
        const selectedColorGroup = colorCategories.find(group =>
            group.meta.name === this.activeRound.value.activeColor.categoryName);

        if (selectedColorGroup == null) {
            this.nodecg.log.info('Resetting active round colors as the currently assigned colors are unknown');
            const newColor = colorCategories[0].colors[0];

            this.activeRound.value.activeColor = {
                categoryName: colorCategories[0].meta.name,
                clrNeutral: newColor.clrNeutral,
                index: newColor.index,
                title: newColor.title,
                isCustom: newColor.isCustom
            };
            this.activeRound.value.teamA.color = this.swapColorsInternally.value ? newColor.clrB : newColor.clrA;
            this.activeRound.value.teamB.color = this.swapColorsInternally.value ? newColor.clrA : newColor.clrB;
        }
    }
}
