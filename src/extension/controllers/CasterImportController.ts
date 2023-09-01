import type NodeCG from '@nodecg/types';
import { BaseController } from './BaseController';
import { RadiaProductionsService } from '../services/RadiaProductionsService';

export class CasterImportController extends BaseController {
    constructor(nodecg: NodeCG.ServerAPI, radiaProductionsService: RadiaProductionsService) {
        super(nodecg);

        this.listen('getLiveCommentators', async () => {
            return radiaProductionsService.getLiveCommentators();
        });

        this.listen('searchCommentators', async (query) => {
            return radiaProductionsService.searchCommentators(query);
        });

        this.listen('pushCastersToRadia', async () => {
            return radiaProductionsService.pushCastersToRadia();
        });
    }
}
