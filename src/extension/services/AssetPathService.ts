import type NodeCG from '@nodecg/types';
import { AssetPaths } from 'schemas';
import { GameVersion } from 'types/enums/gameVersion';
import { perGameData } from '../../helpers/gameData/gameData';

export class AssetPathService {
    private nodecg: NodeCG.ServerAPI;
    private assetPaths: NodeCG.ServerReplicant<AssetPaths>;

    constructor(nodecg: NodeCG.ServerAPI) {
        this.nodecg = nodecg;
        this.assetPaths = nodecg.Replicant<AssetPaths>('assetPaths', { persistent: false });
    }

    updateAssetPaths(gameVersion: GameVersion) {
        const gameData = perGameData[gameVersion];
        this.assetPaths.value.stageImages = Object.fromEntries(Object.entries(gameData.stageImagePaths)
            .map(([stage, path]) => ([stage, `/bundles/${this.nodecg.bundleName}/stage-images/${path}`])));
    }
}
