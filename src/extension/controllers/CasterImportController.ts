import type { NodeCG } from 'nodecg/server';
import { BaseController } from './BaseController';
import { RadiaProductionsService } from '../services/RadiaProductionsService';

export class CasterImportController extends BaseController {
    constructor(nodecg: NodeCG, radiaProductionsService: RadiaProductionsService) {
        super(nodecg);

        this.listen('getLiveCommentators', async () => {
            return radiaProductionsService.getLiveCommentators();
        });
    }
}
