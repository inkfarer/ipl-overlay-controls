import { AssetPathService } from '../AssetPathService';
import { mockNodecg, replicants } from '../../__mocks__/mockNodecg';
import { GameVersion } from 'types/enums/gameVersion';
import { AssetPaths } from 'schemas';

describe('AssetPathService', () => {
    let assetPathService: AssetPathService;

    beforeEach(() => {
        assetPathService = new AssetPathService(mockNodecg);
        replicants.assetPaths = { stageImages: { } };
    });

    describe('updateAssetPaths', () => {
        it.each(Object.values(GameVersion))('updates asset paths as expected for %s', version => {
            assetPathService.updateAssetPaths(version);

            expect((replicants.assetPaths as AssetPaths).stageImages).toMatchSnapshot();
        });
    });
});