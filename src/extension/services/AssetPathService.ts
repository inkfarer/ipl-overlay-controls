import type { NodeCG, ReplicantServer } from 'nodecg/server';
import { AssetPaths } from 'schemas';
import { GameVersion } from 'types/enums/gameVersion';
import { perGameData } from '../../helpers/gameData/gameData';

export class AssetPathService {
    private nodecg: NodeCG;
    private assetPaths: ReplicantServer<AssetPaths>;

    constructor(nodecg: NodeCG) {
        this.nodecg = nodecg;
        this.assetPaths = nodecg.Replicant<AssetPaths>('assetPaths');
    }

    updateAssetPaths(gameVersion: GameVersion) {
        const gameData = perGameData[gameVersion];
        this.assetPaths.value.stageImages = Object.fromEntries(Object.entries(gameData.stageImagePaths)
            .map(([stage, path]) => ([stage, `/bundles/${this.nodecg.bundleName}/stage-images/${path}`])));
    }
}
